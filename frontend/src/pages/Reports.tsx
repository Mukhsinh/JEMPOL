import { useState, useEffect } from 'react';
import reportService, { FullReportData, ReportFilters, TrendData, RiskAnalysis, DetailedReport } from '../services/reportService';

const Reports = () => {
    const [reportData, setReportData] = useState<FullReportData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<ReportFilters>({ dateRange: 'month', unitId: '', categoryId: '', status: '', priority: '' });
    const [units, setUnits] = useState<Array<{ id: string; name: string }>>([]);
    const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [showFilters, setShowFilters] = useState({ dateRange: false, unit: false, category: false });

    useEffect(() => { loadReportData(); loadFilterOptions(); }, []);
    useEffect(() => { loadReportData(); }, [filters, currentPage]);

    const loadReportData = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await reportService.getReportData({ ...filters, page: currentPage, limit: 10 });
            setReportData(data);
        } catch (err) {
            console.error('Error loading report data:', err);
            setError('Gagal memuat data laporan');
        } finally {
            setLoading(false);
        }
    };

    const loadFilterOptions = async () => {
        try {
            const [unitsData, categoriesData] = await Promise.all([reportService.getUnits(), reportService.getServiceCategories()]);
            setUnits(unitsData);
            setCategories(categoriesData);
        } catch (err) {
            console.error('Error loading filter options:', err);
        }
    };

    const handleFilterChange = (key: keyof ReportFilters, value: string) => { setFilters(prev => ({ ...prev, [key]: value })); setCurrentPage(1); };
    const applyFilters = () => { loadReportData(); setShowFilters({ dateRange: false, unit: false, category: false }); };

    const exportToPDF = async () => {
        try {
            const blob = await reportService.exportToPDF(filters);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `laporan-${new Date().toISOString().split('T')[0]}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            console.error('Error exporting PDF:', err);
            alert('Gagal mengekspor PDF');
        }
    };

    const exportToExcel = async () => {
        try {
            const blob = await reportService.exportToExcel(filters);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `laporan-${new Date().toISOString().split('T')[0]}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            console.error('Error exporting Excel:', err);
            alert('Gagal mengekspor Excel');
        }
    };

    const getDateRangeLabel = () => {
        switch (filters.dateRange) {
            case 'week': return 'Minggu Ini';
            case 'month': return 'Bulan Ini';
            case 'quarter': return 'Kuartal Ini';
            case 'year': return 'Tahun Ini';
            default: return 'Bulan Ini';
        }
    };

    const getUnitLabel = () => filters.unitId ? (units.find(u => u.id === filters.unitId)?.name || 'Semua Unit') : 'Semua Unit';
    const getCategoryLabel = () => filters.categoryId ? (categories.find(c => c.id === filters.categoryId)?.name || 'Semua Kategori') : 'Semua Kategori';

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open': return 'bg-blue-100 text-blue-700';
            case 'in_progress': return 'bg-yellow-100 text-yellow-700';
            case 'resolved': return 'bg-green-100 text-green-700';
            case 'closed': return 'bg-gray-100 text-gray-700';
            case 'escalated': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'open': return 'Baru';
            case 'in_progress': return 'Sedang Proses';
            case 'resolved': return 'Selesai';
            case 'closed': return 'Ditutup';
            case 'escalated': return 'Eskalasi';
            default: return status;
        }
    };

    const getRiskColor = (level: string) => {
        switch (level) {
            case 'critical': return 'bg-red-500';
            case 'high': return 'bg-orange-500';
            case 'medium': return 'bg-yellow-500';
            case 'low': return 'bg-primary';
            default: return 'bg-gray-500';
        }
    };

    if (loading && !reportData) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-gray-600">Memuat data laporan...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <h2 className="text-xl font-bold mb-2">Terjadi Kesalahan</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button onClick={loadReportData} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600">Coba Lagi</button>
                </div>
            </div>
        );
    }

    const maxTrendValue = reportData?.trends?.length ? Math.max(...reportData.trends.map((t: TrendData) => t.complaints), 1) : 10;
    const totalPages = reportData ? Math.ceil(reportData.totalReports / 10) : 1;

    return (
        <div className="flex flex-col gap-6 p-6 md:p-8 max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center text-sm text-[#4c739a]">
                    <a className="hover:text-primary" href="/">Beranda</a>
                    <span className="mx-2">/</span>
                    <span className="text-[#0d141b] font-medium">Laporan & Analitik</span>
                </div>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-[#0d141b] text-3xl font-black">Laporan & Analitik</h1>
                        <p className="text-[#4c739a]">Wawasan mendalam mengenai tren komplain dan performa pelayanan RS.</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={exportToPDF} className="flex items-center gap-2 px-4 py-2 bg-white border border-[#e7edf3] rounded-lg text-sm font-medium hover:bg-gray-50 shadow-sm">
                            <span className="material-symbols-outlined text-[20px]">picture_as_pdf</span>Ekspor PDF
                        </button>
                        <button onClick={exportToExcel} className="flex items-center gap-2 px-4 py-2 bg-white border border-[#e7edf3] rounded-lg text-sm font-medium hover:bg-gray-50 shadow-sm">
                            <span className="material-symbols-outlined text-[20px]">table_view</span>Ekspor Excel
                        </button>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-[#e7edf3] p-4 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex flex-wrap gap-3 flex-1 w-full">
                        <div className="relative">
                            <button onClick={() => setShowFilters(prev => ({ ...prev, dateRange: !prev.dateRange }))} className="flex h-10 items-center gap-2 rounded-lg bg-[#f6f7f8] hover:bg-[#eef2f6] px-4 min-w-[180px]">
                                <span className="material-symbols-outlined text-[#4c739a] text-[20px]">calendar_month</span>
                                <span className="text-sm font-medium">{getDateRangeLabel()}</span>
                                <span className="material-symbols-outlined text-[20px]">expand_more</span>
                            </button>
                            {showFilters.dateRange && (
                                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[180px]">
                                    {[{ value: 'week', label: 'Minggu Ini' }, { value: 'month', label: 'Bulan Ini' }, { value: 'quarter', label: 'Kuartal Ini' }, { value: 'year', label: 'Tahun Ini' }].map(opt => (
                                        <button key={opt.value} onClick={() => { handleFilterChange('dateRange', opt.value); setShowFilters(prev => ({ ...prev, dateRange: false })); }} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm">{opt.label}</button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="relative">
                            <button onClick={() => setShowFilters(prev => ({ ...prev, unit: !prev.unit }))} className="flex h-10 items-center gap-2 rounded-lg bg-[#f6f7f8] hover:bg-[#eef2f6] px-4 min-w-[160px]">
                                <span className="material-symbols-outlined text-[#4c739a] text-[20px]">domain</span>
                                <span className="text-sm font-medium">{getUnitLabel()}</span>
                                <span className="material-symbols-outlined text-[20px]">expand_more</span>
                            </button>
                            {showFilters.unit && (
                                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[200px] max-h-60 overflow-y-auto">
                                    <button onClick={() => { handleFilterChange('unitId', ''); setShowFilters(prev => ({ ...prev, unit: false })); }} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm border-b">Semua Unit</button>
                                    {units.map(unit => (
                                        <button key={unit.id} onClick={() => { handleFilterChange('unitId', unit.id); setShowFilters(prev => ({ ...prev, unit: false })); }} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm">{unit.name}</button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="relative">
                            <button onClick={() => setShowFilters(prev => ({ ...prev, category: !prev.category }))} className="flex h-10 items-center gap-2 rounded-lg bg-[#f6f7f8] hover:bg-[#eef2f6] px-4 min-w-[160px]">
                                <span className="material-symbols-outlined text-[#4c739a] text-[20px]">category</span>
                                <span className="text-sm font-medium">{getCategoryLabel()}</span>
                                <span className="material-symbols-outlined text-[20px]">expand_more</span>
                            </button>
                            {showFilters.category && (
                                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[200px] max-h-60 overflow-y-auto">
                                    <button onClick={() => { handleFilterChange('categoryId', ''); setShowFilters(prev => ({ ...prev, category: false })); }} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm border-b">Semua Kategori</button>
                                    {categories.map(cat => (
                                        <button key={cat.id} onClick={() => { handleFilterChange('categoryId', cat.id); setShowFilters(prev => ({ ...prev, category: false })); }} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm">{cat.name}</button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <button onClick={applyFilters} className="h-10 px-6 bg-primary hover:bg-blue-600 text-white text-sm font-medium rounded-lg shadow-sm w-full md:w-auto">Terapkan Filter</button>
                </div>
            </div>

            {/* KPI Cards */}
            {reportData && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-5 rounded-xl border border-[#e7edf3] shadow-sm flex flex-col gap-2">
                        <div className="flex justify-between items-start">
                            <div className="bg-blue-50 text-primary p-2 rounded-lg"><span className="material-symbols-outlined">inbox</span></div>
                            <span className={`text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 ${reportData.kpi.totalComplaintsChange >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                <span className="material-symbols-outlined text-[14px]">{reportData.kpi.totalComplaintsChange >= 0 ? 'arrow_upward' : 'arrow_downward'}</span>{Math.abs(reportData.kpi.totalComplaintsChange)}%
                            </span>
                        </div>
                        <p className="text-[#4c739a] text-sm font-medium">Total Komplain</p>
                        <h3 className="text-[#0d141b] text-2xl font-bold">{reportData.kpi.totalComplaints}</h3>
                    </div>
                    <div className="bg-white p-5 rounded-xl border border-[#e7edf3] shadow-sm flex flex-col gap-2">
                        <div className="flex justify-between items-start">
                            <div className="bg-green-50 text-green-600 p-2 rounded-lg"><span className="material-symbols-outlined">check_circle</span></div>
                            <span className={`text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 ${reportData.kpi.resolvedComplaintsChange >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                <span className="material-symbols-outlined text-[14px]">{reportData.kpi.resolvedComplaintsChange >= 0 ? 'arrow_upward' : 'arrow_downward'}</span>{Math.abs(reportData.kpi.resolvedComplaintsChange)}%
                            </span>
                        </div>
                        <p className="text-[#4c739a] text-sm font-medium">Diselesaikan</p>
                        <h3 className="text-[#0d141b] text-2xl font-bold">{reportData.kpi.resolvedComplaints}</h3>
                    </div>
                    <div className="bg-white p-5 rounded-xl border border-[#e7edf3] shadow-sm flex flex-col gap-2">
                        <div className="flex justify-between items-start">
                            <div className="bg-orange-50 text-orange-600 p-2 rounded-lg"><span className="material-symbols-outlined">timer</span></div>
                            <span className={`text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 ${reportData.kpi.averageResponseTimeChange <= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                <span className="material-symbols-outlined text-[14px]">{reportData.kpi.averageResponseTimeChange <= 0 ? 'arrow_downward' : 'arrow_upward'}</span>{Math.abs(reportData.kpi.averageResponseTimeChange)}m
                            </span>
                        </div>
                        <p className="text-[#4c739a] text-sm font-medium">Rata-rata Respon</p>
                        <h3 className="text-[#0d141b] text-2xl font-bold">{reportData.kpi.averageResponseTime} Menit</h3>
                    </div>
                    <div className="bg-gradient-to-br from-primary/5 to-white p-5 rounded-xl border border-primary/20 shadow-sm flex flex-col gap-2 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2 opacity-10"><span className="material-symbols-outlined text-6xl text-primary">auto_awesome</span></div>
                        <div className="flex justify-between items-start relative z-10">
                            <div className="bg-primary/10 text-primary p-2 rounded-lg"><span className="material-symbols-outlined">trending_up</span></div>
                            <span className="text-xs font-bold px-2 py-1 rounded-full border border-primary/20 text-primary bg-white">Prediksi AI</span>
                        </div>
                        <p className="text-[#4c739a] text-sm font-medium relative z-10">Proyeksi Minggu Depan</p>
                        <h3 className="text-[#0d141b] text-2xl font-bold relative z-10">~{reportData.kpi.projectedNextWeek} <span className="text-sm font-normal text-gray-500">Kasus</span></h3>
                    </div>
                </div>
            )}

            {/* Charts */}
            {reportData && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-[#e7edf3] shadow-sm flex flex-col gap-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-[#0d141b] text-lg font-bold">Tren Komplain (7 Hari)</h3>
                            <span className="text-primary text-sm font-medium">Data Real-time</span>
                        </div>
                        <div className="w-full h-64 flex flex-col justify-end relative pl-8 pb-6">
                            <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-400 pb-6 pr-2">
                                <span>{maxTrendValue}</span><span>{Math.round(maxTrendValue * 0.75)}</span><span>{Math.round(maxTrendValue * 0.5)}</span><span>{Math.round(maxTrendValue * 0.25)}</span><span>0</span>
                            </div>
                            <div className="absolute bottom-6 left-8 right-0 border-b border-gray-200"></div>
                            <div className="w-full h-full flex items-end justify-between gap-2 z-10 pt-2">
                                {reportData.trends?.length ? reportData.trends.map((trend: TrendData, i: number) => {
                                    const h = maxTrendValue > 0 ? (trend.complaints / maxTrendValue) * 100 : 0;
                                    return (
                                        <div key={i} className="flex flex-col items-center flex-1 group relative">
                                            <div className="w-full bg-primary rounded-t-sm min-h-[4px] hover:bg-blue-600" style={{ height: `${Math.max(h, 2)}%` }} title={`${trend.complaints} komplain`}></div>
                                            <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white text-xs px-2 py-1 rounded z-20">{trend.complaints} komplain</div>
                                        </div>
                                    );
                                }) : <div className="w-full h-full flex items-center justify-center text-gray-400">Tidak ada data tren</div>}
                            </div>
                            <div className="absolute bottom-0 left-8 right-0 flex justify-between text-xs text-gray-400 pt-2">
                                {reportData.trends?.map((t: TrendData, i: number) => <span key={i} className="text-center flex-1 truncate">{t.date}</span>)}
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-[#e7edf3] shadow-sm flex flex-col gap-4">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="material-symbols-outlined text-orange-500">warning</span>
                            <h3 className="text-[#0d141b] text-lg font-bold">Risiko Tinggi</h3>
                        </div>
                        <div className="flex flex-col gap-4 flex-1 justify-center">
                            {reportData.riskAnalysis?.length ? reportData.riskAnalysis.map((risk: RiskAnalysis, i: number) => (
                                <div key={i} className="flex flex-col gap-1">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium text-gray-700">{risk.unitName}</span>
                                        <span className={`font-bold ${risk.riskLevel === 'critical' ? 'text-red-600' : risk.riskLevel === 'high' ? 'text-orange-500' : risk.riskLevel === 'medium' ? 'text-yellow-500' : 'text-primary'}`}>{risk.riskPercentage}%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                                        <div className={`h-2.5 rounded-full ${getRiskColor(risk.riskLevel)}`} style={{ width: `${risk.riskPercentage}%` }}></div>
                                    </div>
                                </div>
                            )) : <div className="text-center text-gray-400 py-4"><span className="material-symbols-outlined text-4xl mb-2">check_circle</span><p>Tidak ada unit dengan risiko tinggi</p></div>}
                        </div>
                        <div className="mt-2 bg-blue-50 p-3 rounded-lg text-xs text-[#4c739a] flex gap-2 items-start">
                            <span className="material-symbols-outlined text-[16px] text-primary mt-0.5">info</span>
                            <p>Prediksi risiko berdasarkan volume komplain dan waktu respon lambat.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Detail Table */}
            {reportData && (
                <div className="bg-white rounded-xl border border-[#e7edf3] shadow-sm overflow-hidden flex flex-col">
                    <div className="px-6 py-4 border-b border-[#e7edf3] flex justify-between items-center">
                        <h3 className="text-[#0d141b] text-lg font-bold">Detail Laporan Komplain</h3>
                        <span className="text-sm text-gray-500">Total: {reportData.totalReports} laporan</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 text-xs uppercase text-[#4c739a] font-semibold">
                                <tr>
                                    <th className="px-6 py-4">ID Tiket</th>
                                    <th className="px-6 py-4">Tanggal</th>
                                    <th className="px-6 py-4">Unit Kerja</th>
                                    <th className="px-6 py-4">Kategori</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Waktu Respon</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm text-[#0d141b] divide-y divide-[#e7edf3]">
                                {reportData.detailedReports?.length ? reportData.detailedReports.map((r: DetailedReport) => (
                                    <tr key={r.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium">{r.ticketNumber}</td>
                                        <td className="px-6 py-4 text-[#4c739a]">{r.date}</td>
                                        <td className="px-6 py-4">{r.unitName}</td>
                                        <td className="px-6 py-4">{r.categoryName}</td>
                                        <td className="px-6 py-4"><span className={`px-2 py-1 rounded text-xs font-bold ${getStatusColor(r.status)}`}>{getStatusLabel(r.status)}</span></td>
                                        <td className="px-6 py-4">{r.responseTime !== null ? <span className={`font-medium ${r.responseTime > 60 ? 'text-red-600' : 'text-green-600'}`}>{r.responseTime} Menit {r.responseTime > 60 ? '(Lambat)' : ''}</span> : <span className="text-[#4c739a]">-</span>}</td>
                                    </tr>
                                )) : <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-400">Tidak ada data laporan</td></tr>}
                            </tbody>
                        </table>
                    </div>
                    <div className="px-6 py-4 border-t border-[#e7edf3] flex justify-between items-center bg-gray-50">
                        <span className="text-sm text-[#4c739a]">Menampilkan {((currentPage - 1) * 10) + 1}-{Math.min(currentPage * 10, reportData.totalReports)} dari {reportData.totalReports} laporan</span>
                        <div className="flex gap-1">
                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="size-8 flex items-center justify-center rounded border border-[#e7edf3] bg-white text-[#4c739a] hover:bg-gray-100 disabled:opacity-50"><span className="material-symbols-outlined text-[18px]">chevron_left</span></button>
                            {Array.from({ length: Math.min(3, totalPages || 1) }, (_, i) => {
                                const pn = Math.max(1, currentPage - 1) + i;
                                if (pn > totalPages) return null;
                                return <button key={pn} onClick={() => setCurrentPage(pn)} className={`size-8 flex items-center justify-center rounded border text-sm font-medium ${pn === currentPage ? 'border-primary bg-primary text-white' : 'border-[#e7edf3] bg-white hover:bg-gray-100'}`}>{pn}</button>;
                            })}
                            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages} className="size-8 flex items-center justify-center rounded border border-[#e7edf3] bg-white text-[#4c739a] hover:bg-gray-100 disabled:opacity-50"><span className="material-symbols-outlined text-[18px]">chevron_right</span></button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Reports;
