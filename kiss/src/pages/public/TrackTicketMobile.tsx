import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

interface TimelineEvent {
  type: string;
  title: string;
  description: string;
  timestamp: string;
  icon: string;
  color: string;
}

interface TicketData {
  ticket: {
    id: string;
    ticket_number: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    created_at: string;
    updated_at: string;
    resolved_at: string | null;
    sla_deadline: string;
    unit: { name: string; code: string } | null;
    category: { name: string } | null;
  };
  timeline: TimelineEvent[];
  stats: {
    totalResponses: number;
    totalEscalations: number;
    isResolved: boolean;
    isOverSLA: boolean;
  };
}

const TrackTicketMobile: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [ticketNumber, setTicketNumber] = useState('TKT-2026-0015');
  const [ticketData, setTicketData] = useState<TicketData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [aiInsightEnabled, setAiInsightEnabled] = useState(false);

  // Auto-search jika ada query parameter
  useEffect(() => {
    const ticketFromUrl = searchParams.get('ticket');
    if (ticketFromUrl) {
      setTicketNumber(ticketFromUrl);
      handleSearchWithTicket(ticketFromUrl);
    }
  }, [searchParams]);

  const handleSearchWithTicket = async (ticket: string) => {
    if (!ticket.trim()) return;

    setLoading(true);
    setError('');
    setTicketData(null);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(`${apiUrl}/public/track/${ticket.trim()}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Tiket tidak ditemukan');
      }

      setTicketData(data.data);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat mencari tiket');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketNumber.trim()) {
      setError('Silakan masukkan nomor tiket');
      return;
    }
    await handleSearchWithTicket(ticketNumber);
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      open: 'Terbuka',
      in_progress: 'Sedang Diproses',
      resolved: 'Selesai',
      closed: 'Ditutup',
      pending: 'Menunggu',
    };
    return labels[status] || status;
  };

  const getPriorityLabel = (priority: string) => {
    const labels: Record<string, string> = {
      low: 'Rendah',
      medium: 'Sedang',
      high: 'Tinggi',
      urgent: 'Mendesak',
    };
    return labels[priority] || priority;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-slate-950 dark:via-blue-950/20 dark:to-slate-950 font-sans text-slate-900 dark:text-slate-100 flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm px-4 py-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-9 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">KISS</h1>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Lacak Tiket</p>
            </div>
          </div>
          <button className="size-10 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center">
            <span className="material-symbols-outlined text-slate-600 dark:text-slate-300">more_vert</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center w-full pb-10">
        {/* Search Section */}
        <section className="w-full max-w-md px-4 pt-8 pb-6">
          <div className="flex flex-col gap-5">
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Cek Status Laporan</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">Masukkan nomor tiket pengaduan, permintaan informasi, dan saran untuk melacak perkembangan laporan Anda secara realtime.</p>
            </div>
            <form onSubmit={handleSearch} className="relative">
              <div className="flex items-stretch gap-2 p-2 bg-white dark:bg-slate-800 rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-200/80 dark:border-slate-700/80">
                <div className="flex-grow flex items-center pl-4 pr-2">
                  <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-xl mr-2">search</span>
                  <input
                    className="w-full border-none bg-transparent focus:ring-0 text-sm font-semibold py-3 px-0 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    placeholder="Contoh: TKT-2025-0001"
                    type="text"
                    value={ticketNumber}
                    onChange={(e) => setTicketNumber(e.target.value.toUpperCase())}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                      <span>Mencari...</span>
                    </>
                  ) : (
                    <>
                      <span>Lacak</span>
                      <span className="material-symbols-outlined text-lg">arrow_forward</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* Ticket Result */}
        {ticketData && (
          <section className="w-full max-w-md px-4 space-y-5">
            {/* Status Card */}
            <div className="bg-gradient-to-br from-white to-blue-50/30 dark:from-slate-800 dark:to-blue-950/20 rounded-3xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-200/50 dark:border-slate-700/50">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <span className="text-[10px] uppercase font-black tracking-widest text-blue-600/70 dark:text-blue-400/70">Status Saat Ini</span>
                  <div className="mt-2 flex items-center gap-2.5">
                    <span className="relative flex size-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
                      <span className="relative inline-flex rounded-full size-3 bg-blue-600"></span>
                    </span>
                    <h3 className="text-2xl font-black text-blue-600 dark:text-blue-400 tracking-tight">
                      {getStatusLabel(ticketData.ticket.status)}
                    </h3>
                  </div>
                </div>
                <div className="text-right bg-slate-100 dark:bg-slate-900/50 px-4 py-2.5 rounded-2xl">
                  <span className="text-[9px] uppercase font-black tracking-widest text-slate-400 dark:text-slate-500 block mb-1">ID Tiket</span>
                  <p className="font-mono font-black text-slate-900 dark:text-white text-sm">#{ticketData.ticket.ticket_number}</p>
                </div>
              </div>

              {/* Timeline */}
              <div className="space-y-10 relative">
                {ticketData.timeline.map((event, index) => {
                  const isActive = index === 0;
                  const isCompleted = index < ticketData.timeline.length - 2;
                  
                  return (
                    <div key={index} className="flex gap-5 relative">
                      {index < ticketData.timeline.length - 1 && (
                        <div className={`absolute left-[19px] top-[36px] bottom-[-12px] w-0.5 ${isCompleted ? 'bg-gradient-to-b from-blue-600 to-blue-400' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                      )}
                      <div className={`relative z-10 size-10 rounded-2xl flex items-center justify-center ring-4 ring-white dark:ring-slate-800 shadow-lg transition-all ${
                        isCompleted ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-blue-500/30' : isActive ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-blue-500/30 scale-110' : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500'
                      }`}>
                        <span className="material-symbols-outlined text-lg">
                          {isCompleted ? 'check' : isActive ? 'sync' : event.icon}
                        </span>
                      </div>
                      <div className="flex flex-col flex-grow">
                        <h4 className={`text-sm font-bold mb-1 ${isActive ? 'text-blue-600 dark:text-blue-400' : isCompleted ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                          {event.title}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{formatDate(event.timestamp)}</p>
                        {isActive && (
                          <div className="mt-4 p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 border border-blue-200/50 dark:border-blue-800/50 shadow-sm">
                            <div className="flex items-center gap-2.5 mb-3">
                              <div className="size-7 rounded-xl bg-blue-600 dark:bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
                                <span className="material-symbols-outlined text-white text-base">auto_awesome</span>
                              </div>
                              <h5 className="text-[10px] font-black text-blue-700 dark:text-blue-400 uppercase tracking-widest">AI Status Insight</h5>
                            </div>
                            <p className="text-xs leading-relaxed text-slate-700 dark:text-blue-100 font-medium">
                              {event.description}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* WhatsApp Notification Card */}
            <div className="bg-gradient-to-br from-green-50 via-white to-green-50/50 dark:from-green-950/30 dark:via-slate-800 dark:to-green-950/20 rounded-3xl p-6 shadow-xl shadow-green-200/30 dark:shadow-slate-900/50 border border-green-200/50 dark:border-green-900/30">
              <div className="space-y-5">
                <div className="flex items-center gap-4">
                  <div className="size-12 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white shadow-xl shadow-green-500/30">
                    <svg className="size-7" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.631 1.433h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-base font-black text-slate-900 dark:text-white mb-1">Dapatkan Pembaruan Langsung</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">Terima pesan otomatis setiap ada perubahan status tiket Anda.</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1">Nomor WhatsApp Anda</label>
                    <div className="relative flex items-center">
                      <span className="absolute left-4 text-sm font-bold text-slate-500 dark:text-slate-400">+62</span>
                      <input
                        className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-semibold focus:ring-4 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all placeholder:text-slate-400"
                        placeholder="81234567890"
                        type="tel"
                        value={whatsappNumber}
                        onChange={(e) => setWhatsappNumber(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-white/70 dark:bg-slate-900/50 rounded-2xl border border-green-200/50 dark:border-slate-700">
                    <input
                      className="size-5 mt-0.5 text-green-600 border-slate-300 dark:border-slate-600 rounded-md focus:ring-green-500/30 focus:ring-2"
                      id="ai-insight-wa"
                      type="checkbox"
                      checked={aiInsightEnabled}
                      onChange={(e) => setAiInsightEnabled(e.target.checked)}
                    />
                    <label className="flex flex-col cursor-pointer flex-grow" htmlFor="ai-insight-wa">
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-0.5">Dapatkan Wawasan AI via WhatsApp</span>
                      <span className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">Kirim ringkasan progres otomatis oleh AI.</span>
                    </label>
                  </div>
                  <button className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3.5 rounded-2xl text-sm shadow-xl shadow-green-500/20 transition-all flex items-center justify-center gap-2.5">
                    <span>Aktifkan Notifikasi</span>
                    <span className="material-symbols-outlined text-lg">notifications_active</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Ticket Details Card */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-200/50 dark:border-slate-700/50">
              <h3 className="text-base font-black mb-5 flex items-center gap-2.5 text-slate-900 dark:text-white">
                <div className="size-8 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-lg">description</span>
                </div>
                Rincian Tiket
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/50 dark:to-slate-900/30 rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
                  <p className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase mb-2 tracking-widest">Kategori</p>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-base">medical_services</span>
                    <span className="text-xs font-bold truncate text-slate-900 dark:text-white">{ticketData.ticket.category?.name || '-'}</span>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/30 dark:to-orange-900/20 rounded-2xl border border-orange-200/50 dark:border-orange-800/50">
                  <p className="text-[9px] font-black text-orange-600/70 dark:text-orange-400/70 uppercase mb-2 tracking-widest">Prioritas</p>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-orange-600 dark:text-orange-400 text-base">priority_high</span>
                    <span className="text-xs font-bold text-orange-700 dark:text-orange-300">{getPriorityLabel(ticketData.ticket.priority)}</span>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/50 dark:to-slate-900/30 rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
                  <p className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase mb-2 tracking-widest">Lokasi</p>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-500 dark:text-slate-400 text-base">location_on</span>
                    <span className="text-xs font-bold truncate text-slate-900 dark:text-white">{ticketData.ticket.unit?.name || '-'}</span>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/50 dark:to-slate-900/30 rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
                  <p className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase mb-2 tracking-widest">Tgl Masuk</p>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-500 dark:text-slate-400 text-base">event</span>
                    <span className="text-[11px] font-bold text-slate-900 dark:text-white">{formatDate(ticketData.ticket.created_at).split(',')[0]}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* History Card */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-200/50 dark:border-slate-700/50">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-base font-black flex items-center gap-2.5 text-slate-900 dark:text-white">
                  <div className="size-8 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <span className="material-symbols-outlined text-purple-600 dark:text-purple-400 text-lg">history</span>
                  </div>
                  Riwayat Pembaruan
                </h3>
                <button className="text-xs font-bold text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">Semua</button>
              </div>
              <div className="space-y-4">
                {ticketData.timeline.slice(0, 3).map((event, index) => (
                  <div key={index} className={`flex gap-3.5 ${index < 2 ? 'pb-4 border-b border-slate-100 dark:border-slate-700' : ''}`}>
                    <div className={`size-2.5 mt-2 rounded-full flex-shrink-0 ${index === 0 ? 'bg-blue-600 shadow-[0_0_12px_rgba(37,99,235,0.6)] ring-4 ring-blue-100 dark:ring-blue-900/30' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
                    <div className="flex-grow min-w-0">
                      <p className={`text-sm ${index === 0 ? 'font-bold text-slate-900 dark:text-white' : 'font-semibold text-slate-700 dark:text-slate-300'}`}>{event.title}</p>
                      <div className="flex justify-between items-center mt-1.5">
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{formatDate(event.timestamp)}</p>
                        <span className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 font-bold">Sistem</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Cards */}
            <div className="grid grid-cols-2 gap-3 mt-6">
              <button className="p-5 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 hover:from-blue-100 hover:to-blue-200/50 dark:hover:from-blue-950/40 dark:hover:to-blue-900/30 rounded-2xl border border-blue-200/50 dark:border-blue-800/50 text-center space-y-2.5 transition-all shadow-sm hover:shadow-md">
                <div className="size-10 mx-auto rounded-xl bg-blue-600 dark:bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <span className="material-symbols-outlined text-white text-xl">call</span>
                </div>
                <div>
                  <p className="text-[10px] font-black text-blue-700 dark:text-blue-400 uppercase tracking-widest mb-1">Call Center</p>
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-black">112</p>
                </div>
              </button>
              <button className="p-5 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/30 dark:to-green-900/20 hover:from-green-100 hover:to-green-200/50 dark:hover:from-green-950/40 dark:hover:to-green-900/30 rounded-2xl border border-green-200/50 dark:border-green-800/50 text-center space-y-2.5 transition-all shadow-sm hover:shadow-md">
                <div className="size-10 mx-auto rounded-xl bg-green-600 dark:bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/25">
                  <span className="material-symbols-outlined text-white text-xl">chat</span>
                </div>
                <div>
                  <p className="text-[10px] font-black text-green-700 dark:text-green-400 uppercase tracking-widest mb-1">WhatsApp Help</p>
                  <p className="text-xs text-green-600 dark:text-green-400 font-black">Chat Sekarang</p>
                </div>
              </button>
            </div>
          </section>
        )}

        {/* Error State */}
        {error && !loading && (
          <section className="w-full max-w-md px-4 py-8">
            <div className="bg-gradient-to-br from-white to-red-50/30 dark:from-slate-800 dark:to-red-950/20 rounded-3xl shadow-2xl p-8 text-center border border-red-200/50 dark:border-red-900/30">
              <div className="w-20 h-20 mx-auto mb-5 bg-gradient-to-br from-red-100 to-red-200/50 dark:from-red-900/30 dark:to-red-900/20 rounded-3xl flex items-center justify-center shadow-xl shadow-red-500/10">
                <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-4xl">error</span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">Tiket Tidak Ditemukan</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">{error}</p>
              <button
                onClick={() => {
                  setError('');
                  setTicketNumber('');
                }}
                className="px-8 py-3 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 text-slate-700 dark:text-slate-200 rounded-2xl hover:from-slate-200 hover:to-slate-300 dark:hover:from-slate-600 dark:hover:to-slate-500 font-bold shadow-lg transition-all"
              >
                Coba Lagi
              </button>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto bg-gradient-to-t from-slate-100 to-white dark:from-slate-900 dark:to-slate-900/50 border-t border-slate-200/50 dark:border-slate-800/50 py-8 px-4">
        <div className="max-w-md mx-auto text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="size-6 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-sm font-black text-slate-900 dark:text-white">KISS</span>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed uppercase tracking-widest font-bold">
            Portal Layanan Publik • RSUD Bendan
          </p>
          <div className="flex justify-center gap-6 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            <a className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors" href="#">Panduan</a>
            <a className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors" href="#">Privasi</a>
            <a className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors" href="#">Kontak</a>
          </div>
        </div>
      </footer>

      {/* Material Symbols Font */}
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        rel="stylesheet"
      />
    </div>
  );
};

export default TrackTicketMobile;
