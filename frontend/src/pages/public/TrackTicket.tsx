import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, CheckCircle, Clock, AlertCircle, TrendingUp, MessageCircle, FileText } from 'lucide-react';

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

const TrackTicket: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [ticketNumber, setTicketNumber] = useState('');
  const [ticketData, setTicketData] = useState<TicketData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/public/track/${ticket.trim()}`
      );

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

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; color: string }> = {
      open: { label: 'Terbuka', color: 'bg-blue-100 text-blue-800' },
      in_progress: { label: 'Dalam Proses', color: 'bg-yellow-100 text-yellow-800' },
      resolved: { label: 'Selesai', color: 'bg-green-100 text-green-800' },
      closed: { label: 'Ditutup', color: 'bg-gray-100 text-gray-800' },
      pending: { label: 'Menunggu', color: 'bg-orange-100 text-orange-800' },
    };

    const config = statusConfig[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig: Record<string, { label: string; color: string }> = {
      low: { label: 'Rendah', color: 'bg-gray-100 text-gray-800' },
      medium: { label: 'Sedang', color: 'bg-blue-100 text-blue-800' },
      high: { label: 'Tinggi', color: 'bg-orange-100 text-orange-800' },
      urgent: { label: 'Mendesak', color: 'bg-red-100 text-red-800' },
    };

    const config = priorityConfig[priority] || { label: priority, color: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getTimelineIcon = (iconName: string, color: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      add_circle: <FileText className="w-5 h-5" />,
      reply: <MessageCircle className="w-5 h-5" />,
      chat: <MessageCircle className="w-5 h-5" />,
      check_circle: <CheckCircle className="w-5 h-5" />,
      task_alt: <CheckCircle className="w-5 h-5" />,
      trending_up: <TrendingUp className="w-5 h-5" />,
    };

    const colorMap: Record<string, string> = {
      blue: 'bg-blue-100 text-blue-600',
      emerald: 'bg-emerald-100 text-emerald-600',
      orange: 'bg-orange-100 text-orange-600',
      red: 'bg-red-100 text-red-600',
    };

    return (
      <div className={`p-3 rounded-full ${colorMap[color] || 'bg-gray-100 text-gray-600'}`}>
        {iconMap[iconName] || <Clock className="w-5 h-5" />}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Lacak Tiket Pengaduan</h1>
          <p className="mt-2 text-gray-600">
            Masukkan nomor tiket untuk melihat status dan progres pengaduan Anda
          </p>
        </div>
      </div>

      {/* Search Form */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={ticketNumber}
                onChange={(e) => setTicketNumber(e.target.value.toUpperCase())}
                placeholder="Masukkan nomor tiket (contoh: TKT-2025-0001)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            >
              <Search className="w-5 h-5" />
              {loading ? 'Mencari...' : 'Lacak Tiket'}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-800">{error}</p>
            </div>
          )}
        </div>

        {/* Ticket Details */}
        {ticketData && (
          <div className="space-y-6">
            {/* Ticket Info Card */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-emerald-600 px-6 py-4">
                <h2 className="text-2xl font-bold text-white">
                  {ticketData.ticket.ticket_number}
                </h2>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {ticketData.ticket.title}
                  </h3>
                  <p className="text-gray-600">{ticketData.ticket.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Status</p>
                    {getStatusBadge(ticketData.ticket.status)}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Prioritas</p>
                    {getPriorityBadge(ticketData.ticket.priority)}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Unit</p>
                    <p className="font-medium text-gray-900">
                      {ticketData.ticket.unit?.name || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Kategori</p>
                    <p className="font-medium text-gray-900">
                      {ticketData.ticket.category?.name || '-'}
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <MessageCircle className="w-8 h-8 text-blue-600" />
                      <div>
                        <p className="text-2xl font-bold text-blue-900">
                          {ticketData.stats.totalResponses}
                        </p>
                        <p className="text-sm text-blue-700">Tanggapan</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-orange-50 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-8 h-8 text-orange-600" />
                      <div>
                        <p className="text-2xl font-bold text-orange-900">
                          {ticketData.stats.totalEscalations}
                        </p>
                        <p className="text-sm text-orange-700">Eskalasi</p>
                      </div>
                    </div>
                  </div>

                  <div className={`rounded-lg p-4 ${
                    ticketData.stats.isResolved 
                      ? 'bg-emerald-50' 
                      : ticketData.stats.isOverSLA 
                      ? 'bg-red-50' 
                      : 'bg-yellow-50'
                  }`}>
                    <div className="flex items-center gap-3">
                      {ticketData.stats.isResolved ? (
                        <CheckCircle className="w-8 h-8 text-emerald-600" />
                      ) : ticketData.stats.isOverSLA ? (
                        <AlertCircle className="w-8 h-8 text-red-600" />
                      ) : (
                        <Clock className="w-8 h-8 text-yellow-600" />
                      )}
                      <div>
                        <p className={`text-2xl font-bold ${
                          ticketData.stats.isResolved 
                            ? 'text-emerald-900' 
                            : ticketData.stats.isOverSLA 
                            ? 'text-red-900' 
                            : 'text-yellow-900'
                        }`}>
                          {ticketData.stats.isResolved 
                            ? 'Selesai' 
                            : ticketData.stats.isOverSLA 
                            ? 'Terlambat' 
                            : 'Proses'}
                        </p>
                        <p className={`text-sm ${
                          ticketData.stats.isResolved 
                            ? 'text-emerald-700' 
                            : ticketData.stats.isOverSLA 
                            ? 'text-red-700' 
                            : 'text-yellow-700'
                        }`}>
                          Status SLA
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Timeline Progres</h3>

              <div className="space-y-6">
                {ticketData.timeline.map((event, index) => (
                  <div key={index} className="flex gap-4">
                    {/* Icon */}
                    <div className="flex-shrink-0">
                      {getTimelineIcon(event.icon, event.color)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-6 border-b border-gray-200 last:border-0">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-lg font-semibold text-gray-900">
                          {event.title}
                        </h4>
                        <span className="text-sm text-gray-500 whitespace-nowrap ml-4">
                          {formatDate(event.timestamp)}
                        </span>
                      </div>
                      <p className="text-gray-600">{event.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {ticketData.timeline.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p>Belum ada aktivitas pada tiket ini</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackTicket;
