import { useState } from 'react';
import { supabase } from '../../utils/supabaseClient';

// Import Material Icons CSS
import '@fontsource/material-icons';

interface PublicTicket {
  id: string;
  ticket_number: string;
  type: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
  resolved_at?: string;
  units?: { name: string; code: string };
  service_categories?: { name: string };
  ticket_responses?: Array<{
    id: string;
    message: string;
    response_type: string;
    created_at: string;
    users?: { full_name: string };
  }>;
}

interface TimelineEvent {
  type: string;
  title: string;
  description: string;
  timestamp: string;
  icon: string;
  color: string;
}

const FormLacak = () => {
  const [ticketNumber, setTicketNumber] = useState('');
  const [ticket, setTicket] = useState<PublicTicket | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [enableAIInsight, setEnableAIInsight] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketNumber.trim()) return;

    setLoading(true);
    setError('');
    setTicket(null);
    setTimeline([]);
    setSearched(true);

    try {
      // Fetch ticket dari Supabase
      const { data, error: supabaseError } = await supabase
        .from('tickets')
        .select(`
          id,
          ticket_number,
          type,
          title,
          description,
          status,
          priority,
          created_at,
          resolved_at,
          first_response_at,
          units:unit_id(name, code),
          service_categories:category_id(name),
          ticket_responses:ticket_responses(
            id, 
            message, 
            response_type, 
            created_at,
            users:user_id(full_name)
          )
        `)
        .eq('ticket_number', ticketNumber.trim())
        .single();

      if (supabaseError || !data) {
        setError('Tiket tidak ditemukan. Pastikan nomor tiket benar.');
      } else {
        setTicket(data as any);
        buildTimeline(data as any);
      }
    } catch (err) {
      console.error('Error searching ticket:', err);
      setError('Terjadi kesalahan saat mencari tiket. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const buildTimeline = (ticketData: PublicTicket) => {
    const events: TimelineEvent[] = [];

    // Event: Tiket dibuat
    events.push({
      type: 'created',
      title: 'Laporan Terkirim',
      description: 'Tiket pengaduan telah dibuat dan terdaftar dalam sistem',
      timestamp: ticketData.created_at,
      icon: 'check',
      color: 'primary'
    });

    // Event: Respon pertama
    if (ticketData.ticket_responses && ticketData.ticket_responses.length > 0) {
      const firstResponse = ticketData.ticket_responses[0];
      events.push({
        type: 'first_response',
        title: 'Sedang Diproses',
        description: firstResponse.message,
        timestamp: firstResponse.created_at,
        icon: 'sync',
        color: 'primary'
      });
    }

    // Event: Tiket diselesaikan
    if (ticketData.resolved_at) {
      events.push({
        type: 'resolved',
        title: 'Selesai',
        description: 'Tiket pengaduan Anda telah diselesaikan',
        timestamp: ticketData.resolved_at,
        icon: 'flag',
        color: 'success'
      });
    }

    // Sort timeline by timestamp
    events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    setTimeline(events);
  };

  const getStatusLabel = (s: string) =>
    ({ open: 'Dibuka', in_progress: 'Sedang Diproses', resolved: 'Selesai', closed: 'Ditutup', pending: 'Menunggu' }[s] || s);

  const getStatusColor = (s: string) =>
    s === 'resolved' || s === 'closed'
      ? 'bg-emerald-500'
      : s === 'in_progress'
      ? 'bg-blue-500'
      : s === 'pending'
      ? 'bg-amber-500'
      : 'bg-gray-500';

  const getPriorityLabel = (p: string) =>
    ({ low: 'Rendah', medium: 'Sedang', high: 'Tinggi', urgent: 'Mendesak' }[p] || p);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleActivateNotification = () => {
    if (!whatsappNumber.trim()) {
      alert('Mohon masukkan nomor WhatsApp Anda');
      return;
    }
    alert('Fitur notifikasi WhatsApp akan segera aktif!');
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-100 flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 px-4 py-3 shadow-sm">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h1 className="font-bold text-base tracking-tight">Lacak Tiket</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center w-full pb-10">
        {/* Search Section */}
        <section className="w-full max-w-md px-4 pt-6 pb-4">
          <div className="flex flex-col gap-4">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Cek Status Laporan</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">Masukkan nomor tiket pengaduan, permintaan informasi, dan saran untuk melacak perkembangan laporan Anda secara realtime</p>
            </div>
            <form onSubmit={handleSearch} className="relative">
              <div className="flex items-center gap-2 p-2 bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700">
                <div className="flex-grow flex items-center pl-3">
                  <svg className="w-5 h-5 text-slate-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    className="w-full border-none bg-transparent focus:ring-0 text-sm font-medium py-2 outline-none"
                    placeholder="Contoh: TKT-2024-0001"
                    type="text"
                    value={ticketNumber}
                    onChange={(e) => setTicketNumber(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !ticketNumber.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Mencari...' : 'Lacak'}
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* Empty State - Belum Mencari */}
        {!searched && !loading && (
          <section className="w-full max-w-md px-4 mt-8">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 text-center shadow-sm border border-slate-100 dark:border-slate-700">
              <div className="w-20 h-20 mx-auto mb-4 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Lacak Status Tiket Anda</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                Masukkan nomor tiket di kolom pencarian di atas untuk melihat status dan riwayat pengaduan Anda.
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-left">
                <p className="text-xs font-semibold text-blue-900 dark:text-blue-100 mb-2">💡 Tips:</p>
                <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1">
                  <li>• Nomor tiket biasanya dimulai dengan TKT-</li>
                  <li>• Contoh: TKT-2024-0001</li>
                  <li>• Cek email atau SMS konfirmasi Anda</li>
                </ul>
              </div>
            </div>
          </section>
        )}

        {/* Error State */}
        {searched && !loading && error && (
          <section className="w-full max-w-md px-4">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 text-center shadow-lg">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Tiket Tidak Ditemukan</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{error}</p>
              <button
                onClick={() => {
                  setSearched(false);
                  setTicketNumber('');
                  setError('');
                }}
                className="px-6 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 font-medium transition-colors"
              >
                Coba Lagi
              </button>
            </div>
          </section>
        )}

        {/* Ticket Result */}
        {searched && !loading && ticket && (
          <section className="w-full max-w-md px-4 space-y-4">
            {/* Status Card */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-700">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 dark:text-slate-500">Status Saat Ini</span>
                  <div className="mt-1 flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${getStatusColor(ticket.status)} animate-pulse`}></span>
                    <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400">{getStatusLabel(ticket.status)}</h3>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 dark:text-slate-500">ID Tiket</span>
                  <p className="font-mono font-bold text-slate-900 dark:text-white">#{ticket.ticket_number}</p>
                </div>
              </div>

              {/* Timeline */}
              <div className="space-y-8 relative">
                {timeline.map((event, index) => (
                  <div key={index} className="flex gap-4 relative">
                    {index < timeline.length - 1 && (
                      <div className="absolute left-[15px] top-[30px] bottom-[-10px] w-0.5 bg-slate-200 dark:bg-slate-700"></div>
                    )}
                    <div className={`relative z-10 w-8 h-8 rounded-full ${event.type === 'created' || event.type === 'first_response' ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'} flex items-center justify-center text-white ring-4 ring-white dark:ring-slate-800`}>
                      {event.icon === 'check' && (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      {event.icon === 'sync' && (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      )}
                      {event.icon === 'flag' && (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                        </svg>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <h4 className={`text-sm font-bold ${event.type === 'first_response' ? 'text-primary' : 'text-slate-900 dark:text-white'}`}>
                        {event.title}
                      </h4>
                      <p className="text-xs text-slate-500">{formatDate(event.timestamp)}</p>
                      {event.type === 'first_response' && (
                        <div className="mt-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50">
                          <div className="flex items-center gap-2 mb-2">
                            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            <h5 className="text-xs font-bold text-blue-600 uppercase tracking-wide">AI Status Insight</h5>
                          </div>
                          <p className="text-xs leading-relaxed text-slate-700 dark:text-blue-100">
                            {event.description}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* WhatsApp Notification Card */}
            <div className="bg-gradient-to-br from-green-50 to-white dark:from-green-950/20 dark:to-slate-800 rounded-2xl p-5 shadow-sm border border-green-100 dark:border-green-900/30">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-whatsapp flex items-center justify-center text-white shadow-lg shadow-green-500/20">
                    <svg className="size-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.631 1.433h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Dapatkan Pembaruan Langsung</h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">Terima pesan otomatis setiap ada perubahan status tiket Anda.</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Nomor WhatsApp Anda</label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3 text-sm font-bold text-slate-400">+62</span>
                      <input
                        className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-whatsapp/20 focus:border-whatsapp outline-none transition-all"
                        placeholder="81234567890"
                        type="tel"
                        value={whatsappNumber}
                        onChange={(e) => setWhatsappNumber(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-slate-900/40 rounded-xl border border-white dark:border-slate-700">
                    <input
                      className="size-4 text-whatsapp border-slate-300 rounded focus:ring-whatsapp/20"
                      id="ai-insight-wa"
                      type="checkbox"
                      checked={enableAIInsight}
                      onChange={(e) => setEnableAIInsight(e.target.checked)}
                    />
                    <label className="flex flex-col cursor-pointer" htmlFor="ai-insight-wa">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Dapatkan Wawasan AI via WhatsApp</span>
                      <span className="text-[10px] text-slate-500">Kirim ringkasan progres otomatis oleh AI.</span>
                    </label>
                  </div>
                  <button
                    onClick={handleActivateNotification}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-xl text-sm shadow-md transition-colors flex items-center justify-center gap-2"
                  >
                    <span>Aktifkan Notifikasi</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Ticket Details Card */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-700">
              <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Rincian Tiket
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Kategori</p>
                  <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <span className="text-xs font-bold truncate">{ticket.service_categories?.name || '-'}</span>
                  </div>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Prioritas</p>
                  <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span className="text-xs font-bold text-orange-600">{getPriorityLabel(ticket.priority)}</span>
                  </div>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Lokasi</p>
                  <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-xs font-bold truncate">{ticket.units?.name || '-'}</span>
                  </div>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Tgl Masuk</p>
                  <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs font-bold">{new Date(ticket.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* History Card */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-700">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Riwayat Pembaruan
                </h3>
              </div>
              <div className="space-y-4">
                {ticket.ticket_responses && ticket.ticket_responses.length > 0 ? (
                  ticket.ticket_responses.slice(0, 3).map((response, index) => (
                    <div key={response.id} className={`flex gap-3 ${index < ticket.ticket_responses!.length - 1 ? 'pb-3 border-b border-slate-100 dark:border-slate-700' : ''}`}>
                      <div className={`size-2 mt-1.5 rounded-full ${index === 0 ? 'bg-primary shadow-[0_0_8px_rgba(19,127,236,0.5)]' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
                      <div className="flex-grow">
                        <p className="text-xs font-bold">{response.response_type === 'resolution' ? 'Resolusi' : 'Respon'}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{response.message}</p>
                        <div className="flex justify-between mt-0.5">
                          <p className="text-[10px] text-slate-500">{formatDate(response.created_at)}</p>
                          <p className="text-[10px] italic text-slate-400">{response.users?.full_name || 'Sistem'}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-slate-500">Belum ada riwayat pembaruan</p>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Cards */}
            <div className="grid grid-cols-2 gap-3 mt-6">
              <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 text-center space-y-2 hover:shadow-md transition-shadow cursor-pointer">
                <svg className="w-6 h-6 mx-auto text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <p className="text-[10px] font-bold text-slate-900 dark:text-white uppercase">Call Center</p>
                <p className="text-xs text-blue-600 font-bold">112</p>
              </div>
              <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 text-center space-y-2 hover:shadow-md transition-shadow cursor-pointer">
                <svg className="w-6 h-6 mx-auto text-green-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.631 1.433h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"></path>
                </svg>
                <p className="text-[10px] font-bold text-slate-900 dark:text-white uppercase">WhatsApp Help</p>
                <p className="text-xs text-green-600 font-bold">Chat Sekarang</p>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-6 px-4">
        <div className="max-w-md mx-auto text-center space-y-3">
          <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed uppercase tracking-widest font-bold">
            Portal Layanan Publik • Sistem Manajemen Pengaduan
          </p>
          <div className="flex justify-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
            <a className="hover:text-primary transition-colors" href="#">Panduan</a>
            <a className="hover:text-primary transition-colors" href="#">Privasi</a>
            <a className="hover:text-primary transition-colors" href="#">Kontak</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FormLacak;
