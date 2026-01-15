// Halaman Tinjauan Eksekutif - Untuk Direktur
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import escalatedTicketService from '../../services/escalatedTicketService';
import ErrorBoundary from '../../components/ErrorBoundary';

interface EscalationTicket {
  id: string;
  ticket_number: string;
  title: string;
  reporter: string;
  department: string;
  duration: string;
  sla_status: 'on_track' | 'warning' | 'breached';
  status: string;
  status_type: 'escalation_director' | 'high_priority' | 'investigation';
}

interface Stats {
  total_escalation: number;
  sla_breach_percentage: number;
  avg_response_hours: number;
  satisfaction_index: number;
  new_escalations: number;
  sla_improvement: number;
  response_improvement: string;
}

interface AIInsight {
  title: string;
  description: string;
  percentage?: number;
}

export default function TinjauanEksekutif() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tickets, setTickets] = useState<EscalationTicket[]>([]);
  const [stats, setStats] = useState<Stats>({
    total_escalation: 12, sla_breach_percentage: 5, avg_response_hours: 4.5,
    satisfaction_index: 4.8, new_escalations: 2, sla_improvement: 2, response_improvement: '15m'
  });
  const [aiInsight, setAIInsight] = useState<AIInsight>({
    title: 'Peningkatan Keluhan Fasilitas',
    description: 'Terdeteksi kenaikan 15% keluhan terkait AC di Ruang Rawat B dalam 24 jam terakhir. Sistem menyarankan pemeriksaan teknis segera sebelum eskalasi meluas.',
    percentage: 15
  });
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [periodFilter, setPeriodFilter] = useState('week');

  useEffect(() => {
    fetchExecutiveData();
  }, []);

  // Handle auth error - redirect to login if needed
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { supabase } = await import('../../utils/supabaseClient');
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error?.message?.includes('Refresh Token') || (!session && !loading)) {
          const { clearInvalidSession } = await import('../../utils/supabaseClient');
          await clearInvalidSession();
        }
      } catch (e) {
        console.log('Auth check error:', e);
      }
    };
    checkAuth();
  }, [loading]);

  const fetchExecutiveData = async () => {
    try {
      setLoading(true);
      const data = await escalatedTicketService.getExecutiveOverview();
      if (data) {
        setTickets(data.tickets || []);
        if (data.stats) {
          setStats(data.stats);
        }
        if (data.ai_insight) {
          setAIInsight(data.ai_insight);
        }
      } else {
        setTickets([]);
      }
    } catch (error) {
      console.error('Error fetching executive data:', error);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string, type: string) => {
    if (type === 'escalation_director') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-600 px-2.5 py-1 text-xs font-bold text-white shadow-sm animate-pulse">
          <span className="material-symbols-outlined text-[14px]">error</span>
          {status}
        </span>
      );
    }
    if (type === 'high_priority') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-1 text-xs font-bold text-orange-700 border border-orange-200">
          {status}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-bold text-blue-700 border border-blue-200">
        {status}
      </span>
    );
  };

  const getDurationStyle = (slaStatus: string) => {
    if (slaStatus === 'breached') return 'text-red-600 font-bold bg-red-50 px-2 py-1 rounded';
    if (slaStatus === 'warning') return 'text-orange-600 font-medium';
    return 'text-emerald-600 font-medium';
  };

  const getDurationIcon = (slaStatus: string) => {
    if (slaStatus === 'breached') return 'timer';
    if (slaStatus === 'warning') return 'warning';
    return 'check_circle';
  };



  // ... (existing helper functions)

  // Chart data for weekly trend
  const chartData = [
    { day: 'Sen', incoming: 40, resolved: 35 },
    { day: 'Sel', incoming: 60, resolved: 55 },
    { day: 'Rab', incoming: 80, resolved: 70 },
    { day: 'Kam', incoming: 45, resolved: 45 },
    { day: 'Jum', incoming: 90, resolved: 50 },
    { day: 'Sab', incoming: 30, resolved: 28 },
    { day: 'Min', incoming: 20, resolved: 20 }
  ];

  const safeTickets = Array.isArray(tickets) ? tickets : [];

  return (
    <ErrorBoundary name="TinjauanEksekutif">
      <div className="w-full min-h-[calc(100vh-120px)] bg-slate-50 dark:bg-slate-900/50">
        {/* Debug Banner - Remove after testing */}
        <div className="bg-purple-100 dark:bg-purple-900/30 border-b border-purple-300 p-3 text-purple-800 dark:text-purple-200 text-sm font-medium">
          🔍 Debug: TinjauanEksekutif loaded - User: {user?.email || 'Unknown'} | Loading: {loading ? 'Yes' : 'No'} | Tickets: {tickets.length}
        </div>

        <div className="flex flex-col gap-6 pb-6 p-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row flex-wrap justify-between gap-4 items-end md:items-center">
            <div className="flex flex-col gap-1">
              <h1 className="text-slate-900 dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">
                Tinjauan Eksekutif
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-base font-normal leading-normal">
                Selamat Pagi, {user?.full_name || 'Bapak Direktur'}. Berikut ringkasan kinerja layanan & eskalasi prioritas.
              </p>
            </div>
            <div className="flex gap-3">
              <div className="hidden sm:flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 h-10 shadow-sm">
                <span className="text-xs font-bold text-slate-500 px-2 uppercase tracking-wider">Periode:</span>
                <select
                  value={periodFilter}
                  onChange={(e) => setPeriodFilter(e.target.value)}
                  className="text-sm font-bold text-slate-900 dark:text-white bg-transparent border-none focus:ring-0 cursor-pointer py-1 pl-0"
                >
                  <option value="week">Minggu Ini</option>
                  <option value="month">Bulan Ini</option>
                  <option value="quarter">Kuartal Ini</option>
                </select>
              </div>
              <button className="flex items-center justify-center rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold shadow-md shadow-blue-200 hover:bg-blue-600 transition-colors gap-2">
                <span className="material-symbols-outlined text-[20px]">download</span>
                <span>Unduh Laporan PDF</span>
              </button>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Filter Cepat</span>
            <div className="flex flex-wrap gap-3 overflow-x-auto pb-2 items-center">
              <button
                onClick={() => setActiveFilter('all')}
                className={`flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full px-4 shadow-sm transition-transform active:scale-95 ${activeFilter === 'all' ? 'bg-slate-900 text-white border border-slate-900' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
              >
                <span className="text-sm font-bold">Semua Tiket</span>
              </button>
              <button
                onClick={() => setActiveFilter('escalation')}
                className={`flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full px-4 shadow-sm transition-colors group ${activeFilter === 'escalation' ? 'bg-red-600 text-white border border-red-600' : 'bg-white text-red-600 border border-red-200 hover:bg-red-50 hover:border-red-300'
                  }`}
              >
                <span className="material-symbols-outlined text-[18px] group-hover:animate-pulse">warning</span>
                <span className="text-sm font-bold">Eskalasi Direktur ({stats.total_escalation})</span>
              </button>
              <button
                onClick={() => setActiveFilter('sla')}
                className={`flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full px-4 shadow-sm transition-colors ${activeFilter === 'sla' ? 'bg-orange-600 text-white border border-orange-600' : 'bg-white text-orange-600 border border-orange-200 hover:bg-orange-50 hover:border-orange-300'
                  }`}
              >
                <span className="material-symbols-outlined text-[18px]">timer_off</span>
                <span className="text-sm font-bold">Melebihi SLA ({stats.sla_breach_percentage}%)</span>
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex flex-col gap-2 rounded-xl p-5 bg-white dark:bg-slate-800 border border-red-100 shadow-[0_2px_10px_-3px_rgba(220,38,38,0.1)] relative overflow-hidden group hover:shadow-md transition-all cursor-pointer ring-1 ring-transparent hover:ring-red-200">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <span className="material-symbols-outlined text-red-600 text-7xl">gavel</span>
              </div>
              <div className="flex items-center gap-2 text-red-600 mb-1">
                <div className="bg-red-50 p-1 rounded-md">
                  <span className="material-symbols-outlined text-[20px] block">priority_high</span>
                </div>
                <p className="text-sm font-bold uppercase tracking-wider">Total Eskalasi</p>
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <p className="text-slate-900 dark:text-white tracking-tight text-4xl font-black leading-tight">{stats.total_escalation}</p>
                <span className="text-sm text-slate-500 font-medium">tiket</span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-red-600 animate-pulse"></span>
                <p className="text-red-700 text-xs font-bold leading-normal">+{stats.new_escalations} Baru</p>
              </div>
            </div>

            <div className="flex flex-col gap-2 rounded-xl p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group hover:border-orange-300 transition-all cursor-pointer hover:shadow-md">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-orange-600 text-7xl">timer_off</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500 mb-1">
                <div className="bg-orange-50 p-1 rounded-md text-orange-600">
                  <span className="material-symbols-outlined text-[20px] block">timer</span>
                </div>
                <p className="text-sm font-bold uppercase tracking-wider text-slate-500">Melebihi SLA</p>
              </div>
              <p className="text-slate-900 dark:text-white tracking-tight text-4xl font-black leading-tight mt-1">{stats.sla_breach_percentage}%</p>
              <div className="mt-2">
                <p className="text-emerald-600 text-xs font-bold leading-normal bg-emerald-50 w-fit px-2 py-1 rounded-md flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">trending_down</span>
                  Turun {stats.sla_improvement}%
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 rounded-xl p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group hover:border-blue-300 transition-all">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-blue-600 text-7xl">speed</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500 mb-1">
                <div className="bg-blue-50 p-1 rounded-md text-blue-600">
                  <span className="material-symbols-outlined text-[20px] block">avg_time</span>
                </div>
                <p className="text-sm font-bold uppercase tracking-wider text-slate-500">Rerata Respon</p>
              </div>
              <p className="text-slate-900 dark:text-white tracking-tight text-4xl font-black leading-tight mt-1">
                {stats.avg_response_hours}<span className="text-xl font-bold text-slate-400 ml-1">Jam</span>
              </p>
              <div className="mt-2">
                <p className="text-emerald-600 text-xs font-bold leading-normal bg-emerald-50 w-fit px-2 py-1 rounded-md flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">bolt</span>
                  {stats.response_improvement} Cepat
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 rounded-xl p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group hover:border-purple-300 transition-all">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-purple-600 text-7xl">sentiment_satisfied</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500 mb-1">
                <div className="bg-purple-50 p-1 rounded-md text-purple-600">
                  <span className="material-symbols-outlined text-[20px] block">thumb_up</span>
                </div>
                <p className="text-sm font-bold uppercase tracking-wider text-slate-500">Indeks Kepuasan</p>
              </div>
              <p className="text-slate-900 dark:text-white tracking-tight text-4xl font-black leading-tight mt-1">
                {stats.satisfaction_index} <span className="text-lg text-slate-400 font-normal">/ 5.0</span>
              </p>
              <div className="mt-2">
                <p className="text-slate-500 text-xs font-bold leading-normal bg-slate-100 w-fit px-2 py-1 rounded-md">Stabil</p>
              </div>
            </div>
          </div>

          {/* Chart and AI Insight */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart */}
            <div className="lg:col-span-2 flex flex-col gap-4 rounded-xl bg-white dark:bg-slate-800 p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <div className="flex flex-col">
                  <h3 className="text-slate-900 dark:text-white text-lg font-bold flex items-center gap-2">
                    Tren Volume Keluhan & Resolusi
                    <span className="material-symbols-outlined text-slate-400 text-sm cursor-help" title="Data based on ticket creation date">info</span>
                  </h3>
                  <p className="text-sm text-slate-500">Perbandingan tiket masuk vs terselesaikan (7 Hari Terakhir)</p>
                </div>
              </div>
              <div className="flex items-end justify-between h-64 gap-2 md:gap-4 pt-8 pb-2 border-b border-l border-slate-100 relative mt-2 pl-2">
                {chartData.map((data, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-3 flex-1 group z-10 cursor-pointer">
                    <div className="flex items-end gap-1 h-full w-full justify-center relative">
                      <div className={`w-3 bg-blue-100 rounded-t-sm group-hover:bg-blue-200 transition-all`} style={{ height: `${data.incoming}%` }}></div>
                      <div className={`w-3 bg-primary rounded-t-sm shadow-sm relative`} style={{ height: `${data.resolved}%` }}></div>
                    </div>
                    <span className={`text-xs font-semibold text-slate-500`}>{data.day}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Insight Card */}
            <div className="lg:col-span-1">
              <div className="h-full flex flex-col rounded-xl overflow-hidden shadow-md relative bg-slate-900 group">
                <div className="absolute inset-0 z-0 bg-gradient-to-t from-blue-900/90 to-transparent"></div>
                <div className="relative z-10 flex flex-col justify-between h-full p-6">
                  <div className="flex items-start justify-between">
                    <div className="bg-white/10 backdrop-blur-md rounded-lg p-2 text-blue-200 border border-white/10 shadow-inner">
                      <span className="material-symbols-outlined text-2xl">auto_awesome</span>
                    </div>
                    <span className="bg-blue-600 text-white text-[10px] uppercase font-bold px-2 py-1 rounded tracking-widest shadow-lg shadow-blue-900/50">AI Insight</span>
                  </div>
                  <div className="mt-8">
                    <h3 className="text-white text-lg font-bold leading-tight mb-2">{aiInsight.title}</h3>
                    <p className="text-blue-100 text-sm font-medium leading-relaxed mb-6 opacity-90">
                      {aiInsight.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Escalation Table Title */}
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <h3 className="text-slate-900 dark:text-white text-xl font-bold leading-tight">Daftar Eskalasi Prioritas</h3>
              </div>
              <Link to="/assignment/tiket-eskalasi" className="text-primary text-sm font-bold hover:underline flex items-center gap-1 group">
                Lihat Semua Tiket
                <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </Link>
            </div>

            {/* Escalation Table */}
            {/* ... */}
            <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : safeTickets.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 px-4">
                  <div className="bg-slate-100 dark:bg-slate-700 rounded-full p-6 mb-4">
                    <span className="material-symbols-outlined text-5xl text-slate-400 dark:text-slate-500">gavel</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Tidak Ada Eskalasi Prioritas</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-center max-w-md">
                    Saat ini tidak ada tiket yang memerlukan tinjauan eksekutif. Tiket akan muncul di sini ketika ada eskalasi ke level direktur.
                  </p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                        <tr>
                          <th className="px-6 py-4 font-bold text-slate-900 dark:text-white w-24">ID Tiket</th>
                          <th className="px-6 py-4 font-bold text-slate-900 dark:text-white">Subjek Masalah</th>
                          <th className="px-6 py-4 font-bold text-slate-900 dark:text-white">Departemen</th>
                          <th className="px-6 py-4 font-bold text-slate-900 dark:text-white">Durasi / SLA</th>
                          <th className="px-6 py-4 font-bold text-slate-900 dark:text-white">Status</th>
                          <th className="px-6 py-4 font-bold text-slate-900 dark:text-white text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {safeTickets.map((ticket) => (
                          <tr key={ticket?.id || Math.random()} className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group ${ticket?.status_type === 'escalation_director' ? 'hover:bg-red-50/30' : ''}`}>
                            <td className="px-6 py-4 font-medium text-slate-500">
                              <span className="group-hover:text-primary transition-colors">#{ticket?.ticket_number}</span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="font-bold text-slate-900 dark:text-white group-hover:text-primary">{ticket?.title}</span>
                                <span className="text-xs text-slate-500">{ticket?.reporter}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded text-xs font-semibold">{ticket?.department}</span>
                            </td>
                            <td className="px-6 py-4">
                              <div className={`flex items-center gap-2 ${getDurationStyle(ticket?.sla_status)} w-fit`}>
                                <span className="material-symbols-outlined text-sm">{getDurationIcon(ticket?.sla_status)}</span>
                                {ticket?.duration}
                              </div>
                            </td>
                            <td className="px-6 py-4">{getStatusBadge(ticket?.status, ticket?.status_type)}</td>
                            <td className="px-6 py-4 text-right">
                              {ticket?.status_type === 'escalation_director' ? (
                                <button
                                  onClick={() => navigate(`/assignment/tinjauan-eksekutif/${ticket?.id}`)}
                                  className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white font-bold hover:bg-primary hover:text-white hover:border-primary px-4 py-2 rounded-lg transition-all shadow-sm text-xs uppercase tracking-wide"
                                >
                                  Tinjau Segera
                                </button>
                              ) : (
                                <button
                                  onClick={() => navigate(`/assignment/tinjauan-eksekutif/${ticket?.id}`)}
                                  className="text-primary font-bold hover:underline text-sm"
                                >
                                  Detail Tiket
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {/* ... */}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
