import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import AppFooter from '../../components/AppFooter';

interface FormData {
  reporter_identity_type: 'personal' | 'anonymous';
  reporter_name: string;
  reporter_email: string;
  reporter_phone: string;
  reporter_address: string;
  service_type: string;
  category: string;
  title: string;
  description: string;
  attachments: File[];
}

// Mobile-optimized Public External Ticket Form
// Halaman ini diakses melalui scan QR Code - TANPA SIDEBAR
const PublicExternalTicket: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const qrCode = searchParams.get('qr') || '';
  const unitId = searchParams.get('unit_id') || '';
  const unitName = decodeURIComponent(searchParams.get('unit_name') || '');
  const autoFill = searchParams.get('auto_fill') === 'true';

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ticketNumber, setTicketNumber] = useState('');
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState<FormData>({
    reporter_identity_type: 'personal',
    reporter_name: '',
    reporter_email: '',
    reporter_phone: '',
    reporter_address: '',
    service_type: '',
    category: '',
    title: '',
    description: '',
    attachments: []
  });

  const [captchaVerified, setCaptchaVerified] = useState(false);
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
    
    if (!captchaVerified) {
      setError('Silakan verifikasi captcha terlebih dahulu');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // Kirim sebagai JSON, bukan FormData
      const submitData = {
        reporter_identity_type: formData.reporter_identity_type,
        reporter_name: formData.reporter_name,
        reporter_email: formData.reporter_email,
        reporter_phone: formData.reporter_phone,
        reporter_address: formData.reporter_address,
        service_type: formData.service_type,
        category: formData.category,
        title: formData.title,
        description: formData.description,
        qr_code: qrCode,
        unit_id: unitId,
        source: 'qr_code'
      };

      const response = await fetch('/api/public/external-tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setTicketNumber(result.ticket_number);
        setSubmitted(true);
        window.scrollTo(0, 0);
      } else {
        setError(result.error || 'Gagal mengirim laporan');
      }
    } catch (err: any) {
      console.error('Error submitting ticket:', err);
      setError('Terjadi kesalahan saat mengirim laporan');
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
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Laporan Berhasil Dikirim!</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Terima kasih telah menyampaikan laporan Anda. Tim kami akan segera menindaklanjuti.
          </p>
          <div className="bg-slate-100 dark:bg-slate-700 rounded-xl p-4 mb-6">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Nomor Tiket Anda</p>
            <p className="text-2xl font-bold text-primary">{ticketNumber}</p>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            Simpan nomor tiket ini untuk melacak status laporan Anda.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => {
                setSubmitted(false);
                setFormData({
                  reporter_identity_type: 'personal',
                  reporter_name: '',
                  reporter_email: '',
                  reporter_phone: '',
                  reporter_address: '',
                  service_type: '',
                  category: '',
                  title: '',
                  description: '',
                  attachments: []
                });
                setCaptchaVerified(false);
                setCharacterCount(0);
              }}
              className="w-full px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors"
            >
              Buat Laporan Baru
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
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-2xl">local_hospital</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-white">Sistem Pengaduan Terpadu</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Layanan Publik Digital</p>
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
              Sampaikan Laporan Anda
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Silakan isi formulir di bawah ini untuk menyampaikan pengaduan, permintaan, atau saran.
            </p>
          </div>

          {/* Unit Info Card - Auto-filled from QR */}
          {unitName && autoFill && (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-2xl">business</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-primary uppercase tracking-wider">Unit Tujuan</span>
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
            {/* Identity Section */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Identitas Pelapor</h3>
              
              {/* Identity Toggle */}
              <div className="flex p-1 bg-slate-100 dark:bg-slate-700 rounded-lg w-fit mb-6">
                <label className="cursor-pointer">
                  <input 
                    checked={formData.reporter_identity_type === 'personal'}
                    onChange={() => setFormData(prev => ({ ...prev, reporter_identity_type: 'personal' }))}
                    className="peer sr-only" 
                    name="identity" 
                    type="radio" 
                    value="personal"
                  />
                  <div className="px-4 py-2 rounded-md text-sm font-medium text-slate-500 dark:text-slate-400 peer-checked:bg-white dark:peer-checked:bg-slate-600 peer-checked:text-primary peer-checked:shadow-sm transition-all flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">person</span>
                    Identitas Pribadi
                  </div>
                </label>
                <label className="cursor-pointer">
                  <input 
                    checked={formData.reporter_identity_type === 'anonymous'}
                    onChange={() => setFormData(prev => ({ ...prev, reporter_identity_type: 'anonymous' }))}
                    className="peer sr-only" 
                    name="identity" 
                    type="radio" 
                    value="anonymous"
                  />
                  <div className="px-4 py-2 rounded-md text-sm font-medium text-slate-500 dark:text-slate-400 peer-checked:bg-white dark:peer-checked:bg-slate-600 peer-checked:text-primary peer-checked:shadow-sm transition-all flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">visibility_off</span>
                    Anonim
                  </div>
                </label>
              </div>

              {/* Personal Info Fields */}
              {formData.reporter_identity_type === 'personal' && (
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
                      Email
                    </label>
                    <input 
                      type="email"
                      name="reporter_email"
                      value={formData.reporter_email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      placeholder="email@example.com"
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
                      Alamat
                    </label>
                    <input 
                      type="text"
                      name="reporter_address"
                      value={formData.reporter_address}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      placeholder="Alamat lengkap"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Report Details Section */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Detail Laporan</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Jenis Layanan <span className="text-red-500">*</span>
                  </label>
                  <select 
                    name="service_type"
                    value={formData.service_type}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  >
                    <option value="">Pilih jenis layanan...</option>
                    <option value="complaint">Pengaduan</option>
                    <option value="request">Permintaan Informasi</option>
                    <option value="suggestion">Saran & Masukan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Kategori
                  </label>
                  <select 
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  >
                    <option value="">Pilih kategori...</option>
                    <option value="service">Pelayanan Medis</option>
                    <option value="facility">Fasilitas & Sarana</option>
                    <option value="staff">Perilaku Petugas</option>
                    <option value="admin">Administrasi</option>
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Judul Laporan <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="Ringkasan singkat masalah Anda"
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
                  placeholder="Jelaskan kronologi kejadian secara detail..."
                />
                <div className="text-right text-xs text-slate-400 mt-1">
                  {characterCount} / 2000 karakter
                </div>
              </div>
            </div>

            {/* Attachments Section */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Lampiran (Opsional)</h3>
              
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-6 text-center hover:border-primary transition-colors cursor-pointer relative">
                <input 
                  type="file"
                  multiple
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="material-symbols-outlined text-slate-400 text-2xl">cloud_upload</span>
                </div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  <span className="text-primary">Klik untuk unggah</span> atau seret file ke sini
                </p>
                <p className="text-xs text-slate-500 mt-1">JPG, PNG, PDF (Maks. 5MB)</p>
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
              {/* Captcha */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg p-3 shadow-sm">
                  <input 
                    type="checkbox"
                    id="captcha"
                    checked={captchaVerified}
                    onChange={(e) => setCaptchaVerified(e.target.checked)}
                    className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary/20"
                  />
                  <label htmlFor="captcha" className="text-sm text-slate-600 dark:text-slate-300 cursor-pointer">
                    Saya bukan robot
                  </label>
                  <div className="ml-4 flex flex-col items-center opacity-50">
                    <span className="material-symbols-outlined text-sm">security</span>
                    <span className="text-[8px] uppercase font-bold">Captcha</span>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex flex-col-reverse md:flex-row gap-4 items-center justify-between">
                <p className="text-xs text-slate-500 dark:text-slate-400 text-center md:text-left">
                  Dengan mengirimkan laporan ini, Anda menyetujui{' '}
                  <a className="text-primary hover:underline" href="#">Kebijakan Privasi</a> kami.
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
                    disabled={submitting || !captchaVerified}
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
                        Kirim Laporan
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

export default PublicExternalTicket;
