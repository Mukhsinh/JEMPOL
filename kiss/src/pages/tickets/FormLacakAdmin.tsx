import { useState } from 'react';
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

const FormLacakAdmin = () => {
  const [ticketNumber, setTicketNumber] = useState('');
  const [ticket, setTicket] = useState<PublicTicket | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

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

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Lacak Tiket</h1>
        <p className="text-slate-600 dark:text-slate-400">Cari dan lacak status tiket pengaduan</p>
      </div>

      {/* Search Form */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <label htmlFor="ticketNumber" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Nomor Tiket
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                id="ticketNumber"
                value={ticketNumber}
                onChange={(e) => setTicketNumber(e.target.value)}
                placeholder="Contoh: TKT-2024-0001"
                className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-slate-700 dark:text-white"
              />
              <button
                type="submit"
                disabled={loading || !ticketNumber.trim()}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {loading ? 'Mencari...' : 'Cari'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Error Message */}
      {searched && error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-red-600 dark:text-red-400">error</span>
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        </div>
      )}

      {/* Ticket Details */}
      {ticket && (
        <div className="space-y-6">
          {/* Ticket Info Card */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{ticket.title}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">#{ticket.ticket_number}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(ticket.status)}`}>
                {getStatusLabel(ticket.status)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Tipe</p>
                <p className="font-medium text-slate-900 dark:text-white">{ticket.type === 'internal' ? 'Internal' : 'Eksternal'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Prioritas</p>
                <p className="font-medium text-slate-900 dark:text-white">{getPriorityLabel(ticket.priority)}</p>
              </div>
              {ticket.units && (
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Unit</p>
                  <p className="font-medium text-slate-900 dark:text-white">{ticket.units.name}</p>
                </div>
              )}
              {ticket.service_categories && (
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Kategori</p>
                  <p className="font-medium text-slate-900 dark:text-white">{ticket.service_categories.name}</p>
                </div>
              )}
            </div>

            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Deskripsi</p>
              <p className="text-slate-700 dark:text-slate-300">{ticket.description}</p>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Timeline</h3>
            <div className="space-y-4">
              {timeline.map((event, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full bg-${event.color}-100 dark:bg-${event.color}-900/20 flex items-center justify-center`}>
                      <span className={`material-symbols-outlined text-${event.color}-600 dark:text-${event.color}-400 text-xl`}>
                        {event.icon}
                      </span>
                    </div>
                    {index < timeline.length - 1 && (
                      <div className="w-0.5 h-full bg-slate-200 dark:bg-slate-700 mt-2"></div>
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <h4 className="font-semibold text-slate-900 dark:text-white">{event.title}</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{event.description}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">{formatDate(event.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Responses */}
          {ticket.ticket_responses && ticket.ticket_responses.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Riwayat Respon</h3>
              <div className="space-y-4">
                {ticket.ticket_responses.map((response) => (
                  <div key={response.id} className="border-l-4 border-primary pl-4 py-2">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-slate-900 dark:text-white">
                        {response.users?.full_name || 'Admin'}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {formatDate(response.created_at)}
                      </p>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300">{response.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty State - Before Search */}
      {!searched && !loading && (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-primary text-4xl">search</span>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Cari Tiket Anda</h3>
          <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
            Masukkan nomor tiket pada form di atas untuk melihat status dan riwayat pengaduan Anda
          </p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Mencari tiket...</p>
        </div>
      )}
    </div>
  );
};

export default FormLacakAdmin;
