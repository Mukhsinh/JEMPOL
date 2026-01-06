import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

interface TicketDetail {
  id: string;
  ticket_number: string;
  title: string;
  description: string;
  unit_name: string;
  unit_id: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: string;
  created_at: string;
  sla_deadline: string;
  escalated_at: string;
  escalation_reason: string;
  ai_classification?: {
    category: string;
    urgency: string;
    unit: string;
  };
  ai_confidence?: number;
  ai_recommendations?: string[];
  sentiment_score?: number;
  submitter_name?: string;
  submitter_email?: string;
  submitter_phone?: string;
  submitter_type?: string;
  attachments?: { url: string; name: string }[];
  history?: {
    type: string;
    user: string;
    message: string;
    timestamp: string;
    is_ai?: boolean;
    is_escalation?: boolean;
  }[];
}

export default function TiketEskalasiDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  useAuth(); // Memastikan user terautentikasi
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [responseText, setResponseText] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('');

  useEffect(() => {
    fetchTicketDetail();
  }, [id]);

  const fetchTicketDetail = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/escalations/tickets/${id}`);
      if (response.data.success && response.data.data) {
        const data = response.data.data;
        // Format data dari API
        setTicket({
          id: data.id,
          ticket_number: data.ticket_number,
          title: data.title,
          description: data.description,
          unit_name: data.units?.name || 'Unit tidak diketahui',
          unit_id: data.unit_id,
          priority: data.priority || 'medium',
          status: data.status || 'open',
          created_at: data.created_at,
          sla_deadline: data.sla_deadline,
          escalated_at: data.ticket_escalations?.[0]?.escalated_at || data.created_at,
          escalation_reason: data.ticket_escalations?.[0]?.reason || '',
          ai_classification: data.ai_classification,
          ai_confidence: data.confidence_score ? Number(data.confidence_score) : undefined,
          sentiment_score: data.sentiment_score ? Number(data.sentiment_score) : undefined,
          submitter_name: data.submitter_name,
          submitter_email: data.submitter_email,
          submitter_phone: data.submitter_phone,
          history: data.ticket_responses?.map((r: any) => ({
            type: 'response',
            user: r.users?.full_name || 'Sistem',
            message: r.message,
            timestamp: r.created_at
          })) || []
        });
        setSelectedUnit(data.unit_id);
      } else {
        setTicket(null);
      }
    } catch (error) {
      console.error('Error fetching ticket detail:', error);
      setTicket(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSendResponse = async () => {
    if (!responseText.trim()) return;
    try {
      await api.post(`/escalations/tickets/${id}/respond`, {
        message: responseText,
        response_type: 'comment'
      });
      setResponseText('');
      fetchTicketDetail();
    } catch (error) {
      console.error('Error sending response:', error);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      await api.patch(`/escalations/tickets/${id}/status`, { status: newStatus });
      fetchTicketDetail();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleEscalateToManager = async () => {
    try {
      await api.post(`/escalations/tickets/${id}/escalate`, {
        to_role: 'manager',
        reason: 'Eskalasi ke Manajer untuk tindakan lebih lanjut'
      });
      navigate('/assignment/tiket-eskalasi');
    } catch (error) {
      console.error('Error escalating ticket:', error);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const calculateSLARemaining = () => {
    if (!ticket?.sla_deadline) return { hours: 0, minutes: 0, percentage: 100 };
    const now = new Date();
    const deadline = new Date(ticket.sla_deadline);
    const created = new Date(ticket.created_at);
    const total = deadline.getTime() - created.getTime();
    const remaining = deadline.getTime() - now.getTime();
    const percentage = Math.max(0, Math.min(100, ((total - remaining) / total) * 100));
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    return { hours: Math.max(0, hours), minutes: Math.max(0, minutes), percentage };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">error</span>
        <p className="text-slate-500">Tiket tidak ditemukan</p>
        <Link to="/assignment/tiket-eskalasi" className="mt-4 text-primary hover:underline">
          Kembali ke daftar tiket
        </Link>
      </div>
    );
  }

  const sla = calculateSLARemaining();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-8 flex flex-col gap-6">
        {/* Breadcrumb */}
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Link to="/" className="text-slate-500 font-medium hover:text-primary transition-colors">
            Dasbor Unit
          </Link>
          <span className="material-symbols-outlined text-slate-400 text-[16px]">chevron_right</span>
          <Link to="/assignment/tiket-eskalasi" className="text-slate-500 font-medium hover:text-primary transition-colors">
            Tiket Eskalasi
          </Link>
          <span className="material-symbols-outlined text-slate-400 text-[16px]">chevron_right</span>
          <span className="text-slate-900 dark:text-white font-medium bg-blue-100 dark:bg-blue-900/40 px-2 py-0.5 rounded text-xs text-primary dark:text-blue-300">
            #{ticket.ticket_number}
          </span>
        </div>

        {/* Header */}
        <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div className="flex flex-col gap-3 max-w-3xl">
            <h1 className="text-slate-900 dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-[-0.02em]">
              Tiket #{ticket.ticket_number}: {ticket.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                <span className="material-symbols-outlined text-[18px] text-primary">calendar_today</span>
                <span className="font-medium text-slate-900 dark:text-slate-200">
                  {formatDate(ticket.created_at)} • {formatTime(ticket.created_at)}
                </span>
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                <span className="material-symbols-outlined text-[18px] text-primary">apartment</span>
                <span className="font-medium text-slate-900 dark:text-slate-200">Unit: {ticket.unit_name}</span>
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 items-start">
            <a href="#response-form" className="flex items-center gap-2 h-11 px-5 bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-primary dark:text-blue-400 text-sm font-bold rounded-lg transition-colors shadow-sm">
              <span className="material-symbols-outlined text-[20px]">reply</span>
              <span>Respon</span>
            </a>
            <button 
              onClick={() => handleStatusChange('in_progress')}
              className="flex items-center gap-2 h-11 px-5 bg-primary hover:bg-blue-600 text-white text-sm font-bold rounded-lg shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transition-all transform hover:-translate-y-0.5"
            >
              <span className="material-symbols-outlined text-[20px]">edit_note</span>
              <span>Ubah Status</span>
            </button>
            <button 
              onClick={handleEscalateToManager}
              className="flex items-center gap-2 h-11 px-5 bg-white dark:bg-slate-800 border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-bold rounded-lg transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-[20px]">upgrade</span>
              <span>Eskalasi ke Manajer</span>
            </button>
            <button className="flex items-center gap-2 h-11 px-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-sm font-bold rounded-lg transition-colors shadow-sm">
              <span className="material-symbols-outlined text-[20px]">assignment_return</span>
              <span>Kembalikan ke Petugas</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            {/* AI Analysis Card */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border-l-4 border-primary shadow-sm overflow-hidden ring-1 ring-black/5 dark:ring-white/5">
              <div className="bg-gradient-to-r from-blue-50 to-white dark:from-blue-900/30 dark:to-slate-800 px-6 py-4 border-b border-blue-100 dark:border-slate-700 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-lg text-primary dark:text-blue-300">
                    <span className="material-symbols-outlined text-[24px]">psychology</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Analisis AI & Wawasan</h3>
                    <p className="text-xs text-slate-500 dark:text-blue-200">Didukung oleh Mesin GovAI v2.4</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-white dark:bg-slate-700 rounded-md text-xs font-bold text-primary dark:text-blue-300 border border-blue-100 dark:border-blue-900 shadow-sm">
                  Analisis Selesai
                </span>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col gap-6">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Hasil Klasifikasi</h4>
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200 border border-red-200 dark:border-red-800">
                        {ticket.ai_classification?.category || 'Keluhan'}
                      </span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200 border border-orange-200 dark:border-orange-800">
                        {ticket.ai_classification?.urgency || 'Urgensi Tinggi'}
                      </span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200 border border-blue-200 dark:border-blue-800">
                        {ticket.ai_classification?.unit || 'Unit Sanitasi'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-end mb-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Skor Keyakinan AI</h4>
                      <span className="text-2xl font-black text-primary dark:text-blue-400">{ticket.ai_confidence || 95}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-primary h-3 rounded-full relative shadow-[0_0_10px_rgba(19,127,236,0.5)]" 
                        style={{ width: `${ticket.ai_confidence || 95}%` }}
                      >
                        <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2 italic">
                      Keyakinan tinggi berdasarkan pencocokan pola gambar dan kepadatan kata kunci.
                    </p>
                  </div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-5 border border-blue-100 dark:border-blue-900/30 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-3 text-primary dark:text-blue-300">
                      <span className="material-symbols-outlined text-[20px]">lightbulb</span>
                      <h4 className="text-sm font-bold">Rekomendasi Tindakan</h4>
                    </div>
                    <ul className="space-y-3">
                      {(ticket.ai_recommendations || [
                        'Kirim petugas kebersihan segera (Risiko SLA).',
                        'Panggilan tindak lanjut dalam 2 jam.',
                        'Catat insiden untuk tinjauan mingguan.'
                      ]).map((rec, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-slate-900 dark:text-slate-200">
                          <span className="material-symbols-outlined text-[18px] text-primary mt-0.5">check_circle</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-5 pt-3 border-t border-blue-100 dark:border-blue-800/30">
                    <button className="w-full py-2 bg-white dark:bg-slate-800 text-xs font-bold text-primary dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded border border-blue-200 dark:border-blue-800 transition-colors flex items-center justify-center gap-1">
                      Terapkan Semua Rekomendasi
                      <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Description Card */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm ring-1 ring-black/5 dark:ring-white/5">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">
                Deskripsi Laporan
              </h3>
              <p className="text-slate-500 dark:text-slate-300 leading-relaxed mb-6 text-[15px]">
                {ticket.description}
              </p>
              {ticket.attachments && ticket.attachments.length > 0 && (
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {ticket.attachments.map((att, idx) => (
                    <div key={idx} className="flex-none w-40 h-40 rounded-xl bg-slate-100 dark:bg-slate-700 overflow-hidden relative group cursor-pointer border border-slate-200 dark:border-slate-600 shadow-sm">
                      <div 
                        className="bg-cover bg-center w-full h-full hover:scale-105 transition-transform duration-300"
                        style={{ backgroundImage: `url('${att.url}')` }}
                      ></div>
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="material-symbols-outlined text-white">zoom_in</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* History Card */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm ring-1 ring-black/5 dark:ring-white/5">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-8 border-b border-slate-200 dark:border-slate-700 pb-2">
                Riwayat & Eskalasi
              </h3>
              <div className="relative pl-8 border-l-2 border-slate-200 dark:border-slate-700 space-y-10">
                {ticket.history?.map((item, idx) => (
                  <div key={idx} className="relative group">
                    <div className={`absolute -left-[41px] top-1 h-6 w-6 rounded-full border-4 border-white dark:border-slate-800 flex items-center justify-center z-10 ${
                      item.is_escalation ? 'bg-red-100 dark:bg-red-900' :
                      item.is_ai ? 'bg-blue-100 dark:bg-blue-900' :
                      item.type === 'created' ? 'bg-green-100 dark:bg-green-900' :
                      'bg-slate-200 dark:bg-slate-600'
                    }`}>
                      {item.is_escalation && <span className="material-symbols-outlined text-[12px] text-red-600 dark:text-red-300">upgrade</span>}
                      {item.is_ai && <span className="material-symbols-outlined text-[12px] text-primary dark:text-blue-300">smart_toy</span>}
                      {item.type === 'created' && <span className="material-symbols-outlined text-[12px] text-green-600 dark:text-green-300">add</span>}
                    </div>
                    <div className={`flex flex-col gap-2 ${item.is_escalation ? 'p-3 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30' : ''}`}>
                      <div className="flex justify-between items-center">
                        <span className={`text-sm font-bold ${
                          item.is_escalation ? 'text-red-800 dark:text-red-300' :
                          item.is_ai ? 'text-primary dark:text-blue-400' :
                          'text-slate-900 dark:text-white'
                        }`}>
                          {item.user}
                        </span>
                        <span className="text-xs text-slate-500">{formatTime(item.timestamp)}</span>
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-300">{item.message}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Response Form */}
              <div className="mt-10 pt-6 border-t border-slate-200 dark:border-slate-700 scroll-mt-24" id="response-form">
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                      Tindakan Kepala Unit
                    </h4>
                    <button className="text-xs text-primary font-medium hover:underline flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">
                      <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                      Hasilkan Respon AI
                    </button>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-inner focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                    <textarea
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      className="w-full bg-transparent border-none focus:ring-0 text-sm p-0 min-h-[120px] text-slate-900 dark:text-white placeholder-slate-400"
                      placeholder="Ketik respon kepada petugas, catatan eskalasi, atau pembaruan status internal..."
                    ></textarea>
                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                      <div className="flex gap-2">
                        <button className="p-1.5 text-slate-400 hover:text-primary hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-colors" title="Lampirkan File">
                          <span className="material-symbols-outlined text-[20px]">attach_file</span>
                        </button>
                        <button className="p-1.5 text-slate-400 hover:text-primary hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-colors" title="Templat">
                          <span className="material-symbols-outlined text-[20px]">text_snippet</span>
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <button className="bg-white dark:bg-slate-800 hover:bg-slate-50 border border-slate-200 dark:border-slate-700 text-slate-400 text-sm font-bold px-4 py-2 rounded-lg transition-colors">
                          Simpan Draf
                        </button>
                        <button 
                          onClick={handleSendResponse}
                          className="bg-primary hover:bg-blue-600 text-white text-sm font-bold px-5 py-2 rounded-lg transition-colors flex items-center gap-2 shadow-md shadow-blue-500/20"
                        >
                          <span>Kirim Respon</span>
                          <span className="material-symbols-outlined text-[16px]">send</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Status Card */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm ring-1 ring-black/5 dark:ring-white/5 flex flex-col gap-5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-slate-700 pb-2">
                Status Tiket
              </h3>
              <div className="grid grid-cols-1 gap-y-5">
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-slate-500">Status Saat Ini</span>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg border border-yellow-100 dark:border-yellow-900/30">
                    <div className="flex items-center gap-3">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
                      </span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white">Sedang Diproses</span>
                    </div>
                    <button className="text-xs font-bold text-primary hover:underline">Ubah</button>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-slate-500">Prioritas & SLA</span>
                  <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/30">
                    <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-[20px]">priority_high</span>
                    <div>
                      <p className="text-sm font-bold text-red-700 dark:text-red-400">Tinggi - Kritis</p>
                      <p className="text-[10px] text-red-600/70 dark:text-red-400/70">Wajib respons &lt; 2 jam</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-slate-500">Unit Ditugaskan</span>
                  <select 
                    value={selectedUnit}
                    onChange={(e) => setSelectedUnit(e.target.value)}
                    className="w-full text-sm border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 rounded-lg py-2.5 pl-3 pr-8 focus:border-primary focus:ring-1 focus:ring-primary text-slate-900 dark:text-white cursor-pointer font-medium shadow-sm"
                  >
                    <option value="1">Ruang B - Sanitasi</option>
                    <option value="2">Pemeliharaan Umum</option>
                    <option value="3">Keamanan</option>
                    <option value="4">Layanan Medis</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SLA Timer Card */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm ring-1 ring-black/5 dark:ring-white/5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-slate-400">timer</span>
                  Timer SLA
                </h3>
                <span className={`text-xs font-bold px-2 py-1 rounded border ${
                  sla.percentage > 75 
                    ? 'text-red-600 bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800' 
                    : sla.percentage > 50 
                    ? 'text-orange-600 bg-orange-100 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800'
                    : 'text-green-600 bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800'
                }`}>
                  {sla.percentage > 75 ? 'Hampir Lewat' : sla.percentage > 50 ? 'Perhatian' : 'Aman'}
                </span>
              </div>
              <div className="flex justify-between items-end mb-2">
                <span className="text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">
                  {String(sla.hours).padStart(2, '0')}<span className="text-slate-300 dark:text-slate-600">:</span>{String(sla.minutes).padStart(2, '0')}
                </span>
                <span className="text-xs text-slate-500 font-medium mb-1">tersisa dari 4j</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                <div 
                  className={`h-3 rounded-full ${
                    sla.percentage > 75 ? 'bg-gradient-to-r from-orange-500 to-red-500' : 
                    sla.percentage > 50 ? 'bg-orange-500' : 'bg-green-500'
                  }`} 
                  style={{ width: `${sla.percentage}%` }}
                ></div>
              </div>
              <p className="text-xs text-slate-500 mt-3 flex justify-between">
                <span>Target: {formatDate(ticket.sla_deadline)}, {formatTime(ticket.sla_deadline)}</span>
                <span className={`font-bold ${sla.percentage > 75 ? 'text-red-500' : 'text-slate-500'}`}>
                  {sla.percentage > 75 ? 'Risiko Tinggi' : 'Normal'}
                </span>
              </p>
            </div>

            {/* Sentiment Card */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm ring-1 ring-black/5 dark:ring-white/5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Sentimen Pelanggan</h3>
                <span className="material-symbols-outlined text-slate-400">sentiment_dissatisfied</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 flex-none">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
                    <path
                      className="text-slate-200 dark:text-slate-700"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="text-red-500"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeDasharray={`${Math.abs((ticket.sentiment_score || -0.8) * 100)}, 100`}
                      strokeWidth="4"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-red-500 font-bold text-sm">
                    {ticket.sentiment_score || -0.8}
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-red-600 dark:text-red-400">Negatif</span>
                  <span className="text-xs text-slate-500 leading-tight">
                    Bahasa pengguna menunjukkan frustrasi dan urgensi.
                  </span>
                </div>
              </div>
            </div>

            {/* Reporter Info Card */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm ring-1 ring-black/5 dark:ring-white/5">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Info Pelapor</h3>
              <div className="flex items-center gap-4 mb-5">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center text-slate-500 dark:text-white font-bold text-lg shadow-sm border border-white dark:border-slate-500">
                  {ticket.submitter_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'JD'}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{ticket.submitter_name || 'John Doe'}</p>
                  <p className="text-xs text-slate-500">{ticket.submitter_type || 'Keluarga Pasien • VIP'}</p>
                </div>
              </div>
              <div className="space-y-4">
                {ticket.submitter_email && (
                  <a href={`mailto:${ticket.submitter_email}`} className="flex items-center gap-3 text-sm text-slate-500 hover:text-primary transition-colors group">
                    <div className="bg-slate-50 dark:bg-slate-700 p-1.5 rounded-md group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
                      <span className="material-symbols-outlined text-[18px]">mail</span>
                    </div>
                    {ticket.submitter_email}
                  </a>
                )}
                {ticket.submitter_phone && (
                  <a href={`tel:${ticket.submitter_phone}`} className="flex items-center gap-3 text-sm text-slate-500 hover:text-primary transition-colors group">
                    <div className="bg-slate-50 dark:bg-slate-700 p-1.5 rounded-md group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
                      <span className="material-symbols-outlined text-[18px]">call</span>
                    </div>
                    {ticket.submitter_phone}
                  </a>
                )}
                <div className="flex items-center gap-3 text-sm text-slate-500 border-t border-slate-200 dark:border-slate-700 pt-3 mt-3">
                  <span className="material-symbols-outlined text-[18px]">history</span>
                  <span>2 tiket sebelumnya</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
