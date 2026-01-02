import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { complaintService, Ticket } from '../services/complaintService';

interface TicketTableProps {
    filters?: {
        dateRange?: string;
        unit_id?: string;
        status?: string;
        category_id?: string;
    };
}

const TicketTable: React.FC<TicketTableProps> = ({ filters }) => {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    const fetchTickets = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Build query parameters based on filters
            const params: any = { limit: 10 };
            
            if (filters?.status && filters.status !== 'all') {
                params.status = filters.status;
            }
            if (filters?.unit_id && filters.unit_id !== 'all') {
                params.unit_id = filters.unit_id;
            }
            
            const response = await complaintService.getTickets(params);
            
            if (response.success) {
                setTickets(response.data || []);
            } else {
                setError(response.error || 'Failed to fetch tickets');
            }
        } catch (err: any) {
            console.error('Error fetching tickets:', err);
            setError(err.message || 'Failed to fetch tickets');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, [filters]);

    const handleTicketClick = (ticketId: string) => {
        navigate(`/tickets/${ticketId}`);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const filteredTickets = tickets.filter(ticket =>
        ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.ticket_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ticket.units?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'escalated': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200 dark:border-orange-900/50';
            case 'over_sla': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-900/50';
            case 'in_progress': return 'bg-primary/10 text-primary dark:bg-blue-900/30 dark:text-blue-300 border-blue-100 dark:border-blue-900/50';
            case 'open': return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600';
            case 'resolved': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/50';
            case 'closed': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/50';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority.toLowerCase()) {
            case 'critical': return 'text-red-600 dark:text-red-400';
            case 'high': return 'text-orange-600 dark:text-orange-400';
            case 'medium': return 'text-yellow-600 dark:text-yellow-400';
            case 'low': return 'text-green-600 dark:text-green-400';
            default: return 'text-slate-500 dark:text-slate-400';
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const displayTickets = searchTerm ? filteredTickets : tickets;

    return (
        <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col flex-1 min-h-[300px]">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex flex-wrap gap-4 justify-between items-center">
                <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">list_alt</span>
                        Recent Tickets
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Latest tickets based on current filters</p>
                </div>
                <div className="flex gap-2">
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                            <span className="material-symbols-outlined text-slate-400 text-[20px]">search</span>
                        </span>
                        <input 
                            className="pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 dark:text-white w-64" 
                            placeholder="Search tickets..." 
                            type="text"
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                    </div>
                    <button 
                        onClick={fetchTickets}
                        className="px-3 py-2 bg-primary text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
                    >
                        Refresh
                    </button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ticket ID</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Subject</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Unit</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Priority</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {loading ? (
                            <tr><td colSpan={7} className="text-center py-8">
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-2"></div>
                                    Loading tickets...
                                </div>
                            </td></tr>
                        ) : error ? (
                            <tr><td colSpan={7} className="text-center py-8 text-red-600">{error}</td></tr>
                        ) : displayTickets.length === 0 ? (
                            <tr><td colSpan={7} className="text-center py-8 text-slate-500">No tickets found</td></tr>
                        ) : displayTickets.map((ticket) => (
                            <tr key={ticket.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer" onClick={() => handleTicketClick(ticket.id)}>
                                <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">{ticket.ticket_number || '#REQ-????'}</td>
                                <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300 max-w-xs truncate">{ticket.title}</td>
                                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{ticket.units?.name || 'Unknown'}</td>
                                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{formatTime(ticket.created_at)}</td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(ticket.status)}`}>
                                        {ticket.status.replace('_', ' ')}
                                    </span>
                                </td>
                                <td className={`px-6 py-4 text-sm font-medium ${getPriorityColor(ticket.priority)}`}>
                                    {ticket.priority}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleTicketClick(ticket.id);
                                        }}
                                        className="text-primary hover:text-blue-700 dark:hover:text-blue-400 font-medium text-sm"
                                    >
                                        View
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TicketTable;