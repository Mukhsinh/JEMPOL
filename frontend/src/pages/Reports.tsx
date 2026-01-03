import { useState, useEffect } from 'react';
import reportService, { ReportData, ReportFilters } from '../services/reportService';

const Reports = () => {
    const [reportData, setReportData] = useState<{
        data: ReportData[];
        summary: any;
        pagination: any;
    } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<ReportFilters>({
        dateRange: 'month',
        unitId: '',
        categoryId: '',
        status: '',
        priority: ''
    });
    const [units, setUnits] = useState<Array<{ id: string; name: string }>>([]);
    const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [showFilters, setShowFilters] = useState({
        dateRange: false,
        unit: false,
        category: false
    });

    // Load initial data
    useEffect(() => {
        loadReportData();
        loadFilterOptions();
    }, []);

    // Reload data when filters change
    useEffect(() => {
        loadReportData();
    }, [filters, currentPage]);

    const loadReportData = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await reportService.getReportData({
                ...filters,
                page: currentPage,
                limit: 10
            });
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
            const [unitsData, categoriesData] = await Promise.all([
                reportService.getUnits(),
                reportService.getServiceCategories()
            ]);
            setUnits(unitsData);
            setCategories(categoriesData);
        } catch (err) {
            console.error('Error loading filter options:', err);
        }
    };

    const handleFilterChange = (key: keyof ReportFilters, value: string) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
        setCurrentPage(1); // Reset to first page when filters change
    };

    const applyFilters = () => {
        loadReportData();
        // Close all dropdowns
        setShowFilters({
            dateRange: false,
            unit: false,
            category: false
        });
    };

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

    const getUnitLabel = () => {
        if (!filters.unitId) return 'Semua Unit';
        const unit = units.find(u => u.id === filters.unitId);
        return unit ? unit.name : 'Semua Unit';
    };

    const getCategoryLabel = () => {
        if (!filters.categoryId) return 'Semua Kategori';
        const category = categories.find(c => c.id === filters.categoryId);
        return category ? category.name : 'Semua Kategori';
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
            case 'in_progress': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
            case 'resolved': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
            case 'closed': return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
            case 'escalated': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
            default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
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
                    <p className="text-gray-600 dark:text-gray-400">Memuat data laporan...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Terjadi Kesalahan</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
                    <button
                        onClick={loadReportData}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        Coba Lagi
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 p-6 md:p-8 max-w-[1600px] mx-auto">
            {/* Breadcrumbs & Heading */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center text-sm text-[#4c739a] dark:text-slate-400">
                    <a className="hover:text-primary transition-colors" href="/">Beranda</a>
                    <span className="mx-2">/</span>
                    <span className="text-[#0d141b] dark:text-white font-medium">Laporan & Analitik</span>
                </div>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-[#0d141b] dark:text-white text-3xl font-black leading-tight tracking-[-0.033em]">Laporan & Analitik</h1>
                        <p className="text-[#4c739a] dark:text-slate-400 text-base font-normal">Wawasan mendalam mengenai tren komplain dan performa pelayanan RS.</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={exportToPDF}
                            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-surface-dark border border-[#e7edf3] dark:border-slate-700 rounded-lg text-[#0d141b] dark:text-white text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
                        >
                            <span className="material-symbols-outlined text-[20px]">picture_as_pdf</span>
                            Ekspor PDF
                        </button>
                        <button
                            onClick={exportToExcel}
                            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-surface-dark border border-[#e7edf3] dark:border-slate-700 rounded-lg text-[#0d141b] dark:text-white text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
                        >
                            <span className="material-symbols-outlined text-[20px]">table_view</span>
                            Ekspor Excel
                        </button>
                    </div>
                </div>
            </div>

            {/* Filters Section */}
            <div className="bg-white dark:bg-surface-dark rounded-xl border border-[#e7edf3] dark:border-slate-700 p-4 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex flex-wrap gap-3 flex-1 w-full">
                        {/* Date Range Filter */}
                        <div className="relative">
                            <button
                                onClick={() => setShowFilters(prev => ({ ...prev, dateRange: !prev.dateRange }))}
                                className="flex h-10 shrink-0 items-center justify-between gap-x-2 rounded-lg bg-[#f6f7f8] dark:bg-slate-800 hover:bg-[#eef2f6] dark:hover:bg-slate-700 px-4 min-w-[180px] text-left transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[#4c739a] text-[20px]">calendar_month</span>
                                    <p className="text-[#0d141b] dark:text-white text-sm font-medium">{getDateRangeLabel()}</p>
                                </div>
                                <span className="material-symbols-outlined text-[#0d141b] dark:text-white text-[20px]">expand_more</span>
                            </button>
                            {showFilters.dateRange && (
                                <div className="absolute top-full left-0 mt-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg z-10 min-w-[180px]">
                                    {[
                                        { value: 'week', label: 'Minggu Ini' },
                                        { value: 'month', label: 'Bulan Ini' },
                                        { value: 'quarter', label: 'Kuartal Ini' },
                                        { value: 'year', label: 'Tahun Ini' }
                                    ].map(option => (
                                        <button
                                            key={option.value}
                                            onClick={() => {
                                                handleFilterChange('dateRange', option.value);
                                                setShowFilters(prev => ({ ...prev, dateRange: false }));
                                            }}
                                            className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-slate-700 text-sm"
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Unit Filter */}
                        <div className="relative">
                            <button
                                onClick={() => setShowFilters(prev => ({ ...prev, unit: !prev.unit }))}
                                className="flex h-10 shrink-0 items-center justify-between gap-x-2 rounded-lg bg-[#f6f7f8] dark:bg-slate-800 hover:bg-[#eef2f6] dark:hover:bg-slate-700 px-4 min-w-[160px] text-left transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[#4c739a] text-[20px]">domain</span>
                                    <p className="text-[#0d141b] dark:text-white text-sm font-medium">{getUnitLabel()}</p>
                                </div>
                                <span className="material-symbols-outlined text-[#0d141b] dark:text-white text-[20px]">expand_more</span>
                            </button>
                            {showFilters.unit && (
                                <div className="absolute top-full left-0 mt-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg z-10 min-w-[200px] max-h-60 overflow-y-auto">
                                    <button
                                        onClick={() => {
                                            handleFilterChange('unitId', '');
                                            setShowFilters(prev => ({ ...prev, unit: false }));
                                        }}
                                        className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-slate-700 text-sm border-b border-gray-100 dark:border-slate-700"
                                    >
                                        Semua Unit
                                    </button>
                                    {units.map(unit => (
                                        <button
                                            key={unit.id}
                                            onClick={() => {
                                                handleFilterChange('unitId', unit.id);
                                                setShowFilters(prev => ({ ...prev, unit: false }));
                                            }}
                                            className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-slate-700 text-sm"
                                        >
                                            {unit.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Category Filter */}
                        <div className="relative">
                            <button
                                onClick={() => setShowFilters(prev => ({ ...prev, category: !prev.category }))}
                                className="flex h-10 shrink-0 items-center justify-between gap-x-2 rounded-lg bg-[#f6f7f8] dark:bg-slate-800 hover:bg-[#eef2f6] dark:hover:bg-slate-700 px-4 min-w-[160px] text-left transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[#4c739a] text-[20px]">category</span>
                                    <p className="text-[#0d141b] dark:text-white text-sm font-medium">{getCategoryLabel()}</p>
                                </div>
                                <span className="material-symbols-outlined text-[#0d141b] dark:text-white text-[20px]">expand_more</span>
                            </button>
                            {showFilters.category && (
                                <div className="absolute top-full left-0 mt-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg z-10 min-w-[200px] max-h-60 overflow-y-auto">
                                    <button
                                        onClick={() => {
                                            handleFilterChange('categoryId', '');
                                            setShowFilters(prev => ({ ...prev, category: false }));
                                        }}
                                        className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-slate-700 text-sm border-b border-gray-100 dark:border-slate-700"
                                    >
                                        Semua Kategori
                                    </button>
                                    {categories.map(category => (
                                        <button
                                            key={category.id}
                                            onClick={() => {
                                                handleFilterChange('categoryId', category.id);
                                                setShowFilters(prev => ({ ...prev, category: false }));
                                            }}
                                            className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-slate-700 text-sm"
                                        >
                                            {category.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={applyFilters}
                        className="h-10 px-6 bg-primary hover:bg-blue-600 text-white text-sm font-medium rounded-lg shadow-sm transition-colors w-full md:w-auto"
                    >
                        Terapkan Filter
                    </button>
                </div>
            </div>

            {/* KPI Cards Grid */}
            {reportData && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Card 1 */}
                    <div className="bg-white dark:bg-surface-dark p-5 rounded-xl border border-[#e7edf3] dark:border-slate-700 shadow-sm flex flex-col gap-2">
                        <div className="flex justify-between items-start">
                            <div className="bg-blue-50 dark:bg-blue-900/20 text-primary p-2 rounded-lg">
                                <span className="material-symbols-outlined">inbox</span>
                            </div>
                            <span className={`text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400`}>
                                <span className="material-symbols-outlined text-[14px]">
                                    arrow_upward
                                </span>
                                5%
                            </span>
                        </div>
                        <div>
                            <p className="text-[#4c739a] dark:text-slate-400 text-sm font-medium">Total Komplain</p>
                            <h3 className="text-[#0d141b] dark:text-white text-2xl font-bold">{reportData.summary?.total_tickets || 0}</h3>
                        </div>
                    </div>

                    {/* Card 2 */}
                    <div className="bg-white dark:bg-surface-dark p-5 rounded-xl border border-[#e7edf3] dark:border-slate-700 shadow-sm flex flex-col gap-2">
                        <div className="flex justify-between items-start">
                            <div className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-2 rounded-lg">
                                <span className="material-symbols-outlined">check_circle</span>
                            </div>
                            <span className={`text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400`}>
                                <span className="material-symbols-outlined text-[14px]">
                                    arrow_upward
                                </span>
                                3%
                            </span>
                        </div>
                        <div>
                            <p className="text-[#4c739a] dark:text-slate-400 text-sm font-medium">Diselesaikan</p>
                            <h3 className="text-[#0d141b] dark:text-white text-2xl font-bold">{reportData.summary?.resolved_tickets || 0}</h3>
                        </div>
                    </div>

                    {/* Card 3 */}
                    <div className="bg-white dark:bg-surface-dark p-5 rounded-xl border border-[#e7edf3] dark:border-slate-700 shadow-sm flex flex-col gap-2">
                        <div className="flex justify-between items-start">
                            <div className="bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 p-2 rounded-lg">
                                <span className="material-symbols-outlined">timer</span>
                            </div>
                            <span className={`text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400`}>
                                <span className="material-symbols-outlined text-[14px]">
                                    arrow_downward
                                </span>
                                2m
                            </span>
                        </div>
                        <div>
                            <p className="text-[#4c739a] dark:text-slate-400 text-sm font-medium">Rata-rata Respon</p>
                            <h3 className="text-[#0d141b] dark:text-white text-2xl font-bold">{reportData.summary?.average_resolution_time || 0} Menit</h3>
                        </div>
                    </div>

                    {/* Card 4 AI Prediction */}
                    <div className="bg-gradient-to-br from-primary/5 to-white dark:to-surface-dark p-5 rounded-xl border border-primary/20 shadow-sm flex flex-col gap-2 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2 opacity-10">
                            <span className="material-symbols-outlined text-6xl text-primary">auto_awesome</span>
                        </div>
                        <div className="flex justify-between items-start relative z-10">
                            <div className="bg-primary/10 text-primary p-2 rounded-lg">
                                <span className="material-symbols-outlined">trending_up</span>
                            </div>
                            <span className="text-xs font-bold px-2 py-1 rounded-full border border-primary/20 text-primary bg-white dark:bg-slate-800">
                                Prediksi AI
                            </span>
                        </div>
                        <div className="relative z-10">
                            <p className="text-[#4c739a] dark:text-slate-400 text-sm font-medium">Proyeksi Minggu Depan</p>
                            <h3 className="text-[#0d141b] dark:text-white text-2xl font-bold">~{Math.ceil((reportData.summary?.total_tickets || 0) * 1.1)} <span className="text-sm font-normal text-gray-500">Kasus</span></h3>
                        </div>
                    </div>
                </div>
            )}

            {/* Charts Section */}
            {reportData && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Trend Chart */}
                    <div className="lg:col-span-2 bg-white dark:bg-surface-dark p-6 rounded-xl border border-[#e7edf3] dark:border-slate-700 shadow-sm flex flex-col gap-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-[#0d141b] dark:text-white text-lg font-bold">Tren Komplain (30 Hari)</h3>
                            <button className="text-primary text-sm font-medium hover:underline">Lihat Detail</button>
                        </div>
                        {/* Simple Chart Visualization */}
                        <div className="w-full h-64 flex flex-col justify-end relative pl-8 pb-6">
                            {/* Y-axis labels */}
                            <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-400 pb-6 pr-2">
                                <span>100</span>
                                <span>75</span>
                                <span>50</span>
                                <span>25</span>
                                <span>0</span>
                            </div>
                            {/* X-axis line */}
                            <div className="absolute bottom-6 left-8 right-0 border-b border-gray-200 dark:border-gray-700"></div>
                            {/* Chart Bars */}
                            <div className="w-full h-full flex items-end justify-between gap-1 z-10 pt-2">
                                {reportData.data && reportData.data.slice(-7).map((_: any, index: number) => {
                                    const maxValue = Math.max(...reportData.data.map((_: any) => 1));
                                    const height = maxValue > 0 ? (1 / maxValue) * 100 : 0;
                                    return (
                                        <div key={index} className="flex flex-col items-center flex-1">
                                            <div
                                                className="w-full bg-primary rounded-t-sm min-h-[4px]"
                                                style={{ height: `${height}%` }}
                                                title={`1 komplain`}
                                            ></div>
                                        </div>
                                    );
                                })}
                            </div>
                            {/* X-axis labels */}
                            <div className="absolute bottom-0 left-8 right-0 flex justify-between text-xs text-gray-400 pt-2">
                                {reportData.data && reportData.data.slice(-7).map((item: any, index: number) => (
                                    <span key={index} className="text-center flex-1">
                                        {new Date(item.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit' })}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Risk Analysis Chart */}
                    <div className="bg-white dark:bg-surface-dark p-6 rounded-xl border border-[#e7edf3] dark:border-slate-700 shadow-sm flex flex-col gap-4">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="material-symbols-outlined text-orange-500">warning</span>
                            <h3 className="text-[#0d141b] dark:text-white text-lg font-bold">Risiko Tinggi</h3>
                        </div>
                        <div className="flex flex-col gap-4 flex-1 justify-center">
                            {[
                                { unitName: 'Unit A', riskLevel: 'high', riskPercentage: 75 },
                                { unitName: 'Unit B', riskLevel: 'medium', riskPercentage: 45 },
                                { unitName: 'Unit C', riskLevel: 'low', riskPercentage: 20 }
                            ].map((risk: any, index: number) => (
                                <div key={index} className="flex flex-col gap-1">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium text-gray-700 dark:text-gray-300">{risk.unitName}</span>
                                        <span className={`font-bold ${risk.riskLevel === 'critical' ? 'text-red-600' :
                                                risk.riskLevel === 'high' ? 'text-orange-500' :
                                                    risk.riskLevel === 'medium' ? 'text-yellow-500' :
                                                        'text-primary'
                                            }`}>{risk.riskPercentage}%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5">
                                        <div
                                            className={`h-2.5 rounded-full ${getRiskColor(risk.riskLevel)}`}
                                            style={{ width: `${risk.riskPercentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-2 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-xs text-[#4c739a] dark:text-blue-300 flex gap-2 items-start">
                            <span className="material-symbols-outlined text-[16px] text-primary mt-0.5">info</span>
                            <p>Prediksi risiko berdasarkan volume komplain dan waktu respon lambat dalam 7 hari terakhir.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Detailed Data Table */}
            {reportData && (
                <div className="bg-white dark:bg-surface-dark rounded-xl border border-[#e7edf3] dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
                    <div className="px-6 py-4 border-b border-[#e7edf3] dark:border-slate-700 flex justify-between items-center">
                        <h3 className="text-[#0d141b] dark:text-white text-lg font-bold">Detail Laporan Komplain</h3>
                        <button className="text-[#4c739a] hover:text-primary transition-colors">
                            <span className="material-symbols-outlined">filter_list</span>
                        </button>
                    </div>
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 dark:bg-slate-800 text-xs uppercase text-[#4c739a] dark:text-slate-400 font-semibold">
                                <tr>
                                    <th className="px-6 py-4 rounded-tl-lg">ID Tiket</th>
                                    <th className="px-6 py-4">Tanggal</th>
                                    <th className="px-6 py-4">Unit Kerja</th>
                                    <th className="px-6 py-4">Kategori</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 rounded-tr-lg">Waktu Respon</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm text-[#0d141b] dark:text-white divide-y divide-[#e7edf3] dark:divide-slate-700">
                                {reportData.data && reportData.data.map((report: any) => (
                                    <tr key={report.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4 font-medium">{report.ticketNumber}</td>
                                        <td className="px-6 py-4 text-[#4c739a] dark:text-slate-400">{report.date}</td>
                                        <td className="px-6 py-4">{report.unitName}</td>
                                        <td className="px-6 py-4">{report.categoryName}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${getStatusColor(report.status)}`}>
                                                {getStatusLabel(report.status)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {report.responseTime !== null ? (
                                                <span className={`font-medium ${report.responseTime > 60
                                                        ? 'text-red-600 dark:text-red-400'
                                                        : 'text-green-600 dark:text-green-400'
                                                    }`}>
                                                    {report.responseTime} Menit {report.responseTime > 60 ? '(Lambat)' : ''}
                                                </span>
                                            ) : (
                                                <span className="text-[#4c739a] dark:text-slate-400">-</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="px-6 py-4 border-t border-[#e7edf3] dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-slate-800">
                        <span className="text-sm text-[#4c739a] dark:text-slate-400">
                            Menampilkan {((currentPage - 1) * 10) + 1}-{Math.min(currentPage * 10, reportData.pagination?.total || 0)} dari {reportData.pagination?.total || 0} laporan
                        </span>
                        <div className="flex gap-1">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="size-8 flex items-center justify-center rounded border border-[#e7edf3] dark:border-slate-700 bg-white dark:bg-slate-800 text-[#4c739a] dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50"
                            >
                                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                            </button>

                            {/* Page numbers */}
                            {Array.from({ length: Math.min(3, Math.ceil((reportData.pagination?.total || 0) / 10)) }, (_, i) => {
                                const pageNum = currentPage + i - 1;
                                if (pageNum < 1 || pageNum > Math.ceil((reportData.pagination?.total || 0) / 10)) return null;
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`size-8 flex items-center justify-center rounded border text-sm font-medium ${pageNum === currentPage
                                                ? 'border-primary bg-primary text-white'
                                                : 'border-[#e7edf3] dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0d141b] dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700'
                                            }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}

                            <button
                                onClick={() => setCurrentPage(prev => Math.min(Math.ceil((reportData.pagination?.total || 0) / 10), prev + 1))}
                                disabled={currentPage >= Math.ceil((reportData.pagination?.total || 0) / 10)}
                                className="size-8 flex items-center justify-center rounded border border-[#e7edf3] dark:border-slate-700 bg-white dark:bg-slate-800 text-[#4c739a] dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50"
                            >
                                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Reports;