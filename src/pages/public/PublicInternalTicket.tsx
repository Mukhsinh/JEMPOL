import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import AppFooter from '../../components/AppFooter';

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
  attachments: File[];
}

// Mobile-optimized Public Internal Ticket Form
// Halaman ini diakses melalui scan QR Code - TANPA SIDEBAR
const PublicInternalTicket: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const qrCode = searchParams.get('qr') || '';
  const unitId = searchParams.get('unit_id') || '';
  const unitName = decodeURIComponent(searchParams.get('unit_name') || '');
  const autoFill = searchParams.get('auto_fill') === 'true';

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ticketNumber, setTicketNumber] = useState('');
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState<FormData>({
    reporter_name: '',
    reporter_email: '',
    reporter_phone: '',
    reporter_department: '',
    reporter_position: '',
    category: '',
    priority: 'medium',
    title: '',
    description: '',
    attachments: []
  });

  const [characterCount, setCharacterCount] = useState(0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'description') {
      setCharacterCount(value.length);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...files]
      }));
    }
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi unit_id - CRITICAL
    if (!unitId || unitId.trim() === '' || unitId === 'null' || unitId === 'undefined') {
      setError('Unit tujuan tidak valid. Silakan scan QR code ulang.');
      console.error('❌ Unit ID tidak valid:', unitId);
      return;
    }

    // Validasi format UUID untuk unit_id
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(unitId)) {
      setError('Format Unit ID tidak valid. Silakan scan QR code ulang.');
      console.error('❌ Unit ID format tidak valid:', unitId);
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // Kirim sebagai JSON dengan field lengkap
      const submitData = {
        reporter_name: formData.reporter_name?.trim() || null,
        reporter_email: formData.reporter_email?.trim() || null,
        reporter_phone: formData.reporter_phone?.trim() || null,
        reporter_department: formData.reporter_department?.trim() || null,
        reporter_position: formData.reporter_position?.trim() || null,
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category || null,
        priority: formData.priority,
        qr_code: qrCode || null,
        unit_id: unitId,
        source: qrCode ? 'qr_code' : 'web'
      };

      console.log('📤 Submitting internal ticket:', submitData);
      console.log('📤 Unit ID:', unitId);

      const response = await fetch('/api/public/internal-tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(submitData)
      });

      console.log('📊 Response status:', response.status);
      console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));

      // Cek apakah response adalah HTML (error 404 atau 500)
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('❌ Response is not JSON:', text.substring(0, 200));
        
        // Jika 404, kemungkinan endpoint tidak ditemukan
        if (response.status === 404) {
          setError('Endpoint API tidak ditemukan. Silakan hubungi administrator.');
          console.error('❌ API endpoint /api/public/internal-tickets tidak ditemukan (404)');
        } else {
          setError('Server mengembalikan response yang tidak valid. Silakan coba lagi.');
        }
        return;
      }

      const result = await response.json();
      console.log('📊 Response data:', result);

      if (response.ok && result.success) {
        setTicketNumber(result.ticket_number);
        setSubmitted(true);
        window.scrollTo(0, 0);
      } else {
        const errorMsg = result.error || 'Gagal mengirim tiket';
        const errorDetails = result.details ? ` (${result.details})` : '';
        const debugInfo = result.debug_info ? `\nDebug: ${JSON.stringify(result.debug_info)}` : '';
        setError(errorMsg + errorDetails);
        console.error('❌ Submit failed:', result);
        console.error('❌ Error details:', errorMsg + errorDetails + debugInfo);
      }
    } catch (err: any) {
      console.error('❌ Error submitting ticket:', err);
      setError('Terjadi kesalahan saat mengirim tiket: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-4xl">check_circle</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Tiket Berhasil Dibuat!</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Tiket internal Anda telah berhasil dibuat. Tim terkait akan segera menindaklanjuti.
          </p>
          <div className="bg-slate-100 dark:bg-slate-700 rounded-xl p-4 mb-6">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Nomor Tiket Anda</p>
            <p className="text-2xl font-bold text-primary">{ticketNumber}</p>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            Simpan nomor tiket ini untuk melacak status tiket Anda.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => {
                setSubmitted(false);
                setFormData({
                  reporter_name: '',
                  reporter_email: '',
                  reporter_phone: '',
                  reporter_department: '',
                  reporter_position: '',
                  category: '',
                  priority: 'medium',
                  title: '',
                  description: '',
                  attachments: []
                });
                setCharacterCount(0);
              }}
              className="w-full px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors"
            >
              Buat Tiket Baru
            </button>
            <button
              onClick={() => {
                // Kembali ke halaman QR landing jika ada qrCode, atau tutup window
                if (qrCode) {
                  window.location.href = `/m/${qrCode}`;
                } else {
                  window.close();
                  // Fallback jika window.close() tidak bekerja
                  window.history.back();
                }
              }}
              className="w-full px-6 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl font-semibold hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
            >
              Kembali ke Menu Utama
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 flex flex-col">
      {/* Header - No Sidebar */}
      <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-purple-600 dark:text-purple-400 text-2xl">assignment</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-white">Tiket Internal</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Khusus Petugas Internal</p>
            </div>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Kembali
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Page Header */}
          <div className="mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Buat Tiket Internal
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Formulir ini khusus untuk petugas internal. Silakan isi data dengan lengkap.
            </p>
          </div>

          {/* Unit Info Card - Auto-filled from QR */}
          {unitName && autoFill && (
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800 p-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-purple-600 dark:text-purple-400 text-2xl">business</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Unit Tujuan</span>
                    <span className="material-symbols-outlined text-green-500 text-sm">verified</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{unitName}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Unit terdeteksi otomatis dari QR Code
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6 flex items-center gap-3">
              <span className="material-symbols-outlined text-red-600">error</span>
              <p className="text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            {/* Reporter Info Section */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">badge</span>
                Data Pelapor
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text"
                    name="reporter_name"
                    value={formData.reporter_name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="Masukkan nama lengkap"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="email"
                    name="reporter_email"
                    value={formData.reporter_email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="email@rumahsakit.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Nomor Telepon
                  </label>
                  <input 
                    type="tel"
                    name="reporter_phone"
                    value={formData.reporter_phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="08xxxxxxxxxx"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Unit/Departemen <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text"
                    name="reporter_department"
                    value={formData.reporter_department}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="Contoh: Unit Rawat Inap"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Jabatan
                  </label>
                  <input 
                    type="text"
                    name="reporter_position"
                    value={formData.reporter_position}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="Contoh: Perawat, Dokter, Admin"
                  />
                </div>
              </div>
            </div>

            {/* Ticket Details Section */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">description</span>
                Detail Tiket
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Kategori <span className="text-red-500">*</span>
                  </label>
                  <select 
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  >
                    <option value="">Pilih kategori...</option>
                    <option value="it_support">IT & Sistem</option>
                    <option value="facility">Fasilitas & Sarana</option>
                    <option value="equipment">Peralatan Medis</option>
                    <option value="hr">SDM & Kepegawaian</option>
                    <option value="admin">Administrasi</option>
                    <option value="other">Lainnya</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Prioritas <span className="text-red-500">*</span>
                  </label>
                  <select 
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  >
                    <option value="low">Rendah - Tidak Mendesak</option>
                    <option value="medium">Sedang - Perlu Ditangani</option>
                    <option value="high">Tinggi - Mendesak</option>
                    <option value="critical">Kritis - Sangat Mendesak</option>
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Judul Tiket <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="Ringkasan singkat masalah"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Deskripsi Lengkap <span className="text-red-500">*</span>
                </label>
                <textarea 
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={5}
                  maxLength={2000}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                  placeholder="Jelaskan masalah secara detail..."
                />
                <div className="text-right text-xs text-slate-400 mt-1">
                  {characterCount} / 2000 karakter
                </div>
              </div>
            </div>

            {/* Attachments Section */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">attach_file</span>
                Lampiran (Opsional)
              </h3>
              
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-6 text-center hover:border-primary transition-colors cursor-pointer relative">
                <input 
                  type="file"
                  multiple
                  accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="material-symbols-outlined text-slate-400 text-2xl">cloud_upload</span>
                </div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  <span className="text-primary">Klik untuk unggah</span> atau seret file ke sini
                </p>
                <p className="text-xs text-slate-500 mt-1">JPG, PNG, PDF, DOC (Maks. 5MB)</p>
              </div>

              {formData.attachments.length > 0 && (
                <div className="mt-4 space-y-2">
                  {formData.attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-slate-400">attach_file</span>
                        <div>
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{file.name}</p>
                          <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                      >
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Section */}
            <div className="p-6 bg-slate-50 dark:bg-slate-700/50">
              <div className="flex flex-col-reverse md:flex-row gap-4 items-center justify-between">
                <p className="text-xs text-slate-500 dark:text-slate-400 text-center md:text-left">
                  Tiket akan diteruskan ke unit terkait untuk ditindaklanjuti.
                </p>
                <div className="flex w-full md:w-auto gap-3">
                  <button 
                    type="button"
                    onClick={() => navigate(-1)}
                    className="flex-1 md:flex-none px-6 py-3 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit"
                    disabled={submitting}
                    className="flex-1 md:flex-none px-8 py-3 rounded-lg bg-primary text-white font-semibold shadow-lg shadow-primary/30 hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Mengirim...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-lg">send</span>
                        Kirim Tiket
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>

      {/* Footer */}
      <AppFooter variant="compact" className="mt-auto" />
    </div>
  );
};

export default PublicInternalTicket;
