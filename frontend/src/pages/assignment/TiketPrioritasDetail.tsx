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

export default function TiketPrioritasDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
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
      const response = await api.get(`/escalations/priority-tickets/${id}`);
      if (response.data.success) {
        setTicket(response.data.data);
        setSelectedUnit(response.data.data.unit_id);
      }
    } catch (error) {
      console.error('Error fetching ticket detail:', error);
      setTicket({
        id: id || '1',
        ticket_number: '4920',
        title: 'Masalah Sanitasi di Ruang B',
        description: 'Pasien melaporkan tempat sampah meluap di lorong utama Ruang B dekat stasiun perawat. Baunya mulai menyengat dan membuat pengunjung serta pasien di ruang tunggu tidak nyaman.',
        unit_name: 'Manajemen Fasilitas',
        unit_id: '1',
        priority: 'high',
        status: 'in_progress',
        created_at: '2023-10-24T10:00:00Z',
        sla_deadline: '2023-10-24T14:00:00Z',
        ai_classification: { category: 'Pengaduan', urgency: 'Urgensi Tinggi', unit: 'Unit Sanitasi' },
        ai_confidence: 95,
        ai_recommendations: ['Kirim petugas kebersihan segera (Risiko SLA).', 'Telepon tindak lanjut dalam 2 jam.', 'Catat insiden untuk tinjauan mingguan.'],
        sentiment_score: -0.8,
        submitter_name: 'John Doe',
        submitter_email: 'john.doe@example.com',
        submitter_phone: '+1 (555) 123-4567',
        attachments: [{ url: 'https://via.placeholder.com/300', name: 'foto_1.jpg' }],
        history: [
          { type: 'response', user: 'Agen Sarah Jenkins', message: 'Memberitahu supervisor kebersihan melalui radio internal. Estimasi penyelesaian dalam 30 menit.', timestamp: '2023-10-24T10:15:00Z' },
          { type: 'ai_classification', user: 'Sistem AI', message: 'Diklasifikasikan otomatis sebagai Sanitasi / Kebersihan dengan Prioritas Tinggi.', timestamp: '2023-10-24T10:01:00Z', is_ai: true },
          { type: 'created', user: 'Sistem', message: 'Dikirim via Aplikasi Seluler oleh Pengguna Tamu.', timestamp: '2023-10-24T10:00:00Z' }
        ],
        unit_performance: { open_tickets: 12, avg_response: '15m', sla_compliance: '94%' }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendResponse = async () => {
    if (!responseText.trim()) return;
    try {
      await api.post(`/escalations/priority-tickets/${id}/respond`, { message: responseText });
      setResponseText('');
      fetchTicketDetail();
    } catch (error) {
      console.error('Error sending response:', error);
    }
  };

  const handleCloseTicket = async () => {
    try {
      await api.patch(`/escalations/priority-tickets/${id}/status`, { status: 'closed' });
      navigate('/assignment/tiket-prioritas');
    } catch (error) {
      console.error('Error closing ticket:', error);
    }
  };

  const formatTime = (dateString: string) => new Date(dateString).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

  const calculateSLARemaining = () => {
    if (!ticket?.sla_deadline) return { hours: 0, minutes: 0, percentage: 100 };
    const now = new Date();
    const deadline = new Date(ticket.sla_deadline);
    const created = new Date(ticket.created_at);
    const total = deadline.getTime() - created.getTime();
    const remaining = deadline.getTime() - now.getTime();
    const percentage = Math.max(0, Math.min(100, ((total - remaining) / total) * 100));
    return { hours: Math.max(0, Math.floor(remaining / (1000 * 60 * 60))), minutes: Math.max(0, Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))), percentage };
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  if (!ticket) return <div className="flex flex-col items-center justify-center min-h-screen"><p className="text-slate-500">Tiket tidak ditemukan</p></div>;

  const sla = calculateSLARemaining();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 pb-20 flex flex-col gap-6">
        {/* Breadcrumb */}
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Link to="/" className="text-slate-500 font-medium hover:text-primary transition-colors">Beranda</Link>
          <span className="material-symbols-outlined text-slate-400 text-[16px]">chevron_right</span>
          <Link to="/assignment/tiket-prioritas" className="text-slate-500 font-medium hover:text-primary transition-colors">Tiket Prioritas</Link>
          <span className="material-symbols-outlined text-slate-400 text-[16px]">chevron_right</span>
          <span className="text-slate-900 dark:text-white font-medium">Tiket #{ticket.ticket_number}</span>
        </div>

        {/* Header */}
        <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-6 border-b border-slate-200 dark:border-slate-700 pb-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-slate-900 dark:text-white text-3xl font-black leading-tight tracking-[-0.033em]">
              Tiket #{ticket.ticket_number}: {ticket.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[18px]">calendar_today</span> {formatDate(ticket.created_at)} • {formatTime(ticket.created_at)} WIB</span>
              <span>•</span>
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[18px]">apartment</span> Unit: {ticket.unit_name}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="flex items-center gap-2 h-10 px-4 bg-primary hover:bg-blue-600 text-white text-sm font-bold rounded-lg shadow-md shadow-blue-500/20 transition-colors">
              <span className="material-symbols-outlined text-[20px]">reply</span><span>Respon</span>
            </button>
            <button className="flex items-center gap-2 h-10 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-800 dark:text-white text-sm font-bold rounded-lg transition-colors">
              <span className="material-symbols-outlined text-[20px]">edit_note</span><span>Ubah Status</span>
            </button>
            <button className="flex items-center gap-2 h-10 px-4 bg-white dark:bg-slate-800 border border-red-200 dark:border-red-900/50 hover:bg-red-50 text-red-600 dark:text-red-400 text-sm font-bold rounded-lg transition-colors">
              <span className="material-symbols-outlined text-[20px]">warning</span><span>Eskalasi Direktur</span>
            </button>
            <button onClick={handleCloseTicket} className="flex items-center gap-2 h-10 px-4 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-lg shadow-sm transition-colors ml-2">
              <span className="material-symbols-outlined text-[20px]">check_circle</span><span>Tutup Tiket</span>
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
                  <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-lg text-primary dark:text-blue-300">
                    <span className="material-symbols-outlined text-[24px]">psychology</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Analisis & Wawasan AI</h3>
                    <p className="text-xs text-slate-500 dark:text-blue-200">Didukung oleh GovAI Engine v2.4</p>
                  </div>
                </div>
                <span className="px-2 py-1 bg-white dark:bg-slate-700 rounded text-xs font-semibold text-primary dark:text-blue-300 border border-blue-100 dark:border-blue-900">Analisis Selesai</span>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-5">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Hasil Klasifikasi</h4>
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border border-red-200 dark:border-red-800">{ticket.ai_classification?.category}</span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 border border-orange-200 dark:border-orange-800">{ticket.ai_classification?.urgency}</span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border border-blue-200 dark:border-blue-800">{ticket.ai_classification?.unit}</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-end mb-1">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Skor Keyakinan AI</h4>
                      <span className="text-2xl font-black text-primary dark:text-blue-400">{ticket.ai_confidence}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                      <div className="bg-primary h-3 rounded-full relative shadow-[0_0_10px_rgba(15,98,254,0.5)]" style={{ width: `${ticket.ai_confidence}%` }}></div>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-4 border border-blue-100 dark:border-blue-900/30">
                  <div className="flex items-center gap-2 mb-2 text-primary dark:text-blue-300">
                    <span className="material-symbols-outlined text-[18px]">lightbulb</span>
                    <h4 className="text-sm font-bold">Rekomendasi Tindakan</h4>
                  </div>
                  <ul className="space-y-2.5">
                    {ticket.ai_recommendations?.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-slate-800 dark:text-slate-200">
                        <span className="material-symbols-outlined text-[16px] text-primary mt-0.5">check_small</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Deskripsi Masalah</h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6">{ticket.description}</p>
              {ticket.attachments && ticket.attachments.length > 0 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {ticket.attachments.map((att, idx) => (
                    <div key={idx} className="flex-none w-32 h-32 rounded-lg bg-slate-100 dark:bg-slate-700 overflow-hidden relative group cursor-pointer border border-slate-200 dark:border-slate-600">
                      <div className="bg-cover bg-center w-full h-full hover:scale-105 transition-transform duration-300" style={{ backgroundImage: `url('${att.url}')` }}></div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* History */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Riwayat Aktivitas</h3>
              <div className="relative pl-8 border-l border-slate-200 dark:border-slate-700 space-y-8">
                {ticket.history?.map((item, idx) => (
                  <div key={idx} className="relative group">
                    <div className={`absolute -left-[39px] top-1 h-5 w-5 rounded-full border-4 border-white dark:border-slate-800 flex items-center justify-center ${
                      item.is_ai ? 'bg-blue-100 dark:bg-blue-900' : item.type === 'created' ? 'bg-green-100 dark:bg-green-900' : 'bg-slate-200 dark:bg-slate-600'
                    }`}>
                      {item.is_ai && <span className="material-symbols-outlined text-[10px] text-primary dark:text-blue-300">smart_toy</span>}
                      {item.type === 'created' && <span className="material-symbols-outlined text-[10px] text-green-600 dark:text-green-300">add</span>}
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between items-center">
                        <span className={`text-sm font-bold ${item.is_ai ? 'text-primary dark:text-blue-400' : 'text-slate-900 dark:text-white'}`}>{item.user}</span>
                        <span className="text-xs text-slate-500">{formatTime(item.timestamp)} WIB</span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-300">{item.message}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Response Form */}
              <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Tambahkan Catatan Internal atau Respon Manajer</h4>
                <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3 border border-slate-200 dark:border-slate-700 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                  <textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    className="w-full bg-transparent border-none focus:ring-0 text-sm p-2 min-h-[100px] text-slate-800 dark:text-white placeholder-slate-400"
                    placeholder="Ketik respon atau arahan Anda di sini..."
                  ></textarea>
                  <div className="flex justify-end mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                    <button onClick={handleSendResponse} className="bg-primary hover:bg-blue-600 text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-2 shadow-sm">
                      <span>Kirim Respon</span>
                      <span className="material-symbols-outlined text-[16px]">send</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Status Card */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm flex flex-col gap-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-1">Detail Tiket</h3>
              <div className="grid grid-cols-2 gap-y-4">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-slate-500">Status</span>
                  <div className="inline-flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-yellow-500 animate-pulse"></span>
                    <span className="text-sm font-medium text-slate-900 dark:text-white">Dalam Proses</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-slate-500">Prioritas</span>
                  <div className="inline-flex items-center gap-1 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-2 py-1 rounded-md w-fit">
                    <span className="material-symbols-outlined text-[16px]">priority_high</span>
                    <span className="text-sm font-bold">Tinggi</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1 col-span-2">
                  <span className="text-xs text-slate-500">Unit Ditugaskan</span>
                  <select
                    value={selectedUnit}
                    onChange={(e) => setSelectedUnit(e.target.value)}
                    className="text-sm border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 rounded-lg py-2 pl-3 pr-8 focus:border-primary focus:ring-0 text-slate-800 dark:text-white cursor-pointer w-full"
                  >
                    <option value="1">Ruang B - Sanitasi</option>
                    <option value="2">Pemeliharaan Umum</option>
                    <option value="3">Keamanan</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Unit Performance */}
            <div className="bg-gradient-to-br from-white to-blue-50 dark:from-slate-800 dark:to-slate-800/80 rounded-xl border border-blue-200 dark:border-slate-700 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">query_stats</span> Kinerja Unit
                </h3>
                <a href="#" className="text-xs text-primary font-bold hover:underline">Detail</a>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm border-b border-blue-100 dark:border-slate-700 pb-2">
                  <span className="text-slate-600 dark:text-slate-300">Tiket Terbuka</span>
                  <span className="font-bold text-slate-900 dark:text-white">{ticket.unit_performance?.open_tickets}</span>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-blue-100 dark:border-slate-700 pb-2">
                  <span className="text-slate-600 dark:text-slate-300">Rata-rata Respon</span>
                  <span className="font-bold text-green-600">{ticket.unit_performance?.avg_response}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600 dark:text-slate-300">Tepat Waktu (SLA)</span>
                  <span className="font-bold text-blue-600">{ticket.unit_performance?.sla_compliance}</span>
                </div>
              </div>
            </div>

            {/* SLA Timer */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-slate-400">timer</span> Pengatur Waktu SLA
                </h3>
                <span className={`text-xs font-bold px-2 py-1 rounded ${sla.percentage > 75 ? 'text-orange-600 bg-orange-100 dark:bg-orange-900/30' : 'text-green-600 bg-green-100 dark:bg-green-900/30'}`}>
                  {sla.percentage > 75 ? 'Mendekati Batas' : 'Aman'}
                </span>
              </div>
              <div className="flex justify-between items-end mb-2">
                <span className="text-2xl font-black text-slate-900 dark:text-white">{String(sla.hours).padStart(2, '0')}j {String(sla.minutes).padStart(2, '0')}m</span>
                <span className="text-xs text-slate-500">tersisa</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                <div className={`h-2.5 rounded-full ${sla.percentage > 75 ? 'bg-orange-500' : 'bg-green-500'}`} style={{ width: `${sla.percentage}%` }}></div>
              </div>
              <p className="text-xs text-slate-500 mt-2">Target penyelesaian: {formatDate(ticket.sla_deadline)}, {formatTime(ticket.sla_deadline)} WIB</p>
            </div>

            {/* Sentiment */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Sentimen Pelanggan</h3>
                <span className="material-symbols-outlined text-slate-400">sentiment_dissatisfied</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 flex-none">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
                    <path className="text-slate-200 dark:text-slate-700" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                    <path className="text-red-500" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray={`${Math.abs((ticket.sentiment_score || -0.8) * 100)}, 100`} strokeWidth="4" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-red-500 font-bold text-sm">{ticket.sentiment_score}</div>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-red-600 dark:text-red-400">Negatif</span>
                  <span className="text-xs text-slate-500 leading-tight">Bahasa pengguna menunjukkan frustrasi dan urgensi.</span>
                </div>
              </div>
            </div>

            {/* Reporter Info */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Info Pelapor</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-slate-500 dark:text-white font-bold text-sm">
                  {ticket.submitter_name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{ticket.submitter_name}</p>
                  <p className="text-xs text-slate-500">Anggota Keluarga Pasien</p>
                </div>
              </div>
              <div className="space-y-3">
                {ticket.submitter_email && (
                  <a href={`mailto:${ticket.submitter_email}`} className="flex items-center gap-3 text-sm text-slate-500 hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-[18px]">mail</span>{ticket.submitter_email}
                  </a>
                )}
                {ticket.submitter_phone && (
                  <a href={`tel:${ticket.submitter_phone}`} className="flex items-center gap-3 text-sm text-slate-500 hover:text-primary transition-colors">
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
