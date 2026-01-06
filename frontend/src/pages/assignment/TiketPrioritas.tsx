import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

interface PriorityTicket {
  id: string;
  ticket_number: string;
  title: string;
  description: string;
  unit_name: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: string;
  created_at: string;
  sla_deadline: string;
  sla_remaining: string;
  sla_status: 'on_track' | 'warning' | 'breached';
  ai_summary?: string;
  ai_alert_type?: 'sentiment' | 'prediction' | 'validation' | 'warning';
  assignee?: { name: string; role: string; avatar?: string };
}

interface Stats {
  total_escalation: number;
  sla_breach: number;
  high_priority: number;
  waiting_review: number;
  new_today: number;
}

export default function TiketPrioritas() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tickets, setTickets] = useState<PriorityTicket[]>([]);
  const [stats, setStats] = useState<Stats>({
    total_escalation: 0, sla_breach: 0, high_priority: 0, waiting_review: 0, new_today: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [unitFilter, setUnitFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchPriorityTickets();
  }, []);

  const fetchPriorityTickets = async () => {
    try {
      setLoading(true);
      const response = await api.get('/escalations/priority-tickets');
      if (response.data.success) {
        setTickets(response.data.data || []);
        calculateStats(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching priority tickets:', error);
      // Mock data
      const mockTickets: PriorityTicket[] = [
        {
          id: '1',
          ticket_number: 'T-1045',
          title: 'Keluhan Waktu Tunggu IGD Melebihi 4 Jam',
          description: 'Pasien mengeluh waktu tunggu terlalu lama',
          unit_name: 'IGD / Emergency',
          priority: 'critical',
          status: 'in_progress',
          created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          sla_deadline: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          sla_remaining: '-1j 15m',
          sla_status: 'breached',
          ai_summary: 'Analisis AI: Sentimen pasien sangat negatif. Risiko viral di medsos tinggi.',
          ai_alert_type: 'sentiment',
          assignee: { name: 'Dr. Budi S.', role: 'Ka. Unit' }
        },
        {
          id: '2',
          ticket_number: 'T-1029',
          title: 'Fasilitas AC Ruang Rawat Inap 304 Rusak',
          description: 'AC tidak berfungsi sejak kemarin',
          unit_name: 'Fasilitas',
          priority: 'high',
          status: 'open',
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          sla_deadline: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
          sla_remaining: '2j 00m',
          sla_status: 'on_track',
          ai_summary: 'Prediksi: Eskalasi otomatis dalam 2 jam jika tidak ditangani.',
          ai_alert_type: 'prediction',
          assignee: { name: 'Ahmad R.', role: 'Teknisi' }
        },
        {
          id: '3',
          ticket_number: 'T-1067',
          title: 'Permintaan Persetujuan Refund Obat',
          description: 'Dieskalasi oleh Admin Farmasi',
          unit_name: 'Farmasi',
          priority: 'medium',
          status: 'escalated',
          created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          sla_deadline: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(),
          sla_remaining: '22j 15m',
          sla_status: 'on_track',
          ai_summary: 'Validasi: Data sesuai prosedur refund. Memerlukan approval manager.',
          ai_alert_type: 'validation'
        },
        {
          id: '4',
          ticket_number: 'T-1011',
          title: 'Dugaan Malpraktik Ringan Poli Gigi',
          description: 'Menunggu Review Manager',
          unit_name: 'Poli Gigi',
          priority: 'high',
          status: 'escalated',
          created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          sla_deadline: new Date(Date.now() + 4.5 * 60 * 60 * 1000).toISOString(),
          sla_remaining: '4j 30m',
          sla_status: 'warning',
          ai_summary: 'Alert: Kata kunci sensitif terdeteksi "Sakit Berlebih", "Salah Prosedur".',
          ai_alert_type: 'warning',
          assignee: { name: 'Drg. Ratna', role: 'Dokter Gigi' }
        }
      ];
      setTickets(mockTickets);
      calculateStats(mockTickets);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data: PriorityTicket[]) => {
    setStats({
      total_escalation: data.length,
      sla_breach: data.filter(t => t.sla_status === 'breached').length,
      high_priority: data.filter(t => t.priority === 'high' || t.priority === 'critical').length,
      waiting_review: data.filter(t => t.status === 'escalated').length,
      new_today: 2
    });
  };

  const getPriorityBadge = (priority: string) => {
    const styles: Record<string, string> = {
      critical: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
      high: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
      medium: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
      low: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
    };
    const labels: Record<string, string> = { critical: 'KRITIS', high: 'TINGGI', medium: 'MEDIUM', low: 'RENDAH' };
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${styles[priority]}`}>
        {labels[priority] || priority.toUpperCase()}
      </span>
    );
  };

  const getSLAStatusColor = (status: string) => {
    if (status === 'breached') return 'text-red-600 dark:text-red-400';
    if (status === 'warning') return 'text-orange-600 dark:text-orange-400';
    return 'text-slate-900 dark:text-white';
  };

  const getAIAlertStyle = (type?: string) => {
    if (type === 'sentiment') return 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-800/50 text-indigo-900 dark:text-indigo-200';
    if (type === 'warning') return 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800/50 text-amber-900 dark:text-amber-200';
    return 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300';
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.ticket_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesUnit = unitFilter === 'all' || ticket.unit_name.toLowerCase().includes(unitFilter.toLowerCase());
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    return matchesSearch && matchesUnit && matchesPriority;
  });

  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);
  const paginatedTickets = filteredTickets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="w-full bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-8 py-6 flex flex-wrap justify-between items-center gap-4 shrink-0 z-10">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h1 className="text-slate-900 dark:text-white text-2xl font-black tracking-tight">Tiket Prioritas Saya</h1>
            <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">MANAGER VIEW</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              {stats.high_priority} Tiket memerlukan perhatian segera - <span className="text-slate-900 dark:text-slate-200 font-medium">Tindakan Diperlukan</span>
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => fetchPriorityTickets()} className="flex items-center justify-center gap-2 h-10 px-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            <span className="material-symbols-outlined text-[20px]">refresh</span>
            <span>Refresh</span>
          </button>
          <button className="flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-primary hover:bg-blue-600 text-white text-sm font-bold shadow-sm shadow-blue-200 dark:shadow-none transition-all active:scale-95">
            <span className="material-symbols-outlined text-[20px]">download</span>
            <span>Export Data</span>
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-[1400px] mx-auto flex flex-col gap-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group hover:border-primary/50 transition-colors">
              <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-6xl text-primary">trending_up</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Eskalasi</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-slate-900 dark:text-white text-3xl font-bold">{stats.total_escalation}</h3>
                <span className="text-emerald-600 dark:text-emerald-400 text-xs font-bold bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded">+{stats.new_today} hari ini</span>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-l-4 border-slate-200 dark:border-slate-700 border-l-red-500 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group hover:border-red-200 transition-colors">
              <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-6xl text-red-500">warning</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Pelanggaran SLA</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-slate-900 dark:text-white text-3xl font-bold">{stats.sla_breach}</h3>
                <span className="text-red-600 dark:text-red-400 text-xs font-bold bg-red-50 dark:bg-red-900/30 px-2 py-0.5 rounded">+1 Baru</span>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group hover:border-orange-200 transition-colors">
              <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-6xl text-orange-500">priority_high</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Prioritas Tinggi</p>
              <h3 className="text-slate-900 dark:text-white text-3xl font-bold">{stats.high_priority}</h3>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group hover:border-blue-200 transition-colors">
              <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-6xl text-blue-400">rate_review</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Menunggu Review</p>
              <h3 className="text-slate-900 dark:text-white text-3xl font-bold">{stats.waiting_review}</h3>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="relative flex-1 min-w-[280px] max-w-md">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm transition-shadow"
                  placeholder="Cari ID Tiket, Keyword, atau Nama Pasien..."
                />
              </div>
              <div className="flex items-center gap-3 overflow-x-auto pb-1">
                <select
                  value={unitFilter}
                  onChange={(e) => setUnitFilter(e.target.value)}
                  className="h-9 px-3 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white font-medium"
                >
                  <option value="all">Semua Unit</option>
                  <option value="igd">IGD / Emergency</option>
                  <option value="fasilitas">Fasilitas</option>
                  <option value="farmasi">Farmasi</option>
                </select>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="h-9 px-3 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white font-medium"
                >
                  <option value="all">Semua Prioritas</option>
                  <option value="critical">Kritis</option>
                  <option value="high">Tinggi</option>
                  <option value="medium">Medium</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                        <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider w-[60px]">Status</th>
                        <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Tiket & Subjek</th>
                        <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">AI Summary</th>
                        <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Unit</th>
                        <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Prioritas</th>
                        <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">SLA Timer</th>
                        <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Assignee</th>
                        <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {paginatedTickets.map((ticket) => (
                        <tr key={ticket.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="py-4 px-6 align-top">
                            <div className={`w-3 h-3 rounded-full mt-1.5 ${
                              ticket.sla_status === 'breached' ? 'bg-red-500 ring-4 ring-red-100 dark:ring-red-900/20' :
                              ticket.sla_status === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                            }`} title={ticket.sla_status === 'breached' ? 'SLA Breach' : ticket.sla_status === 'warning' ? 'Review Needed' : 'Escalated'}></div>
                          </td>
                          <td className="py-4 px-6 align-top max-w-[280px]">
                            <div className="flex flex-col gap-1">
                              <span className="text-xs font-bold text-slate-400">#{ticket.ticket_number}</span>
                              <p className="text-sm font-bold text-slate-900 dark:text-white leading-snug group-hover:text-primary transition-colors">{ticket.title}</p>
                              <span className="text-xs text-slate-500">{ticket.description}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6 align-top max-w-[260px]">
                            {ticket.ai_summary && (
                              <div className={`flex gap-2 p-2 rounded-lg border ${getAIAlertStyle(ticket.ai_alert_type)}`}>
                                <span className={`material-symbols-outlined text-[18px] shrink-0 ${
                                  ticket.ai_alert_type === 'sentiment' ? 'text-indigo-500' :
                                  ticket.ai_alert_type === 'warning' ? 'text-amber-500' : 'text-slate-400'
                                }`}>
                                  {ticket.ai_alert_type === 'warning' ? 'warning' : ticket.ai_alert_type === 'sentiment' ? 'auto_awesome' : 'smart_toy'}
                                </span>
                                <p className="text-xs leading-relaxed font-medium">{ticket.ai_summary}</p>
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-6 align-top">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                              {ticket.unit_name}
                            </span>
                          </td>
                          <td className="py-4 px-6 align-top">{getPriorityBadge(ticket.priority)}</td>
                          <td className="py-4 px-6 align-top">
                            <div className="flex flex-col">
                              <span className={`text-sm font-bold ${getSLAStatusColor(ticket.sla_status)}`}>{ticket.sla_remaining}</span>
                              <span className={`text-xs ${ticket.sla_status === 'breached' ? 'text-red-500' : 'text-slate-500'}`}>
                                {ticket.sla_status === 'breached' ? 'SLA Terlewati' : 'Tersisa'}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-6 align-top">
                            {ticket.assignee ? (
                              <div className="flex items-center gap-2">
                                <div className="bg-center bg-no-repeat bg-cover rounded-full w-8 h-8 shrink-0 bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300">
                                  {ticket.assignee.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-xs font-semibold text-slate-900 dark:text-white">{ticket.assignee.name}</span>
                                  <span className="text-[10px] text-slate-500">{ticket.assignee.role}</span>
                                </div>
                              </div>
                            ) : (
                              <span className="text-xs italic text-slate-400">Menunggu Anda</span>
                            )}
                          </td>
                          <td className="py-4 px-6 align-top text-right">
                            <button
                              onClick={() => navigate(`/assignment/tiket-prioritas/${ticket.id}`)}
                              className="text-primary hover:text-blue-600 hover:bg-primary/10 p-2 rounded-lg transition-colors group/btn"
                            >
                              <span className="material-symbols-outlined group-hover/btn:translate-x-0.5 transition-transform">arrow_forward_ios</span>
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
                      className="px-3 py-1 text-sm font-medium rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-400 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 text-sm font-medium rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
