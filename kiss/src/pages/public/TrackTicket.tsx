import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, CheckCircle, Clock, AlertCircle, MessageCircle, 
  FileText, Phone, Bell, Calendar, MapPin, Tag, User
} from 'lucide-react';
import { getAppSettings, AppSettings } from '../../services/appSettingsService';

interface TimelineEvent {
  type: string;
  title: string;
  description: string;
  timestamp: string;
  icon: string;
  color: string;
}

interface EscalationUnit {
  id: string;
  status: string;
  is_primary: boolean;
  is_cc: boolean;
  created_at: string;
  units: {
    name: string;
  };
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
  escalationUnits: EscalationUnit[];
  stats: {
    totalResponses: number;
    totalEscalations: number;
    isResolved: boolean;
    isOverSLA: boolean;
  };
}

const TrackTicket: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [ticketNumber, setTicketNumber] = useState('');
  const [ticketData, setTicketData] = useState<TicketData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [enableAIInsights, setEnableAIInsights] = useState(false);
  const [showNotificationForm, setShowNotificationForm] = useState(false);
  const [appSettings, setAppSettings] = useState<AppSettings>({
    app_name: 'Sistem Pelacakan Tiket',
    institution_name: 'Instansi',
    logo_url: '',
    app_footer: '',
    call_center_number: '112',
    whatsapp_help_number: '',
    contact_phone: '',
    contact_email: '',
    institution_address: '',
    website: ''
  });

  // Auto-search jika ada query parameter dan polling untuk realtime update
  useEffect(() => {
    const ticketFromUrl = searchParams.get('ticket');
    if (ticketFromUrl) {
      setTicketNumber(ticketFromUrl);
      handleSearchWithTicket(ticketFromUrl);
    }
    fetchAppSettings();
  }, [searchParams]);

  // Polling untuk update realtime setiap 30 detik jika ada tiket yang ditampilkan
  useEffect(() => {
    if (!ticketData) return;

    const intervalId = setInterval(() => {
      // Refresh data tiket secara silent (tanpa loading indicator)
      handleSearchWithTicket(ticketData.ticket.ticket_number, true);
    }, 30000); // 30 detik

    return () => clearInterval(intervalId);
  }, [ticketData]);

  const fetchAppSettings = async () => {
    try {
      const settings = await getAppSettings();
      setAppSettings(settings);
    } catch (err) {
      console.error('Error fetching app settings:', err);
    }
  };

  const handleSearchWithTicket = async (ticket: string, silent: boolean = false) => {
    if (!ticket.trim()) return;

    if (!silent) {
      setLoading(true);
      setError('');
      setTicketData(null);
    }

    try {
      // Gunakan endpoint yang benar untuk Vercel
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(
        `${apiUrl}/public/track-ticket?ticket=${encodeURIComponent(ticket.trim())}`
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Tiket tidak ditemukan');
      }

      setTicketData(data.data);
    } catch (err: any) {
      if (!silent) {
        setError(err.message || 'Terjadi kesalahan saat mencari tiket');
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
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

  const getStatusInfo = (status: string) => {
    const statusConfig: Record<string, { label: string; color: string; bgColor: string; icon: React.ReactNode }> = {
      open: { 
        label: 'Laporan Terkirim', 
        color: 'text-blue-600', 
        bgColor: 'bg-blue-500',
        icon: <CheckCircle className="w-4 h-4" />
      },
      in_progress: { 
        label: 'Sedang Diproses', 
        color: 'text-blue-600', 
        bgColor: 'bg-blue-500',
        icon: <Clock className="w-4 h-4 animate-spin" />
      },
      resolved: { 
        label: 'Tindak Lanjut', 
        color: 'text-gray-400', 
        bgColor: 'bg-gray-100',
        icon: <AlertCircle className="w-4 h-4" />
      },
      closed: { 
        label: 'Selesai', 
        color: 'text-gray-400', 
        bgColor: 'bg-gray-100',
        icon: <CheckCircle className="w-4 h-4" />
      },
    };

    return statusConfig[status] || statusConfig.open;
  };

  const getPriorityInfo = (priority: string) => {
    const priorityConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
      low: { label: 'Rendah', color: 'text-gray-600', icon: <AlertCircle className="w-4 h-4" /> },
      medium: { label: 'Sedang', color: 'text-blue-600', icon: <AlertCircle className="w-4 h-4" /> },
      high: { label: 'Tinggi', color: 'text-orange-600', icon: <AlertCircle className="w-4 h-4" /> },
      urgent: { label: 'Mendesak', color: 'text-red-600', icon: <AlertCircle className="w-4 h-4" /> },
    };

    return priorityConfig[priority] || priorityConfig.medium;
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

  const formatDateShort = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  const handleActivateNotification = () => {
    if (!whatsappNumber.trim()) {
      alert('Silakan masukkan nomor WhatsApp Anda');
      return;
    }
    
    // Simpan preferensi notifikasi
    alert(`Notifikasi WhatsApp berhasil diaktifkan untuk nomor +62${whatsappNumber}`);
    setShowNotificationForm(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 font-sans">
      {/* Modern Mobile Header with Gradient */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 shadow-lg shadow-blue-500/20 px-4 py-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {appSettings.logo_url ? (
              <div className="w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center p-1.5">
                <img src={appSettings.logo_url} alt="Logo" className="w-full h-full object-contain" />
              </div>
            ) : (
              <div className="w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center text-blue-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8.57829 8.57829C5.52816 11.6284 3.451 15.5145 2.60947 19.7452C1.76794 23.9758 2.19984 28.361 3.85056 32.3462C5.50128 36.3314 8.29667 39.7376 11.8832 42.134C15.4698 44.5305 19.6865 45.8096 24 45.8096C28.3135 45.8096 32.5302 44.5305 36.1168 42.134C39.7033 39.7375 42.4987 36.3314 44.1494 32.3462C45.8002 28.361 46.2321 23.9758 45.3905 19.7452C44.549 15.5145 42.4718 11.6284 39.4217 8.57829L24 24L8.57829 8.57829Z" fill="currentColor"></path>
                </svg>
              </div>
            )}
            <div className="flex flex-col">
              <h1 className="font-bold text-base tracking-tight text-white drop-shadow-sm">{appSettings.app_name}</h1>
              <span className="text-[10px] text-blue-100 font-medium">{appSettings.institution_name}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {ticketData && (
              <div className="flex items-center gap-1.5 px-2 py-1 bg-white/10 backdrop-blur-sm rounded-lg">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-[9px] text-white font-semibold">Live</span>
              </div>
            )}
            <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Bell className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center w-full pb-10">
        {/* Modern Search Section with Gradient Card */}
        <section className="w-full max-w-md px-4 pt-8 pb-6">
          <div className="flex flex-col gap-5">
            <div className="space-y-2 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/30 mb-3">
                <Search className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                Cek Status Laporan
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xs mx-auto">
                Masukkan nomor tiket pengaduan, permintaan informasi, dan saran untuk melacak perkembangan laporan Anda secara realtime
              </p>
            </div>

            <form onSubmit={handleSearch} className="relative">
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-100 dark:border-slate-700 p-2 transition-all hover:shadow-2xl">
                <div className="flex items-center gap-3">
                  <div className="flex-grow flex items-center bg-slate-50 dark:bg-slate-900/50 rounded-xl px-4 py-3">
                    <Search className="text-blue-500 w-5 h-5 mr-3" />
                    <input
                      className="w-full border-none bg-transparent focus:ring-0 text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400"
                      placeholder="TKT-2025-0001"
                      type="text"
                      value={ticketNumber}
                      onChange={(e) => setTicketNumber(e.target.value.toUpperCase())}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-500/30 disabled:from-gray-400 disabled:to-gray-500 disabled:shadow-none flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Mencari...</span>
                      </>
                    ) : (
                      <>
                        <span>Lacak</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>

            {error && (
              <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-2 border-red-200 dark:border-red-800/50 rounded-2xl flex items-start gap-3 shadow-lg shadow-red-100/50">
                <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-white" />
                </div>
                <div className="flex-grow">
                  <p className="text-sm font-bold text-red-900 dark:text-red-200 mb-0.5">Tiket Tidak Ditemukan</p>
                  <p className="text-xs text-red-700 dark:text-red-300">{error}</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Ticket Details */}
        {ticketData && (
          <section className="w-full max-w-md px-4 space-y-5">
            {/* Modern Status Card with Gradient */}
            <div className="bg-gradient-to-br from-white to-blue-50 dark:from-slate-800 dark:to-slate-900 rounded-3xl p-6 shadow-2xl shadow-blue-500/10 border border-blue-100 dark:border-slate-700 relative overflow-hidden">
              {/* Decorative Background */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-400/10 to-blue-400/10 rounded-full blur-2xl"></div>
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full text-[10px] font-black text-blue-700 dark:text-blue-300 uppercase tracking-wider mb-3">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"></div>
                      Status Terkini
                    </span>
                    <div className="flex items-center gap-2.5 mt-2">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 shadow-lg shadow-blue-500/50 animate-pulse"></div>
                      <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                        {getStatusInfo(ticketData.ticket.status).label}
                      </h3>
                    </div>
                  </div>
                  <div className="text-right bg-white dark:bg-slate-800 rounded-2xl px-4 py-3 shadow-lg">
                    <span className="text-[9px] uppercase font-black tracking-widest text-slate-400 dark:text-slate-500 block mb-1">
                      ID Tiket
                    </span>
                    <p className="font-mono font-black text-lg text-blue-600 dark:text-blue-400">
                      #{ticketData.ticket.ticket_number}
                    </p>
                  </div>
                </div>

                {/* Modern Timeline Stepper - Dinamis berdasarkan status */}
                <div className="space-y-6 relative">
                  {/* Step 1: Laporan Terkirim - Selalu aktif */}
                  <div className="flex gap-4 relative">
                    {(ticketData.ticket.status !== 'open' || ticketData.stats.totalResponses > 0 || ticketData.stats.totalEscalations > 0 || ticketData.stats.isResolved) && (
                      <div className="absolute left-[19px] top-[40px] bottom-[-8px] w-1 bg-gradient-to-b from-blue-500 to-blue-300"></div>
                    )}
                    <div className="relative z-10 w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white ring-4 ring-white dark:ring-slate-800 shadow-lg shadow-blue-500/30">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col flex-grow bg-white dark:bg-slate-800/50 rounded-2xl p-4 shadow-md">
                      <h4 className="text-sm font-black text-slate-900 dark:text-white">Laporan Terkirim</h4>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(ticketData.ticket.created_at)}
                      </p>
                    </div>
                  </div>

                  {/* Step 2: Sedang Diproses - Aktif jika ada respon/eskalasi atau status in_progress */}
                  {(ticketData.ticket.status === 'in_progress' || ticketData.ticket.status === 'resolved' || ticketData.ticket.status === 'closed' || ticketData.stats.totalResponses > 0 || ticketData.stats.totalEscalations > 0) && (
                    <div className="flex gap-4 relative">
                      {(ticketData.ticket.status === 'resolved' || ticketData.ticket.status === 'closed') && (
                        <div className="absolute left-[19px] top-[40px] bottom-[-8px] w-1 bg-gradient-to-b from-blue-300 to-emerald-300"></div>
                      )}
                      {(ticketData.ticket.status === 'in_progress' && !ticketData.stats.isResolved) && (
                        <div className="absolute left-[19px] top-[40px] bottom-[-8px] w-1 bg-gradient-to-b from-blue-300 to-slate-200 dark:to-slate-700"></div>
                      )}
                      <div className="relative z-10 w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white ring-4 ring-white dark:ring-slate-800 shadow-lg shadow-blue-500/30">
                        <Clock className="w-5 h-5 animate-spin" />
                      </div>
                      <div className="flex flex-col flex-grow">
                        <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-4 shadow-md">
                          <h4 className="text-sm font-black text-blue-600 dark:text-blue-400">Sedang Diproses</h4>
                          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            Estimasi: {ticketData.ticket.sla_deadline ? formatDateShort(ticketData.ticket.sla_deadline) : '-'}
                          </p>
                        </div>

                        {/* Tampilkan Semua Respon */}
                        {ticketData.timeline.filter(t => t.type === 'response' || t.type === 'first_response').map((response, idx) => (
                          <div key={idx} className="mt-3 p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border-2 border-emerald-200 dark:border-emerald-700/50 shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-400/10 rounded-full blur-2xl"></div>
                            <div className="relative z-10">
                              <div className="flex items-center gap-2 mb-4">
                                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                                  <MessageCircle className="text-white w-5 h-5" />
                                </div>
                                <div className="flex-grow">
                                  <h5 className="text-sm font-black text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                                    {response.title}
                                  </h5>
                                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                                    {formatDate(response.timestamp)}
                                  </span>
                                </div>
                              </div>
                              <div className="bg-white/80 dark:bg-slate-800/80 rounded-xl p-4 border border-emerald-100 dark:border-emerald-800/30">
                                <p className="text-sm leading-relaxed text-slate-800 dark:text-slate-200 font-medium whitespace-pre-wrap">
                                  {response.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* Tampilkan Semua Eskalasi */}
                        {ticketData.stats.totalEscalations > 0 && ticketData.timeline.filter(t => t.type === 'escalation' || t.type === 'escalation_resolved').map((escalation, idx) => (
                          <div key={idx} className={`mt-3 p-6 rounded-2xl ${
                            escalation.type === 'escalation_resolved' 
                              ? 'bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border-2 border-emerald-200 dark:border-emerald-700/50'
                              : 'bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-2 border-orange-200 dark:border-orange-700/50'
                          } shadow-xl relative overflow-hidden`}>
                            <div className={`absolute top-0 right-0 w-20 h-20 ${
                              escalation.type === 'escalation_resolved' ? 'bg-emerald-400/10' : 'bg-orange-400/10'
                            } rounded-full blur-2xl`}></div>
                            <div className="relative z-10">
                              <div className="flex items-center gap-2 mb-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${
                                  escalation.type === 'escalation_resolved'
                                    ? 'bg-gradient-to-br from-emerald-500 to-green-600 shadow-emerald-500/30'
                                    : 'bg-gradient-to-br from-orange-500 to-amber-600 shadow-orange-500/30'
                                }`}>
                                  {escalation.type === 'escalation_resolved' ? (
                                    <CheckCircle className="text-white w-5 h-5" />
                                  ) : (
                                    <AlertCircle className="text-white w-5 h-5" />
                                  )}
                                </div>
                                <div className="flex-grow">
                                  <h5 className={`text-sm font-black uppercase tracking-wider ${
                                    escalation.type === 'escalation_resolved'
                                      ? 'text-emerald-700 dark:text-emerald-300'
                                      : 'text-orange-700 dark:text-orange-300'
                                  }`}>
                                    {escalation.title}
                                  </h5>
                                  <span className={`text-[10px] font-medium ${
                                    escalation.type === 'escalation_resolved'
                                      ? 'text-emerald-600 dark:text-emerald-400'
                                      : 'text-orange-600 dark:text-orange-400'
                                  }`}>
                                    {formatDate(escalation.timestamp)}
                                  </span>
                                </div>
                              </div>
                              <div className={`rounded-xl p-4 border ${
                                escalation.type === 'escalation_resolved'
                                  ? 'bg-white/80 dark:bg-slate-800/80 border-emerald-100 dark:border-emerald-800/30'
                                  : 'bg-white/80 dark:bg-slate-800/80 border-orange-100 dark:border-orange-800/30'
                              }`}>
                                <p className="text-sm leading-relaxed font-medium whitespace-pre-wrap text-slate-800 dark:text-slate-200">
                                  {escalation.description}
                                </p>
                              </div>
                              {escalation.type === 'escalation' && ticketData.escalationUnits && ticketData.escalationUnits.length > 0 && (
                                <div className="mt-4 bg-white/60 dark:bg-slate-800/60 rounded-xl p-4 border border-orange-100 dark:border-orange-800/30">
                                  <p className="text-xs font-black text-orange-700 dark:text-orange-400 mb-3 flex items-center gap-2">
                                    <MapPin className="w-4 h-4" />
                                    Unit Tujuan Eskalasi:
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {ticketData.escalationUnits.map((eu: any, i: number) => (
                                      <span key={i} className="text-xs px-3 py-2 bg-white dark:bg-orange-900/30 rounded-lg border-2 border-orange-200 dark:border-orange-800/50 text-orange-700 dark:text-orange-300 font-bold shadow-sm flex items-center gap-1.5">
                                        {eu.units?.name || 'Unit'} 
                                        {eu.is_primary && <span className="text-amber-500">⭐</span>}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}

                        {/* Jika belum ada respon/eskalasi */}
                        {ticketData.stats.totalResponses === 0 && ticketData.stats.totalEscalations === 0 && !ticketData.stats.isResolved && (
                          <div className="mt-3 p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-100 dark:border-blue-800/50 shadow-lg relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-400/10 rounded-full blur-2xl"></div>
                            <div className="relative z-10">
                              <div className="flex items-center gap-2 mb-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                                  <User className="text-white w-4 h-4" />
                                </div>
                                <h5 className="text-xs font-black text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                                  Status
                                </h5>
                              </div>
                              <p className="text-xs leading-relaxed text-slate-700 dark:text-blue-100">
                                Laporan Anda telah diverifikasi oleh unit{' '}
                                <strong className="font-black text-blue-700 dark:text-blue-300">{ticketData.ticket.unit?.name || 'terkait'}</strong>. 
                                Saat ini sedang dalam tahap persetujuan dan tindak lanjut.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Step 3: Selesai - Hanya tampil jika tiket sudah resolved */}
                  {ticketData.stats.isResolved && ticketData.ticket.resolved_at && (
                    <div className="flex gap-4 relative">
                      <div className="relative z-10 w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white ring-4 ring-white dark:ring-slate-800 shadow-lg shadow-emerald-500/30 animate-pulse">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col flex-grow bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-2xl p-5 shadow-lg border-2 border-emerald-200 dark:border-emerald-700/50">
                        <h4 className="text-sm font-black text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                          <span className="inline-block w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                          Tiket Selesai
                        </h4>
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          Diselesaikan: {formatDate(ticketData.ticket.resolved_at)}
                        </p>
                        <div className="mt-3 p-3 bg-white/70 dark:bg-slate-800/70 rounded-xl border border-emerald-100 dark:border-emerald-800/30">
                          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                            ✅ Pengaduan Anda telah ditindaklanjuti dan diselesaikan. Terima kasih atas laporan Anda yang membantu kami meningkatkan layanan.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modern WhatsApp Notification Card */}
            <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-white dark:from-green-950/20 dark:via-emerald-950/20 dark:to-slate-800 rounded-3xl p-6 shadow-2xl shadow-green-500/10 border-2 border-green-100 dark:border-green-900/30 overflow-hidden relative">
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-400/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-400/10 rounded-full blur-2xl"></div>
              
              <div className="relative z-10">
                {!showNotificationForm ? (
                  <div className="space-y-5">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white shadow-xl shadow-green-500/30 flex-shrink-0">
                        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.631 1.433h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"></path>
                        </svg>
                      </div>
                      <div className="flex-grow">
                        <h3 className="text-base font-black text-slate-900 dark:text-white mb-1">
                          Dapatkan Pembaruan Langsung
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                          Terima notifikasi otomatis via WhatsApp setiap ada perubahan status tiket Anda
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setShowNotificationForm(true)}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-black py-4 rounded-2xl text-sm shadow-xl shadow-green-500/20 transition-all flex items-center justify-center gap-2.5 group"
                    >
                      <span>Aktifkan Notifikasi WhatsApp</span>
                      <Bell className="w-5 h-5 group-hover:animate-bounce" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider pl-1 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-green-600" />
                        Nomor WhatsApp Anda
                      </label>
                      <div className="relative flex items-center bg-white dark:bg-slate-900 rounded-2xl shadow-lg overflow-hidden border-2 border-green-200 dark:border-green-800/50">
                        <span className="absolute left-4 text-sm font-black text-slate-500">+62</span>
                        <input
                          className="w-full pl-14 pr-4 py-4 bg-transparent border-none text-sm font-semibold focus:ring-0 outline-none"
                          placeholder="81234567890"
                          type="tel"
                          value={whatsappNumber}
                          onChange={(e) => setWhatsappNumber(e.target.value.replace(/\D/g, ''))}
                        />
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-white/70 dark:bg-slate-900/40 rounded-2xl border-2 border-green-100 dark:border-green-800/30">
                      <input
                        className="w-5 h-5 text-green-600 border-green-300 rounded-lg focus:ring-green-500/20 mt-0.5"
                        id="ai-insight-wa"
                        type="checkbox"
                        checked={enableAIInsights}
                        onChange={(e) => setEnableAIInsights(e.target.checked)}
                      />
                      <label className="flex flex-col cursor-pointer flex-grow" htmlFor="ai-insight-wa">
                        <span className="text-xs font-black text-slate-800 dark:text-slate-200 mb-0.5">
                          Dapatkan Wawasan AI via WhatsApp
                        </span>
                        <span className="text-[10px] text-slate-600 dark:text-slate-400 leading-relaxed">
                          Kirim ringkasan progres otomatis oleh AI untuk memudahkan pemantauan
                        </span>
                      </label>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowNotificationForm(false)}
                        className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold py-3.5 rounded-2xl text-sm transition-all"
                      >
                        Batal
                      </button>
                      <button
                        onClick={handleActivateNotification}
                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-black py-3.5 rounded-2xl text-sm shadow-xl shadow-green-500/20 transition-all flex items-center justify-center gap-2"
                      >
                        <span>Aktifkan</span>
                        <Bell className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modern Ticket Details Card */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-100 dark:border-slate-700">
              <h3 className="text-base font-black mb-5 flex items-center gap-2.5 text-slate-900 dark:text-white">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <FileText className="text-white w-5 h-5" />
                </div>
                Rincian Tiket
              </h3>

              <div className="space-y-4">
                {/* Judul Tiket */}
                <div className="p-4 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900/50 dark:to-blue-900/20 rounded-2xl border border-slate-100 dark:border-slate-700">
                  <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    Judul Pengaduan
                  </p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white break-words leading-relaxed">
                    {ticketData.ticket.title}
                  </p>
                </div>

                {/* Deskripsi */}
                <div className="p-4 bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-slate-900/50 dark:to-indigo-900/20 rounded-2xl border border-slate-100 dark:border-slate-700">
                  <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                    Deskripsi
                  </p>
                  <p className="text-xs text-slate-700 dark:text-slate-300 break-words whitespace-pre-wrap leading-relaxed">
                    {ticketData.ticket.description || '-'}
                  </p>
                </div>

                {/* Grid Info with Modern Cards */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-slate-900/50 rounded-2xl border border-blue-100 dark:border-blue-800/30 shadow-sm">
                    <p className="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2">Kategori</p>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center shadow-md shadow-blue-500/20">
                        <Tag className="text-white w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {ticketData.ticket.category?.name || 'Umum'}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-orange-50 to-white dark:from-orange-900/20 dark:to-slate-900/50 rounded-2xl border border-orange-100 dark:border-orange-800/30 shadow-sm">
                    <p className="text-[9px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-wider mb-2">Prioritas</p>
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shadow-md ${
                        ticketData.ticket.priority === 'urgent' ? 'bg-red-500 shadow-red-500/20' :
                        ticketData.ticket.priority === 'high' ? 'bg-orange-500 shadow-orange-500/20' :
                        ticketData.ticket.priority === 'medium' ? 'bg-blue-500 shadow-blue-500/20' :
                        'bg-gray-500 shadow-gray-500/20'
                      }`}>
                        {getPriorityInfo(ticketData.ticket.priority).icon}
                      </div>
                      <span className={`text-xs font-bold ${getPriorityInfo(ticketData.ticket.priority).color}`}>
                        {getPriorityInfo(ticketData.ticket.priority).label}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/20 dark:to-slate-900/50 rounded-2xl border border-purple-100 dark:border-purple-800/30 shadow-sm">
                    <p className="text-[9px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-2">Lokasi</p>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-purple-500 rounded-lg flex items-center justify-center shadow-md shadow-purple-500/20">
                        <MapPin className="text-white w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {ticketData.ticket.unit?.name || '-'}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-900/20 dark:to-slate-900/50 rounded-2xl border border-indigo-100 dark:border-indigo-800/30 shadow-sm">
                    <p className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-2">Tgl Masuk</p>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-indigo-500 rounded-lg flex items-center justify-center shadow-md shadow-indigo-500/20">
                        <Calendar className="text-white w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{formatDateShort(ticketData.ticket.created_at)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modern Timeline History */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-100 dark:border-slate-700">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-base font-black flex items-center gap-2.5 text-slate-900 dark:text-white">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                    <Clock className="text-white w-5 h-5" />
                  </div>
                  Riwayat Pembaruan
                </h3>
                <button className="text-xs font-bold text-blue-600 hover:text-blue-700 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg transition-colors">
                  Semua
                </button>
              </div>

              <div className="space-y-4">
                {ticketData.timeline.length > 0 ? (
                  ticketData.timeline.slice(0, 3).map((event, index) => (
                    <div key={index} className="flex gap-4 pb-4 border-b border-slate-100 dark:border-slate-700 last:border-0 group hover:bg-slate-50 dark:hover:bg-slate-900/30 -mx-2 px-2 py-2 rounded-xl transition-colors">
                      <div className={`w-3 h-3 mt-1.5 rounded-full flex-shrink-0 ${
                        index === 0 
                          ? 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/50 ring-4 ring-blue-100 dark:ring-blue-900/30' 
                          : 'bg-slate-300 dark:bg-slate-600'
                      }`}></div>
                      <div className="flex-grow">
                        <p className={`text-sm font-bold ${index === 0 ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}>
                          {event.title}
                        </p>
                        <div className="flex justify-between items-center mt-1.5">
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                            <Calendar className="w-3 h-3" />
                            {formatDate(event.timestamp)}
                          </p>
                          <span className={`text-[9px] font-bold px-2 py-1 rounded-full ${
                            event.type === 'system' 
                              ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' 
                              : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                          }`}>
                            {event.type === 'system' ? 'Sistem' : 'Admin'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="flex gap-4 pb-4 border-b border-slate-100 dark:border-slate-700 group hover:bg-slate-50 dark:hover:bg-slate-900/30 -mx-2 px-2 py-2 rounded-xl transition-colors">
                      <div className="w-3 h-3 mt-1.5 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/50 ring-4 ring-blue-100 dark:ring-blue-900/30 flex-shrink-0"></div>
                      <div className="flex-grow">
                        <p className="text-sm font-bold text-blue-600 dark:text-blue-400">Verifikasi Dokumen Selesai</p>
                        <div className="flex justify-between items-center mt-1.5">
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                            <Calendar className="w-3 h-3" />
                            Hari ini, 09:30 WIB
                          </p>
                          <span className="text-[9px] font-bold px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                            Sistem
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-4 pb-4 border-b border-slate-100 dark:border-slate-700 group hover:bg-slate-50 dark:hover:bg-slate-900/30 -mx-2 px-2 py-2 rounded-xl transition-colors">
                      <div className="w-3 h-3 mt-1.5 rounded-full bg-slate-300 dark:bg-slate-600 flex-shrink-0"></div>
                      <div className="flex-grow">
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Laporan Diteruskan ke Unit</p>
                        <div className="flex justify-between items-center mt-1.5">
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                            <Calendar className="w-3 h-3" />
                            {formatDate(ticketData.ticket.created_at)}
                          </p>
                          <span className="text-[9px] font-bold px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                            Admin
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-4 group hover:bg-slate-50 dark:hover:bg-slate-900/30 -mx-2 px-2 py-2 rounded-xl transition-colors">
                      <div className="w-3 h-3 mt-1.5 rounded-full bg-slate-300 dark:bg-slate-600 flex-shrink-0"></div>
                      <div className="flex-grow">
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Tiket Berhasil Dibuat</p>
                        <div className="flex justify-between items-center mt-1.5">
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                            <Calendar className="w-3 h-3" />
                            {formatDate(ticketData.ticket.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Modern Contact Support Cards */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <a 
                href={`tel:${appSettings.call_center_number}`}
                className="group p-5 bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-slate-800 rounded-2xl border-2 border-blue-100 dark:border-blue-800/30 text-center space-y-3 hover:shadow-xl hover:scale-105 transition-all shadow-lg shadow-blue-500/10"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">Call Center</p>
                  <p className="text-sm text-blue-700 dark:text-blue-300 font-black">{appSettings.call_center_number || '112'}</p>
                </div>
              </a>
              <a 
                href={appSettings.whatsapp_help_number ? `https://wa.me/${appSettings.whatsapp_help_number}` : '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="group p-5 bg-gradient-to-br from-green-50 to-white dark:from-green-900/20 dark:to-slate-800 rounded-2xl border-2 border-green-100 dark:border-green-800/30 text-center space-y-3 hover:shadow-xl hover:scale-105 transition-all shadow-lg shadow-green-500/10"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-green-500/30 group-hover:scale-110 transition-transform">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-green-600 dark:text-green-400 uppercase tracking-wider mb-1">WhatsApp</p>
                  <p className="text-sm text-green-700 dark:text-green-300 font-black">Chat Sekarang</p>
                </div>
              </a>
            </div>
          </section>
        )}
      </main>

      {/* Modern Footer */}
      <footer className="mt-auto bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 border-t-2 border-slate-200 dark:border-slate-700 py-8 px-4">
        <div className="max-w-md mx-auto space-y-5">
          {/* Logo & Institution */}
          <div className="flex items-center justify-center gap-4">
            {appSettings.logo_url && (
              <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl shadow-lg flex items-center justify-center p-2">
                <img src={appSettings.logo_url} alt="Logo" className="w-full h-full object-contain" />
              </div>
            )}
            <div className="text-center">
              <p className="text-base font-black text-slate-900 dark:text-white">{appSettings.institution_name}</p>
              {appSettings.institution_address && (
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 max-w-xs">{appSettings.institution_address}</p>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-600 to-transparent"></div>

          {/* Footer Text */}
          <div className="text-center">
            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
              {appSettings.app_footer || `© ${new Date().getFullYear()} ${appSettings.institution_name}. Hak Cipta Dilindungi.`}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TrackTicket;
