import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContextOptimized';
import { complaintService, Ticket } from '../../services/complaintService';

export default function TicketList() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterPriority, setFilterPriority] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');
    
    const { isAuthenticated, isLoading: authLoading } = useAuth();

    useEffect(() => {
        // Only fetch tickets if user is authenticated and auth is not loading
        if (!authLoading && isAuthenticated) {
            console.log('TicketList: User is authenticated, fetching tickets...');
            fetchTickets();
        } else if (!authLoading && !isAuthenticated) {
            console.log('TicketList: User is not authenticated');
            setError('Anda harus login terlebih dahulu');
            setLoading(false);
        } else {
            console.log('TicketList: Auth is loading...');
        }
    }, [isAuthenticated, authLoading]);

    async function fetchTickets() {
        if (!isAuthenticated) {
            console.log('TicketList: Cannot fetch tickets - user not authenticated');
            setError('Anda harus login terlebih dahulu');
            setLoading(false);
            return;
        }
        
        console.log('TicketList: Starting to fetch tickets...');
        setLoading(true);
        setError(null);
        try {
            const response = await complaintService.getTickets();
            console.log('TicketList: API response received:', response);
            if (response.success) {
                setTickets(response.data || []);
                console.log('TicketList: Successfully loaded', response.data?.length || 0, 'tickets');
            } else {
                console.error('TicketList: API returned error:', response.error);
                setError(response.error || 'Failed to fetch tickets');
                // Set empty array to prevent further errors
                setTickets([]);
            }
        } catch (err: any) {
            console.error('TicketList: Exception while fetching tickets:', err);
            setError(err.message || 'Failed to fetch tickets');
            // Set empty array to prevent further errors
            setTickets([]);
        } finally {
            setLoading(false);
        }
    }

    // Filter logic
    const filteredTickets = tickets.filter(ticket => {
        const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
        const matchesPriority = filterPriority === 'all' || ticket.priority === filterPriority;
        const matchesSearch = searchTerm === '' ||
            ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (ticket.ticket_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (ticket.units?.name || '').toLowerCase().includes(searchTerm.toLowerCase());

        return matchesStatus && matchesPriority && matchesSearch;
    });

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

    // Helper untuk mapping status ke Bahasa Indonesia
    const getStatusLabel = (status: string) => {
        const map: Record<string, string> = {
            'open': 'Baru',
            'in_progress': 'Diproses',
            'escalated': 'Eskalasi',
            'resolved': 'Selesai',
            'closed': 'Ditutup'
        };
        return map[status] || status;
    };

    // Helper untuk mapping prioritas ke Bahasa Indonesia
    const getPriorityLabel = (priority: string) => {
        const map: Record<string, string> = {
            'low': 'Rendah',
            'medium': 'Sedang',
            'high': 'Tinggi',
            'critical': 'Kritis'
        };
        return map[priority] || priority;
    };

    return (
        <div className="p-6 md:p-8 max-w-[1600px] mx-auto flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Daftar Tiket</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Kelola semua tiket masuk dan status penyelesaian.</p>
                </div>
                    <div className="flex items-center gap-3">
                        <button onClick={fetchTickets} className="p-2 text-slate-500 hover:text-primary transition-colors bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 rounded-lg">
                            <span className="material-symbols-outlined">refresh</span>
                        </button>
                        {/* Debug info */}
                        <div className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                            API: {(import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api'}
                        </div>
                        {/* Debug: Quick login button for testing */}
                        {!isAuthenticated && (
                            <button 
                                onClick={async () => {
                                    try {
                                        const { authService } = await import('../../services/authService');
                                        const result = await authService.login('admin@jempol.com', 'password');
                                        if (result.success) {
                                            window.location.reload();
                                        } else {
                                            alert('Login failed: ' + result.error);
                                        }
                                    } catch (error: any) {
                                        alert('Login error: ' + error.message);
                                    }
                                }}
                                className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors"
                            >
                                Quick Login (Test)
                            </button>
                        )}
                        <Link to="/tickets/create/internal" className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors shadow-sm shadow-blue-500/30">
                            <span className="material-symbols-outlined text-[20px]">add</span>
                            <span>Buat Tiket Baru</span>
                        </Link>
                    </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-surface-dark p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <span className="material-symbols-outlined text-slate-400 text-[20px]">search</span>
                    </span>
                    <input
                        className="pl-10 pr-4 py-2 w-full border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 dark:text-white"
                        placeholder="Cari ID tiket, judul, atau unit..."
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <select
                        className="px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 dark:text-white"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="all">Semua Status</option>
                        <option value="open">Baru</option>
                        <option value="in_progress">Diproses</option>
                        <option value="escalated">Eskalasi</option>
                        <option value="resolved">Selesai</option>
                        <option value="closed">Ditutup</option>
                    </select>
                    <select
                        className="px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 dark:text-white"
                        value={filterPriority}
                        onChange={(e) => setFilterPriority(e.target.value)}
                    >
                        <option value="all">Semua Prioritas</option>
                        <option value="low">Rendah</option>
                        <option value="medium">Sedang</option>
                        <option value="high">Tinggi</option>
                        <option value="critical">Kritis</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">ID Tiket</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Judul & Deskripsi</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Unit</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Prioritas</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">SLA</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {authLoading || loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                                        {authLoading ? 'Memverifikasi autentikasi...' : 'Memuat data tiket...'}
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center">
                                        <div className="text-red-500 mb-4">{error}</div>
                                        {!isAuthenticated && (
                                            <div>
                                                <p className="text-slate-600 mb-4">Silakan login untuk mengakses data tiket.</p>
                                                <Link 
                                                    to="/login" 
                                                    className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors"
                                                >
                                                    Login Sekarang
                                                </Link>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ) : filteredTickets.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-slate-500">Tidak ada tiket yang ditemukan sesuai filter.</td>
                                </tr>
                            ) : (
                                filteredTickets.map((ticket) => (
                                    <tr key={ticket.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <Link to={`/tickets/${ticket.id}`} className="text-primary hover:underline font-medium text-sm">
                                                {ticket.ticket_number}
                                            </Link>
                                            <p className="text-xs text-slate-500 mt-0.5">{new Date(ticket.created_at).toLocaleDateString('id-ID')}</p>
                                        </td>
                                        <td className="px-6 py-4 max-w-xs">
                                            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{ticket.title}</p>
                                            <p className="text-xs text-slate-500 mt-0.5 truncate">{ticket.description || 'Tidak ada deskripsi'}</p>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                                            {ticket.units?.name || '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(ticket.status)} capitalize`}>
                                                {getStatusLabel(ticket.status)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`capitalize text-sm font-medium ${ticket.priority === 'critical' ? 'text-red-600' :
                                                ticket.priority === 'high' ? 'text-orange-600' :
                                                    'text-slate-600'
                                                }`}>
                                                {getPriorityLabel(ticket.priority)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {ticket.sla_deadline ? (
                                                <div className="flex items-center gap-1.5">
                                                    <span className={`w-2 h-2 rounded-full ${new Date(ticket.sla_deadline).getTime() < new Date().getTime() && ticket.status !== 'resolved'
                                                        ? 'bg-red-500'
                                                        : 'bg-emerald-500'
                                                        }`}></span>
                                                    <span className="text-xs text-slate-600 dark:text-slate-400">
                                                        {new Date(ticket.sla_deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link to={`/tickets/${ticket.id}`} className="text-slate-400 hover:text-primary transition-colors">
                                                <span className="material-symbols-outlined">visibility</span>
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Pagination (Static for now) */}
                <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Menampilkan <span className="font-medium text-slate-900 dark:text-white">{filteredTickets.length}</span> tiket
                    </p>
                    <div className="flex gap-2">
                        <button className="px-3 py-1 border border-slate-200 dark:border-slate-700 rounded-lg text-sm disabled:opacity-50" disabled>Sebelumnya</button>
                        <button className="px-3 py-1 border border-slate-200 dark:border-slate-700 rounded-lg text-sm disabled:opacity-50" disabled>Selanjutnya</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
