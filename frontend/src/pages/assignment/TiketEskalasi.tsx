// Halaman Tiket Eskalasi - Untuk Kepala Unit
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

interface EscalatedTicket {
  id: string;
  ticket_number: string;
  title: string;
  description: string;
  unit_name: string;
  unit_color: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: string;
  created_at: string;
  sla_deadline: string;
  escalated_at: string;
  escalation_reason: string;
  ai_insight?: string;
  submitter_name?: string;
}

interface Stats {
  total_active: number;
  high_urgency: number;
  waiting_response: number;
  completed_this_month: number;
  new_today: number;
}

export default function TiketEskalasi() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tickets, setTickets] = useState<EscalatedTicket[]>([]);
  const [stats, setStats] = useState<Stats>({
    total_active: 0,
    high_urgency: 0,
    waiting_response: 0,
    completed_this_month: 0,
    new_today: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchEscalatedTickets();
  }, []);

  const fetchEscalatedTickets = async () => {
    try {
      setLoading(true);
      // Fetch escalated tickets for current user (Kepala Unit)
      const response = await api.get('/escalations/my-tickets');
      if (response.data.success) {
        setTickets(response.data.data || []);
        calculateStats(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching escalated tickets:', error);
      // Use mock data for demo
      const mockTickets: EscalatedTicket[] = [
        {
          id: '1',
          ticket_number: 'TKT-2023-001',
          title: 'Keluhan Pelayanan UGD',
          description: 'Pasien menunggu > 3 jam',
          unit_name: 'Unit Gawat Darurat',
          unit_color: '#3B82F6',
          priority: 'high',
          status: 'in_progress',
          created_at: '2023-10-12T10:00:00Z',
          sla_deadline: '2023-10-12T14:00:00Z',
          escalated_at: '2023-10-12T10:20:00Z',
          escalation_reason: 'Risiko SLA tinggi dan kategori sanitasi kritis',
          ai_insight: 'Sentimen negatif terdeteksi, perlu tindakan segera',
          submitter_name: 'John Doe'
        },
        {
          id: '2',
          ticket_number: 'TKT-2023-004',
          title: 'Fasilitas Ruang Tunggu Rusak',
          description: 'AC mati di lantai 2',
          unit_name: 'Unit Sarana & Prasarana',
          unit_color: '#F97316',
          priority: 'medium',
          status: 'open',
          created_at: '2023-10-11T09:00:00Z',
          sla_deadline: '2023-10-12T09:00:00Z',
          escalated_at: '2023-10-11T11:00:00Z',
          escalation_reason: 'Keluhan berulang dari pengunjung'
        },
        {
          id: '3',
          ticket_number: 'TKT-2023-018',
          title: 'Keterlambatan Obat Rawat Inap',
          description: 'Komplain keluarga pasien VIP',
          unit_name: 'Unit Farmasi',
          unit_color: '#14B8A6',
          priority: 'high',
          status: 'in_progress',
          created_at: '2023-10-10T08:00:00Z',
          sla_deadline: '2023-10-10T12:00:00Z',
          escalated_at: '2023-10-10T10:00:00Z',
          escalation_reason: 'Pasien VIP, prioritas tinggi',
          ai_insight: 'Pola keluhan serupa terdeteksi minggu ini'
        },
        {
          id: '4',
          ticket_number: 'TKT-2023-022',
          title: 'Permintaan Jadwal Dokter Spesialis',
          description: 'Website tidak update',
          unit_name: 'Unit Administrasi',
          unit_color: '#6366F1',
          priority: 'low',
          status: 'escalated',
          created_at: '2023-10-09T14:00:00Z',
          sla_deadline: '2023-10-11T14:00:00Z',
          escalated_at: '2023-10-10T08:00:00Z',
          escalation_reason: 'Menunggu persetujuan',
          ai_insight: 'Masalah teknis teridentifikasi'
        }
      ];
      setTickets(mockTickets);
      calculateStats(mockTickets);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data: EscalatedTicket[]) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    setStats({
      total_active: data.filter(t => !['resolved', 'closed'].includes(t.status)).length,
      high_urgency: data.filter(t => t.priority === 'high' || t.priority === 'critical').length,
      waiting_response: data.filter(t => t.status === 'escalated').length,
      completed_this_month: data.filter(t => 
        ['resolved', 'closed'].includes(t.status) && 
        new Date(t.created_at) >= startOfMonth
      ).length,
      new_today: data.filter(t => new Date(t.escalated_at) >= startOfDay).length
    });
  };

  const getPriorityBadge = (priority: string) => {
    const styles: Record<string, string> = {
      critical: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
      high: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
      medium: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
      low: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700'
    };
    const labels: Record<string, string> = {
      critical: 'KRITIS',
      high: 'TINGGI',
      medium: 'SEDANG',
      low: 'RENDAH'
    };
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${styles[priority] || styles.medium}`}>
        {(priority === 'high' || priority === 'critical') && (
          <span className="material-symbols-outlined text-sm">warning</span>
        )}
        {labels[priority] || priority.toUpperCase()}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      open: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800',
      in_progress: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
      escalated: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800',
      resolved: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800',
      closed: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700'
    };
    const labels: Record<string, string> = {
      open: 'Baru',
      in_progress: 'Sedang Proses',
      escalated: 'Menunggu',
      resolved: 'Selesai',
      closed: 'Ditutup'
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${styles[status] || styles.open}`}>
        {labels[status] || status}
      </span>
    );
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.ticket_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.unit_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesUrgency = urgencyFilter === 'all' || ticket.priority === urgencyFilter;
    return matchesSearch && matchesStatus && matchesUrgency;
  });

  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);
  const paginatedTickets = filteredTickets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="w-full">
      <div className="flex flex-col gap-6">
        {/* Breadcrumb */}
        <nav className="flex text-sm font-medium text-slate-500 dark:text-slate-400">
          <Link to="/" className="hover:text-primary transition-colors flex items-center gap-1">
            <span className="material-symbols-outlined text-lg">home</span>
            Beranda
          </Link>
          <span className="mx-2 text-slate-300">/</span>
          <span className="text-slate-900 dark:text-white font-semibold">Tiket Eskalasi Saya</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex flex-col gap-1.5 max-w-3xl">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              Tiket Eskalasi Saya
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-base leading-relaxed">
              Anda sedang melihat daftar tiket yang dieskalasikan khusus untuk{' '}
              <span className="font-semibold text-slate-900 dark:text-slate-200">
                {user?.role === 'supervisor' ? 'Kepala Unit' : user?.full_name || 'Anda'}
              </span>. Tinjau urgensi dan ambil tindakan cepat.
            </p>
          </div>
          <div className="flex gap-3">
            <button className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition flex items-center gap-2 shadow-sm">
              <span className="material-symbols-outlined text-lg">print</span>
              Cetak Laporan
            </button>
            <button className="bg-primary text-white border border-primary px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-blue-600 transition flex items-center gap-2 shadow-sm shadow-blue-200 dark:shadow-none">
              <span className="material-symbols-outlined text-lg">download</span>
              Ekspor Data
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:border-primary/50 transition-colors cursor-default">
            <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <span className="material-symbols-outlined text-7xl text-primary">inbox</span>
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Total Tiket Aktif</p>
              <p className="text-3xl font-black text-slate-900 dark:text-white">{stats.total_active}</p>
            </div>
            <div className="mt-4 pt-4 border-t border-dashed border-slate-200 dark:border-slate-700 w-full">
              <span className="text-xs text-slate-500 dark:text-slate-500">Semua tiket eskalasi</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:border-red-500/50 transition-colors cursor-default">
            <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <span className="material-symbols-outlined text-7xl text-red-500">priority_high</span>
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Urgensi Tinggi</p>
              <div className="flex items-center gap-2">
                <p className="text-3xl font-black text-slate-900 dark:text-white">{stats.high_urgency}</p>
                {stats.new_today > 0 && (
                  <span className="text-[10px] font-bold text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400 px-2 py-0.5 rounded-full animate-pulse">
                    PERLU TINDAKAN
                  </span>
                )}
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-dashed border-slate-200 dark:border-slate-700 w-full">
              <span className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">trending_up</span>
                +{stats.new_today} hari ini
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:border-yellow-500/50 transition-colors cursor-default">
            <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <span className="material-symbols-outlined text-7xl text-yellow-500">pending</span>
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Menunggu Respon</p>
              <p className="text-3xl font-black text-slate-900 dark:text-white">{stats.waiting_response}</p>
            </div>
            <div className="mt-4 pt-4 border-t border-dashed border-slate-200 dark:border-slate-700 w-full">
              <span className="text-xs text-slate-500 dark:text-slate-500">Menunggu persetujuan Anda</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:border-green-500/50 transition-colors cursor-default">
            <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <span className="material-symbols-outlined text-7xl text-green-500">check_circle</span>
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Selesai Bulan Ini</p>
              <p className="text-3xl font-black text-slate-900 dark:text-white">{stats.completed_this_month}</p>
            </div>
            <div className="mt-4 pt-4 border-t border-dashed border-slate-200 dark:border-slate-700 w-full">
              <span className="text-xs text-green-600 dark:text-green-400 font-medium">Kinerja Unit: Baik</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-4 flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
          <div className="w-full lg:w-96 relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400">search</span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border-none ring-1 ring-slate-200 dark:ring-slate-600 focus:ring-2 focus:ring-primary dark:focus:ring-primary text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-500 text-sm transition-all shadow-sm"
              placeholder="Cari No. Tiket, Judul, Unit..."
            />
          </div>
          <div className="flex flex-wrap gap-2 w-full lg:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm font-medium border border-slate-200 dark:border-slate-600"
            >
              <option value="all">Semua Status</option>
              <option value="open">Baru</option>
              <option value="in_progress">Sedang Proses</option>
              <option value="escalated">Menunggu</option>
              <option value="resolved">Selesai</option>
            </select>
            <select
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm font-medium border border-slate-200 dark:border-slate-600"
            >
              <option value="all">Semua Urgensi</option>
              <option value="critical">Kritis</option>
              <option value="high">Tinggi</option>
              <option value="medium">Sedang</option>
              <option value="low">Rendah</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex-1 flex flex-col">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="px-6 py-4 font-bold text-slate-500 dark:text-slate-300 uppercase text-xs tracking-wider">No. Tiket</th>
                      <th className="px-6 py-4 font-bold text-slate-500 dark:text-slate-300 uppercase text-xs tracking-wider">Judul / Masalah</th>
                      <th className="px-6 py-4 font-bold text-slate-500 dark:text-slate-300 uppercase text-xs tracking-wider">Unit Asal</th>
                      <th className="px-6 py-4 font-bold text-slate-500 dark:text-slate-300 uppercase text-xs tracking-wider">Urgensi</th>
                      <th className="px-6 py-4 font-bold text-slate-500 dark:text-slate-300 uppercase text-xs tracking-wider">Status</th>
                      <th className="px-6 py-4 font-bold text-slate-500 dark:text-slate-300 uppercase text-xs tracking-wider text-right">Aksi Cepat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {paginatedTickets.map((ticket, index) => (
                      <tr key={ticket.id} className="hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors group/row">
                        <td className="px-6 py-4 font-bold text-primary">#{ticket.ticket_number}</td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-slate-900 dark:text-white font-bold text-base">{ticket.title}</span>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-slate-500 dark:text-slate-400">
                                {formatDate(ticket.created_at)} • {ticket.description}
                              </span>
                              {ticket.ai_insight && (
                                <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-[10px] font-bold px-1.5 py-0.5 rounded border border-purple-200 dark:border-purple-800 flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[10px]">auto_awesome</span>
                                  AI Insight
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-2 h-2 rounded-full" 
                              style={{ backgroundColor: ticket.unit_color }}
                            ></div>
                            <span className="text-slate-900 dark:text-slate-200 font-medium">{ticket.unit_name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">{getPriorityBadge(ticket.priority)}</td>
                        <td className="px-6 py-4">{getStatusBadge(ticket.status)}</td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => navigate(`/assignment/tiket-eskalasi/${ticket.id}`)}
                            className={`${
                              index === 0 
                                ? 'bg-primary hover:bg-blue-600 text-white shadow-sm shadow-blue-200 dark:shadow-none' 
                                : 'bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-900 dark:text-white'
                            } text-sm font-semibold px-4 py-2 rounded-lg transition-all active:scale-95 flex items-center gap-2 ml-auto`}
                          >
                            Lihat Detail
                            <span className="material-symbols-outlined text-lg">arrow_forward</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 mt-auto">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Menampilkan <span className="font-bold text-slate-900 dark:text-white">{(currentPage - 1) * itemsPerPage + 1}</span> sampai{' '}
                  <span className="font-bold text-slate-900 dark:text-white">{Math.min(currentPage * itemsPerPage, filteredTickets.length)}</span> dari{' '}
                  <span className="font-bold text-slate-900 dark:text-white">{filteredTickets.length}</span> tiket
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 text-sm font-semibold transition-colors"
                  >
                    Sebelumnya
                  </button>
                  <div className="hidden sm:flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 3).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 rounded-lg text-sm font-bold flex items-center justify-center ${
                          currentPage === page
                            ? 'bg-primary text-white'
                            : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-semibold transition-colors"
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

