import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

interface TicketDetail {
  id: string;
  ticket_number: string;
  title: string;
  description: string;
  unit_name: string;
  priority: string;
  status: string;
  created_at: string;
  sla_deadline: string;
  ai_classification?: { category: string; urgency: string; unit: string };
  ai_confidence?: number;
  ai_recommendations?: string[];
  sentiment_score?: number;
  submitter_name?: string;
  submitter_email?: string;
  submitter_phone?: string;
  attachments?: { url: string; name: string }[];
  history?: { type: string; user: string; message: string; timestamp: string; is_ai?: boolean }[];
  unit_performance?: { open_tickets: number; avg_response: string; sla_compliance: string };
}

export default function TinjauanEksekutifDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [responseText, setResponseText] = useState('');

  useEffect(() => {
    fetchTicketDetail();
  }, [id]);

  const fetchTicketDetail = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/escalations/executive-tickets/${id}`);
      if (response.data.success) setTicket(response.data.data);
    } catch (error) {
      // Mock data
      setTicket({
        id: id || '1',
        ticket_number: 'TKT-2094',
        title: 'Kelangkaan Obat Insulin',
        description: 'Stok obat insulin habis di unit farmasi. Pasien diabetes memerlukan obat segera.',
        unit_name: 'Farmasi',
        priority: 'critical',
        status: 'escalated',
        created_at: '2023-10-22T10:00:00Z',
        sla_deadline: '2023-10-24T10:00:00Z',
        ai_classification: { category: 'Keluhan Kritis', urgency: 'Sangat Tinggi', unit: 'Farmasi' },
        ai_confidence: 98,
        ai_recommendations: ['Koordinasi dengan supplier obat segera', 'Cari alternatif obat dari RS lain', 'Informasikan pasien tentang status'],
        sentiment_score: -0.9,
        submitter_name: 'Dr. Budi Santoso',
        submitter_email: 'budi.santoso@rs.com',
        submitter_phone: '+62 812 3456 7890',
        history: [
          { type: 'escalation', user: 'Manajer Farmasi', message: 'Dieskalasi ke Direktur karena stok kritis', timestamp: '2023-10-23T14:00:00Z' },
          { type: 'response', user: 'Staff Farmasi', message: 'Sudah menghubungi supplier, estimasi 2 hari', timestamp: '2023-10-23T10:00:00Z' },
          { type: 'created', user: 'Dr. Budi Santoso', message: 'Melaporkan kelangkaan obat insulin', timestamp: '2023-10-22T10:00:00Z' }
        ],
        unit_performance: { open_tickets: 8, avg_response: '2j', sla_compliance: '85%' }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendResponse = async () => {
    if (!responseText.trim()) return;
    try {
      await api.post(`/escalations/executive-tickets/${id}/respond`, { message: responseText });
      setResponseText('');
      fetchTicketDetail();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const formatTime = (d: string) => new Date(d).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  const formatDate = (d: string) => new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  if (!ticket) return <div className="flex flex-col items-center justify-center min-h-screen"><p className="text-slate-500">Tiket tidak ditemukan</p></div>;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900">
      <div className="max-w-[1280px] mx-auto p-4 md:p-8 flex flex-col gap-6">
        {/* Breadcrumb */}
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Link to="/" className="text-slate-500 font-medium hover:text-primary">Beranda</Link>
          <span className="material-symbols-outlined text-slate-400 text-[16px]">chevron_right</span>
          <Link to="/assignment/tinjauan-eksekutif" className="text-slate-500 font-medium hover:text-primary">Tinjauan Eksekutif</Link>
          <span className="material-symbols-outlined text-slate-400 text-[16px]">chevron_right</span>
          <span className="text-slate-900 dark:text-white font-medium">#{ticket.ticket_number}</span>
        </div>

        {/* Header */}
        <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-6 border-b border-slate-200 dark:border-slate-700 pb-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-slate-900 dark:text-white text-3xl font-black leading-tight">
              Tiket #{ticket.ticket_number}: {ticket.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[18px]">calendar_today</span> {formatDate(ticket.created_at)}</span>
              <span>•</span>
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[18px]">apartment</span> {ticket.unit_name}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="flex items-center gap-2 h-10 px-4 bg-primary hover:bg-blue-600 text-white text-sm font-bold rounded-lg shadow-md transition-colors">
              <span className="material-symbols-outlined text-[20px]">reply</span>Respon
            </button>
            <button className="flex items-center gap-2 h-10 px-4 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-lg transition-colors">
              <span className="material-symbols-outlined text-[20px]">check_circle</span>Setujui & Tutup
            </button>
            <button className="flex items-center gap-2 h-10 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-sm font-bold rounded-lg transition-colors">
              <span className="material-symbols-outlined text-[20px]">forward</span>Teruskan
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* AI Analysis */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border-l-4 border-primary shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-white dark:from-blue-900/30 dark:to-slate-800 px-6 py-4 border-b border-blue-100 dark:border-slate-700 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-lg text-primary">
                    <span className="material-symbols-outlined text-[24px]">psychology</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Analisis AI</h3>
                    <p className="text-xs text-slate-500">GovAI Engine v2.4</p>
                  </div>
                </div>
                <span className="px-2 py-1 bg-white dark:bg-slate-700 rounded text-xs font-semibold text-primary border border-blue-100">Selesai</span>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-4">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Klasifikasi</h4>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">{ticket.ai_classification?.category}</span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">{ticket.ai_classification?.urgency}</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-end mb-1">
                      <h4 className="text-xs font-bold uppercase text-slate-500">Keyakinan AI</h4>
                      <span className="text-2xl font-black text-primary">{ticket.ai_confidence}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                      <div className="bg-primary h-3 rounded-full" style={{ width: `${ticket.ai_confidence}%` }}></div>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-4 border border-blue-100">
                  <h4 className="text-sm font-bold text-primary mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">lightbulb</span>Rekomendasi
                  </h4>
                  <ul className="space-y-2">
                    {ticket.ai_recommendations?.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-slate-800">
                        <span className="material-symbols-outlined text-[16px] text-primary mt-0.5">check_small</span>{rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Deskripsi</h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{ticket.description}</p>
            </div>

            {/* History */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Riwayat</h3>
              <div className="relative pl-8 border-l border-slate-200 space-y-6">
                {ticket.history?.map((item, idx) => (
                  <div key={idx} className="relative">
                    <div className={`absolute -left-[39px] top-1 h-5 w-5 rounded-full border-4 border-white ${item.is_ai ? 'bg-blue-100' : item.type === 'escalation' ? 'bg-red-100' : 'bg-slate-200'}`}></div>
                    <div className="flex justify-between items-center">
                      <span className={`text-sm font-bold ${item.type === 'escalation' ? 'text-red-600' : 'text-slate-900'}`}>{item.user}</span>
                      <span className="text-xs text-slate-500">{formatTime(item.timestamp)}</span>
                    </div>
                    <p className="text-sm text-slate-600 mt-1">{item.message}</p>
                  </div>
                ))}
              </div>

              {/* Response Form */}
              <div className="mt-8 pt-6 border-t border-slate-200">
                <h4 className="text-sm font-bold text-slate-900 mb-3">Keputusan Direktur</h4>
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    className="w-full bg-transparent border-none focus:ring-0 text-sm min-h-[100px] text-slate-800 placeholder-slate-400"
                    placeholder="Ketik keputusan atau arahan..."
                  ></textarea>
                  <div className="flex justify-end mt-2 pt-2 border-t border-slate-200">
                    <button onClick={handleSendResponse} className="bg-primary hover:bg-blue-600 text-white text-sm font-bold px-4 py-2 rounded-lg flex items-center gap-2">
                      Kirim<span className="material-symbols-outlined text-[16px]">send</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 p-5 shadow-sm">
              <h3 className="text-sm font-bold uppercase text-slate-500 mb-4">Status Tiket</h3>
              <div className="space-y-4">
                <div>
                  <span className="text-xs text-slate-500">Status</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse"></span>
                    <span className="text-sm font-bold text-red-600">Eskalasi Direktur</span>
                  </div>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Prioritas</span>
                  <div className="flex items-center gap-1 mt-1 text-red-600 bg-red-50 px-2 py-1 rounded-md w-fit">
                    <span className="material-symbols-outlined text-[16px]">priority_high</span>
                    <span className="text-sm font-bold">Kritis</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-4">Info Pelapor</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-sm">
                  {ticket.submitter_name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{ticket.submitter_name}</p>
                  <p className="text-xs text-slate-500">Dokter</p>
                </div>
              </div>
              <div className="space-y-2">
                {ticket.submitter_email && (
                  <a href={`mailto:${ticket.submitter_email}`} className="flex items-center gap-2 text-sm text-slate-500 hover:text-primary">
                    <span className="material-symbols-outlined text-[18px]">mail</span>{ticket.submitter_email}
                  </a>
                )}
                {ticket.submitter_phone && (
                  <a href={`tel:${ticket.submitter_phone}`} className="flex items-center gap-2 text-sm text-slate-500 hover:text-primary">
                    <span className="material-symbols-outlined text-[18px]">call</span>{ticket.submitter_phone}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
