import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import assignmentService, { AssignmentTicket, EscalationStats } from '../../services/assignmentService';

export default function TiketPrioritas() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<AssignmentTicket[]>([]);
  const [stats, setStats] = useState<EscalationStats>({
    total_active: 0, high_urgency: 0, waiting_response: 0, 
    completed_this_month: 0, new_today: 0, sla_breach: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [unitFilter, setUnitFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await assignmentService.getPriorityTickets();
      setTickets(data);
      setStats(assignmentService.calculateStats(data));
    } catch (error) {
      console.error('Error fetching priority tickets:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.ticket_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ticket.submitter_name?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesUnit = unitFilter === 'all' || ticket.unit_name.toLowerCase().includes(unitFilter.toLowerCase());
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    return matchesSearch && matchesUnit && matchesPriority;
  });

  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);
  const paginatedTickets = filteredTickets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getPriorityBadge = (priority: string) => {
    const styles: Record<string, string> = {
      critical: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
      high: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
      medium: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
      low: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
    };
    const labels: Record<string, string> = { critical: 'KRITIS', high: 'TINGGI', medium: 'SEDANG', low: 'RENDAH' };
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${styles[priority]}`}>
        {labels[priority] || priority.toUpperCase()}
      </span>
    );
  };

  const getSLAStatusColor = (status?: string) => {
    if (status === 'breached') return 'text-red-600 dark:text-red-400';
    if (status === 'warning') return 'text-orange-600 dark:text-orange-400';
    return 'text-green-600 dark:text-green-400';
  };


  return (
    <div className="w-full min-h-[calc(100vh-120px)] bg-slate-50 dark:bg-slate-900/50">
      <div className="p-6">
        {/* Header */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-6 py-5 flex flex-wrap justify-between items-center gap-4 mb-6">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h1 className="text-slate-900 dark:text-white text-2xl font-bold tracking-tight">Tiket Prioritas</h1>
              <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">MANAGER</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                {stats.high_urgency} tiket memerlukan perhatian segera
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={fetchData} className="flex items-center gap-2 h-10 px-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              <span className="material-symbols-outlined text-[20px]">refresh</span>
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Tiket Prioritas</p>
            <div className="flex items-baseline gap-2 mt-2">
              <h3 className="text-slate-900 dark:text-white text-3xl font-bold">{stats.total_active}</h3>
              <span className="text-emerald-600 text-xs font-bold bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded">+{stats.new_today} hari ini</span>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-l-4 border-slate-200 dark:border-slate-700 border-l-red-500 shadow-sm">
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">SLA Terlewati</p>
            <div className="flex items-baseline gap-2 mt-2">
              <h3 className="text-slate-900 dark:text-white text-3xl font-bold">{stats.sla_breach}</h3>
              <span className="text-red-600 text-xs font-bold bg-red-50 dark:bg-red-900/30 px-2 py-0.5 rounded">Perlu Tindakan</span>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Prioritas Tinggi/Kritis</p>
            <h3 className="text-slate-900 dark:text-white text-3xl font-bold mt-2">{stats.high_urgency}</h3>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Menunggu Respon</p>
            <h3 className="text-slate-900 dark:text-white text-3xl font-bold mt-2">{stats.waiting_response}</h3>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm mb-6">
          <div className="relative flex-1 min-w-[280px] max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full h-11 pl-10 pr-4 rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="Cari nomor tiket, judul, atau pelapor..."
            />
          </div>
          <div className="flex items-center gap-3">
            <select 
              value={unitFilter} 
              onChange={(e) => { setUnitFilter(e.target.value); setCurrentPage(1); }} 
              className="h-10 px-3 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="all">Semua Unit</option>
              <option value="igd">IGD / Emergency</option>
              <option value="fasilitas">Fasilitas</option>
              <option value="farmasi">Farmasi</option>
            </select>
            <select 
              value={priorityFilter} 
              onChange={(e) => { setPriorityFilter(e.target.value); setCurrentPage(1); }} 
              className="h-10 px-3 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="all">Semua Prioritas</option>
              <option value="critical">Kritis</option>
              <option value="high">Tinggi</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="text-sm text-slate-500">Memuat data...</p>
              </div>
            </div>
          ) : paginatedTickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4">
              <div className="bg-slate-100 dark:bg-slate-700 rounded-full p-6 mb-4">
                <span className="material-symbols-outlined text-5xl text-slate-400 dark:text-slate-500">priority_high</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Tidak Ada Tiket Prioritas</h3>
              <p className="text-slate-500 dark:text-slate-400 text-center max-w-md">
                {searchTerm || priorityFilter !== 'all' || unitFilter !== 'all' 
                  ? 'Tidak ada tiket yang sesuai dengan filter. Coba ubah kriteria pencarian.'
                  : 'Saat ini tidak ada tiket dengan prioritas tinggi atau kritis.'}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                      <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Tiket & Subjek</th>
                      <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Unit</th>
                      <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Prioritas</th>
                      <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">SLA</th>
                      <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Petugas</th>
                      <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {paginatedTickets.map((ticket) => (
                      <tr key={ticket.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-4 px-6 max-w-[300px]">
                          <div className="flex flex-col gap-1">
                            <span className="text-xs font-bold text-slate-400">#{ticket.ticket_number}</span>
                            <p className="text-sm font-bold text-slate-900 dark:text-white leading-snug group-hover:text-primary truncate">{ticket.title}</p>
                            {ticket.submitter_name && (
                              <span className="text-xs text-slate-500">Pelapor: {ticket.submitter_name}</span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                            {ticket.unit_name}
                          </span>
                        </td>
                        <td className="py-4 px-6">{getPriorityBadge(ticket.priority)}</td>
                        <td className="py-4 px-6">
                          <div className="flex flex-col">
                            <span className={`text-sm font-bold ${getSLAStatusColor(ticket.sla_status)}`}>
                              {ticket.sla_remaining || '-'}
                            </span>
                            <span className={`text-xs ${ticket.sla_status === 'breached' ? 'text-red-500' : 'text-slate-500'}`}>
                              {ticket.sla_status === 'breached' ? 'SLA Terlewati' : 'Tersisa'}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          {ticket.assignee_name ? (
                            <div className="flex items-center gap-2">
                              <div className="bg-slate-200 dark:bg-slate-600 rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300">
                                {ticket.assignee_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-xs font-semibold text-slate-900 dark:text-white">{ticket.assignee_name}</span>
                                <span className="text-[10px] text-slate-500 capitalize">{ticket.assignee_role}</span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs italic text-slate-400">Belum ditugaskan</span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button 
                            onClick={() => navigate(`/assignment/tiket-prioritas/${ticket.id}`)} 
                            className="text-primary hover:text-blue-600 hover:bg-primary/10 p-2 rounded-lg transition-colors"
                          >
                            <span className="material-symbols-outlined">arrow_forward_ios</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Menampilkan <span className="font-medium text-slate-900 dark:text-white">{(currentPage - 1) * itemsPerPage + 1}</span> sampai{' '}
                  <span className="font-medium text-slate-900 dark:text-white">{Math.min(currentPage * itemsPerPage, filteredTickets.length)}</span> dari{' '}
                  <span className="font-medium text-slate-900 dark:text-white">{filteredTickets.length}</span> tiket
                </p>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                    disabled={currentPage === 1} 
                    className="px-3 py-1.5 text-sm font-medium rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    Sebelumnya
                  </button>
                  <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                    disabled={currentPage === totalPages || totalPages === 0} 
                    className="px-3 py-1.5 text-sm font-medium rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    Selanjutnya
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
