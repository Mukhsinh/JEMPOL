import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { complaintService, Ticket } from '../../services/complaintService';
import { EscalationModal, ResponseModal } from '../../components/TicketActionModals';

// Tipe untuk notifikasi
interface Notification {
    id: string;
    ticket_id: string;
    ticket_number: string;
    type: 'new_ticket' | 'escalation' | 'response';
    message: string;
    created_at: string;
    is_read: boolean;
}

export default function TicketList() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterPriority, setFilterPriority] = useState<string>('all');
    const [filterType, setFilterType] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');
    
    // Notification states
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    
    // Modal states
    const [escalationModal, setEscalationModal] = useState<{ isOpen: boolean; ticketId: string; ticketNumber: string; unitId?: string }>({
        isOpen: false, ticketId: '', ticketNumber: '', unitId: ''
    });
    const [responseModal, setResponseModal] = useState<{ isOpen: boolean; ticketId: string; ticketNumber: string }>({
        isOpen: false, ticketId: '', ticketNumber: ''
    });
    
    const { isAuthenticated, isLoading: authLoading, user } = useAuth();

    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            fetchTickets();
            fetchNotifications();
        } else if (!authLoading && !isAuthenticated) {
            setError('Anda harus login terlebih dahulu');
            setLoading(false);
        }
    }, [isAuthenticated, authLoading]);

    // Fetch notifications
    async function fetchNotifications() {
        try {
            // Simulasi fetch notifikasi - nanti bisa diganti dengan API real
            const mockNotifications: Notification[] = tickets
                .filter(t => t.status === 'open' || t.status === 'escalated')
                .slice(0, 5)
                .map(t => ({
                    id: `notif-${t.id}`,
                    ticket_id: t.id,
                    ticket_number: t.ticket_number || '',
                    type: t.status === 'escalated' ? 'escalation' : 'new_ticket',
                    message: t.status === 'escalated' 
                        ? `Tiket ${t.ticket_number} telah dieskalasi` 
                        : `Tiket baru ${t.ticket_number} masuk`,
                    created_at: t.created_at,
                    is_read: false
                }));
            
            setNotifications(mockNotifications);
            setUnreadCount(mockNotifications.filter(n => !n.is_read).length);
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        }
    }

    // Mark notification as read
    function markAsRead(notificationId: string) {
        setNotifications(prev => 
            prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
    }

    // Mark all as read
    function markAllAsRead() {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);
    }

    async function fetchTickets() {
        if (!isAuthenticated) {
            setError('Anda harus login terlebih dahulu');
            setLoading(false);
            return;
        }
        
        setLoading(true);
        setError(null);
        try {
            const response = await complaintService.getTickets();
            if (response.success) {
                setTickets(response.data || []);
            } else {
                setError(response.error || 'Failed to fetch tickets');
                setTickets([]);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to fetch tickets');
            setTickets([]);
        } finally {
            setLoading(false);
        }
    }

    // Filter logic - filter berdasarkan unit user jika bukan admin/superadmin
    const filteredTickets = tickets.filter(ticket => {
        // Filter berdasarkan unit kerja - hanya admin/superadmin yang bisa lihat semua
        const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
        
        // Filter tiket yang masuk langsung atau eskalasi ke unit ini
        const isDirectTicket = ticket.unit_id === (user as any)?.unit_id;
        const isEscalatedToUnit = ticket.status === 'escalated' && ticket.escalated_to_unit_id === (user as any)?.unit_id;
        const matchesTicketAccess = isAdmin || isDirectTicket || isEscalatedToUnit;
        
        const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
        const matchesPriority = filterPriority === 'all' || ticket.priority === filterPriority;
        const matchesType = filterType === 'all' || ticket.type === filterType;
        const matchesSearch = searchTerm === '' ||
            ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (ticket.ticket_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (ticket.units?.name || '').toLowerCase().includes(searchTerm.toLowerCase());

        return matchesTicketAccess && matchesStatus && matchesPriority && matchesType && matchesSearch;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200';
            case 'in_progress': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200';
            case 'escalated': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200';
            case 'resolved': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200';
            case 'closed': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200';
            default: return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 border-slate-200';
        }
    };

    const getStatusLabel = (status: string) => {
        const map: Record<string, string> = {
            'open': 'Baru', 'in_progress': 'Diproses', 'escalated': 'Eskalasi', 'resolved': 'Selesai', 'closed': 'Ditutup'
        };
        return map[status] || status;
    };

    const getPriorityLabel = (priority: string) => {
        const map: Record<string, string> = {
            'low': 'Rendah', 'medium': 'Sedang', 'high': 'Tinggi', 'critical': 'Kritis'
        };
        return map[priority] || priority;
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'critical': return 'text-red-600 dark:text-red-400';
            case 'high': return 'text-orange-600 dark:text-orange-400';
            case 'medium': return 'text-yellow-600 dark:text-yellow-400';
            default: return 'text-slate-600 dark:text-slate-400';
        }
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
                    
                    {/* Tombol Notifikasi */}
                    <div className="relative">
                        <button 
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="relative p-2 text-slate-500 hover:text-primary transition-colors bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 rounded-lg"
                        >
                            <span className="material-symbols-outlined">notifications</span>
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </button>
                        
                        {/* Dropdown Notifikasi */}
                        {showNotifications && (
                            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 max-h-96 overflow-hidden flex flex-col">
                                <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                                    <h3 className="font-semibold text-slate-900 dark:text-white">Notifikasi</h3>
                                    {unreadCount > 0 && (
                                        <button 
                                            onClick={markAllAsRead}
                                            className="text-xs text-primary hover:underline"
                                        >
                                            Tandai semua dibaca
                                        </button>
                                    )}
                                </div>
                                <div className="overflow-y-auto flex-1">
                                    {notifications.length === 0 ? (
                                        <div className="px-4 py-8 text-center text-slate-500 text-sm">
                                            Tidak ada notifikasi
                                        </div>
                                    ) : (
                                        notifications.map(notif => (
                                            <Link
                                                key={notif.id}
                                                to={`/tickets/${notif.ticket_id}`}
                                                onClick={() => {
                                                    markAsRead(notif.id);
                                                    setShowNotifications(false);
                                                }}
                                                className={`block px-4 py-3 border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
                                                    !notif.is_read ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                                                }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <span className={`material-symbols-outlined text-[20px] mt-0.5 ${
                                                        notif.type === 'escalation' ? 'text-orange-500' : 'text-blue-500'
                                                    }`}>
                                                        {notif.type === 'escalation' ? 'trending_up' : 'notifications_active'}
                                                    </span>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm text-slate-900 dark:text-white font-medium">
                                                            {notif.message}
                                                        </p>
                                                        <p className="text-xs text-slate-500 mt-1">
                                                            {new Date(notif.created_at).toLocaleString('id-ID', {
                                                                day: 'numeric',
                                                                month: 'short',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </p>
                                                    </div>
                                                    {!notif.is_read && (
                                                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2"></span>
                                                    )}
                                                </div>
                                            </Link>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
                        <span className="material-symbols-outlined text-[16px] text-primary">person</span>
                        <span className="font-medium">{user?.name || user?.email || 'User'}</span>
                    </div>
                    <Link to="/form/eksternal" className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors shadow-sm shadow-blue-500/30">
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
                <div className="flex flex-wrap gap-3 w-full md:w-auto">
                    <select
                        className="px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 dark:text-white min-w-[140px]"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                    >
                        <option value="all">Semua Jenis</option>
                        <option value="internal">Internal</option>
                        <option value="external">Eksternal</option>
                    </select>
                    <select
                        className="px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 dark:text-white min-w-[140px]"
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
                        className="px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 dark:text-white min-w-[150px]"
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
                                <th className="px-4 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">ID Tiket</th>
                                <th className="px-4 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Judul & Deskripsi</th>
                                <th className="px-4 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Unit</th>
                                <th className="px-4 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Jenis</th>
                                <th className="px-4 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                <th className="px-4 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Prioritas</th>
                                <th className="px-4 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">SLA</th>
                                <th className="px-4 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {authLoading || loading ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-8 text-center text-slate-500">
                                        {authLoading ? 'Memverifikasi autentikasi...' : 'Memuat data tiket...'}
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-8 text-center">
                                        <div className="text-red-500 mb-4">{error}</div>
                                        {!isAuthenticated && (
                                            <div>
                                                <p className="text-slate-600 mb-4">Silakan login untuk mengakses data tiket.</p>
                                                <Link to="/login" className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors">
                                                    Login Sekarang
                                                </Link>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ) : filteredTickets.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-8 text-center text-slate-500">Tidak ada tiket yang ditemukan sesuai filter.</td>
                                </tr>
                            ) : (
                                filteredTickets.map((ticket: any) => (
                                    <tr key={ticket.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-2">
                                                {ticket.is_flagged && (
                                                    <span className="material-symbols-outlined text-red-500 text-[16px]" title="Ditandai">flag</span>
                                                )}
                                                <div>
                                                    <Link to={`/tickets/${ticket.id}`} className="text-primary hover:underline font-medium text-sm">
                                                        {ticket.ticket_number}
                                                    </Link>
                                                    <p className="text-xs text-slate-500 mt-0.5">{new Date(ticket.created_at).toLocaleDateString('id-ID')}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 max-w-xs">
                                            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{ticket.title}</p>
                                            <p className="text-xs text-slate-500 mt-0.5 truncate">{ticket.description || 'Tidak ada deskripsi'}</p>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400">
                                            {ticket.units?.name || '-'}
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                                ticket.type === 'internal' 
                                                    ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 border-indigo-200' 
                                                    : 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200'
                                            }`}>
                                                {ticket.type === 'internal' ? 'Internal' : 'Eksternal'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(ticket.status)} capitalize`}>
                                                {getStatusLabel(ticket.status)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={`capitalize text-sm font-medium ${getPriorityColor(ticket.priority)}`}>
                                                {getPriorityLabel(ticket.priority)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            {ticket.sla_deadline ? (
                                                <div className="flex items-center gap-1.5">
                                                    <span className={`w-2 h-2 rounded-full ${new Date(ticket.sla_deadline).getTime() < new Date().getTime() && ticket.status !== 'resolved' ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
                                                    <span className="text-xs text-slate-600 dark:text-slate-400">
                                                        {new Date(ticket.sla_deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center justify-center gap-1">
                                                {/* Tombol Respon */}
                                                {ticket.status !== 'resolved' && ticket.status !== 'closed' && (
                                                    <button
                                                        onClick={() => setResponseModal({ isOpen: true, ticketId: ticket.id, ticketNumber: ticket.ticket_number })}
                                                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                                                        title="Respon"
                                                    >
                                                        <span className="material-symbols-outlined text-[20px]">reply</span>
                                                    </button>
                                                )}
                                                {/* Tombol Eskalasi */}
                                                {ticket.status !== 'resolved' && ticket.status !== 'closed' && (
                                                    <button
                                                        onClick={() => setEscalationModal({ isOpen: true, ticketId: ticket.id, ticketNumber: ticket.ticket_number, unitId: ticket.unit_id })}
                                                        className="p-1.5 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                                                        title="Eskalasi"
                                                    >
                                                        <span className="material-symbols-outlined text-[20px]">trending_up</span>
                                                    </button>
                                                )}
                                                {/* Flag Status Tiket - Hijau jika selesai, Merah jika belum */}
                                                <div 
                                                    className={`p-1.5 rounded-lg ${
                                                        ticket.status === 'resolved' || ticket.status === 'closed'
                                                            ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20'
                                                            : 'text-red-500 bg-red-50 dark:bg-red-900/20'
                                                    }`}
                                                    title={ticket.status === 'resolved' || ticket.status === 'closed' ? 'Tiket Selesai' : 'Tiket Belum Selesai'}
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">flag</span>
                                                </div>
                                                {/* Tombol Lihat Detail */}
                                                <Link to={`/tickets/${ticket.id}`} className="p-1.5 text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors" title="Lihat Detail">
                                                    <span className="material-symbols-outlined text-[20px]">visibility</span>
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Pagination */}
                <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Menampilkan <span className="font-medium text-slate-900 dark:text-white">{filteredTickets.length}</span> tiket
                    </p>
                </div>
            </div>

            {/* Modals */}
            <EscalationModal
                isOpen={escalationModal.isOpen}
                onClose={() => setEscalationModal({ isOpen: false, ticketId: '', ticketNumber: '', unitId: '' })}
                ticketId={escalationModal.ticketId}
                ticketNumber={escalationModal.ticketNumber}
                currentUnitId={escalationModal.unitId}
                onSuccess={fetchTickets}
            />
            <ResponseModal
                isOpen={responseModal.isOpen}
                onClose={() => setResponseModal({ isOpen: false, ticketId: '', ticketNumber: '' })}
                ticketId={responseModal.ticketId}
                ticketNumber={responseModal.ticketNumber}
                onSuccess={fetchTickets}
            />
        </div>
    );
}
