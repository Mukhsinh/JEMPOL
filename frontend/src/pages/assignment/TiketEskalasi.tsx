import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import escalatedTicketService, { EscalatedTicket, EscalationStats } from '../../services/escalatedTicketService';

export default function TiketEskalasi() {
  const [tickets, setTickets] = useState<EscalatedTicket[]>([]);
  const [stats, setStats] = useState<EscalationStats>({
    total_active: 0,
    high_urgency: 0,
    waiting_response: 0,
    completed_this_month: 0,
    new_today: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await escalatedTicketService.getMyEscalatedTickets();
      setTickets(data);
      setStats(escalatedTicketService.calculateStats(data));
    } catch (error) {
      console.error('Error fetching escalated tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       ticket.ticket_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchPriority = filterPriority === 'all' || ticket.priority === filterPriority;
    const matchStatus = filterStatus === 'all' || ticket.status === filterStatus;
    return matchSearch && matchPriority && matchStatus;
  });

  const getPriorityBadge = (priority: string) => {
    const styles: Record<string, string> = {
      critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200',
      high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200',
      medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200',
      low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200'
    };
    const labels: Record<string, string> = { critical: 'Kritis', high: 'Tinggi', medium: 'Sedang', low: 'Rendah' };
    return <span className={`px-2 py-0.5 text-xs font-semibold rounded border ${styles[priority] || styles.medium}`}>{labels[priority] || priority}</span>;
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      baru: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      open: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      in_progress: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      escalated: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      resolved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      closed: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
    };
    const labels: Record<string, string> = { baru: 'Baru', open: 'Terbuka', in_progress: 'Diproses', escalated: 'Dieskalasi', resolved: 'Selesai', closed: 'Ditutup' };
    return <span className={`px-2 py-0.5 text-xs font-semibold rounded ${styles[status] || styles.open}`}>{labels[status] || status}</span>;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const calculateSLAStatus = (deadline: string) => {
    if (!deadline) return { status: 'unknown', text: '-', color: 'text-slate-500' };
    const now = new Date();
    const slaDate = new Date(deadline);
    const diff = slaDate.getTime() - now.getTime();
    const hours = Math.floor(Math.abs(diff) / (1000 * 60 * 60));
    const minutes = Math.floor((Math.abs(diff) % (1000 * 60 * 60)) / (1000 * 60));
    if (diff < 0) return { status: 'breached', text: `Lewat ${hours}j ${minutes}m`, color: 'text-red-600' };
    if (diff < 2 * 60 * 60 * 1000) return { status: 'warning', text: `${hours}j ${minutes}m`, color: 'text-orange-600' };
    return { status: 'on_track', text: `${hours}j ${minutes}m`, color: 'text-green-600' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          <p className="text-sm text-slate-500">Memuat data tiket eskalasi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Tiket Eskalasi</h1>
          <p className="text-sm text-slate-500 mt-1">Kelola tiket yang memerlukan perhatian khusus</p>
        </div>
        <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors">
          <span className="material-symbols-outlined text-[18px]">refresh</span>
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { icon: 'confirmation_number', color: 'blue', value: stats.total_active, label: 'Total Aktif' },
          { icon: 'priority_high', color: 'red', value: stats.high_urgency, label: 'Urgensi Tinggi' },
          { icon: 'hourglass_empty', color: 'yellow', value: stats.waiting_response, label: 'Menunggu Respon' },
          { icon: 'check_circle', color: 'green', value: stats.completed_this_month, label: 'Selesai Bulan Ini' },
          { icon: 'new_releases', color: 'purple', value: stats.new_today, label: 'Baru Hari Ini' }
        ].map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-3">
              <div className={`p-2 bg-${stat.color}-100 dark:bg-${stat.color}-900/30 rounded-lg`}>
                <span className={`material-symbols-outlined text-${stat.color}-600 dark:text-${stat.color}-400`}>{stat.icon}</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                <p className="text-xs text-slate-500">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
            <input type="text" placeholder="Cari tiket..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white text-sm" />
          </div>
          <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white text-sm">
            <option value="all">Semua Prioritas</option>
            <option value="critical">Kritis</option>
            <option value="high">Tinggi</option>
            <option value="medium">Sedang</option>
            <option value="low">Rendah</option>
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white text-sm">
            <option value="all">Semua Status</option>
            <option value="baru">Baru</option>
            <option value="open">Terbuka</option>
            <option value="in_progress">Diproses</option>
            <option value="escalated">Dieskalasi</option>
            <option value="resolved">Selesai</option>
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        {filteredTickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">inbox</span>
            <p className="text-slate-500 text-lg font-medium">Tidak ada tiket eskalasi</p>
            <p className="text-slate-400 text-sm mt-1">{searchTerm || filterPriority !== 'all' || filterStatus !== 'all' ? 'Coba ubah filter pencarian' : 'Tiket eskalasi akan muncul di sini'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">No. Tiket</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Judul</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Unit</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Prioritas</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">SLA</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Dieskalasi</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {filteredTickets.map((ticket) => {
                  const sla = calculateSLAStatus(ticket.sla_deadline);
                  return (
                    <tr key={ticket.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                      <td className="px-4 py-3"><span className="text-sm font-mono font-medium text-primary">#{ticket.ticket_number}</span></td>
                      <td className="px-4 py-3">
                        <div className="max-w-xs">
                          <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{ticket.title}</p>
                          {ticket.submitter_name && <p className="text-xs text-slate-500 mt-0.5">Pelapor: {ticket.submitter_name}</p>}
                        </div>
                      </td>
                      <td className="px-4 py-3"><span className="text-sm text-slate-600 dark:text-slate-300">{ticket.unit_name}</span></td>
                      <td className="px-4 py-3">{getPriorityBadge(ticket.priority)}</td>
                      <td className="px-4 py-3">{getStatusBadge(ticket.status)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <span className={`material-symbols-outlined text-[16px] ${sla.status === 'breached' ? 'text-red-500' : sla.status === 'warning' ? 'text-orange-500' : 'text-green-500'}`}>
                            {sla.status === 'breached' ? 'error' : sla.status === 'warning' ? 'warning' : 'schedule'}
                          </span>
                          <span className={`text-sm font-medium ${sla.color}`}>{sla.text}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3"><span className="text-sm text-slate-500">{formatDate(ticket.escalated_at)}</span></td>
                      <td className="px-4 py-3 text-center">
                        <Link to={`/assignment/tiket-eskalasi/${ticket.id}`} className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-sm font-medium rounded-lg transition-colors">
                          <span className="material-symbols-outlined text-[16px]">visibility</span>
                          Detail
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {filteredTickets.length > 0 && (
        <div className="flex items-center justify-between text-sm text-slate-500">
          <p>Menampilkan {filteredTickets.length} dari {tickets.length} tiket</p>
          <p>Terakhir diperbarui: {new Date().toLocaleTimeString('id-ID')}</p>
        </div>
      )}
    </div>
  );
}
