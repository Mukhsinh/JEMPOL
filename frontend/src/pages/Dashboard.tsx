import { useEffect, useState } from 'react';
import { complaintService } from '../services/complaintService';
import KPICard from '../components/KPICard';
import StatusChart from '../components/StatusChart';
import TicketTable from '../components/TicketTable';

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

    // Load initial data
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [unitsResponse, categoriesResponse] = await Promise.all([
                    complaintService.getUnits(),
                    complaintService.getCategories()
                ]);

                if (unitsResponse.success) {
                    setUnits(unitsResponse.data);
                }
                if (categoriesResponse.success) {
                    setCategories(categoriesResponse.data);
                }
            } catch (error) {
                console.error('Error loading initial data:', error);
            }
        };

        loadInitialData();
    }, []);

    // Load metrics when filters change
    useEffect(() => {
        const fetchMetrics = async () => {
            setLoading(true);
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
        const csvData = [
            ['Metric', 'Value'],
            ['Total Tickets', totalTickets.toString()],
            ['Open Tickets', getStatusCount('open').toString()],
            ['In Progress', getStatusCount('in_progress').toString()],
            ['Escalated', getStatusCount('escalated').toString()],
            ['Resolved', getStatusCount('resolved').toString()],
            ['Closed', getStatusCount('closed').toString()]
        ];
        
        const csvContent = csvData.map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dashboard-report-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
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
            case 'last_7_days': return 'Last 7 Days';
            case 'last_30_days': return 'Last 30 Days';
            case 'last_90_days': return 'Last 90 Days';
            case 'this_month': return 'This Month';
            case 'last_month': return 'Last Month';
            default: return 'Last 7 Days';
        }
    };

    const getUnitLabel = (unitId: string) => {
        if (unitId === 'all') return 'All Units';
        const unit = units.find(u => u.id === unitId);
        return unit ? unit.name : 'All Units';
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'all': return 'All Statuses';
            case 'open': return 'Open';
            case 'in_progress': return 'In Progress';
            case 'escalated': return 'Escalated';
            case 'resolved': return 'Resolved';
            case 'closed': return 'Closed';
            default: return 'All Statuses';
        }
    };

    const getCategoryLabel = (categoryId: string) => {
        if (categoryId === 'all') return 'All Categories';
        const category = categories.find(c => c.id === categoryId);
        return category ? category.name : 'All Categories';
    };

    return (
        <>
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Dashboard Overview</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Welcome back, Director Johnson. Here's what's happening today.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleRefresh}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                    >
                        <span className={`material-symbols-outlined text-[20px] ${loading ? 'animate-spin' : ''}`}>refresh</span>
                        <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
                    </button>
                    <button 
                        onClick={handleExportReport}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors shadow-sm shadow-blue-500/30"
                    >
                        <span className="material-symbols-outlined text-[20px]">download</span>
                        <span>Export Report</span>
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-surface-dark p-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="pl-2 pr-4 border-r border-slate-200 dark:border-slate-700">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Filters</span>
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
                                { value: 'last_7_days', label: 'Last 7 Days' },
                                { value: 'last_30_days', label: 'Last 30 Days' },
                                { value: 'last_90_days', label: 'Last 90 Days' },
                                { value: 'this_month', label: 'This Month' },
                                { value: 'last_month', label: 'Last Month' }
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
                                All Units
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
                                { value: 'all', label: 'All Statuses' },
                                { value: 'open', label: 'Open' },
                                { value: 'in_progress', label: 'In Progress' },
                                { value: 'escalated', label: 'Escalated' },
                                { value: 'resolved', label: 'Resolved' },
                                { value: 'closed', label: 'Closed' }
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
                                All Categories
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
                        title="Reset Filters"
                    >
                        <span className="material-symbols-outlined text-[20px]">filter_list_off</span>
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                    title="Total Tickets"
                    value={loading ? "..." : totalTickets.toString()}
                    icon="confirmation_number"
                    trend="+12%"
                    trendDirection="up"
                    trendColor="emerald"
                    iconBgColor="bg-blue-50 dark:bg-blue-900/20"
                    iconColor="text-primary"
                />
                <KPICard
                    title="Open Tickets"
                    value={loading ? "..." : getStatusCount('open').toString()}
                    icon="timer_off"
                    trend="-2%"
                    trendDirection="down"
                    trendColor="emerald"
                    iconBgColor="bg-red-50 dark:bg-red-900/20"
                    iconColor="text-red-600 dark:text-red-400"
                />
                <KPICard
                    title="In Progress"
                    value={loading ? "..." : getStatusCount('in_progress').toString()}
                    icon="history"
                    trend="-10m"
                    trendDirection="down"
                    trendColor="emerald"
                    iconBgColor="bg-orange-50 dark:bg-orange-900/20"
                    iconColor="text-orange-600 dark:text-orange-400"
                />
                <KPICard
                    title="Resolved"
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
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Status Distribution</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Current workload</p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-5 flex-1 justify-center">
                        <div className="flex flex-col gap-1">
                            <div className="flex justify-between text-sm">
                                <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-slate-400"></span> Open
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
                                    <span className="w-2 h-2 rounded-full bg-primary"></span> In Progress
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
                                    <span className="w-2 h-2 rounded-full bg-orange-500"></span> Escalated
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
                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Resolved
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