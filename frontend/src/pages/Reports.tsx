import { useState, useEffect } from 'react';
import reportService, { FullReportData, ReportFilters, DetailedReport } from '../services/reportService';

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
                    {/* Total Pengaduan */}
                    <div className="bg-white p-5 rounded-xl border border-[#e7edf3] shadow-sm flex flex-col gap-2">
                        <div className="flex justify-between items-start">
                            <div className="bg-red-50 text-red-600 p-2 rounded-lg"><span className="material-symbols-outlined">report_problem</span></div>
                            <span className={`text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 ${reportData.kpi.totalComplaintsChange >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                <span className="material-symbols-outlined text-[14px]">{reportData.kpi.totalComplaintsChange >= 0 ? 'arrow_upward' : 'arrow_downward'}</span>{Math.abs(reportData.kpi.totalComplaintsChange)}%
                            </span>
                        </div>
                        <p className="text-[#4c739a] text-sm font-medium">Total Pengaduan</p>
                        <h3 className="text-[#0d141b] text-2xl font-bold">{reportData.kpi.totalComplaints}</h3>
                    </div>
                    {/* Total Saran */}
                    <div className="bg-white p-5 rounded-xl border border-[#e7edf3] shadow-sm flex flex-col gap-2">
                        <div className="flex justify-between items-start">
                            <div className="bg-purple-50 text-purple-600 p-2 rounded-lg"><span className="material-symbols-outlined">lightbulb</span></div>
                            <span className={`text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 ${reportData.kpi.totalSuggestionsChange >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                <span className="material-symbols-outlined text-[14px]">{reportData.kpi.totalSuggestionsChange >= 0 ? 'arrow_upward' : 'arrow_downward'}</span>{Math.abs(reportData.kpi.totalSuggestionsChange)}%
                            </span>
                        </div>
                        <p className="text-[#4c739a] text-sm font-medium">Total Saran</p>
                        <h3 className="text-[#0d141b] text-2xl font-bold">{reportData.kpi.totalSuggestions}</h3>
                    </div>
                    {/* Total Permintaan Informasi */}
                    <div className="bg-white p-5 rounded-xl border border-[#e7edf3] shadow-sm flex flex-col gap-2">
                        <div className="flex justify-between items-start">
                            <div className="bg-blue-50 text-blue-600 p-2 rounded-lg"><span className="material-symbols-outlined">info</span></div>
                            <span className={`text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 ${reportData.kpi.totalRequestsChange >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                <span className="material-symbols-outlined text-[14px]">{reportData.kpi.totalRequestsChange >= 0 ? 'arrow_upward' : 'arrow_downward'}</span>{Math.abs(reportData.kpi.totalRequestsChange)}%
                            </span>
                        </div>
                        <p className="text-[#4c739a] text-sm font-medium">Total Permintaan Informasi</p>
                        <h3 className="text-[#0d141b] text-2xl font-bold">{reportData.kpi.totalRequests}</h3>
                    </div>
                    {/* Total Survey */}
                    <div className="bg-white p-5 rounded-xl border border-[#e7edf3] shadow-sm flex flex-col gap-2">
                        <div className="flex justify-between items-start">
                            <div className="bg-emerald-50 text-emerald-600 p-2 rounded-lg"><span className="material-symbols-outlined">poll</span></div>
                            <span className={`text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 ${reportData.kpi.totalSurveysChange >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                <span className="material-symbols-outlined text-[14px]">{reportData.kpi.totalSurveysChange >= 0 ? 'arrow_upward' : 'arrow_downward'}</span>{Math.abs(reportData.kpi.totalSurveysChange)}%
                            </span>
                        </div>
                        <p className="text-[#4c739a] text-sm font-medium">Total Survey</p>
                        <h3 className="text-[#0d141b] text-2xl font-bold">{reportData.kpi.totalSurveys}</h3>
                    </div>
                </div>
            )}

            {/* Charts - Grafik Analitik Modern dengan Visualisasi Menarik */}
            {reportData && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Grafik Pengaduan */}
                    <div className="bg-gradient-to-br from-white via-red-50 to-red-100 p-6 rounded-2xl border-2 border-red-200 shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col gap-4 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-red-200 rounded-full -mr-16 -mt-16 opacity-30"></div>
                        <div className="flex justify-between items-center relative z-10">
                            <h3 className="text-[#0d141b] text-lg font-bold flex items-center gap-2">
                                <span className="material-symbols-outlined text-red-600 text-2xl">report_problem</span>
                                Pengaduan
                            </h3>
                            <div className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold">{reportData.kpi.totalComplaints}</div>
                        </div>
                        <div className="w-full h-72 flex items-end justify-center px-8 py-4 border-l-4 border-b-4 border-red-300 rounded-bl-lg relative bg-white/50 backdrop-blur-sm">
                            <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-red-100/30 to-transparent"></div>
                            <div className="flex-1 max-w-[140px] flex flex-col items-center gap-3 relative z-10 group">
                                <div className="bg-white px-4 py-2 rounded-lg shadow-md border-2 border-red-200 group-hover:scale-110 transition-transform">
                                    <span className="text-2xl font-black text-red-600">{reportData.kpi.totalComplaints}</span>
                                </div>
                                <div 
                                    className="w-full bg-gradient-to-t from-red-700 via-red-500 to-red-400 hover:from-red-800 hover:via-red-600 hover:to-red-500 rounded-t-xl transition-all cursor-pointer shadow-2xl relative group-hover:scale-105"
                                    style={{ height: `${Math.max((reportData.kpi.totalComplaints / Math.max(reportData.kpi.totalComplaints, reportData.kpi.totalSuggestions, reportData.kpi.totalRequests, 1)) * 220, 40)}px` }}
                                    title={`${reportData.kpi.totalComplaints} pengaduan`}
                                >
                                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-xl"></div>
                                    <div className="absolute top-2 left-1/2 -translate-x-1/2 text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                        {Math.round((reportData.kpi.totalComplaints / Math.max(reportData.kpi.totalComplaints + reportData.kpi.totalSuggestions + reportData.kpi.totalRequests, 1)) * 100)}%
                                    </div>
                                </div>
                                <span className="text-sm font-bold text-red-700 mt-2 bg-white px-3 py-1 rounded-full shadow-sm">Total Pengaduan</span>
                            </div>
                        </div>
                        <div className="flex justify-between items-center text-xs text-red-600 bg-white/70 p-2 rounded-lg">
                            <span>Perubahan:</span>
                            <span className="font-bold flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">{reportData.kpi.totalComplaintsChange >= 0 ? 'arrow_upward' : 'arrow_downward'}</span>
                                {Math.abs(reportData.kpi.totalComplaintsChange)}%
                            </span>
                        </div>
                    </div>

                    {/* Grafik Permintaan Informasi */}
                    <div className="bg-gradient-to-br from-white via-blue-50 to-blue-100 p-6 rounded-2xl border-2 border-blue-200 shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col gap-4 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200 rounded-full -mr-16 -mt-16 opacity-30"></div>
                        <div className="flex justify-between items-center relative z-10">
                            <h3 className="text-[#0d141b] text-lg font-bold flex items-center gap-2">
                                <span className="material-symbols-outlined text-blue-600 text-2xl">info</span>
                                Permintaan
                            </h3>
                            <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold">{reportData.kpi.totalRequests}</div>
                        </div>
                        <div className="w-full h-72 flex items-end justify-center px-8 py-4 border-l-4 border-b-4 border-blue-300 rounded-bl-lg relative bg-white/50 backdrop-blur-sm">
                            <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-blue-100/30 to-transparent"></div>
                            <div className="flex-1 max-w-[140px] flex flex-col items-center gap-3 relative z-10 group">
                                <div className="bg-white px-4 py-2 rounded-lg shadow-md border-2 border-blue-200 group-hover:scale-110 transition-transform">
                                    <span className="text-2xl font-black text-blue-600">{reportData.kpi.totalRequests}</span>
                                </div>
                                <div 
                                    className="w-full bg-gradient-to-t from-blue-700 via-blue-500 to-blue-400 hover:from-blue-800 hover:via-blue-600 hover:to-blue-500 rounded-t-xl transition-all cursor-pointer shadow-2xl relative group-hover:scale-105"
                                    style={{ height: `${Math.max((reportData.kpi.totalRequests / Math.max(reportData.kpi.totalComplaints, reportData.kpi.totalSuggestions, reportData.kpi.totalRequests, 1)) * 220, 40)}px` }}
                                    title={`${reportData.kpi.totalRequests} permintaan`}
                                >
                                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-xl"></div>
                                    <div className="absolute top-2 left-1/2 -translate-x-1/2 text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                        {Math.round((reportData.kpi.totalRequests / Math.max(reportData.kpi.totalComplaints + reportData.kpi.totalSuggestions + reportData.kpi.totalRequests, 1)) * 100)}%
                                    </div>
                                </div>
                                <span className="text-sm font-bold text-blue-700 mt-2 bg-white px-3 py-1 rounded-full shadow-sm">Total Permintaan</span>
                            </div>
                        </div>
                        <div className="flex justify-between items-center text-xs text-blue-600 bg-white/70 p-2 rounded-lg">
                            <span>Perubahan:</span>
                            <span className="font-bold flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">{reportData.kpi.totalRequestsChange >= 0 ? 'arrow_upward' : 'arrow_downward'}</span>
                                {Math.abs(reportData.kpi.totalRequestsChange)}%
                            </span>
                        </div>
                    </div>

                    {/* Grafik Saran */}
                    <div className="bg-gradient-to-br from-white via-purple-50 to-purple-100 p-6 rounded-2xl border-2 border-purple-200 shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col gap-4 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200 rounded-full -mr-16 -mt-16 opacity-30"></div>
                        <div className="flex justify-between items-center relative z-10">
                            <h3 className="text-[#0d141b] text-lg font-bold flex items-center gap-2">
                                <span className="material-symbols-outlined text-purple-600 text-2xl">lightbulb</span>
                                Saran
                            </h3>
                            <div className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold">{reportData.kpi.totalSuggestions}</div>
                        </div>
                        <div className="w-full h-72 flex items-end justify-center px-8 py-4 border-l-4 border-b-4 border-purple-300 rounded-bl-lg relative bg-white/50 backdrop-blur-sm">
                            <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-purple-100/30 to-transparent"></div>
                            <div className="flex-1 max-w-[140px] flex flex-col items-center gap-3 relative z-10 group">
                                <div className="bg-white px-4 py-2 rounded-lg shadow-md border-2 border-purple-200 group-hover:scale-110 transition-transform">
                                    <span className="text-2xl font-black text-purple-600">{reportData.kpi.totalSuggestions}</span>
                                </div>
                                <div 
                                    className="w-full bg-gradient-to-t from-purple-700 via-purple-500 to-purple-400 hover:from-purple-800 hover:via-purple-600 hover:to-purple-500 rounded-t-xl transition-all cursor-pointer shadow-2xl relative group-hover:scale-105"
                                    style={{ height: `${Math.max((reportData.kpi.totalSuggestions / Math.max(reportData.kpi.totalComplaints, reportData.kpi.totalSuggestions, reportData.kpi.totalRequests, 1)) * 220, 40)}px` }}
                                    title={`${reportData.kpi.totalSuggestions} saran`}
                                >
                                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-xl"></div>
                                    <div className="absolute top-2 left-1/2 -translate-x-1/2 text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                        {Math.round((reportData.kpi.totalSuggestions / Math.max(reportData.kpi.totalComplaints + reportData.kpi.totalSuggestions + reportData.kpi.totalRequests, 1)) * 100)}%
                                    </div>
                                </div>
                                <span className="text-sm font-bold text-purple-700 mt-2 bg-white px-3 py-1 rounded-full shadow-sm">Total Saran</span>
                            </div>
                        </div>
                        <div className="flex justify-between items-center text-xs text-purple-600 bg-white/70 p-2 rounded-lg">
                            <span>Perubahan:</span>
                            <span className="font-bold flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">{reportData.kpi.totalSuggestionsChange >= 0 ? 'arrow_upward' : 'arrow_downward'}</span>
                                {Math.abs(reportData.kpi.totalSuggestionsChange)}%
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Grafik Tren Komplain Per Kategori */}
            {reportData && reportData.categoryTrends && reportData.categoryTrends.length > 0 && (
                <div className="bg-white rounded-xl border border-[#e7edf3] shadow-sm p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-[#0d141b] text-xl font-bold flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-2xl">bar_chart</span>
                            Tren Komplain Per Kategori
                        </h3>
                        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                            Total: {reportData.categoryTrends.reduce((sum, cat) => sum + cat.count, 0)} tiket
                        </span>
                    </div>
                    <div className="space-y-4">
                        {reportData.categoryTrends.map((category, index) => {
                            const maxCount = Math.max(...reportData.categoryTrends.map(c => c.count));
                            const barWidth = (category.count / maxCount) * 100;
                            const colors = [
                                'from-blue-600 to-blue-400',
                                'from-purple-600 to-purple-400',
                                'from-pink-600 to-pink-400',
                                'from-red-600 to-red-400',
                                'from-orange-600 to-orange-400',
                                'from-yellow-600 to-yellow-400',
                                'from-green-600 to-green-400',
                                'from-teal-600 to-teal-400',
                                'from-cyan-600 to-cyan-400',
                                'from-indigo-600 to-indigo-400'
                            ];
                            const colorClass = colors[index % colors.length];
                            
                            return (
                                <div key={index} className="group">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2 flex-1">
                                            <span className="text-sm font-semibold text-gray-700 min-w-[200px]">
                                                {category.categoryName}
                                            </span>
                                            <div className="flex-1 bg-gray-100 rounded-full h-10 relative overflow-hidden shadow-inner">
                                                <div 
                                                    className={`h-full bg-gradient-to-r ${colorClass} rounded-full transition-all duration-700 ease-out flex items-center justify-end pr-3 group-hover:shadow-lg`}
                                                    style={{ width: `${barWidth}%` }}
                                                >
                                                    <span className="text-white text-xs font-bold">
                                                        {category.count}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 ml-4">
                                            <span className="text-sm font-bold text-gray-600 min-w-[60px] text-right">
                                                {category.count} tiket
                                            </span>
                                            <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded-full min-w-[50px] text-center">
                                                {category.percentage}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Grafik Komparasi Jenis Pasien */}
            {reportData && reportData.patientTypeTrends && reportData.patientTypeTrends.length > 0 && (
                <div className="bg-white rounded-xl border border-[#e7edf3] shadow-sm p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-[#0d141b] text-xl font-bold flex items-center gap-2">
                            <span className="material-symbols-outlined text-emerald-600 text-2xl">groups</span>
                            Komparasi Jenis Pasien
                        </h3>
                        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                            Total: {reportData.patientTypeTrends?.reduce((sum, pt) => sum + pt.count, 0) || 0} tiket eksternal
                        </span>
                    </div>
                    <div className="space-y-4">
                        {reportData.patientTypeTrends?.map((patientType, index) => {
                            const maxCount = Math.max(...(reportData.patientTypeTrends?.map(pt => pt.count) || [1]));
                            const barWidth = (patientType.count / maxCount) * 100;
                            const colors = [
                                'from-emerald-600 to-emerald-400',
                                'from-teal-600 to-teal-400',
                                'from-cyan-600 to-cyan-400',
                                'from-sky-600 to-sky-400',
                                'from-blue-600 to-blue-400',
                                'from-indigo-600 to-indigo-400',
                                'from-violet-600 to-violet-400',
                                'from-purple-600 to-purple-400'
                            ];
                            const colorClass = colors[index % colors.length];
                            
                            return (
                                <div key={index} className="group">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2 flex-1">
                                            <span className="text-sm font-semibold text-gray-700 min-w-[200px]">
                                                {patientType.patientTypeName}
                                            </span>
                                            <div className="flex-1 bg-gray-100 rounded-full h-10 relative overflow-hidden shadow-inner">
                                                <div 
                                                    className={`h-full bg-gradient-to-r ${colorClass} rounded-full transition-all duration-700 ease-out flex items-center justify-end pr-3 group-hover:shadow-lg`}
                                                    style={{ width: `${barWidth}%` }}
                                                >
                                                    <span className="text-white text-xs font-bold">
                                                        {patientType.count}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 ml-4">
                                            <span className="text-sm font-bold text-gray-600 min-w-[60px] text-right">
                                                {patientType.count} tiket
                                            </span>
                                            <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full min-w-[50px] text-center">
                                                {patientType.percentage}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Grafik Komparasi Jenis Pasien */}
            {reportData && reportData.patientTypeTrends && reportData.patientTypeTrends.length > 0 && (
                <div className="bg-white rounded-xl border border-[#e7edf3] shadow-sm p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-[#0d141b] text-xl font-bold flex items-center gap-2">
                            <span className="material-symbols-outlined text-emerald-600 text-2xl">groups</span>
                            Komparasi Jenis Pasien
                        </h3>
                        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                            Total: {reportData.patientTypeTrends?.reduce((sum, pt) => sum + pt.count, 0) || 0} tiket
                        </span>
                    </div>
                    <div className="space-y-4">
                        {reportData.patientTypeTrends?.map((patientType, index) => {
                            const maxCount = Math.max(...(reportData.patientTypeTrends?.map(pt => pt.count) || [1]));
                            const barWidth = (patientType.count / maxCount) * 100;
                            const colors = [
                                'from-emerald-600 to-emerald-400',
                                'from-teal-600 to-teal-400',
                                'from-cyan-600 to-cyan-400',
                                'from-sky-600 to-sky-400',
                                'from-blue-600 to-blue-400',
                                'from-indigo-600 to-indigo-400',
                                'from-violet-600 to-violet-400',
                                'from-purple-600 to-purple-400'
                            ];
                            const colorClass = colors[index % colors.length];
                            
                            return (
                                <div key={index} className="group">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2 flex-1">
                                            <span className="text-sm font-semibold text-gray-700 min-w-[200px]">
                                                {patientType.patientTypeName}
                                            </span>
                                            <div className="flex-1 bg-gray-100 rounded-full h-10 relative overflow-hidden shadow-inner">
                                                <div 
                                                    className={`h-full bg-gradient-to-r ${colorClass} rounded-full transition-all duration-700 ease-out flex items-center justify-end pr-3 group-hover:shadow-lg`}
                                                    style={{ width: `${barWidth}%` }}
                                                >
                                                    <span className="text-white text-xs font-bold">
                                                        {patientType.count}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 ml-4">
                                            <span className="text-sm font-bold text-gray-600 min-w-[60px] text-right">
                                                {patientType.count} tiket
                                            </span>
                                            <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full min-w-[50px] text-center">
                                                {patientType.percentage}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
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
                                    <th className="px-6 py-4">Jenis Pasien</th>
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
                                        <td className="px-6 py-4">{r.patientTypeName}</td>
                                        <td className="px-6 py-4"><span className={`px-2 py-1 rounded text-xs font-bold ${getStatusColor(r.status)}`}>{getStatusLabel(r.status)}</span></td>
                                        <td className="px-6 py-4">{r.responseTime !== null ? <span className={`font-medium ${r.responseTime > 60 ? 'text-red-600' : 'text-green-600'}`}>{r.responseTime} Menit {r.responseTime > 60 ? '(Lambat)' : ''}</span> : <span className="text-[#4c739a]">-</span>}</td>
                                    </tr>
                                )) : <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-400">Tidak ada data laporan</td></tr>}
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
