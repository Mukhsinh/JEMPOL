import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../utils/supabaseClient';
import Modal from '../components/ui/Modal';
import { Database } from '../types/supabase';
import unitService, { Unit } from '../services/unitService';
import { masterDataService, ServiceCategory } from '../services/masterDataService';

type Ticket = Database['public']['Tables']['tickets']['Row'] & {
    unit?: { name: string } | null;
    category?: { name: string } | null;
};

interface Stats {
    totalTickets: number;
    slaBreachRate: number;
    avgResolutionTime: string;
    csatScore: number;
}

interface StatusDistribution {
    open: number;
    in_progress: number;
    escalated: number;
    resolved: number;
    closed: number;
}

interface UnitTicketCount {
    unit_name: string;
    count: number;
}

interface FilterState {
    dateRange: string;
    unitId: string;
    status: string;
    priority: string;
    category: string;
}

export default function DashboardPage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [stats, setStats] = useState<Stats>({
        totalTickets: 0,
        slaBreachRate: 0,
        avgResolutionTime: '0 jam',
        csatScore: 0
    });
    const [loading, setLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Real data states
    const [statusDistribution, setStatusDistribution] = useState<StatusDistribution>({
        open: 0,
        in_progress: 0,
        escalated: 0,
        resolved: 0,
        closed: 0
    });
    const [unitTicketCounts, setUnitTicketCounts] = useState<UnitTicketCount[]>([]);
    
    // Filter states
    const [filters, setFilters] = useState<FilterState>({
        dateRange: '7_days',
        unitId: '',
        status: '',
        priority: '',
        category: ''
    });
    
    // Master data for filters
    const [units, setUnits] = useState<Unit[]>([]);
    const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([]);
    // const [ticketStatuses, setTicketStatuses] = useState<TicketStatus[]>([]);
    
    // Dropdown states
    const [dropdownStates, setDropdownStates] = useState({
        dateRange: false,
        unit: false,
        status: false,
        priority: false,
        category: false
    });

    useEffect(() => {
        fetchDashboardData();
        fetchMasterData();
    }, [filters]);

    async function fetchMasterData() {
        try {
            // Fetch units
            const unitsResponse = await unitService.getUnits();
            setUnits(unitsResponse.units || []);
            
            // Fetch service categories
            const categoriesResponse = await masterDataService.getServiceCategories();
            setServiceCategories(categoriesResponse || []);
            
            // Fetch ticket statuses
            // const statusesResponse = await masterDataService.getTicketStatuses();
            // setTicketStatuses(statusesResponse || []);
        } catch (error) {
            console.error('Error fetching master data:', error);
        }
    }

    async function fetchDashboardData() {
        setLoading(true);
        try {
            // Calculate date filter
            const now = new Date();
            let startDate = new Date();
            
            switch (filters.dateRange) {
                case '1_day':
                    startDate.setDate(now.getDate() - 1);
                    break;
                case '7_days':
                    startDate.setDate(now.getDate() - 7);
                    break;
                case '30_days':
                    startDate.setDate(now.getDate() - 30);
                    break;
                case '90_days':
                    startDate.setDate(now.getDate() - 90);
                    break;
                default:
                    startDate.setDate(now.getDate() - 7);
            }

            // Build query for internal tickets
            let internalQuery = supabase
                .from('tickets')
                .select(`
                    *,
                    unit:unit_id (name),
                    category:category_id (name)
                `)
                .order('created_at', { ascending: false });

            // Build query for external tickets
            let externalQuery = supabase
                .from('external_tickets')
                .select(`
                    *,
                    unit:unit_id (name)
                `)
                .order('created_at', { ascending: false });

            // Apply date filter
            if (filters.dateRange !== '') {
                internalQuery = internalQuery.gte('created_at', startDate.toISOString());
                externalQuery = externalQuery.gte('created_at', startDate.toISOString());
            }

            // Apply unit filter
            if (filters.unitId) {
                internalQuery = internalQuery.eq('unit_id', filters.unitId);
                externalQuery = externalQuery.eq('unit_id', filters.unitId);
            }

            // Apply status filter
            if (filters.status) {
                internalQuery = internalQuery.eq('status', filters.status);
                externalQuery = externalQuery.eq('status', filters.status);
            }

            // Apply priority filter
            if (filters.priority) {
                internalQuery = internalQuery.eq('priority', filters.priority);
                externalQuery = externalQuery.eq('priority', filters.priority);
            }

            // Apply category filter (only for internal tickets)
            if (filters.category) {
                internalQuery = internalQuery.eq('category_id', filters.category);
            }

            // Execute both queries
            const [internalResult, externalResult] = await Promise.all([
                internalQuery,
                externalQuery
            ]);

            if (internalResult.error) throw internalResult.error;
            if (externalResult.error) throw externalResult.error;

            // Format internal tickets
            const internalTickets = (internalResult.data as any[] || []).map((t) => ({
                ...t,
                unit: t.unit,
                category: t.category,
                source_type: 'internal'
            })) as Ticket[];

            // Format external tickets to match Ticket type
            const externalTickets = (externalResult.data as any[] || []).map((t) => ({
                id: t.id,
                ticket_number: t.ticket_number,
                type: t.service_type,
                category_id: null,
                title: t.title,
                description: t.description,
                submitter_name: t.reporter_name,
                submitter_email: t.reporter_email,
                submitter_phone: t.reporter_phone,
                submitter_address: t.reporter_address,
                is_anonymous: t.reporter_identity_type === 'anonymous',
                unit_id: t.unit_id,
                assigned_to: null,
                created_by: null,
                status: t.status,
                priority: t.priority,
                urgency_level: t.urgency_level,
                ai_classification: t.ai_classification,
                sentiment_score: t.sentiment_score,
                confidence_score: t.confidence_score,
                sla_deadline: t.sla_deadline,
                first_response_at: t.first_response_at,
                resolved_at: t.resolved_at,
                source: t.source || 'qr_code',
                qr_code_id: t.qr_code_id,
                ip_address: t.ip_address,
                user_agent: t.user_agent,
                created_at: t.created_at,
                updated_at: t.updated_at,
                unit: t.unit,
                category: { name: t.category || '-' },
                source_type: 'external'
            })) as Ticket[];

            // Combine and sort all tickets
            const allTickets = [...internalTickets, ...externalTickets].sort((a, b) => {
                const dateA = new Date(a.created_at || 0).getTime();
                const dateB = new Date(b.created_at || 0).getTime();
                return dateB - dateA;
            });

            setTickets(allTickets);

            // Calculate stats
            const total = allTickets.length;
            const breached = allTickets.filter((t) => {
                if (!t.sla_deadline) return false;
                const deadline = new Date(t.sla_deadline).getTime();
                const now = new Date().getTime();
                // Jika belum selesai dan lewat deadline, atau selesai tapi lewat deadline
                if (t.status !== 'resolved' && now > deadline) return true;
                if (t.status === 'resolved' && t.resolved_at && new Date(t.resolved_at).getTime() > deadline) return true;
                return false;
            }).length;

            const breachRate = total > 0 ? (breached / total) * 100 : 0;

            // Calculate Avg Resolution Time
            const resolvedTickets = allTickets.filter((t) => t.status === 'resolved' && t.resolved_at);
            let avgTime = 0;
            if (resolvedTickets.length > 0) {
                const totalTime = resolvedTickets.reduce((acc, t) => {
                    const created = new Date(t.created_at!).getTime();
                    const closed = new Date(t.resolved_at!).getTime();
                    return acc + (closed - created);
                }, 0);
                avgTime = totalTime / resolvedTickets.length / (1000 * 60 * 60); // in hours
            }

            setStats({
                totalTickets: total,
                slaBreachRate: breachRate,
                avgResolutionTime: resolvedTickets.length > 0 ? `${avgTime.toFixed(1)} jam` : '0 jam',
                csatScore: 4.8 // Mock for now, nanti ambil dari tabel survei kepuasan
            });

            // Calculate status distribution from real data
            const statusCounts: StatusDistribution = {
                open: allTickets.filter(t => t.status === 'open').length,
                in_progress: allTickets.filter(t => t.status === 'in_progress').length,
                escalated: allTickets.filter(t => t.status === 'escalated').length,
                resolved: allTickets.filter(t => t.status === 'resolved').length,
                closed: allTickets.filter(t => t.status === 'closed').length
            };
            setStatusDistribution(statusCounts);

            // Calculate tickets per unit from real data
            const unitCounts: { [key: string]: number } = {};
            allTickets.forEach(ticket => {
                const unitName = (ticket.unit as any)?.name || 'Tidak Diketahui';
                unitCounts[unitName] = (unitCounts[unitName] || 0) + 1;
            });
            const unitTicketArray = Object.entries(unitCounts).map(([unit_name, count]) => ({
                unit_name,
                count
            })).sort((a, b) => b.count - a.count);
            setUnitTicketCounts(unitTicketArray);

            // Fetch CSAT score from satisfaction_surveys
            const { data: csatData } = await supabase
                .from('satisfaction_surveys')
                .select('overall_score');
            
            if (csatData && csatData.length > 0) {
                const avgCsat = csatData.reduce((acc: number, s: { overall_score: number | null }) => acc + (s.overall_score || 0), 0) / csatData.length;
                setStats(prev => ({ ...prev, csatScore: parseFloat(avgCsat.toFixed(1)) }));
            }

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    }

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const handleViewTicket = (ticket: Ticket) => {
        setSelectedTicket(ticket);
        setIsModalOpen(true);
    };

    const handleFilterChange = (filterType: keyof FilterState, value: string) => {
        setFilters(prev => ({
            ...prev,
            [filterType]: value
        }));
        
        // Close dropdown after selection
        setDropdownStates(prev => ({
            ...prev,
            [filterType === 'unitId' ? 'unit' : filterType]: false
        }));
    };

    const toggleDropdown = (dropdown: keyof typeof dropdownStates) => {
        setDropdownStates(prev => ({
            ...prev,
            [dropdown]: !prev[dropdown]
        }));
    };

    const getDateRangeLabel = (range: string) => {
        switch (range) {
            case '1_day': return '1 Hari Terakhir';
            case '7_days': return '7 Hari Terakhir';
            case '30_days': return '30 Hari Terakhir';
            case '90_days': return '90 Hari Terakhir';
            default: return '7 Hari Terakhir';
        }
    };

    const getPriorityLabel = (priority: string) => {
        switch (priority) {
            case 'low': return 'Rendah';
            case 'medium': return 'Sedang';
            case 'high': return 'Tinggi';
            case 'critical': return 'Kritis';
            default: return 'Semua Prioritas';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'open': return 'Terbuka';
            case 'in_progress': return 'Diproses';
            case 'escalated': return 'Eskalasi';
            case 'resolved': return 'Selesai';
            case 'closed': return 'Ditutup';
            default: return 'Semua Status';
        }
    };

    // Helper untuk warna status
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-900/50';
            case 'in_progress': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-900/50';
            case 'escalated': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200 dark:border-orange-900/50';
            case 'resolved': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/50';
            case 'closed': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-900/50';
            default: return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600';
        }
    };

    return (
        <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display transition-colors duration-200">
            {/* Sidebar */}
            <aside className="w-64 flex-shrink-0 bg-surface-light dark:bg-surface-dark border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between h-full transition-colors duration-200 z-20">
                <div className="flex flex-col gap-6 p-4">
                    {/* Brand */}
                    <div className="flex items-center gap-3 px-2">
                        <div className="bg-primary/10 flex items-center justify-center rounded-lg h-10 w-10 shrink-0">
                            <span className="material-symbols-outlined text-primary text-2xl">local_hospital</span>
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-slate-900 dark:text-white text-base font-bold leading-tight">Rumah Sakit Kota</h1>
                            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">Sistem Manajemen</p>
                        </div>
                    </div>
                    {/* Navigation */}
                    <nav className="flex flex-col gap-1">
                        <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary text-white shadow-md shadow-blue-500/20 group" href="#">
                            <span className="material-symbols-outlined">dashboard</span>
                            <p className="text-sm font-medium">Dasbor</p>
                        </a>
                        <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" href="/tickets">
                            <span className="material-symbols-outlined">confirmation_number</span>
                            <p className="text-sm font-medium">Tiket</p>
                        </a>
                        <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" href="/reports">
                            <span className="material-symbols-outlined">assessment</span>
                            <p className="text-sm font-medium">Laporan</p>
                        </a>
                        <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" href="/users">
                            <span className="material-symbols-outlined">group</span>
                            <p className="text-sm font-medium">Pengguna</p>
                        </a>
                        <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" href="/settings">
                            <span className="material-symbols-outlined">settings</span>
                            <p className="text-sm font-medium">Pengaturan</p>
                        </a>
                    </nav>
                </div>
                {/* Profile */}
                <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer group relative">
                        <div className="bg-center bg-no-repeat bg-cover rounded-full h-9 w-9 ring-2 ring-slate-100 dark:ring-slate-700 bg-slate-200 flex items-center justify-center">
                            <span className="material-symbols-outlined text-slate-500">person</span>
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <p className="text-slate-900 dark:text-white text-sm font-medium truncate">{user?.full_name || 'Pengguna'}</p>
                            <p className="text-slate-500 dark:text-slate-400 text-xs truncate capitalize">{user?.role || 'Staff'}</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="ml-auto p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                            title="Keluar"
                        >
                            <span className="material-symbols-outlined text-[20px]">logout</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto h-full relative">
                <div className="max-w-[1400px] mx-auto p-6 md:p-8 flex flex-col gap-6">
                    {/* Page Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div className="flex flex-col gap-1">
                            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Ringkasan Dasbor</h2>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">Selamat datang kembali, {user?.full_name}. Berikut adalah ringkasan hari ini.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={fetchDashboardData}
                                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            >
                                <span className="material-symbols-outlined text-[20px]">refresh</span>
                                <span>Perbarui</span>
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors shadow-sm shadow-blue-500/30">
                                <span className="material-symbols-outlined text-[20px]">download</span>
                                <span>Ekspor Laporan</span>
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
                                onClick={() => toggleDropdown('dateRange')}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-sm font-medium text-slate-700 dark:text-slate-200"
                            >
                                <span>{getDateRangeLabel(filters.dateRange)}</span>
                                <span className="material-symbols-outlined text-[18px]">keyboard_arrow_down</span>
                            </button>
                            {dropdownStates.dateRange && (
                                <div className="absolute top-full left-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50 min-w-[180px]">
                                    {[
                                        { value: '1_day', label: '1 Hari Terakhir' },
                                        { value: '7_days', label: '7 Hari Terakhir' },
                                        { value: '30_days', label: '30 Hari Terakhir' },
                                        { value: '90_days', label: '90 Hari Terakhir' }
                                    ].map((option) => (
                                        <button
                                            key={option.value}
                                            onClick={() => handleFilterChange('dateRange', option.value)}
                                            className="w-full text-left px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
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
                                onClick={() => toggleDropdown('unit')}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-sm font-medium text-slate-700 dark:text-slate-200"
                            >
                                <span>{filters.unitId ? units.find(u => u.id === filters.unitId)?.name || 'Semua Unit' : 'Semua Unit'}</span>
                                <span className="material-symbols-outlined text-[18px]">keyboard_arrow_down</span>
                            </button>
                            {dropdownStates.unit && (
                                <div className="absolute top-full left-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50 min-w-[180px] max-h-60 overflow-y-auto">
                                    <button
                                        onClick={() => handleFilterChange('unitId', '')}
                                        className="w-full text-left px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                    >
                                        Semua Unit
                                    </button>
                                    {units.filter(unit => unit.is_active).map((unit) => (
                                        <button
                                            key={unit.id}
                                            onClick={() => handleFilterChange('unitId', unit.id)}
                                            className="w-full text-left px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
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
                                onClick={() => toggleDropdown('status')}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-sm font-medium text-slate-700 dark:text-slate-200"
                            >
                                <span>{getStatusLabel(filters.status)}</span>
                                <span className="material-symbols-outlined text-[18px]">keyboard_arrow_down</span>
                            </button>
                            {dropdownStates.status && (
                                <div className="absolute top-full left-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50 min-w-[180px]">
                                    <button
                                        onClick={() => handleFilterChange('status', '')}
                                        className="w-full text-left px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                    >
                                        Semua Status
                                    </button>
                                    {[
                                        { value: 'open', label: 'Terbuka' },
                                        { value: 'in_progress', label: 'Diproses' },
                                        { value: 'escalated', label: 'Eskalasi' },
                                        { value: 'resolved', label: 'Selesai' },
                                        { value: 'closed', label: 'Ditutup' }
                                    ].map((status) => (
                                        <button
                                            key={status.value}
                                            onClick={() => handleFilterChange('status', status.value)}
                                            className="w-full text-left px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                        >
                                            {status.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Priority Filter */}
                        <div className="relative">
                            <button 
                                onClick={() => toggleDropdown('priority')}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-sm font-medium text-slate-700 dark:text-slate-200"
                            >
                                <span>{getPriorityLabel(filters.priority)}</span>
                                <span className="material-symbols-outlined text-[18px]">keyboard_arrow_down</span>
                            </button>
                            {dropdownStates.priority && (
                                <div className="absolute top-full left-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50 min-w-[180px]">
                                    <button
                                        onClick={() => handleFilterChange('priority', '')}
                                        className="w-full text-left px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                    >
                                        Semua Prioritas
                                    </button>
                                    {[
                                        { value: 'low', label: 'Rendah' },
                                        { value: 'medium', label: 'Sedang' },
                                        { value: 'high', label: 'Tinggi' },
                                        { value: 'critical', label: 'Kritis' }
                                    ].map((priority) => (
                                        <button
                                            key={priority.value}
                                            onClick={() => handleFilterChange('priority', priority.value)}
                                            className="w-full text-left px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                        >
                                            {priority.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Category Filter */}
                        <div className="relative">
                            <button 
                                onClick={() => toggleDropdown('category')}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-sm font-medium text-slate-700 dark:text-slate-200"
                            >
                                <span>{filters.category ? serviceCategories.find(c => c.id === filters.category)?.name || 'Semua Kategori' : 'Semua Kategori'}</span>
                                <span className="material-symbols-outlined text-[18px]">keyboard_arrow_down</span>
                            </button>
                            {dropdownStates.category && (
                                <div className="absolute top-full left-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50 min-w-[180px] max-h-60 overflow-y-auto">
                                    <button
                                        onClick={() => handleFilterChange('category', '')}
                                        className="w-full text-left px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                    >
                                        Semua Kategori
                                    </button>
                                    {serviceCategories.filter(cat => cat.is_active).map((category) => (
                                        <button
                                            key={category.id}
                                            onClick={() => handleFilterChange('category', category.id)}
                                            className="w-full text-left px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                        >
                                            {category.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="ml-auto">
                            <button className="p-1.5 text-slate-400 hover:text-primary transition-colors">
                                <span className="material-symbols-outlined text-[20px]">filter_list</span>
                            </button>
                        </div>
                    </div>

                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Total Tickets */}
                        <div className="bg-white dark:bg-surface-dark p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between gap-4">
                            <div className="flex justify-between items-start">
                                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                    <span className="material-symbols-outlined text-primary text-2xl">confirmation_number</span>
                                </div>
                                <span className="flex items-center text-emerald-600 dark:text-emerald-400 text-sm font-medium bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full">
                                    <span className="material-symbols-outlined text-[16px] mr-1">trending_up</span> +12%
                                </span>
                            </div>
                            <div>
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Tiket</p>
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.totalTickets}</h3>
                            </div>
                        </div>
                        {/* SLA Breach Rate */}
                        <div className="bg-white dark:bg-surface-dark p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between gap-4">
                            <div className="flex justify-between items-start">
                                <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                    <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-2xl">timer_off</span>
                                </div>
                                <span className="flex items-center text-emerald-600 dark:text-emerald-400 text-sm font-medium bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full">
                                    <span className="material-symbols-outlined text-[16px] mr-1">trending_down</span> -2%
                                </span>
                            </div>
                            <div>
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Pelanggaran SLA</p>
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.slaBreachRate.toFixed(1)}%</h3>
                            </div>
                        </div>
                        {/* Avg Resolution Time */}
                        <div className="bg-white dark:bg-surface-dark p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between gap-4">
                            <div className="flex justify-between items-start">
                                <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                                    <span className="material-symbols-outlined text-orange-600 dark:text-orange-400 text-2xl">history</span>
                                </div>
                                <span className="flex items-center text-emerald-600 dark:text-emerald-400 text-sm font-medium bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full">
                                    <span className="material-symbols-outlined text-[16px] mr-1">trending_down</span> -10m
                                </span>
                            </div>
                            <div>
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Rata-rata Waktu Selesai</p>
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.avgResolutionTime}</h3>
                            </div>
                        </div>
                        {/* CSAT Score */}
                        <div className="bg-white dark:bg-surface-dark p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between gap-4">
                            <div className="flex justify-between items-start">
                                <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                    <span className="material-symbols-outlined text-purple-600 dark:text-purple-400 text-2xl">thumb_up</span>
                                </div>
                                <span className="flex items-center text-emerald-600 dark:text-emerald-400 text-sm font-medium bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full">
                                    <span className="material-symbols-outlined text-[16px] mr-1">trending_up</span> +0.2
                                </span>
                            </div>
                            <div>
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Skor Kepuasan</p>
                                <div className="flex items-baseline gap-2 mt-1">
                                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stats.csatScore}</h3>
                                    <span className="text-sm text-slate-400">/ 5.0</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Ticket Categories Chart */}
                        <div className="lg:col-span-2 bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Tiket berdasarkan Unit</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Volume di seluruh departemen</p>
                                </div>
                                <button className="text-primary text-sm font-medium hover:underline">Lihat Laporan</button>
                            </div>
                            {/* Real Data Bar Chart */}
                            <div className="h-64 flex flex-col justify-end gap-2">
                                <div className="flex items-end justify-between h-full gap-4 px-2">
                                    {unitTicketCounts.length === 0 ? (
                                        <div className="w-full flex items-center justify-center text-slate-500 dark:text-slate-400">
                                            Tidak ada data tiket
                                        </div>
                                    ) : (
                                        unitTicketCounts.slice(0, 6).map((unit, index) => {
                                            const maxCount = Math.max(...unitTicketCounts.map(u => u.count));
                                            const heightPercent = maxCount > 0 ? (unit.count / maxCount) * 100 : 0;
                                            return (
                                                <div key={index} className="flex flex-col items-center gap-2 flex-1 group">
                                                    <div className="relative w-full max-w-[40px] bg-blue-100 dark:bg-blue-900/30 rounded-t-sm h-full flex flex-col justify-end overflow-hidden">
                                                        <div 
                                                            className="w-full bg-primary hover:bg-blue-600 transition-all duration-500" 
                                                            style={{ height: `${heightPercent}%` }}
                                                        >
                                                            <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-slate-700 dark:text-slate-300">
                                                                {unit.count}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 text-center truncate w-full" title={unit.unit_name}>
                                                        {unit.unit_name.length > 10 ? unit.unit_name.substring(0, 10) + '...' : unit.unit_name}
                                                    </span>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </div>
                        {/* Status Distribution Panel */}
                        <div className="lg:col-span-1 bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 flex flex-col">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Distribusi Status</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Beban kerja saat ini</p>
                                </div>
                            </div>
                            <div className="flex flex-col gap-5 flex-1 justify-center">
                                {(() => {
                                    const totalStatus = statusDistribution.open + statusDistribution.in_progress + statusDistribution.escalated + statusDistribution.resolved + statusDistribution.closed;
                                    const getPercent = (count: number) => totalStatus > 0 ? (count / totalStatus) * 100 : 0;
                                    return (
                                        <>
                                            <div className="flex flex-col gap-1">
                                                <div className="flex justify-between text-sm">
                                                    <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                        <span className="w-2 h-2 rounded-full bg-blue-400"></span> Terbuka
                                                    </span>
                                                    <span className="font-bold text-slate-900 dark:text-white">{statusDistribution.open}</span>
                                                </div>
                                                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                    <div className="h-full bg-blue-400 rounded-full" style={{ width: `${getPercent(statusDistribution.open)}%` }}></div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <div className="flex justify-between text-sm">
                                                    <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                        <span className="w-2 h-2 rounded-full bg-yellow-400"></span> Diproses
                                                    </span>
                                                    <span className="font-bold text-slate-900 dark:text-white">{statusDistribution.in_progress}</span>
                                                </div>
                                                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                    <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${getPercent(statusDistribution.in_progress)}%` }}></div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <div className="flex justify-between text-sm">
                                                    <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                        <span className="w-2 h-2 rounded-full bg-orange-500"></span> Eskalasi
                                                    </span>
                                                    <span className="font-bold text-slate-900 dark:text-white">{statusDistribution.escalated}</span>
                                                </div>
                                                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                    <div className="h-full bg-orange-500 rounded-full" style={{ width: `${getPercent(statusDistribution.escalated)}%` }}></div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <div className="flex justify-between text-sm">
                                                    <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Selesai
                                                    </span>
                                                    <span className="font-bold text-slate-900 dark:text-white">{statusDistribution.resolved}</span>
                                                </div>
                                                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${getPercent(statusDistribution.resolved)}%` }}></div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <div className="flex justify-between text-sm">
                                                    <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                        <span className="w-2 h-2 rounded-full bg-red-500"></span> Ditutup
                                                    </span>
                                                    <span className="font-bold text-slate-900 dark:text-white">{statusDistribution.closed}</span>
                                                </div>
                                                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                    <div className="h-full bg-red-500 rounded-full" style={{ width: `${getPercent(statusDistribution.closed)}%` }}></div>
                                                </div>
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                        </div>
                    </div>

                    {/* Priority Attention List */}
                    <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col flex-1 min-h-[300px]">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex flex-wrap gap-4 justify-between items-center">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <span className="material-symbols-outlined text-red-600">warning</span>
                                    Perhatian Prioritas Diperlukan
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Tiket yang memerlukan tindakan segera (Eskalasi atau Kritis)</p>
                            </div>
                            <div className="flex gap-2">
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                        <span className="material-symbols-outlined text-slate-400 text-[20px]">search</span>
                                    </span>
                                    <input className="pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 dark:text-white w-64" placeholder="Cari tiket..." type="text" />
                                </div>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">ID Tiket</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Judul</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Unit</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tanggal</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Prioritas</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Tindakan</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-4 text-center text-slate-500">Memuat data...</td>
                                        </tr>
                                    ) : tickets.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-4 text-center text-slate-500">Tidak ada tiket yang ditemukan.</td>
                                        </tr>
                                    ) : (
                                        tickets.map((ticket) => (
                                            <tr key={ticket.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">{ticket.ticket_number}</td>
                                                <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">{ticket.title}</td>
                                                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{(ticket.unit as any)?.name || '-'}</td>
                                                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{ticket.created_at ? new Date(ticket.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(ticket.status || '')} capitalize`}>
                                                        {getStatusLabel(ticket.status || '')}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm font-medium">
                                                    <span className={`capitalize ${ticket.priority === 'critical' ? 'text-red-600 font-bold' : ticket.priority === 'high' ? 'text-orange-600' : 'text-slate-600'}`}>
                                                        {getPriorityLabel(ticket.priority || '')}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => handleViewTicket(ticket)}
                                                        className="text-primary hover:text-blue-700 dark:hover:text-blue-400 font-medium text-sm"
                                                    >
                                                        Kelola
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>

            {/* Ticket Detail Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={`Detail Tiket: ${selectedTicket?.ticket_number || ''}`}
            >
                {selectedTicket && (
                    <div className="flex flex-col gap-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Judul Laporan</h4>
                                <p className="text-slate-900 dark:text-white font-semibold text-lg">{selectedTicket.title}</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Status</h4>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(selectedTicket.status || '')} capitalize`}>
                                    {getStatusLabel(selectedTicket.status || '')}
                                </span>
                            </div>
                            <div className="md:col-span-2">
                                <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Deskripsi</h4>
                                <p className="text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                                    {selectedTicket.description || 'Tidak ada deskripsi.'}
                                </p>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Unit Terkait</h4>
                                <p className="text-slate-900 dark:text-white">{(selectedTicket.unit as any)?.name || '-'}</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Prioritas</h4>
                                <p className="text-slate-900 dark:text-white capitalize">{getPriorityLabel(selectedTicket.priority || '')}</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Pelapor</h4>
                                <p className="text-slate-900 dark:text-white">{selectedTicket.submitter_name || '-'}</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Kontak Pelapor</h4>
                                <p className="text-slate-900 dark:text-white">{selectedTicket.submitter_email || selectedTicket.submitter_phone || '-'}</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Tanggal Dibuat</h4>
                                <p className="text-slate-900 dark:text-white">{selectedTicket.created_at ? new Date(selectedTicket.created_at).toLocaleString('id-ID') : '-'}</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Batas SLA</h4>
                                <p className="text-slate-900 dark:text-white">{selectedTicket.sla_deadline ? new Date(selectedTicket.sla_deadline).toLocaleString('id-ID') : '-'}</p>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            >
                                Tutup
                            </button>
                            <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors shadow-sm shadow-blue-500/30">
                                Perbarui Status
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}