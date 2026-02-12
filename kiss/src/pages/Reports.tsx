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
    const [chartFilter, setChartFilter] = useState<'all' | 'complaint' | 'suggestion' | 'information'>('all');
    const [periodTrendFilter, setPeriodTrendFilter] = useState<'daily' | 'weekly' | 'monthly' | 'quarterly' | 'semester' | 'yearly'>('daily');
    const [selectedTicket, setSelectedTicket] = useState<DetailedReport | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showTrendlines, setShowTrendlines] = useState(false);

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

            {/* Grafik Komprehensif dalam Satu Kartu dengan Filter */}
            {reportData && (
                <div className="bg-white rounded-xl border border-[#e7edf3] shadow-sm p-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                        <h3 className="text-[#0d141b] text-xl font-bold flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-2xl">bar_chart</span>
                            Grafik Komparasi Layanan
                        </h3>
                        <div className="flex items-center gap-3 flex-wrap">
                            <span className="text-sm text-gray-500">Filter:</span>
                            <div className="flex gap-2 flex-wrap">
                                <button onClick={() => setChartFilter('all')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${chartFilter === 'all' ? 'bg-primary text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Semua</button>
                                <button onClick={() => setChartFilter('complaint')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${chartFilter === 'complaint' ? 'bg-red-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Pengaduan</button>
                                <button onClick={() => setChartFilter('information')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${chartFilter === 'information' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Permintaan</button>
                                <button onClick={() => setChartFilter('suggestion')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${chartFilter === 'suggestion' ? 'bg-purple-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Saran</button>
                            </div>
                        </div>
                    </div>
                    <div className="w-full h-96 flex items-end justify-center gap-4 md:gap-8 px-4 md:px-8 py-4 border-l-4 border-b-4 border-gray-300 rounded-bl-lg relative bg-gradient-to-br from-gray-50 to-white overflow-x-auto">
                        {/* Grafik Pengaduan */}
                        {(chartFilter === 'all' || chartFilter === 'complaint') && (
                        <div className="flex-1 min-w-[120px] max-w-[200px] flex flex-col items-center gap-3 relative z-10 group">
                            <div className="bg-white px-3 py-1.5 rounded-lg shadow-md border-2 border-red-200 group-hover:scale-110 transition-transform">
                                <span className="text-xl md:text-2xl font-black text-red-600">{reportData.kpi.totalComplaints}</span>
                            </div>
                            <div 
                                className="w-full bg-gradient-to-t from-red-700 via-red-500 to-red-400 hover:from-red-800 hover:via-red-600 hover:to-red-500 rounded-t-xl transition-all cursor-pointer shadow-2xl relative group-hover:scale-105 flex flex-col items-center justify-start pt-2"
                                style={{ height: `${Math.max((reportData.kpi.totalComplaints / Math.max(reportData.kpi.totalComplaints, reportData.kpi.totalSuggestions, reportData.kpi.totalRequests, 1)) * 280, 50)}px` }}
                                title={`${reportData.kpi.totalComplaints} pengaduan`}
                            >
                                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-xl"></div>
                                <span className="text-white text-xs font-bold whitespace-nowrap relative z-10">
                                    {Math.round((reportData.kpi.totalComplaints / Math.max(reportData.kpi.totalComplaints + reportData.kpi.totalSuggestions + reportData.kpi.totalRequests, 1)) * 100)}%
                                </span>
                            </div>
                            <div className="text-center mt-2 w-full">
                                <span className="text-xs md:text-sm font-bold text-red-700 bg-red-50 px-2 py-1 rounded-full shadow-sm block mb-1 truncate">Pengaduan</span>
                                <span className={`text-xs font-bold px-2 py-1 rounded-full flex items-center justify-center gap-1 ${reportData.kpi.totalComplaintsChange >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    <span className="material-symbols-outlined text-[12px]">{reportData.kpi.totalComplaintsChange >= 0 ? 'arrow_upward' : 'arrow_downward'}</span>{Math.abs(reportData.kpi.totalComplaintsChange)}%
                                </span>
                            </div>
                        </div>
                        )}

                        {/* Grafik Permintaan */}
                        {(chartFilter === 'all' || chartFilter === 'information') && (
                        <div className="flex-1 min-w-[120px] max-w-[200px] flex flex-col items-center gap-3 relative z-10 group">
                            <div className="bg-white px-3 py-1.5 rounded-lg shadow-md border-2 border-blue-200 group-hover:scale-110 transition-transform">
                                <span className="text-xl md:text-2xl font-black text-blue-600">{reportData.kpi.totalRequests}</span>
                            </div>
                            <div 
                                className="w-full bg-gradient-to-t from-blue-700 via-blue-500 to-blue-400 hover:from-blue-800 hover:via-blue-600 hover:to-blue-500 rounded-t-xl transition-all cursor-pointer shadow-2xl relative group-hover:scale-105 flex flex-col items-center justify-start pt-2"
                                style={{ height: `${Math.max((reportData.kpi.totalRequests / Math.max(reportData.kpi.totalComplaints, reportData.kpi.totalSuggestions, reportData.kpi.totalRequests, 1)) * 280, 50)}px` }}
                                title={`${reportData.kpi.totalRequests} permintaan`}
                            >
                                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-xl"></div>
                                <span className="text-white text-xs font-bold whitespace-nowrap relative z-10">
                                    {Math.round((reportData.kpi.totalRequests / Math.max(reportData.kpi.totalComplaints + reportData.kpi.totalSuggestions + reportData.kpi.totalRequests, 1)) * 100)}%
                                </span>
                            </div>
                            <div className="text-center mt-2 w-full">
                                <span className="text-xs md:text-sm font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded-full shadow-sm block mb-1 truncate">Permintaan</span>
                                <span className={`text-xs font-bold px-2 py-1 rounded-full flex items-center justify-center gap-1 ${reportData.kpi.totalRequestsChange >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    <span className="material-symbols-outlined text-[12px]">{reportData.kpi.totalRequestsChange >= 0 ? 'arrow_upward' : 'arrow_downward'}</span>{Math.abs(reportData.kpi.totalRequestsChange)}%
                                </span>
                            </div>
                        </div>
                        )}

                        {/* Grafik Saran */}
                        {(chartFilter === 'all' || chartFilter === 'suggestion') && (
                        <div className="flex-1 min-w-[120px] max-w-[200px] flex flex-col items-center gap-3 relative z-10 group">
                            <div className="bg-white px-3 py-1.5 rounded-lg shadow-md border-2 border-purple-200 group-hover:scale-110 transition-transform">
                                <span className="text-xl md:text-2xl font-black text-purple-600">{reportData.kpi.totalSuggestions}</span>
                            </div>
                            <div 
                                className="w-full bg-gradient-to-t from-purple-700 via-purple-500 to-purple-400 hover:from-purple-800 hover:via-purple-600 hover:to-purple-500 rounded-t-xl transition-all cursor-pointer shadow-2xl relative group-hover:scale-105 flex flex-col items-center justify-start pt-2"
                                style={{ height: `${Math.max((reportData.kpi.totalSuggestions / Math.max(reportData.kpi.totalComplaints, reportData.kpi.totalSuggestions, reportData.kpi.totalRequests, 1)) * 280, 50)}px` }}
                                title={`${reportData.kpi.totalSuggestions} saran`}
                            >
                                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-xl"></div>
                                <span className="text-white text-xs font-bold whitespace-nowrap relative z-10">
                                    {Math.round((reportData.kpi.totalSuggestions / Math.max(reportData.kpi.totalComplaints + reportData.kpi.totalSuggestions + reportData.kpi.totalRequests, 1)) * 100)}%
                                </span>
                            </div>
                            <div className="text-center mt-2 w-full">
                                <span className="text-xs md:text-sm font-bold text-purple-700 bg-purple-50 px-2 py-1 rounded-full shadow-sm block mb-1 truncate">Saran</span>
                                <span className={`text-xs font-bold px-2 py-1 rounded-full flex items-center justify-center gap-1 ${reportData.kpi.totalSuggestionsChange >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    <span className="material-symbols-outlined text-[12px]">{reportData.kpi.totalSuggestionsChange >= 0 ? 'arrow_upward' : 'arrow_downward'}</span>{Math.abs(reportData.kpi.totalSuggestionsChange)}%
                                </span>
                            </div>
                        </div>
                        )}
                    </div>
                </div>
            )}

            {/* Grafik Trend Garis 7 Hari */}
            {reportData && reportData.trends && reportData.trends.length > 0 && (
                <div className="bg-white rounded-xl border border-[#e7edf3] shadow-sm p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-[#0d141b] text-xl font-bold flex items-center gap-2">
                            <span className="material-symbols-outlined text-emerald-600 text-2xl">show_chart</span>
                            Trend Tiket 7 Hari Terakhir
                        </h3>
                        <div className="flex gap-4 text-xs">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                <span className="text-gray-600">Total Tiket</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                <span className="text-gray-600">Terselesaikan</span>
                            </div>
                        </div>
                    </div>
                    <div className="w-full h-80 flex items-end justify-between gap-2 px-4 py-4 border-l-4 border-b-4 border-gray-300 rounded-bl-lg relative bg-gradient-to-br from-gray-50 to-white">
                        {reportData.trends.map((trend, index) => {
                            const maxValue = Math.max(...reportData.trends.map(t => Math.max(t.complaints, t.resolved)));
                            const complaintsHeight = (trend.complaints / Math.max(maxValue, 1)) * 250;
                            const resolvedHeight = (trend.resolved / Math.max(maxValue, 1)) * 250;
                            
                            return (
                                <div key={index} className="flex-1 flex flex-col items-center gap-2 group">
                                    <div className="relative w-full flex items-end justify-center gap-1 h-64">
                                        {/* Bar Total Tiket */}
                                        <div className="relative flex flex-col items-center">
                                            <div className="bg-white px-2 py-1 rounded shadow-sm border border-blue-200 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="text-xs font-bold text-blue-600">{trend.complaints}</span>
                                            </div>
                                            <div 
                                                className="w-8 bg-gradient-to-t from-blue-700 to-blue-400 rounded-t-lg hover:from-blue-800 hover:to-blue-500 transition-all cursor-pointer shadow-lg"
                                                style={{ height: `${Math.max(complaintsHeight, 20)}px` }}
                                                title={`${trend.complaints} tiket`}
                                            ></div>
                                        </div>
                                        {/* Bar Terselesaikan */}
                                        <div className="relative flex flex-col items-center">
                                            <div className="bg-white px-2 py-1 rounded shadow-sm border border-green-200 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="text-xs font-bold text-green-600">{trend.resolved}</span>
                                            </div>
                                            <div 
                                                className="w-8 bg-gradient-to-t from-green-700 to-green-400 rounded-t-lg hover:from-green-800 hover:to-green-500 transition-all cursor-pointer shadow-lg"
                                                style={{ height: `${Math.max(resolvedHeight, 20)}px` }}
                                                title={`${trend.resolved} terselesaikan`}
                                            ></div>
                                        </div>
                                    </div>
                                    <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded">{trend.date}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Grafik Trend Tiket Per Periode dengan Trend Line */}
            {reportData && reportData.periodTrends && (
                <div className="bg-white rounded-xl border border-[#e7edf3] shadow-sm p-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                        <h3 className="text-[#0d141b] text-xl font-bold flex items-center gap-2">
                            <span className="material-symbols-outlined text-indigo-600 text-2xl">trending_up</span>
                            Trend Tiket Per Periode
                        </h3>
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-3 flex-wrap">
                            <div className="flex items-center gap-3 flex-wrap">
                                <span className="text-sm text-gray-500">Periode:</span>
                                <div className="flex gap-2 flex-wrap">
                                    <button onClick={() => setPeriodTrendFilter('daily')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${periodTrendFilter === 'daily' ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Harian</button>
                                    <button onClick={() => setPeriodTrendFilter('weekly')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${periodTrendFilter === 'weekly' ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Mingguan</button>
                                    <button onClick={() => setPeriodTrendFilter('monthly')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${periodTrendFilter === 'monthly' ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Bulanan</button>
                                    <button onClick={() => setPeriodTrendFilter('quarterly')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${periodTrendFilter === 'quarterly' ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Triwulanan</button>
                                    <button onClick={() => setPeriodTrendFilter('semester')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${periodTrendFilter === 'semester' ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Semesteran</button>
                                    <button onClick={() => setPeriodTrendFilter('yearly')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${periodTrendFilter === 'yearly' ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Tahunan</button>
                                </div>
                            </div>
                            <button 
                                onClick={() => setShowTrendlines(!showTrendlines)} 
                                className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 ${showTrendlines ? 'bg-emerald-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                            >
                                <span className="material-symbols-outlined text-[16px]">{showTrendlines ? 'visibility_off' : 'show_chart'}</span>
                                {showTrendlines ? 'Sembunyikan Trendline' : 'Tambah Trendline'}
                            </button>
                        </div>
                    </div>
                    <div className="flex gap-4 text-xs mb-4 flex-wrap">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <span className="text-gray-600">Pengaduan</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                            <span className="text-gray-600">Saran</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                            <span className="text-gray-600">Permintaan</span>
                        </div>
                        {showTrendlines && (
                            <>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-0.5 bg-red-500" style={{ borderTop: '2px dashed' }}></div>
                                    <span className="text-gray-600">Trend Pengaduan</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-0.5 bg-purple-500" style={{ borderTop: '2px dashed' }}></div>
                                    <span className="text-gray-600">Trend Saran</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-0.5 bg-blue-500" style={{ borderTop: '2px dashed' }}></div>
                                    <span className="text-gray-600">Trend Permintaan</span>
                                </div>
                            </>
                        )}
                    </div>
                    <div className="w-full h-96 relative border-l-4 border-b-4 border-gray-300 rounded-bl-lg bg-gradient-to-br from-gray-50 to-white p-4 overflow-x-auto">
                        <div className="flex items-end justify-between gap-3 h-full min-w-max">
                            {reportData.periodTrends[periodTrendFilter].map((period, index) => {
                                const maxValue = Math.max(...reportData.periodTrends[periodTrendFilter].map(p => p.total), 1);
                                const complaintsHeight = (period.complaints / maxValue) * 300;
                                const suggestionsHeight = (period.suggestions / maxValue) * 300;
                                const informationHeight = (period.information / maxValue) * 300;
                                
                                return (
                                    <div key={index} className="flex flex-col items-center gap-2 group relative">
                                        {/* Tooltip */}
                                        <div className="absolute -top-20 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-3 py-2 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap text-xs">
                                            <div className="font-bold mb-1">{period.period}</div>
                                            <div>Total: {period.total}</div>
                                            <div>Pengaduan: {period.complaints}</div>
                                            <div>Saran: {period.suggestions}</div>
                                            <div>Permintaan: {period.information}</div>
                                        </div>
                                        
                                        {/* Bars Container */}
                                        <div className="relative flex items-end justify-center gap-1 h-80">
                                            {/* Bar Pengaduan */}
                                            <div className="relative flex flex-col items-center">
                                                {complaintsHeight > 25 && (
                                                    <div className="absolute" style={{ bottom: `${complaintsHeight - 18}px` }}>
                                                        <span className="text-white text-[9px] font-bold">{period.complaints}</span>
                                                    </div>
                                                )}
                                                <div 
                                                    className="w-3 bg-gradient-to-t from-red-700 to-red-400 rounded-t hover:from-red-800 hover:to-red-500 transition-all cursor-pointer shadow-md"
                                                    style={{ height: `${Math.max(complaintsHeight, 5)}px` }}
                                                    title={`${period.complaints} pengaduan`}
                                                ></div>
                                            </div>
                                            {/* Bar Saran */}
                                            <div className="relative flex flex-col items-center">
                                                {suggestionsHeight > 25 && (
                                                    <div className="absolute" style={{ bottom: `${suggestionsHeight - 18}px` }}>
                                                        <span className="text-white text-[9px] font-bold">{period.suggestions}</span>
                                                    </div>
                                                )}
                                                <div 
                                                    className="w-3 bg-gradient-to-t from-purple-700 to-purple-400 rounded-t hover:from-purple-800 hover:to-purple-500 transition-all cursor-pointer shadow-md"
                                                    style={{ height: `${Math.max(suggestionsHeight, 5)}px` }}
                                                    title={`${period.suggestions} saran`}
                                                ></div>
                                            </div>
                                            {/* Bar Permintaan */}
                                            <div className="relative flex flex-col items-center">
                                                {informationHeight > 25 && (
                                                    <div className="absolute" style={{ bottom: `${informationHeight - 18}px` }}>
                                                        <span className="text-white text-[9px] font-bold">{period.information}</span>
                                                    </div>
                                                )}
                                                <div 
                                                    className="w-3 bg-gradient-to-t from-blue-700 to-blue-400 rounded-t hover:from-blue-800 hover:to-blue-500 transition-all cursor-pointer shadow-md"
                                                    style={{ height: `${Math.max(informationHeight, 5)}px` }}
                                                    title={`${period.information} permintaan`}
                                                ></div>
                                            </div>
                                        </div>
                                        
                                        {/* Period Label */}
                                        <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded max-w-[80px] text-center truncate" title={period.period}>
                                            {period.period}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                        
                        {/* Trend Line SVG Overlay - Opsional per Kategori */}
                        {showTrendlines && (
                        <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ paddingLeft: '16px', paddingRight: '16px', paddingBottom: '40px', paddingTop: '16px' }}>
                            {/* Trendline Pengaduan */}
                            <polyline
                                points={reportData.periodTrends[periodTrendFilter].map((period, index) => {
                                    const maxValue = Math.max(...reportData.periodTrends[periodTrendFilter].map(p => p.total), 1);
                                    const complaintsHeight = (period.complaints / maxValue) * 300;
                                    const containerWidth = reportData.periodTrends[periodTrendFilter].length * 60;
                                    const x = (index / Math.max(reportData.periodTrends[periodTrendFilter].length - 1, 1)) * containerWidth + 30;
                                    const y = 320 - complaintsHeight;
                                    return `${x},${y}`;
                                }).join(' ')}
                                fill="none"
                                stroke="#DC2626"
                                strokeWidth="2"
                                strokeDasharray="5,5"
                                opacity="0.7"
                            />
                            {reportData.periodTrends[periodTrendFilter].map((period, index) => {
                                const maxValue = Math.max(...reportData.periodTrends[periodTrendFilter].map(p => p.total), 1);
                                const complaintsHeight = (period.complaints / maxValue) * 300;
                                const containerWidth = reportData.periodTrends[periodTrendFilter].length * 60;
                                const x = (index / Math.max(reportData.periodTrends[periodTrendFilter].length - 1, 1)) * containerWidth + 30;
                                const y = 320 - complaintsHeight;
                                return <circle key={`complaint-${index}`} cx={x} cy={y} r="3" fill="#DC2626" stroke="white" strokeWidth="2" />;
                            })}
                            
                            {/* Trendline Saran */}
                            <polyline
                                points={reportData.periodTrends[periodTrendFilter].map((period, index) => {
                                    const maxValue = Math.max(...reportData.periodTrends[periodTrendFilter].map(p => p.total), 1);
                                    const suggestionsHeight = (period.suggestions / maxValue) * 300;
                                    const containerWidth = reportData.periodTrends[periodTrendFilter].length * 60;
                                    const x = (index / Math.max(reportData.periodTrends[periodTrendFilter].length - 1, 1)) * containerWidth + 30;
                                    const y = 320 - suggestionsHeight;
                                    return `${x},${y}`;
                                }).join(' ')}
                                fill="none"
                                stroke="#9333EA"
                                strokeWidth="2"
                                strokeDasharray="5,5"
                                opacity="0.7"
                            />
                            {reportData.periodTrends[periodTrendFilter].map((period, index) => {
                                const maxValue = Math.max(...reportData.periodTrends[periodTrendFilter].map(p => p.total), 1);
                                const suggestionsHeight = (period.suggestions / maxValue) * 300;
                                const containerWidth = reportData.periodTrends[periodTrendFilter].length * 60;
                                const x = (index / Math.max(reportData.periodTrends[periodTrendFilter].length - 1, 1)) * containerWidth + 30;
                                const y = 320 - suggestionsHeight;
                                return <circle key={`suggestion-${index}`} cx={x} cy={y} r="3" fill="#9333EA" stroke="white" strokeWidth="2" />;
                            })}
                            
                            {/* Trendline Permintaan */}
                            <polyline
                                points={reportData.periodTrends[periodTrendFilter].map((period, index) => {
                                    const maxValue = Math.max(...reportData.periodTrends[periodTrendFilter].map(p => p.total), 1);
                                    const informationHeight = (period.information / maxValue) * 300;
                                    const containerWidth = reportData.periodTrends[periodTrendFilter].length * 60;
                                    const x = (index / Math.max(reportData.periodTrends[periodTrendFilter].length - 1, 1)) * containerWidth + 30;
                                    const y = 320 - informationHeight;
                                    return `${x},${y}`;
                                }).join(' ')}
                                fill="none"
                                stroke="#2563EB"
                                strokeWidth="2"
                                strokeDasharray="5,5"
                                opacity="0.7"
                            />
                            {reportData.periodTrends[periodTrendFilter].map((period, index) => {
                                const maxValue = Math.max(...reportData.periodTrends[periodTrendFilter].map(p => p.total), 1);
                                const informationHeight = (period.information / maxValue) * 300;
                                const containerWidth = reportData.periodTrends[periodTrendFilter].length * 60;
                                const x = (index / Math.max(reportData.periodTrends[periodTrendFilter].length - 1, 1)) * containerWidth + 30;
                                const y = 320 - informationHeight;
                                return <circle key={`information-${index}`} cx={x} cy={y} r="3" fill="#2563EB" stroke="white" strokeWidth="2" />;
                            })}
                        </svg>
                        )}
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
                                    <th className="px-6 py-4 text-center">Aksi</th>
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
                                        <td className="px-6 py-4 text-center">
                                            <button 
                                                onClick={() => { setSelectedTicket(r); setShowDetailModal(true); }}
                                                className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
                                                title="Lihat Detail"
                                            >
                                                <span className="material-symbols-outlined text-[20px]">visibility</span>
                                            </button>
                                        </td>
                                    </tr>
                                )) : <tr><td colSpan={8} className="px-6 py-8 text-center text-gray-400">Tidak ada data laporan</td></tr>}
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

            {/* Modal Detail Tiket */}
            {showDetailModal && selectedTicket && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowDetailModal(false)}>
                    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">description</span>
                                Detail Laporan
                            </h3>
                            <button 
                                onClick={() => setShowDetailModal(false)}
                                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase">ID Tiket</label>
                                    <p className="text-sm font-medium text-gray-900 mt-1">{selectedTicket.ticketNumber}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase">Tanggal</label>
                                    <p className="text-sm font-medium text-gray-900 mt-1">{selectedTicket.date}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase">Unit Kerja</label>
                                    <p className="text-sm font-medium text-gray-900 mt-1">{selectedTicket.unitName}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase">Kategori</label>
                                    <p className="text-sm font-medium text-gray-900 mt-1">{selectedTicket.categoryName}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase">Jenis Pasien</label>
                                    <p className="text-sm font-medium text-gray-900 mt-1">{selectedTicket.patientTypeName}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase">Status</label>
                                    <div className="mt-1">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(selectedTicket.status)}`}>
                                            {getStatusLabel(selectedTicket.status)}
                                        </span>
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    <label className="text-xs font-semibold text-gray-500 uppercase">Waktu Respon</label>
                                    <p className="text-sm font-medium text-gray-900 mt-1">
                                        {selectedTicket.responseTime !== null ? (
                                            <span className={selectedTicket.responseTime > 60 ? 'text-red-600' : 'text-green-600'}>
                                                {selectedTicket.responseTime} Menit {selectedTicket.responseTime > 60 ? '(Lambat)' : '(Cepat)'}
                                            </span>
                                        ) : (
                                            <span className="text-gray-400">Belum ada respon</span>
                                        )}
                                    </p>
                                </div>
                                <div className="col-span-2">
                                    <label className="text-xs font-semibold text-gray-500 uppercase">Judul Tiket</label>
                                    <p className="text-sm font-medium text-gray-900 mt-1 bg-gray-50 p-3 rounded-lg">{selectedTicket.title}</p>
                                </div>
                            </div>
                        </div>
                        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">
                            <button 
                                onClick={() => setShowDetailModal(false)}
                                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Reports;
