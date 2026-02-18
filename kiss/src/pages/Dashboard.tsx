import { useEffect, useState } from 'react';
import { complaintService } from '../services/complaintService';
import { useAuth } from '../contexts/AuthContext';
import KPICard from '../components/KPICard';
import StatusChart from '../components/StatusChart';
import TicketTable from '../components/TicketTable';
import { generateDashboardReportPDF } from '../utils/pdfGenerator';

interface FilterState {
    dateRange: string;
    unit_id: string;
    status: string;
    category_id: string;
}

interface Unit {
    id: string;
    name: string;
    code: string;
}

interface ServiceCategory {
    id: string;
    name: string;
    code: string;
}

const Dashboard = () => {
    const { user } = useAuth();
    const [metrics, setMetrics] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [units, setUnits] = useState<Unit[]>([]);
    const [categories, setCategories] = useState<ServiceCategory[]>([]);
    const [filters, setFilters] = useState<FilterState>({
        dateRange: 'last_7_days',
        unit_id: 'all',
        status: 'all',
        category_id: 'all'
    });
    const [showDateDropdown, setShowDateDropdown] = useState(false);
    const [showUnitDropdown, setShowUnitDropdown] = useState(false);
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

    // Load initial data dengan optimasi timeout
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setLoading(true);
                
                // Load data secara bertahap untuk mengurangi beban
                console.log('📊 Loading dashboard data...');
                
                // Load units dan categories secara paralel untuk lebih cepat
                const [unitsResponse, categoriesResponse] = await Promise.all([
                    complaintService.getUnits(),
                    complaintService.getCategories()
                ]);
                
                if (unitsResponse.success) {
                    setUnits(unitsResponse.data);
                    console.log('✅ Units loaded:', unitsResponse.data.length);
                }
                
                if (categoriesResponse.success) {
                    setCategories(categoriesResponse.data);
                    console.log('✅ Categories loaded:', categoriesResponse.data.length);
                }

            } catch (error) {
                console.error('❌ Error loading initial data:', error);
                // Set empty arrays sebagai fallback
                setUnits([]);
                setCategories([]);
            } finally {
                setLoading(false);
            }
        };

        loadInitialData();
    }, []);

    // Load metrics when filters change dengan optimasi timeout
    useEffect(() => {
        const fetchMetrics = async () => {
            setLoading(true);
            try {
                console.log('📈 Fetching dashboard metrics with filters:', filters);
                
                // Timeout lebih pendek untuk response lebih cepat
                const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => reject(new Error('Metrics request timeout')), 8000);
                });
                
                const metricsPromise = complaintService.getDashboardMetricsFiltered({
                    dateRange: filters.dateRange,
                    unit_id: filters.unit_id,
                    category_id: filters.category_id,
                    status: filters.status
                });
                
                const response = await Promise.race([metricsPromise, timeoutPromise]) as any;
                
                if (response.success) {
                    setMetrics(response.data);
                    console.log('✅ Dashboard metrics loaded successfully');
                } else {
                    console.warn('⚠️ Dashboard metrics failed:', response.error);
                    // Set default metrics jika gagal
                    setMetrics({
                        statusCounts: {},
                        totalTickets: 0,
                        recentTickets: []
                    });
                }
            } catch (error) {
                console.error('❌ Error fetching dashboard metrics:', error);
                // Set default metrics sebagai fallback
                setMetrics({
                    statusCounts: {},
                    totalTickets: 0,
                    recentTickets: []
                });
            } finally {
                setLoading(false);
            }
        };

        fetchMetrics();
    }, [filters]);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element;
            if (!target.closest('.relative')) {
                setShowDateDropdown(false);
                setShowUnitDropdown(false);
                setShowStatusDropdown(false);
                setShowCategoryDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const getStatusCount = (status: string) => {
        return metrics?.statusCounts?.[status] || 0;
    };

    const totalTickets = metrics?.statusCounts ? 
        Object.values(metrics.statusCounts).reduce((sum: number, count: any) => sum + count, 0) : 0;

    const handleRefresh = () => {
        setLoading(true);
        const fetchMetrics = async () => {
            try {
                const response = await complaintService.getDashboardMetricsFiltered(filters);
                if (response.success) {
                    setMetrics(response.data);
                }
            } catch (error) {
                console.error('Error fetching dashboard metrics:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchMetrics();
    };

    const handleExportReport = () => {
        if (!metrics) {
            console.warn('Tidak ada data untuk diekspor');
            return;
        }

        // Siapkan data untuk PDF sesuai interface DashboardReportData
        const pdfData = {
            totalTickets,
            statusCounts: {
                open: getStatusCount('open'),
                in_progress: getStatusCount('in_progress'),
                escalated: getStatusCount('escalated'),
                resolved: getStatusCount('resolved'),
                closed: getStatusCount('closed')
            },
            recentTickets: metrics.recentTickets || [],
            filters: {
                dateRange: getDateRangeLabel(filters.dateRange),
                unit: getUnitLabel(filters.unit_id),
                status: getStatusLabel(filters.status),
                category: getCategoryLabel(filters.category_id)
            },
            generatedAt: new Date().toISOString()
        };

        // Generate PDF
        generateDashboardReportPDF(pdfData);
    };

    const handleFilterChange = (key: keyof FilterState, value: string) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
        setShowDateDropdown(false);
        setShowUnitDropdown(false);
        setShowStatusDropdown(false);
        setShowCategoryDropdown(false);
    };

    const getDateRangeLabel = (range: string) => {
        switch (range) {
            case 'last_7_days': return '7 Hari Terakhir';
            case 'last_30_days': return '30 Hari Terakhir';
            case 'last_90_days': return '90 Hari Terakhir';
            case 'this_month': return 'Bulan Ini';
            case 'last_month': return 'Bulan Lalu';
            default: return '7 Hari Terakhir';
        }
    };

    const getUnitLabel = (unitId: string) => {
        if (unitId === 'all') return 'Semua Unit';
        const unit = units.find(u => u.id === unitId);
        return unit ? unit.name : 'Semua Unit';
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'all': return 'Semua Status';
            case 'open': return 'Terbuka';
            case 'in_progress': return 'Diproses';
            case 'escalated': return 'Eskalasi';
            case 'resolved': return 'Selesai';
            case 'closed': return 'Ditutup';
            default: return 'Semua Status';
        }
    };

    const getCategoryLabel = (categoryId: string) => {
        if (categoryId === 'all') return 'Semua Kategori';
        const category = categories.find(c => c.id === categoryId);
        return category ? category.name : 'Semua Kategori';
    };

    return (
        <>
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Ringkasan Dasbor</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Selamat datang kembali, {user?.full_name || 'Pengguna'}. Berikut adalah ringkasan hari ini.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleRefresh}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                    >
                        <span className={`material-symbols-outlined text-[20px] ${loading ? 'animate-spin' : ''}`}>refresh</span>
                        <span>{loading ? 'Memuat...' : 'Perbarui'}</span>
                    </button>
                    <button 
                        onClick={handleExportReport}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors shadow-sm shadow-blue-500/30"
                    >
                        <span className="material-symbols-outlined text-[20px]">download</span>
                        <span>Unduh Laporan</span>
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-surface-dark p-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="pl-2 pr-4 border-r border-slate-200 dark:border-slate-700">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Filter</span>
                </div>
                
                {/* Date Range Filter */}
                <div className="relative">
                    <button 
                        onClick={() => {
                            setShowDateDropdown(!showDateDropdown);
                            setShowUnitDropdown(false);
                            setShowStatusDropdown(false);
                            setShowCategoryDropdown(false);
                        }}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-sm font-medium text-slate-700 dark:text-slate-200"
                    >
                        <span>{getDateRangeLabel(filters.dateRange)}</span>
                        <span className="material-symbols-outlined text-[18px]">keyboard_arrow_down</span>
                    </button>
                    {showDateDropdown && (
                        <div className="absolute top-full left-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-10 min-w-[160px]">
                            {[
                                { value: 'last_7_days', label: '7 Hari Terakhir' },
                                { value: 'last_30_days', label: '30 Hari Terakhir' },
                                { value: 'last_90_days', label: '90 Hari Terakhir' },
                                { value: 'this_month', label: 'Bulan Ini' },
                                { value: 'last_month', label: 'Bulan Lalu' }
                            ].map(option => (
                                <button
                                    key={option.value}
                                    onClick={() => handleFilterChange('dateRange', option.value)}
                                    className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 ${
                                        filters.dateRange === option.value ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'
                                    }`}
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
                        onClick={() => {
                            setShowUnitDropdown(!showUnitDropdown);
                            setShowDateDropdown(false);
                            setShowStatusDropdown(false);
                            setShowCategoryDropdown(false);
                        }}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-sm font-medium text-slate-700 dark:text-slate-200"
                    >
                        <span>{getUnitLabel(filters.unit_id)}</span>
                        <span className="material-symbols-outlined text-[18px]">keyboard_arrow_down</span>
                    </button>
                    {showUnitDropdown && (
                        <div className="absolute top-full left-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-10 min-w-[200px] max-h-60 overflow-y-auto">
                            <button
                                onClick={() => handleFilterChange('unit_id', 'all')}
                                className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 ${
                                    filters.unit_id === 'all' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'
                                }`}
                            >
                                Semua Unit
                            </button>
                            {units.map(unit => (
                                <button
                                    key={unit.id}
                                    onClick={() => handleFilterChange('unit_id', unit.id)}
                                    className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 ${
                                        filters.unit_id === unit.id ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'
                                    }`}
                                >
                                    {unit.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Status Filter */}
                <div className="relative">
                    <button 
                        onClick={() => {
                            setShowStatusDropdown(!showStatusDropdown);
                            setShowDateDropdown(false);
                            setShowUnitDropdown(false);
                            setShowCategoryDropdown(false);
                        }}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-sm font-medium text-slate-700 dark:text-slate-200"
                    >
                        <span>{getStatusLabel(filters.status)}</span>
                        <span className="material-symbols-outlined text-[18px]">keyboard_arrow_down</span>
                    </button>
                    {showStatusDropdown && (
                        <div className="absolute top-full left-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-10 min-w-[160px]">
                            {[
                                { value: 'all', label: 'Semua Status' },
                                { value: 'open', label: 'Terbuka' },
                                { value: 'in_progress', label: 'Diproses' },
                                { value: 'escalated', label: 'Eskalasi' },
                                { value: 'resolved', label: 'Selesai' },
                                { value: 'closed', label: 'Ditutup' }
                            ].map(option => (
                                <button
                                    key={option.value}
                                    onClick={() => handleFilterChange('status', option.value)}
                                    className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 ${
                                        filters.status === option.value ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'
                                    }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Category Filter */}
                <div className="relative">
                    <button 
                        onClick={() => {
                            setShowCategoryDropdown(!showCategoryDropdown);
                            setShowDateDropdown(false);
                            setShowUnitDropdown(false);
                            setShowStatusDropdown(false);
                        }}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-sm font-medium text-slate-700 dark:text-slate-200"
                    >
                        <span>{getCategoryLabel(filters.category_id)}</span>
                        <span className="material-symbols-outlined text-[18px]">keyboard_arrow_down</span>
                    </button>
                    {showCategoryDropdown && (
                        <div className="absolute top-full left-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-10 min-w-[200px] max-h-60 overflow-y-auto">
                            <button
                                onClick={() => handleFilterChange('category_id', 'all')}
                                className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 ${
                                    filters.category_id === 'all' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'
                                }`}
                            >
                                Semua Kategori
                            </button>
                            {categories.map(category => (
                                <button
                                    key={category.id}
                                    onClick={() => handleFilterChange('category_id', category.id)}
                                    className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 ${
                                        filters.category_id === category.id ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'
                                    }`}
                                >
                                    {category.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="ml-auto">
                    <button 
                        onClick={() => {
                            setFilters({
                                dateRange: 'last_7_days',
                                unit_id: 'all',
                                status: 'all',
                                category_id: 'all'
                            });
                        }}
                        className="p-1.5 text-slate-400 hover:text-primary transition-colors"
                        title="Reset Filter"
                    >
                        <span className="material-symbols-outlined text-[20px]">filter_list_off</span>
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                    title="Total Tiket"
                    value={loading ? "..." : totalTickets.toString()}
                    icon="confirmation_number"
                    trend="+12%"
                    trendDirection="up"
                    trendColor="emerald"
                    iconBgColor="bg-blue-50 dark:bg-blue-900/20"
                    iconColor="text-primary"
                />
                <KPICard
                    title="Tiket Terbuka"
                    value={loading ? "..." : getStatusCount('open').toString()}
                    icon="timer_off"
                    trend="-2%"
                    trendDirection="down"
                    trendColor="emerald"
                    iconBgColor="bg-red-50 dark:bg-red-900/20"
                    iconColor="text-red-600 dark:text-red-400"
                />
                <KPICard
                    title="Diproses"
                    value={loading ? "..." : getStatusCount('in_progress').toString()}
                    icon="history"
                    trend="-10m"
                    trendDirection="down"
                    trendColor="emerald"
                    iconBgColor="bg-orange-50 dark:bg-orange-900/20"
                    iconColor="text-orange-600 dark:text-orange-400"
                />
                <KPICard
                    title="Selesai"
                    value={loading ? "..." : getStatusCount('resolved').toString()}
                    subValue=""
                    icon="thumb_up"
                    trend="+0.2"
                    trendDirection="up"
                    trendColor="emerald"
                    iconBgColor="bg-purple-50 dark:bg-purple-900/20"
                    iconColor="text-purple-600 dark:text-purple-400"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <StatusChart />
                <div className="lg:col-span-1 bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Distribusi Status</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Beban kerja saat ini</p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-5 flex-1 justify-center">
                        <div className="flex flex-col gap-1">
                            <div className="flex justify-between text-sm">
                                <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-slate-400"></span> Terbuka
                                </span>
                                <span className="font-bold text-slate-900 dark:text-white">{getStatusCount('open')}</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-slate-400 rounded-full" style={{ width: `${totalTickets > 0 ? (getStatusCount('open') / totalTickets) * 100 : 0}%` }}></div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <div className="flex justify-between text-sm">
                                <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-primary"></span> Diproses
                                </span>
                                <span className="font-bold text-slate-900 dark:text-white">{getStatusCount('in_progress')}</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-primary rounded-full" style={{ width: `${totalTickets > 0 ? (getStatusCount('in_progress') / totalTickets) * 100 : 0}%` }}></div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <div className="flex justify-between text-sm">
                                <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-orange-500"></span> Eskalasi
                                </span>
                                <span className="font-bold text-slate-900 dark:text-white">{getStatusCount('escalated')}</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-orange-500 rounded-full" style={{ width: `${totalTickets > 0 ? (getStatusCount('escalated') / totalTickets) * 100 : 0}%` }}></div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <div className="flex justify-between text-sm">
                                <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Selesai
                                </span>
                                <span className="font-bold text-slate-900 dark:text-white">{getStatusCount('resolved')}</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${totalTickets > 0 ? (getStatusCount('resolved') / totalTickets) * 100 : 0}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <TicketTable />
        </>
    );
};

export default Dashboard;