import { useState } from 'react';

interface TicketInfo {
  ticket_number: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
  unit_name?: string;
  category_name?: string;
}

export default function TrackTicket() {
  const [ticketNumber, setTicketNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ticketInfo, setTicketInfo] = useState<TicketInfo | null>(null);

  const handleSearchWithTicket = async (ticket: string) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3004';
      const url = `${apiUrl}/api/public/track-ticket?ticket=${encodeURIComponent(ticket)}`;
      
      console.log('🔍 Fetching ticket from:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.log('❌ Response bukan JSON:', contentType);
        const text = await response.text();
        console.log('❌ Response text:', text);
        throw new Error('Server mengembalikan response yang tidak valid. Silakan coba lagi.');
      }

      const data = await response.json();
      console.log('✅ Response data:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Gagal melacak tiket');
      }

      if (data.success && data.data?.ticket) {
        const ticketData = data.data.ticket;
        setTicketInfo({
          ticket_number: ticketData.ticket_number,
          title: ticketData.title,
          description: ticketData.description,
          status: ticketData.status,
          priority: ticketData.priority,
          created_at: ticketData.created_at,
          unit_name: ticketData.unit?.name,
          category_name: ticketData.category?.name
        });
      } else {
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
    setTicketInfo(null);

    try {
      await handleSearchWithTicket(ticketNumber.trim());
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat mencari tiket.');
    } finally {
      setLoading(false);
    }
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
        {ticketInfo && (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-blue-600 p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold">{ticketInfo.ticket_number}</h2>
                <span className="material-symbols-outlined text-3xl">confirmation_number</span>
              </div>
              <p className="text-blue-100">Informasi Detail Tiket</p>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Status & Priority */}
              <div className="flex flex-wrap gap-3">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Status</p>
                  {getStatusBadge(ticketInfo.status)}
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Prioritas</p>
                  {getPriorityBadge(ticketInfo.priority)}
                </div>
              </div>

              {/* Title */}
              <div>
                <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Judul</h3>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">{ticketInfo.title}</p>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Deskripsi</h3>
                <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{ticketInfo.description}</p>
              </div>

              {/* Additional Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                {ticketInfo.unit_name && (
                  <div>
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Unit</h3>
                    <p className="text-slate-900 dark:text-white">{ticketInfo.unit_name}</p>
                  </div>
                )}
                {ticketInfo.category_name && (
                  <div>
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Kategori</h3>
                    <p className="text-slate-900 dark:text-white">{ticketInfo.category_name}</p>
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Tanggal Dibuat</h3>
                  <p className="text-slate-900 dark:text-white">{formatDate(ticketInfo.created_at)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Help Text */}
        {!ticketInfo && !error && (
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
