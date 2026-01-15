import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import assignmentService, { EscalatedTicket, ExecutiveOverview } from '../../services/assignmentService';

export default function TinjauanEksekutif() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState<ExecutiveOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await assignmentService.getExecutiveOverview();
      setData(result);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filteredTickets = (data?.tickets || []).filter(ticket => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'escalation') return ticket.to_role === 'director';
    if (activeFilter === 'sla') return ticket.sla_status === 'breached';
    return true;
  });

  const getSLAStyle = (status?: string) => {
    if (status === 'breached') return 'text-red-600 font-bold bg-red-50 px-2 py-1 rounded';
    if (status === 'warning') return 'text-orange-600 font-medium';
    return 'text-emerald-600 font-medium';
  };

  const getStatusBadge = (ticket: EscalatedTicket) => {
    if (ticket.to_role === 'director') {
      return <span className="inline-flex items-center gap-1 rounded-full bg-red-600 px-2.5 py-1 text-xs font-bold text-white animate-pulse">
        <span className="material-symbols-outlined text-[14px]">error</span>Eskalasi Direktur
      </span>;
    }
    return <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-1 text-xs font-bold text-orange-700 border border-orange-200">Prioritas Tinggi</span>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          <p className="text-sm text-slate-500">Memuat data tinjauan eksekutif...</p>
        </div>
      </div>
    );
  }

  const stats = data?.stats || { total_escalation: 0, sla_breach_percentage: 0, avg_response_hours: 0, satisfaction_index: 0, new_escalations: 0 };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row flex-wrap justify-between gap-4 items-end md:items-center">
        <div className="flex flex-col gap-1">
          <h1 className="text-slate-900 dark:text-white text-3xl font-bold">Tinjauan Eksekutif</h1>
          <p className="text-slate-500 dark:text-slate-400 text-base">
            Selamat datang, {user?.full_name || 'Bapak/Ibu Direktur'}. Berikut ringkasan kinerja layanan & eskalasi prioritas.
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchData} className="flex items-center gap-2 h-10 px-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700">
            <span className="material-symbols-outlined text-[20px]">refresh</span>
            Refresh
          </button>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-3">
        <button onClick={() => setActiveFilter('all')}
          className={`flex h-9 items-center gap-2 rounded-full px-4 shadow-sm transition-colors ${activeFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
          <span className="text-sm font-bold">Semua Tiket</span>
        </button>
        <button onClick={() => setActiveFilter('escalation')}
          className={`flex h-9 items-center gap-2 rounded-full px-4 shadow-sm transition-colors ${activeFilter === 'escalation' ? 'bg-red-600 text-white' : 'bg-white text-red-600 border border-red-200 hover:bg-red-50'}`}>
          <span className="material-symbols-outlined text-[18px]">warning</span>
          <span className="text-sm font-bold">Eskalasi Direktur ({stats.total_escalation})</span>
        </button>
        <button onClick={() => setActiveFilter('sla')}
          className={`flex h-9 items-center gap-2 rounded-full px-4 shadow-sm transition-colors ${activeFilter === 'sla' ? 'bg-orange-600 text-white' : 'bg-white text-orange-600 border border-orange-200 hover:bg-orange-50'}`}>
          <span className="material-symbols-outlined text-[18px]">timer_off</span>
          <span className="text-sm font-bold">Melebihi SLA ({stats.sla_breach_percentage}%)</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-red-100 shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-2 text-red-600 mb-1">
            <div className="bg-red-50 p-1 rounded-md"><span className="material-symbols-outlined text-[20px]">priority_high</span></div>
            <p className="text-sm font-bold uppercase tracking-wider">Total Eskalasi</p>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-slate-900 dark:text-white text-4xl font-bold">{stats.total_escalation}</p>
            <span className="text-sm text-slate-500">tiket</span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-red-600 animate-pulse"></span>
            <p className="text-red-700 text-xs font-bold">+{stats.new_escalations} Baru</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 mb-1">
            <div className="bg-orange-50 p-1 rounded-md text-orange-600"><span className="material-symbols-outlined text-[20px]">timer</span></div>
            <p className="text-sm font-bold uppercase tracking-wider">Melebihi SLA</p>
          </div>
          <p className="text-slate-900 dark:text-white text-4xl font-bold mt-1">{stats.sla_breach_percentage}%</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 mb-1">
            <div className="bg-blue-50 p-1 rounded-md text-blue-600"><span className="material-symbols-outlined text-[20px]">avg_time</span></div>
            <p className="text-sm font-bold uppercase tracking-wider">Rerata Respon</p>
          </div>
          <p className="text-slate-900 dark:text-white text-4xl font-bold mt-1">{stats.avg_response_hours}<span className="text-xl font-bold text-slate-400 ml-1">Jam</span></p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 mb-1">
            <div className="bg-purple-50 p-1 rounded-md text-purple-600"><span className="material-symbols-outlined text-[20px]">thumb_up</span></div>
            <p className="text-sm font-bold uppercase tracking-wider">Indeks Kepuasan</p>
          </div>
          <p className="text-slate-900 dark:text-white text-4xl font-bold mt-1">{stats.satisfaction_index}<span className="text-lg text-slate-400 font-normal"> / 5.0</span></p>
        </div>
      </div>

      {/* AI Insight Card */}
      {data?.ai_insight && (
        <div className="bg-gradient-to-r from-slate-900 to-blue-900 rounded-xl p-6 text-white">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-2 text-blue-200 border border-white/10">
                <span className="material-symbols-outlined text-2xl">auto_awesome</span>
              </div>
              <div>
                <span className="bg-blue-600 text-white text-[10px] uppercase font-bold px-2 py-1 rounded tracking-widest">AI Insight</span>
                <h3 className="text-white text-lg font-bold mt-2">{data.ai_insight.title}</h3>
              </div>
            </div>
          </div>
          <p className="text-blue-100 text-sm font-medium leading-relaxed mt-4 opacity-90">{data.ai_insight.description}</p>
        </div>
      )}

      {/* Escalation Table */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h3 className="text-slate-900 dark:text-white text-xl font-bold">Daftar Eskalasi Prioritas</h3>
          <Link to="/assignment/tiket-eskalasi" className="text-primary text-sm font-bold hover:underline flex items-center gap-1">
            Lihat Semua Tiket
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          {filteredTickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4">
              <div className="bg-slate-100 dark:bg-slate-700 rounded-full p-6 mb-4">
                <span className="material-symbols-outlined text-5xl text-slate-400 dark:text-slate-500">gavel</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Tidak Ada Eskalasi Prioritas</h3>
              <p className="text-slate-500 dark:text-slate-400 text-center max-w-md">
                Saat ini tidak ada tiket yang memerlukan tinjauan eksekutif.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-4 font-bold text-slate-900 dark:text-white">ID Tiket</th>
                    <th className="px-6 py-4 font-bold text-slate-900 dark:text-white">Subjek Masalah</th>
                    <th className="px-6 py-4 font-bold text-slate-900 dark:text-white">Unit</th>
                    <th className="px-6 py-4 font-bold text-slate-900 dark:text-white">SLA</th>
                    <th className="px-6 py-4 font-bold text-slate-900 dark:text-white">Status</th>
                    <th className="px-6 py-4 font-bold text-slate-900 dark:text-white text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {filteredTickets.map((ticket) => (
                    <tr key={ticket.id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${ticket.to_role === 'director' ? 'hover:bg-red-50/30' : ''}`}>
                      <td className="px-6 py-4 font-medium text-slate-500">
                        <span className="hover:text-primary transition-colors">#{ticket.ticket_number}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 dark:text-white">{ticket.title}</span>
                          {ticket.submitter_name && <span className="text-xs text-slate-500">{ticket.submitter_name}</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded text-xs font-semibold">{ticket.unit_name}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={getSLAStyle(ticket.sla_status)}>{ticket.sla_remaining || '-'}</span>
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(ticket)}</td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => navigate(`/assignment/tinjauan-eksekutif/${ticket.id}`)}
                          className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${
                            ticket.to_role === 'director' 
                              ? 'bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white hover:bg-primary hover:text-white hover:border-primary' 
                              : 'text-primary hover:underline'
                          }`}>
                          {ticket.to_role === 'director' ? 'Tinjau Segera' : 'Detail Tiket'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
