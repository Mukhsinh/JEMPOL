// Halaman Tiket Eskalasi - Untuk Kepala Unit
import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ErrorBoundary from '../../components/ErrorBoundary';
import escalatedTicketService, { EscalatedTicket, EscalationStats } from '../../services/escalatedTicketService';
import api, { isVercelProduction } from '../../services/api';
import { createClient } from '@supabase/supabase-js';

// Anon client untuk query publik
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://jxxzbdivafzzwqhagwrf.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4eHpiZGl2YWZ6endxaGFnd3JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MTkwNTEsImV4cCI6MjA4MDQ5NTA1MX0.ICOtGuxrD19GtawdR9JAsnFn9XsHxWkr1aHCEkgHqXg';
const anonSupabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

interface Unit {
  id: string;
  name: string;
  code: string;
}

export default function TiketEskalasi() {
  console.log('🔵 TiketEskalasi: Component mounting...');
  const navigate = useNavigate();
  const { user } = useAuth();
  console.log('🔵 TiketEskalasi: User:', user?.email);
  const [tickets, setTickets] = useState<EscalatedTicket[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [stats, setStats] = useState<EscalationStats>({
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
  const [unitFilter, setUnitFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'priority'>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch units for filter
  const fetchUnits = useCallback(async () => {
    try {
      // Di production, gunakan Supabase langsung
      if (isVercelProduction()) {
        const { data, error } = await anonSupabase
          .from('units')
          .select('id, name, code')
          .eq('is_active', true)
          .order('name');
        if (!error && data) {
          setUnits(data);
        }
        return;
      }

      const response = await api.get('/public/units');
      if (Array.isArray(response.data)) {
        setUnits(response.data);
      }
    } catch (error) {
      console.error('Error fetching units:', error);
      // Fallback ke Supabase
      try {
        const { data } = await anonSupabase
          .from('units')
          .select('id, name, code')
          .eq('is_active', true);
        if (data) setUnits(data);
      } catch (e) {
        // Silent
      }
    }
  }, []);

  const fetchEscalatedTickets = useCallback(async () => {
    try {
      setLoading(true);
      const data = await escalatedTicketService.getMyEscalatedTickets();
      setTickets(data);
      setStats(escalatedTicketService.calculateStats(data));
    } catch (error) {
      console.error('Error fetching escalated tickets:', error);
      setTickets([]);
      setStats(escalatedTicketService.calculateStats([]));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEscalatedTickets();
    fetchUnits();
  }, [fetchEscalatedTickets, fetchUnits]);

  // Handle auth error - redirect to login if needed
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { supabase } = await import('../../utils/supabaseClient');
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error?.message?.includes('Refresh Token') || (!session && !loading)) {
          // Clear invalid session and let ProtectedRoute handle redirect
          const { clearInvalidSession } = await import('../../utils/supabaseClient');
          await clearInvalidSession();
        }
      } catch (e) {
        console.log('Auth check error:', e);
      }
    };
    checkAuth();
  }, [loading]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, urgencyFilter, unitFilter, sortOrder]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['No. Tiket', 'Judul', 'Unit Asal', 'Urgensi', 'Status', 'Tanggal Eskalasi', 'Alasan Eskalasi'];
    const csvData = filteredTickets.map(ticket => [
      ticket.ticket_number,
      ticket.title,
      ticket.unit_name,
      ticket.priority.toUpperCase(),
      ticket.status,
      formatDate(ticket.escalated_at),
      ticket.escalation_reason || '-'
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `tiket-eskalasi-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Print report
  const handlePrint = () => {
    window.print();
  };

  const getPriorityBadge = (priority: string) => {
    const styles: Record<string, string> = {
      critical: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800',
      high: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800',
      medium: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800',
      low: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
    };
    const labels: Record<string, string> = {
      critical: 'KRITIS',
      high: 'TINGGI',
      medium: 'SEDANG',
      low: 'RENDAH'
    };
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${styles[priority] || styles.medium}`}>
        {(priority === 'high' || priority === 'critical') && (
          <span className="material-symbols-outlined text-sm">warning</span>
        )}
        {labels[priority] || priority.toUpperCase()}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      open: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800',
      in_progress: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800',
      escalated: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800',
      resolved: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800',
      closed: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
    };
    const labels: Record<string, string> = {
      open: 'Baru',
      in_progress: 'Sedang Proses',
      escalated: 'Menunggu',
      resolved: 'Selesai',
      closed: 'Ditutup'
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${styles[status] || styles.open}`}>
        {labels[status] || status}
      </span>
    );
  };

  const filteredTickets = (Array.isArray(tickets) ? tickets : [])
    .filter(ticket => {
      if (!ticket) return false;
      const matchesSearch =
        (ticket.ticket_number?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (ticket.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (ticket.unit_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (ticket.submitter_name && ticket.submitter_name.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
      const matchesUrgency = urgencyFilter === 'all' || ticket.priority === urgencyFilter;
      const matchesUnit = unitFilter === 'all' || ticket.unit_name === unitFilter;
      return matchesSearch && matchesStatus && matchesUrgency && matchesUnit;
    })
    .sort((a, b) => {
      // Safe date parsing
      const dateA = a.escalated_at ? new Date(a.escalated_at).getTime() : 0;
      const dateB = b.escalated_at ? new Date(b.escalated_at).getTime() : 0;

      if (sortOrder === 'newest') {
        return dateB - dateA;
      } else if (sortOrder === 'oldest') {
        return dateA - dateB;
      } else {
        // Sort by priority
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2);
      }
    });

  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);
  const paginatedTickets = filteredTickets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <ErrorBoundary name="TiketEskalasi">
      <div className="bg-background-light dark:bg-background-dark font-display text-text-main dark:text-gray-100 min-h-screen flex flex-col overflow-hidden">
        {/* Debug Banner - Remove after testing */}
        <div className="bg-yellow-100 dark:bg-yellow-900/30 border-b border-yellow-300 p-3 text-yellow-800 dark:text-yellow-200 text-sm font-medium">
          🔍 Debug: TiketEskalasi loaded - User: {user?.email || 'Unknown'} | Loading: {loading ? 'Yes' : 'No'} | Tickets: {tickets.length}
        </div>

        <main className="flex-1 flex flex-col h-full overflow-y-auto relative scroll-smooth">
          <div className="w-full max-w-[1440px] mx-auto p-4 md:p-6 lg:p-8 flex flex-col gap-6">
            <nav className="flex text-sm font-medium text-text-sub dark:text-gray-400">
              <Link to="/" className="hover:text-primary transition-colors flex items-center gap-1">
                <span className="material-symbols-outlined text-lg">home</span>
                Beranda
              </Link>
              <span className="mx-2 text-gray-300">/</span>
              <span className="text-text-main dark:text-white font-semibold">Tiket Eskalasi Saya</span>
            </nav>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="flex flex-col gap-1.5 max-w-3xl">
                <h1 className="text-3xl md:text-4xl font-black tracking-tight text-text-main dark:text-white">Tiket Eskalasi Saya</h1>
                <p className="text-text-sub dark:text-gray-400 text-base leading-relaxed">
                  Anda sedang melihat daftar tiket yang dieskalasikan khusus untuk <span className="font-semibold text-text-main dark:text-gray-200">{user?.role === 'supervisor' ? 'Kepala Unit' : user?.full_name || 'Anda'}</span>. Tinjau urgensi dan ambil tindakan cepat.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handlePrint}
                  className="bg-white dark:bg-surface-dark border border-border-color dark:border-gray-600 text-text-main dark:text-white px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-2 shadow-sm"
                >
                  <span className="material-symbols-outlined text-lg">print</span>
                  Cetak Laporan
                </button>
                <button
                  onClick={handleExportCSV}
                  className="bg-primary text-white border border-primary px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-primary-dark transition flex items-center gap-2 shadow-sm shadow-blue-200 dark:shadow-none"
                >
                  <span className="material-symbols-outlined text-lg">download</span>
                  Ekspor Data
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div className="bg-surface-light dark:bg-surface-dark rounded-xl p-5 border border-border-color dark:border-gray-700 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:border-primary/50 transition-colors cursor-default">
                <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <span className="material-symbols-outlined text-7xl text-primary">inbox</span>
                </div>
                <div>
                  <p className="text-text-sub dark:text-gray-400 text-sm font-medium mb-1">Total Tiket Aktif</p>
                  <p className="text-3xl font-black text-text-main dark:text-white">{stats.total_active}</p>
                </div>
                <div className="mt-4 pt-4 border-t border-dashed border-gray-200 dark:border-gray-700 w-full">
                  <span className="text-xs text-text-sub dark:text-gray-500">Semua tiket eskalasi</span>
                </div>
              </div>

              <div className="bg-surface-light dark:bg-surface-dark rounded-xl p-5 border border-border-color dark:border-gray-700 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:border-red-500/50 transition-colors cursor-default">
                <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <span className="material-symbols-outlined text-7xl text-red-500">priority_high</span>
                </div>
                <div>
                  <p className="text-text-sub dark:text-gray-400 text-sm font-medium mb-1">Urgensi Tinggi</p>
                  <div className="flex items-center gap-2">
                    <p className="text-3xl font-black text-text-main dark:text-white">{stats.high_urgency}</p>
                    {stats.new_today > 0 && (
                      <span className="text-[10px] font-bold text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400 px-2 py-0.5 rounded-full animate-pulse">PERLU TINDAKAN</span>
                    )}
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-dashed border-gray-200 dark:border-gray-700 w-full">
                  <span className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">trending_up</span> +{stats.new_today} hari ini
                  </span>
                </div>
              </div>

              <div className="bg-surface-light dark:bg-surface-dark rounded-xl p-5 border border-border-color dark:border-gray-700 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:border-yellow-500/50 transition-colors cursor-default">
                <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <span className="material-symbols-outlined text-7xl text-yellow-500">pending</span>
                </div>
                <div>
                  <p className="text-text-sub dark:text-gray-400 text-sm font-medium mb-1">Menunggu Respon</p>
                  <p className="text-3xl font-black text-text-main dark:text-white">{stats.waiting_response}</p>
                </div>
                <div className="mt-4 pt-4 border-t border-dashed border-gray-200 dark:border-gray-700 w-full">
                  <span className="text-xs text-text-sub dark:text-gray-500">Menunggu persetujuan Anda</span>
                </div>
              </div>

              <div className="bg-surface-light dark:bg-surface-dark rounded-xl p-5 border border-border-color dark:border-gray-700 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:border-green-500/50 transition-colors cursor-default">
                <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <span className="material-symbols-outlined text-7xl text-green-500">check_circle</span>
                </div>
                <div>
                  <p className="text-text-sub dark:text-gray-400 text-sm font-medium mb-1">Selesai Bulan Ini</p>
                  <p className="text-3xl font-black text-text-main dark:text-white">{stats.completed_this_month}</p>
                </div>
                <div className="mt-4 pt-4 border-t border-dashed border-gray-200 dark:border-gray-700 w-full">
                  <span className="text-xs text-green-600 dark:text-green-400 font-medium">Kinerja Unit: Baik</span>
                </div>
              </div>
            </div>

            <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-color dark:border-gray-700 shadow-sm p-4 flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
              <div className="w-full lg:w-96 relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-sub dark:text-gray-400">search</span>
                <input
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-background-light dark:bg-gray-800 border-none ring-1 ring-border-color dark:ring-gray-600 focus:ring-2 focus:ring-primary dark:focus:ring-primary text-text-main dark:text-white placeholder:text-text-sub dark:placeholder:text-gray-500 text-sm transition-all shadow-sm"
                  placeholder="Cari No. Tiket, Judul, Unit..."
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-2 w-full lg:w-auto">
                <div className="relative group">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-background-light dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-text-main dark:text-white text-sm font-medium transition-colors border border-transparent hover:border-gray-300 dark:hover:border-gray-600"
                  >
                    <option value="all">Semua Status</option>
                    <option value="open">Baru</option>
                    <option value="in_progress">Sedang Proses</option>
                    <option value="escalated">Menunggu</option>
                    <option value="resolved">Selesai</option>
                  </select>
                </div>
                <div className="relative group">
                  <select
                    value={urgencyFilter}
                    onChange={(e) => setUrgencyFilter(e.target.value)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-background-light dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-text-main dark:text-white text-sm font-medium transition-colors border border-transparent hover:border-gray-300 dark:hover:border-gray-600"
                  >
                    <option value="all">Semua Urgensi</option>
                    <option value="critical">Kritis</option>
                    <option value="high">Tinggi</option>
                    <option value="medium">Sedang</option>
                    <option value="low">Rendah</option>
                  </select>
                </div>
                <div className="relative group">
                  <select
                    value={unitFilter}
                    onChange={(e) => setUnitFilter(e.target.value)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-background-light dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-text-main dark:text-white text-sm font-medium transition-colors border border-transparent hover:border-gray-300 dark:hover:border-gray-600"
                  >
                    <option value="all">Semua Unit</option>
                    {units.map(unit => (
                      <option key={unit.id} value={unit.name}>{unit.name}</option>
                    ))}
                  </select>
                </div>
                <div className="border-l border-border-color dark:border-gray-600 mx-1 h-8 hidden sm:block"></div>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest' | 'priority')}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-primary hover:bg-primary/10 text-sm font-bold transition-colors ml-auto sm:ml-0 border-none bg-transparent"
                >
                  <option value="newest">Terbaru</option>
                  <option value="oldest">Terlama</option>
                  <option value="priority">Prioritas</option>
                </select>
              </div>
            </div>

            <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-color dark:border-gray-700 shadow-sm overflow-hidden flex-1 flex flex-col">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : paginatedTickets.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 px-4">
                  <div className="bg-slate-100 dark:bg-slate-700 rounded-full p-6 mb-4">
                    <span className="material-symbols-outlined text-5xl text-slate-400 dark:text-slate-500">inbox</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Tidak Ada Tiket Eskalasi</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-center max-w-md">
                    Saat ini tidak ada tiket yang dieskalasikan kepada Anda. Tiket akan muncul di sini ketika ada eskalasi baru.
                  </p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-border-color dark:border-gray-700">
                        <tr>
                          <th className="px-6 py-4 font-bold text-text-sub dark:text-gray-300 uppercase text-xs tracking-wider">No. Tiket</th>
                          <th className="px-6 py-4 font-bold text-text-sub dark:text-gray-300 uppercase text-xs tracking-wider">Judul / Masalah</th>
                          <th className="px-6 py-4 font-bold text-text-sub dark:text-gray-300 uppercase text-xs tracking-wider">Unit Asal</th>
                          <th className="px-6 py-4 font-bold text-text-sub dark:text-gray-300 uppercase text-xs tracking-wider">Urgensi</th>
                          <th className="px-6 py-4 font-bold text-text-sub dark:text-gray-300 uppercase text-xs tracking-wider">Status</th>
                          <th className="px-6 py-4 font-bold text-text-sub dark:text-gray-300 uppercase text-xs tracking-wider text-right">Aksi Cepat</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-color dark:divide-gray-700">
                        {paginatedTickets.map((ticket, index) => (
                          <tr key={ticket.id} className="hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors group/row">
                            <td className="px-6 py-4 font-bold text-primary">#{ticket.ticket_number}</td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="text-text-main dark:text-white font-bold text-base">{ticket.title}</span>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs text-text-sub dark:text-gray-400">
                                    {formatDate(ticket.created_at)} • {ticket.description || 'Tidak ada deskripsi'}
                                  </span>
                                  {ticket.ai_insight && (
                                    <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-[10px] font-bold px-1.5 py-0.5 rounded border border-purple-200 dark:border-purple-800 flex items-center gap-1" title="Dianalisis oleh AI">
                                      <span className="material-symbols-outlined text-[10px]">auto_awesome</span> AI Insight
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <div className="size-2 rounded-full" style={{ backgroundColor: ticket.unit_color || '#3b82f6' }}></div>
                                <span className="text-text-main dark:text-gray-200 font-medium">{ticket.unit_name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {getPriorityBadge(ticket.priority)}
                            </td>
                            <td className="px-6 py-4">
                              {getStatusBadge(ticket.status)}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => navigate(`/assignment/tiket-eskalasi/${ticket.id}`)}
                                className={`${index === 0
                                  ? 'bg-primary hover:bg-primary-dark text-white shadow-sm shadow-blue-200 dark:shadow-none'
                                  : 'bg-white dark:bg-surface-dark border border-border-color dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-text-main dark:text-white'
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

                  <div className="p-4 border-t border-border-color dark:border-gray-700 bg-background-light dark:bg-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 mt-auto">
                    <p className="text-sm text-text-sub dark:text-gray-400">
                      Menampilkan <span className="font-bold text-text-main dark:text-white">{(currentPage - 1) * itemsPerPage + 1}</span> sampai <span className="font-bold text-text-main dark:text-white">{Math.min(currentPage * itemsPerPage, filteredTickets.length)}</span> dari <span className="font-bold text-text-main dark:text-white">{filteredTickets.length}</span> tiket
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 rounded-lg border border-border-color dark:border-gray-600 text-text-sub dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 text-sm font-semibold transition-colors"
                      >
                        Sebelumnya
                      </button>
                      <div className="hidden sm:flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 3).map(page => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`size-8 rounded-lg text-sm font-bold flex items-center justify-center ${currentPage === page
                              ? 'bg-primary text-white'
                              : 'text-text-sub hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                          >
                            {page}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 rounded-lg border border-border-color dark:border-gray-600 text-text-main dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-semibold transition-colors"
                      >
                        Selanjutnya
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
}
