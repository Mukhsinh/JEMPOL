import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { complaintService } from '../../services/complaintService';
import { supabase } from '../../utils/supabaseClient';

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
  }>;
}

interface AppSettings {
  app_name: string;
  app_footer: string;
  institution_name: string;
  logo_url: string;
}

const hospitalServices = [
  { id: 1, name: 'IGD 24 Jam', icon: '🏥', bgColor: 'bg-red-500' },
  { id: 2, name: 'Rawat Inap', icon: '🛏️', bgColor: 'bg-blue-500' },
  { id: 3, name: 'Laboratorium', icon: '🔬', bgColor: 'bg-purple-500' },
  { id: 4, name: 'Radiologi', icon: '📷', bgColor: 'bg-cyan-500' },
  { id: 5, name: 'Farmasi', icon: '💊', bgColor: 'bg-emerald-500' },
  { id: 6, name: 'Poliklinik', icon: '👨‍⚕️', bgColor: 'bg-amber-500' },
  { id: 7, name: 'Rehabilitasi', icon: '🏃', bgColor: 'bg-pink-500' },
  { id: 8, name: 'Gizi & Nutrisi', icon: '🥗', bgColor: 'bg-lime-500' },
];

const TicketTracker = () => {
  const navigate = useNavigate();
  const [ticketNumber, setTicketNumber] = useState('');
  const [ticket, setTicket] = useState<PublicTicket | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  const [appSettings] = useState<AppSettings>({
    app_name: 'Sistem Pengaduan Terpadu',
    app_footer: '',
    institution_name: 'Rumah Sakit Kota',
    logo_url: '',
  });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketNumber.trim()) return;
    setLoading(true);
    setError('');
    setTicket(null);
    setSearched(true);
    try {
      // Try backend first
      const response = await complaintService.getPublicTicket(ticketNumber);
      if (response.success && response.data) {
        setTicket(response.data);
      } else {
        // Fallback to Supabase direct
        console.log('Backend failed, trying Supabase direct...');
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
            units:unit_id(name, code),
            service_categories:category_id(name),
            ticket_responses:ticket_responses(id, message, response_type, created_at)
          `)
          .eq('ticket_number', ticketNumber.trim())
          .single();

        if (supabaseError || !data) {
          setError('Tiket tidak ditemukan. Pastikan nomor tiket benar.');
        } else {
          setTicket(data as any);
        }
      }
    } catch (err) {
      console.error('Error searching ticket:', err);
      setError('Terjadi kesalahan saat mencari tiket. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (s: string) =>
    ({ open: 'Dibuka', in_progress: 'Sedang Diproses', resolved: 'Selesai', closed: 'Ditutup', pending: 'Menunggu' }[s] || s);

  const getStatusColor = (s: string) =>
    s === 'resolved' || s === 'closed'
      ? 'bg-emerald-500 text-white'
      : s === 'in_progress'
      ? 'bg-blue-500 text-white'
      : s === 'pending'
      ? 'bg-amber-500 text-white'
      : 'bg-gray-500 text-white';

  const getPriorityLabel = (p: string) =>
    ({ low: 'Rendah', medium: 'Sedang', high: 'Tinggi', urgent: 'Mendesak' }[p] || p);

  return (
    <div className="bg-gray-50 font-sans text-gray-900 flex flex-col min-h-screen">
      {/* Header */}
      <header className="flex items-center justify-between bg-white border-b border-gray-200 px-4 py-3 md:px-8 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          {appSettings.logo_url ? (
            <img src={appSettings.logo_url} alt="Logo" className="h-10 w-10 object-contain rounded-lg" />
          ) : (
            <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-blue-600">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          )}
          <div>
            <h2 className="text-gray-900 text-base md:text-lg font-bold">{appSettings.app_name}</h2>
            <p className="text-xs text-gray-500">{appSettings.institution_name}</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/login')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
          <span className="hidden sm:inline">Masuk Petugas</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center">
        {/* Hero Section */}
        <section className="w-full py-10 md:py-16 px-4 flex justify-center bg-blue-50">
          <div className="w-full max-w-4xl flex flex-col items-center text-center gap-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-full text-sm font-medium shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Layanan Aktif 24/7
            </div>
            <h1 className="text-gray-900 text-3xl md:text-5xl font-extrabold">
              Lacak Status <span className="text-blue-600">Tiket Anda</span>
            </h1>
            <p className="text-gray-600 text-base md:text-lg max-w-xl">
              Masukkan nomor tiket untuk melihat status terbaru penanganan laporan Anda.
            </p>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="w-full max-w-xl flex flex-col sm:flex-row rounded-2xl bg-white shadow-lg p-2 border border-gray-200">
              <div className="flex w-full items-center px-3 py-2 sm:py-0 gap-3">
                <div className="p-2 rounded-lg bg-blue-100">
                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  className="w-full bg-transparent border-none p-2 text-gray-900 placeholder:text-gray-400 focus:outline-none"
                  placeholder="Masukkan Nomor Tiket (Contoh: TKT-2024-0001)"
                  value={ticketNumber}
                  onChange={(e) => setTicketNumber(e.target.value)}
                />
              </div>
              <div className="p-1 sm:w-auto w-full">
                <button
                  type="submit"
                  disabled={loading || !ticketNumber.trim()}
                  className="w-full sm:w-auto h-12 px-6 bg-blue-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-blue-700 transition-colors"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <span>Mencari...</span>
                    </>
                  ) : (
                    <>
                      <span>Lacak Tiket</span>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* Mozaik Layanan Unggulan - Tampil saat belum search */}
        {!searched && (
          <section className="w-full max-w-5xl px-4 py-10">
            <h2 className="text-center text-xl md:text-2xl font-bold text-gray-800 mb-6">Layanan Unggulan Kami</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 gap-3 md:gap-4">
              {hospitalServices.map((service) => (
                <div
                  key={service.id}
                  className="flex flex-col items-center p-4 rounded-xl bg-white shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center text-2xl md:text-3xl mb-3 ${service.bgColor} bg-opacity-20`}>
                    {service.icon}
                  </div>
                  <span className="text-xs md:text-sm font-medium text-gray-700 text-center">{service.name}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Error State */}
        {searched && !loading && error && (
          <section className="w-full max-w-5xl px-4 py-8">
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center border border-red-100">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Tiket Tidak Ditemukan</h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={() => {
                  setSearched(false);
                  setTicketNumber('');
                }}
                className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium"
              >
                Coba Lagi
              </button>
            </div>
          </section>
        )}

        {/* Ticket Result */}
        {searched && !loading && ticket && (
          <section className="w-full max-w-5xl px-4 py-8">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              {/* Ticket Header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 border-b border-gray-100 gap-4 bg-gray-50">
                <div>
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h2 className="text-xl font-bold text-gray-900">Detail Status Tiket</h2>
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase ${getStatusColor(ticket.status)}`}>
                      {getStatusLabel(ticket.status)}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Dibuat: {new Date(ticket.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="bg-white px-4 py-3 rounded-xl border border-gray-200">
                  <span className="text-xs text-gray-500 uppercase font-semibold">Nomor Referensi</span>
                  <p className="text-lg font-mono font-bold text-blue-600">#{ticket.ticket_number}</p>
                </div>
              </div>

              {/* Ticket Content */}
              <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Info */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Informasi Aduan
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1">Judul</p>
                    <p className="font-semibold text-gray-900">{ticket.title}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1">Deskripsi</p>
                    <p className="text-sm text-gray-700">{ticket.description || '-'}</p>
                  </div>
                  {ticket.ticket_responses && ticket.ticket_responses.length > 0 && (
                    <div className="rounded-xl p-4 bg-blue-50 border-l-4 border-blue-600">
                      <p className="text-xs mb-2 font-semibold text-blue-600">Respon Terbaru</p>
                      <p className="text-sm text-gray-700">{ticket.ticket_responses[0].message}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(ticket.ticket_responses[0].created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  )}
                </div>

                {/* Right Column - Metadata */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="text-sm font-bold text-gray-900 mb-4">Status & Metadata</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">Prioritas</p>
                      <p className="text-sm font-semibold text-gray-900">{getPriorityLabel(ticket.priority)}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">Kategori</p>
                      <p className="text-sm font-semibold text-gray-900">{ticket.service_categories?.name || '-'}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">Unit</p>
                      <p className="text-sm font-semibold text-gray-900">{ticket.units?.name || '-'}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">Tipe</p>
                      <p className="text-sm font-semibold text-gray-900">{ticket.type === 'internal' ? 'Internal' : 'Eksternal'}</p>
                    </div>
                    {ticket.resolved_at && (
                      <div className="col-span-2 bg-emerald-50 rounded-lg p-3 border border-emerald-200">
                        <p className="text-xs text-emerald-600 mb-1">Diselesaikan</p>
                        <p className="text-sm font-semibold text-emerald-700">
                          {new Date(ticket.resolved_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="px-6 pb-6 flex flex-wrap gap-3">
                <button
                  onClick={() => {
                    setSearched(false);
                    setTicketNumber('');
                    setTicket(null);
                  }}
                  className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Cari Tiket Lain
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-5 py-2.5 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 font-medium flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Cetak
                </button>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 px-4 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-center items-center gap-3">
          {appSettings.logo_url ? (
            <img src={appSettings.logo_url} alt="Logo" className="h-8 w-8 object-contain rounded-lg" />
          ) : (
            <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-blue-600">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          )}
          <p className="text-gray-600 text-sm text-center">
            {appSettings.app_footer || `© ${new Date().getFullYear()} ${appSettings.institution_name}`}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default TicketTracker;
