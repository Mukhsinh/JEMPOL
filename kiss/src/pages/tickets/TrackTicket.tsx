import { useState } from 'react';

interface TimelineEvent {
  type: string;
  title: string;
  description: string;
  timestamp: string;
  icon: string;
  color: string;
}

interface TicketInfo {
  id: string;
  ticket_number: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at?: string;
  resolved_at?: string;
  sla_deadline?: string;
  unit?: {
    name: string;
    code: string;
  };
  category?: {
    name: string;
  };
}

interface TrackingData {
  ticket: TicketInfo;
  timeline: TimelineEvent[];
  escalationUnits: any[];
  stats: {
    totalResponses: number;
    totalEscalations: number;
    isResolved: boolean;
    isOverSLA: boolean;
  };
}

export default function TrackTicket() {
  const [ticketNumber, setTicketNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);

  const handleSearchWithTicket = async (ticket: string) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      const url = `${apiUrl}/public/track-ticket?ticket=${encodeURIComponent(ticket)}`;
      
      console.log('🔍 Fetching ticket from:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Response status:', response.status);

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.log('❌ Response bukan JSON:', contentType);
        const text = await response.text();
        console.log('❌ Response text:', text);
        throw new Error('Server mengembalikan response yang tidak valid. Silakan coba lagi.');
      }

      const data = await response.json();
      console.log('📊 Response data:', data);

      if (!response.ok) {
        console.log('❌ Response not OK:', response.status, data);
        throw new Error(data.error || 'Gagal melacak tiket');
      }

      if (data.success && data.data) {
        console.log('✅ Ticket data valid, setting state');
        setTrackingData(data.data);
      } else {
        console.log('❌ Data structure invalid:', data);
        throw new Error('Data tiket tidak valid');
      }
    } catch (err: any) {
      console.error('❌ Error tracking ticket:', err);
      throw err;
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!ticketNumber.trim()) {
      setError('Silakan masukkan nomor tiket');
      return;
    }

    setLoading(true);
    setError('');
    setTrackingData(null);

    try {
      await handleSearchWithTicket(ticketNumber.trim());
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat mencari tiket.');
    } finally {
      setLoading(false);
    }
  };

  const getIconColor = (color: string) => {
    const colorMap: Record<string, string> = {
      'blue': 'text-blue-600 bg-blue-100',
      'emerald': 'text-emerald-600 bg-emerald-100',
      'orange': 'text-orange-600 bg-orange-100',
      'red': 'text-red-600 bg-red-100',
      'gray': 'text-gray-600 bg-gray-100'
    };
    return colorMap[color] || 'text-gray-600 bg-gray-100';
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      'open': { label: 'Terbuka', className: 'bg-blue-100 text-blue-800' },
      'in_progress': { label: 'Dalam Proses', className: 'bg-yellow-100 text-yellow-800' },
      'resolved': { label: 'Selesai', className: 'bg-green-100 text-green-800' },
      'closed': { label: 'Ditutup', className: 'bg-gray-100 text-gray-800' },
      'pending': { label: 'Menunggu', className: 'bg-orange-100 text-orange-800' }
    };

    const statusInfo = statusMap[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
    
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.className}`}>
        {statusInfo.label}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityMap: Record<string, { label: string; className: string }> = {
      'low': { label: 'Rendah', className: 'bg-gray-100 text-gray-800' },
      'medium': { label: 'Sedang', className: 'bg-blue-100 text-blue-800' },
      'high': { label: 'Tinggi', className: 'bg-orange-100 text-orange-800' },
      'urgent': { label: 'Mendesak', className: 'bg-red-100 text-red-800' }
    };

    const priorityInfo = priorityMap[priority] || { label: priority, className: 'bg-gray-100 text-gray-800' };
    
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${priorityInfo.className}`}>
        {priorityInfo.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Lacak Tiket
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Masukkan nomor tiket untuk melacak status pengaduan Anda
          </p>
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
                  placeholder="Contoh: TKT-2024-001"
                  className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-slate-700 dark:text-white"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="material-symbols-outlined animate-spin">refresh</span>
                      Mencari...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined">search</span>
                      Lacak
                    </>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
                <span className="material-symbols-outlined">error</span>
                <p>{error}</p>
              </div>
            )}
          </form>
        </div>

        {/* Ticket Information */}
        {trackingData && (
          <div className="space-y-6">
            {/* Ticket Card */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-primary to-blue-600 p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xl font-bold">{trackingData.ticket.ticket_number}</h2>
                  <span className="material-symbols-outlined text-3xl">confirmation_number</span>
                </div>
                <p className="text-blue-100">Informasi Detail Tiket</p>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="material-symbols-outlined text-blue-600 text-[20px]">chat</span>
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Respon</p>
                    </div>
                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{trackingData.stats.totalResponses}</p>
                  </div>
                  <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="material-symbols-outlined text-orange-600 text-[20px]">trending_up</span>
                      <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">Eskalasi</p>
                    </div>
                    <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{trackingData.stats.totalEscalations}</p>
                  </div>
                  <div className={`p-4 rounded-lg ${trackingData.stats.isResolved ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-yellow-50 dark:bg-yellow-900/20'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`material-symbols-outlined text-[20px] ${trackingData.stats.isResolved ? 'text-emerald-600' : 'text-yellow-600'}`}>
                        {trackingData.stats.isResolved ? 'check_circle' : 'pending'}
                      </span>
                      <p className={`text-xs font-medium ${trackingData.stats.isResolved ? 'text-emerald-600 dark:text-emerald-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                        Status
                      </p>
                    </div>
                    <p className={`text-sm font-bold ${trackingData.stats.isResolved ? 'text-emerald-900 dark:text-emerald-100' : 'text-yellow-900 dark:text-yellow-100'}`}>
                      {trackingData.stats.isResolved ? 'Selesai' : 'Proses'}
                    </p>
                  </div>
                  <div className={`p-4 rounded-lg ${trackingData.stats.isOverSLA ? 'bg-red-50 dark:bg-red-900/20' : 'bg-emerald-50 dark:bg-emerald-900/20'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`material-symbols-outlined text-[20px] ${trackingData.stats.isOverSLA ? 'text-red-600' : 'text-emerald-600'}`}>
                        {trackingData.stats.isOverSLA ? 'schedule' : 'timer'}
                      </span>
                      <p className={`text-xs font-medium ${trackingData.stats.isOverSLA ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        SLA
                      </p>
                    </div>
                    <p className={`text-sm font-bold ${trackingData.stats.isOverSLA ? 'text-red-900 dark:text-red-100' : 'text-emerald-900 dark:text-emerald-100'}`}>
                      {trackingData.stats.isOverSLA ? 'Terlewat' : 'Tepat Waktu'}
                    </p>
                  </div>
                </div>

                {/* Status & Priority */}
                <div className="flex flex-wrap gap-3">
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Status</p>
                    {getStatusBadge(trackingData.ticket.status)}
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Prioritas</p>
                    {getPriorityBadge(trackingData.ticket.priority)}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Judul</h3>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">{trackingData.ticket.title}</p>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Deskripsi</h3>
                  <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{trackingData.ticket.description}</p>
                </div>

                {/* Additional Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                  {trackingData.ticket.unit && (
                    <div>
                      <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Unit</h3>
                      <p className="text-slate-900 dark:text-white">{trackingData.ticket.unit.name}</p>
                    </div>
                  )}
                  {trackingData.ticket.category && (
                    <div>
                      <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Kategori</h3>
                      <p className="text-slate-900 dark:text-white">{trackingData.ticket.category.name}</p>
                    </div>
                  )}
                  <div>
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Tanggal Dibuat</h3>
                    <p className="text-slate-900 dark:text-white">{formatDate(trackingData.ticket.created_at)}</p>
                  </div>
                  {trackingData.ticket.resolved_at && (
                    <div>
                      <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Tanggal Selesai</h3>
                      <p className="text-slate-900 dark:text-white">{formatDate(trackingData.ticket.resolved_at)}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Timeline */}
            {trackingData.timeline && trackingData.timeline.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined">timeline</span>
                  Timeline Tiket
                </h3>
                <div className="space-y-4">
                  {trackingData.timeline.map((event, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getIconColor(event.color)}`}>
                          <span className="material-symbols-outlined text-[20px]">{event.icon}</span>
                        </div>
                        {index < trackingData.timeline.length - 1 && (
                          <div className="w-0.5 h-full bg-slate-200 dark:bg-slate-700 mt-2"></div>
                        )}
                      </div>
                      <div className="flex-1 pb-6">
                        <div className="flex items-start justify-between mb-1">
                          <h4 className="font-semibold text-slate-900 dark:text-white">{event.title}</h4>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {formatDate(event.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{event.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Help Text */}
        {!trackingData && !error && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">info</span>
              <div className="text-sm text-blue-800 dark:text-blue-300">
                <p className="font-medium mb-1">Cara Melacak Tiket:</p>
                <ul className="list-disc list-inside space-y-1 text-blue-700 dark:text-blue-400">
                  <li>Masukkan nomor tiket yang Anda terima saat membuat pengaduan</li>
                  <li>Nomor tiket biasanya dalam format: TKT-YYYY-XXX</li>
                  <li>Pastikan nomor tiket yang dimasukkan benar</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
