import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { downloadInternalTicketPDF } from '../../utils/pdfGenerator';

interface FormData {
  reporter_name: string;
  reporter_email: string;
  reporter_phone: string;
  reporter_department: string;
  reporter_position: string;
  category: string;
  priority: string;
  title: string;
  description: string;
}

// Standalone Form - Tiket Internal (Tanpa Login, Tanpa Sidebar, Clean)
// Route: /standalone/internal-ticket?unit_id=xxx&unit_name=xxx
// Untuk digunakan di QR Code Management - Kolom Redirect URL
const StandaloneInternalTicketForm: React.FC = () => {
  const [searchParams] = useSearchParams();
  
  const unitId = searchParams.get('unit_id') || '';
  const unitName = decodeURIComponent(searchParams.get('unit_name') || '');
  
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ticketNumber, setTicketNumber] = useState('');
  const [submittedTicketData, setSubmittedTicketData] = useState<any>(null);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState<FormData>({
    reporter_name: '',
    reporter_email: '',
    reporter_phone: '',
    reporter_department: unitName || '',
    reporter_position: '',
    category: '',
    priority: 'medium',
    title: '',
    description: ''
  });

  useEffect(() => {
    if (unitName && !formData.reporter_department) {
      setFormData(prev => ({ ...prev, reporter_department: unitName }));
    }
  }, [unitName]);

  const categories = [
    { value: 'it_support', label: 'IT & Sistem', icon: '💻' },
    { value: 'facility', label: 'Fasilitas', icon: '🏥' },
    { value: 'equipment', label: 'Peralatan', icon: '🔧' },
    { value: 'hr', label: 'SDM', icon: '👥' },
    { value: 'admin', label: 'Administrasi', icon: '📋' },
    { value: 'other', label: 'Lainnya', icon: '📝' }
  ];

  const priorities = [
    { value: 'low', label: 'Rendah', color: 'bg-green-500' },
    { value: 'medium', label: 'Sedang', color: 'bg-yellow-500' },
    { value: 'high', label: 'Tinggi', color: 'bg-orange-500' },
    { value: 'critical', label: 'Kritis', color: 'bg-red-500' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/public/internal-tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          unit_id: unitId,
          source: 'web'
        })
      });
      const result = await response.json();

      if (response.ok) {
        const ticketNum = result.ticket_number || 'INT-' + Date.now();
        
        setSubmittedTicketData({
          ticket_number: ticketNum,
          title: formData.title,
          description: formData.description,
          category: categories.find(c => c.value === formData.category)?.label || '-',
          priority: formData.priority,
          unit_name: unitName || formData.reporter_department,
          reporter_name: formData.reporter_name,
          reporter_email: formData.reporter_email,
          reporter_phone: formData.reporter_phone,
          reporter_address: formData.reporter_department,
          created_at: new Date().toISOString(),
          type: 'internal'
        });
        
        setTicketNumber(ticketNum);
        setSubmitted(true);
      } else {
        setError(result.error || 'Gagal mengirim tiket');
      }
    } catch (err: any) {
      setError('Terjadi kesalahan saat mengirim tiket');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setSubmittedTicketData(null);
    setFormData({
      reporter_name: '',
      reporter_email: '',
      reporter_phone: '',
      reporter_department: unitName || '',
      reporter_position: '',
      category: '',
      priority: 'medium',
      title: '',
      description: ''
    });
  };

  const handleDownloadPDF = () => {
    if (submittedTicketData) {
      downloadInternalTicketPDF(submittedTicketData);
    }
  };

  // Success Screen
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <span className="material-symbols-outlined text-white text-5xl">check_circle</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Tiket Berhasil Dibuat!</h2>
          <p className="text-gray-500 mb-6">Tim terkait akan segera menindaklanjuti</p>
          
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 mb-6 text-white shadow-lg">
            <p className="text-white/80 text-sm mb-1">Nomor Tiket</p>
            <p className="text-3xl font-bold tracking-wider">{ticketNumber}</p>
          </div>
          
          <p className="text-gray-400 text-sm mb-6">Simpan nomor ini untuk melacak status tiket Anda</p>
          
          <button 
            onClick={handleDownloadPDF}
            className="w-full py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-emerald-500/30 active:scale-95 transition-transform mb-3 flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">download</span>
            Unduh Tiket (PDF)
          </button>
          
          <button 
            onClick={resetForm} 
            className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl font-bold text-lg shadow-lg active:scale-95 transition-transform"
          >
            Buat Tiket Baru
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="material-symbols-outlined text-white text-4xl">confirmation_number</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Buat Tiket Internal</h1>
          {unitName && (
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-xl rounded-full px-4 py-2 text-white">
              <span className="material-symbols-outlined text-sm">business</span>
              <span className="font-medium">{unitName}</span>
            </div>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-500/90 backdrop-blur-xl rounded-2xl px-4 py-3 flex items-center gap-3 text-white">
            <span className="material-symbols-outlined">error</span>
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Form Card */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="p-8 space-y-6">
            
            {/* Data Pelapor */}
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-500">person</span>
                Data Pelapor
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Lengkap *</label>
                  <input 
                    type="text" 
                    name="reporter_name" 
                    value={formData.reporter_name} 
                    onChange={handleInputChange} 
                    required
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-0 text-gray-800 transition-colors"
                    placeholder="Masukkan nama lengkap"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                    <input 
                      type="email" 
                      name="reporter_email" 
                      value={formData.reporter_email} 
                      onChange={handleInputChange} 
                      required
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-0 text-gray-800 transition-colors"
                      placeholder="email@rumahsakit.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nomor Telepon</label>
                    <input 
                      type="tel" 
                      name="reporter_phone" 
                      value={formData.reporter_phone} 
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-0 text-gray-800 transition-colors"
                      placeholder="08xxxxxxxxxx"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Unit/Departemen *</label>
                    <input 
                      type="text" 
                      name="reporter_department" 
                      value={formData.reporter_department} 
                      onChange={handleInputChange} 
                      required
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-0 text-gray-800 transition-colors"
                      placeholder="Contoh: Unit Rawat Inap"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Jabatan</label>
                    <input 
                      type="text" 
                      name="reporter_position" 
                      value={formData.reporter_position} 
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-0 text-gray-800 transition-colors"
                      placeholder="Contoh: Perawat, Dokter"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Detail Tiket */}
            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-500">description</span>
                Detail Tiket
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Kategori *</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {categories.map((cat) => (
                      <button 
                        key={cat.value} 
                        type="button" 
                        onClick={() => setFormData(prev => ({ ...prev, category: cat.value }))}
                        className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                          formData.category === cat.value 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span className="text-2xl">{cat.icon}</span>
                        <span className={`font-semibold text-sm ${
                          formData.category === cat.value ? 'text-blue-600' : 'text-gray-600'
                        }`}>{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Prioritas *</label>
                  <div className="grid grid-cols-4 gap-2">
                    {priorities.map((p) => (
                      <button 
                        key={p.value} 
                        type="button" 
                        onClick={() => setFormData(prev => ({ ...prev, priority: p.value }))}
                        className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                          formData.priority === p.value 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full ${p.color}`}></div>
                        <span className={`text-xs font-semibold ${
                          formData.priority === p.value ? 'text-blue-600' : 'text-gray-600'
                        }`}>{p.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Judul Tiket *</label>
                  <input 
                    type="text" 
                    name="title" 
                    value={formData.title} 
                    onChange={handleInputChange} 
                    required
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-0 text-gray-800 transition-colors"
                    placeholder="Ringkasan singkat masalah"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Deskripsi Lengkap *</label>
                  <textarea 
                    name="description" 
                    value={formData.description} 
                    onChange={handleInputChange} 
                    required 
                    rows={5}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-0 text-gray-800 transition-colors resize-none"
                    placeholder="Jelaskan masalah secara detail..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="px-8 py-6 bg-gray-50 border-t border-gray-100">
            <button 
              type="submit" 
              disabled={submitting}
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl font-bold text-lg shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Mengirim...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">send</span>
                  Kirim Tiket
                </>
              )}
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-white/80 text-sm">
            Tiket Anda akan diproses dalam 1x24 jam
          </p>
        </div>
      </div>
    </div>
  );
};

export default StandaloneInternalTicketForm;
