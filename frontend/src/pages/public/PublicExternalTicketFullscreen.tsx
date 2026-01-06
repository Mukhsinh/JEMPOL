import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

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

// Fullscreen Mobile-optimized Public External Ticket Form
// Halaman ini diakses melalui scan QR Code - TANPA SIDEBAR, HEADER, FOOTER
const PublicExternalTicketFullscreen: React.FC = () => {
  const [searchParams] = useSearchParams();
  
  const qrCode = searchParams.get('qr') || '';
  const unitId = searchParams.get('unit_id') || '';
  const unitName = decodeURIComponent(searchParams.get('unit_name') || '');
  const autoFill = searchParams.get('auto_fill') === 'true';

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ticketNumber, setTicketNumber] = useState('');
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setFormData(prev => ({ ...prev, attachments: [...prev.attachments, ...files] }));
    }
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({ ...prev, attachments: prev.attachments.filter((_, i) => i !== index) }));
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
      const submitData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== 'attachments') submitData.append(key, value as string);
      });
      submitData.append('qr_code', qrCode);
      submitData.append('unit_id', unitId);
      submitData.append('source', 'qr_code');
      formData.attachments.forEach((file, index) => {
        submitData.append(`attachment_${index}`, file);
      });

      const response = await fetch('/api/public/external-tickets', {
        method: 'POST',
        body: submitData
      });
      const result = await response.json();

      if (response.ok) {
        setTicketNumber(result.ticket_number);
        setSubmitted(true);
      } else {
        setError(result.error || 'Gagal mengirim laporan');
      }
    } catch (err: any) {
      setError('Terjadi kesalahan saat mengirim laporan');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setCurrentStep(1);
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
  };

  // Success Screen
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-5xl">check_circle</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Laporan Terkirim!</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">Terima kasih. Tim kami akan segera menindaklanjuti.</p>
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 mb-6 text-white">
            <p className="text-sm opacity-80 mb-1">Nomor Tiket Anda</p>
            <p className="text-3xl font-bold tracking-wider">{ticketNumber}</p>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Simpan nomor ini untuk melacak status laporan.</p>
          <button onClick={resetForm} className="w-full py-4 bg-primary text-white rounded-2xl font-semibold text-lg hover:bg-blue-600 transition-all active:scale-95">
            Buat Laporan Baru
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
      {/* Minimal Header */}
      <div className="bg-white dark:bg-slate-800 px-4 py-3 shadow-sm safe-area-top">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-xl">support_agent</span>
            </div>
            <span className="font-bold text-slate-900 dark:text-white">Pengaduan</span>
          </div>
          {/* Progress Indicator */}
          <div className="flex items-center gap-1">
            {[1, 2, 3].map((step) => (
              <div key={step} className={`w-8 h-1 rounded-full transition-all ${currentStep >= step ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`} />
            ))}
          </div>
        </div>
      </div>

      {/* Unit Info - Compact */}
      {unitName && autoFill && (
        <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-2">
          <div className="max-w-lg mx-auto flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600 text-sm">location_on</span>
            <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">{unitName}</span>
            <span className="material-symbols-outlined text-green-500 text-sm">verified</span>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 px-4 py-3">
          <div className="max-w-lg mx-auto flex items-center gap-2">
            <span className="material-symbols-outlined text-red-600 text-sm">error</span>
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        </div>
      )}

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto px-4 py-6 space-y-6">

          {/* Step 1: Identity */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-fadeIn">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Identitas Pelapor</h2>
              
              {/* Identity Toggle */}
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setFormData(prev => ({ ...prev, reporter_identity_type: 'personal' }))}
                  className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${formData.reporter_identity_type === 'personal' ? 'border-primary bg-primary/5' : 'border-slate-200 dark:border-slate-700'}`}>
                  <span className="material-symbols-outlined text-2xl text-primary">person</span>
                  <span className="text-sm font-medium">Identitas Pribadi</span>
                </button>
                <button type="button" onClick={() => setFormData(prev => ({ ...prev, reporter_identity_type: 'anonymous' }))}
                  className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${formData.reporter_identity_type === 'anonymous' ? 'border-primary bg-primary/5' : 'border-slate-200 dark:border-slate-700'}`}>
                  <span className="material-symbols-outlined text-2xl text-slate-400">visibility_off</span>
                  <span className="text-sm font-medium">Anonim</span>
                </button>
              </div>

              {formData.reporter_identity_type === 'personal' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Nama Lengkap *</label>
                    <input type="text" name="reporter_name" value={formData.reporter_name} onChange={handleInputChange} required
                      className="w-full px-4 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      placeholder="Masukkan nama lengkap" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Nomor Telepon</label>
                    <input type="tel" name="reporter_phone" value={formData.reporter_phone} onChange={handleInputChange}
                      className="w-full px-4 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      placeholder="08xxxxxxxxxx" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email</label>
                    <input type="email" name="reporter_email" value={formData.reporter_email} onChange={handleInputChange}
                      className="w-full px-4 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      placeholder="email@example.com" />
                  </div>
                </div>
              )}

              <button type="button" onClick={() => setCurrentStep(2)}
                className="w-full py-4 bg-primary text-white rounded-2xl font-semibold text-lg hover:bg-blue-600 transition-all active:scale-95 flex items-center justify-center gap-2">
                Lanjutkan <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          )}

          {/* Step 2: Report Details */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center gap-2 mb-2">
                <button type="button" onClick={() => setCurrentStep(1)} className="p-2 -ml-2 text-slate-400 hover:text-slate-600">
                  <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Detail Laporan</h2>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Jenis Layanan *</label>
                <div className="grid grid-cols-1 gap-2">
                  {[{ value: 'complaint', label: 'Pengaduan', icon: 'report_problem', color: 'text-red-500' },
                    { value: 'request', label: 'Permintaan Informasi', icon: 'help', color: 'text-blue-500' },
                    { value: 'suggestion', label: 'Saran & Masukan', icon: 'lightbulb', color: 'text-yellow-500' }
                  ].map((type) => (
                    <button key={type.value} type="button" onClick={() => setFormData(prev => ({ ...prev, service_type: type.value }))}
                      className={`p-4 rounded-2xl border-2 transition-all flex items-center gap-3 ${formData.service_type === type.value ? 'border-primary bg-primary/5' : 'border-slate-200 dark:border-slate-700'}`}>
                      <span className={`material-symbols-outlined text-2xl ${type.color}`}>{type.icon}</span>
                      <span className="font-medium">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Judul Laporan *</label>
                <input type="text" name="title" value={formData.title} onChange={handleInputChange} required
                  className="w-full px-4 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="Ringkasan singkat masalah" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Deskripsi Lengkap *</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} required rows={5}
                  className="w-full px-4 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-lg focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                  placeholder="Jelaskan kronologi kejadian secara detail..." />
              </div>

              <button type="button" onClick={() => setCurrentStep(3)}
                disabled={!formData.service_type || !formData.title || !formData.description}
                className="w-full py-4 bg-primary text-white rounded-2xl font-semibold text-lg hover:bg-blue-600 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                Lanjutkan <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          )}

          {/* Step 3: Attachments & Submit */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center gap-2 mb-2">
                <button type="button" onClick={() => setCurrentStep(2)} className="p-2 -ml-2 text-slate-400 hover:text-slate-600">
                  <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Lampiran & Kirim</h2>
              </div>

              {/* File Upload */}
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl p-6 text-center relative">
                <input type="file" multiple accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="material-symbols-outlined text-slate-400 text-3xl">cloud_upload</span>
                </div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Tap untuk unggah foto/dokumen</p>
                <p className="text-xs text-slate-500 mt-1">JPG, PNG, PDF (Maks. 5MB)</p>
              </div>

              {formData.attachments.length > 0 && (
                <div className="space-y-2">
                  {formData.attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-800 rounded-xl">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-slate-400">attach_file</span>
                        <div>
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate max-w-[200px]">{file.name}</p>
                          <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                      <button type="button" onClick={() => removeFile(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Captcha */}
              <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl p-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={captchaVerified} onChange={(e) => setCaptchaVerified(e.target.checked)}
                    className="w-6 h-6 rounded-lg border-slate-300 text-primary focus:ring-primary/20" />
                  <span className="text-slate-700 dark:text-slate-300 font-medium">Saya bukan robot</span>
                </label>
              </div>

              {/* Summary */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 space-y-2">
                <h3 className="font-bold text-slate-900 dark:text-white">Ringkasan Laporan</h3>
                <div className="text-sm space-y-1">
                  <p><span className="text-slate-500">Jenis:</span> <span className="font-medium">{formData.service_type === 'complaint' ? 'Pengaduan' : formData.service_type === 'request' ? 'Permintaan Informasi' : 'Saran & Masukan'}</span></p>
                  <p><span className="text-slate-500">Judul:</span> <span className="font-medium">{formData.title}</span></p>
                  {unitName && <p><span className="text-slate-500">Unit:</span> <span className="font-medium">{unitName}</span></p>}
                </div>
              </div>

              <button type="submit" disabled={submitting || !captchaVerified}
                className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl font-semibold text-lg hover:from-blue-600 hover:to-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30">
                {submitting ? (
                  <><div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div> Mengirim...</>
                ) : (
                  <><span className="material-symbols-outlined">send</span> Kirim Laporan</>
                )}
              </button>

              <p className="text-xs text-slate-500 text-center">
                Dengan mengirim, Anda menyetujui kebijakan privasi kami.
              </p>
            </div>
          )}
        </div>
      </form>

      {/* CSS for animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .safe-area-top { padding-top: env(safe-area-inset-top); }
      `}</style>
    </div>
  );
};

export default PublicExternalTicketFullscreen;
