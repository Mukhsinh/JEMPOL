import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

interface FormData {
  reporter_identity_type: 'personal' | 'anonymous';
  reporter_name: string;
  reporter_email: string;
  reporter_phone: string;
  service_type: string;
  title: string;
  description: string;
  attachments: File[];
}

// Direct Form View - Tiket Eksternal/Pengaduan (Public, Tanpa Login, Mobile-First)
// Route: /tickets/tiket-eksternal?unit_id=xxx&unit_name=xxx
const DirectExternalTicketForm: React.FC = () => {
  const [searchParams] = useSearchParams();
  
  const unitId = searchParams.get('unit_id') || searchParams.get('unit') || '';
  const unitName = decodeURIComponent(searchParams.get('unit_name') || searchParams.get('name') || '');
  const qrCode = searchParams.get('qr') || '';

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
    service_type: '',
    title: '',
    description: '',
    attachments: []
  });

  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
    setSubmitting(true);
    setError('');

    try {
      const submitData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== 'attachments') submitData.append(key, value as string);
      });
      submitData.append('qr_code', qrCode);
      submitData.append('unit_id', unitId);
      submitData.append('source', 'direct_form');
      formData.attachments.forEach((file, index) => {
        submitData.append(`attachment_${index}`, file);
      });

      const response = await fetch('/api/public/external-tickets', {
        method: 'POST',
        body: submitData
      });
      const result = await response.json();

      if (response.ok) {
        setTicketNumber(result.ticket_number || 'TKT-' + Date.now());
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
      service_type: '',
      title: '',
      description: '',
      attachments: []
    });
  };

  // Success Screen
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-500 via-rose-500 to-pink-600 flex items-center justify-center p-6">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 -left-20 w-48 h-48 bg-rose-300/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative bg-white rounded-[2rem] shadow-2xl p-8 max-w-sm w-full text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30">
            <span className="material-symbols-outlined text-white text-5xl">check_circle</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Berhasil Terkirim!</h2>
          <p className="text-gray-500 mb-6">Terima kasih atas laporan Anda</p>
          
          <div className="bg-gradient-to-r from-orange-500 to-rose-500 rounded-2xl p-6 mb-6 text-white shadow-lg">
            <p className="text-white/80 text-sm mb-1">Nomor Tiket Anda</p>
            <p className="text-3xl font-bold tracking-wider">{ticketNumber}</p>
          </div>
          
          <p className="text-gray-400 text-sm mb-6">Simpan nomor ini untuk melacak status laporan Anda</p>
          
          <button 
            onClick={resetForm} 
            className="w-full py-4 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-2xl font-bold text-lg shadow-lg shadow-orange-500/30 active:scale-95 transition-transform"
          >
            Buat Laporan Baru
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 via-rose-500 to-pink-600 flex flex-col">
      {/* Decorative */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-20 w-48 h-48 bg-rose-300/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-pink-300/20 rounded-full blur-2xl"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 pt-10 pb-6">
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center shadow-lg">
            <span className="material-symbols-outlined text-white text-3xl">support_agent</span>
          </div>
        </div>
        
        <h1 className="text-white text-2xl font-bold text-center mb-1">Buat Pengaduan</h1>
        <p className="text-white/80 text-sm text-center">Sampaikan keluhan atau saran Anda</p>
        
        {/* Progress */}
        <div className="mt-6 flex items-center gap-3 max-w-md mx-auto">
          <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white rounded-full transition-all duration-500" 
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-white/80 text-sm font-medium">{currentStep}/{totalSteps}</span>
        </div>
      </header>

      {/* Unit Info */}
      {unitName && (
        <div className="relative z-10 px-6 mb-4">
          <div className="max-w-md mx-auto bg-white/20 backdrop-blur-xl rounded-xl px-4 py-3 flex items-center gap-3">
            <span className="material-symbols-outlined text-white">business</span>
            <span className="text-white font-medium flex-1">{unitName}</span>
            <span className="material-symbols-outlined text-green-300">verified</span>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="relative z-10 px-6 mb-4">
          <div className="max-w-md mx-auto bg-red-500/90 backdrop-blur-xl rounded-xl px-4 py-3 flex items-center gap-3">
            <span className="material-symbols-outlined text-white">error</span>
            <span className="text-white text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Form Content */}
      <main className="relative z-10 flex-1 bg-white rounded-t-[2.5rem] overflow-hidden shadow-2xl">
        <form onSubmit={handleSubmit} className="h-full flex flex-col">
          <div className="flex-1 overflow-y-auto px-6 py-8">
            <div className="max-w-md mx-auto space-y-6">

              {/* Step 1: Identity */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-slideUp">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Identitas Pelapor</h2>
                    <p className="text-gray-500 text-sm">Pilih cara Anda ingin melapor</p>
                  </div>

                  {/* Identity Toggle */}
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      type="button" 
                      onClick={() => setFormData(prev => ({ ...prev, reporter_identity_type: 'personal' }))}
                      className={`p-5 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${
                        formData.reporter_identity_type === 'personal' 
                          ? 'border-orange-500 bg-orange-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                        formData.reporter_identity_type === 'personal' 
                          ? 'bg-gradient-to-br from-orange-500 to-rose-500' 
                          : 'bg-gray-100'
                      }`}>
                        <span className={`material-symbols-outlined text-2xl ${
                          formData.reporter_identity_type === 'personal' ? 'text-white' : 'text-gray-400'
                        }`}>person</span>
                      </div>
                      <span className={`font-semibold ${
                        formData.reporter_identity_type === 'personal' ? 'text-orange-600' : 'text-gray-600'
                      }`}>Dengan Identitas</span>
                    </button>
                    
                    <button 
                      type="button" 
                      onClick={() => setFormData(prev => ({ ...prev, reporter_identity_type: 'anonymous' }))}
                      className={`p-5 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${
                        formData.reporter_identity_type === 'anonymous' 
                          ? 'border-orange-500 bg-orange-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                        formData.reporter_identity_type === 'anonymous' 
                          ? 'bg-gradient-to-br from-orange-500 to-rose-500' 
                          : 'bg-gray-100'
                      }`}>
                        <span className={`material-symbols-outlined text-2xl ${
                          formData.reporter_identity_type === 'anonymous' ? 'text-white' : 'text-gray-400'
                        }`}>visibility_off</span>
                      </div>
                      <span className={`font-semibold ${
                        formData.reporter_identity_type === 'anonymous' ? 'text-orange-600' : 'text-gray-600'
                      }`}>Anonim</span>
                    </button>
                  </div>

                  {formData.reporter_identity_type === 'personal' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Lengkap *</label>
                        <input 
                          type="text" 
                          name="reporter_name" 
                          value={formData.reporter_name} 
                          onChange={handleInputChange} 
                          required
                          className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-0 text-gray-800 text-lg transition-colors"
                          placeholder="Masukkan nama lengkap"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Nomor HP (WhatsApp)</label>
                        <input 
                          type="tel" 
                          name="reporter_phone" 
                          value={formData.reporter_phone} 
                          onChange={handleInputChange}
                          className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-0 text-gray-800 text-lg transition-colors"
                          placeholder="08xxxxxxxxxx"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                        <input 
                          type="email" 
                          name="reporter_email" 
                          value={formData.reporter_email} 
                          onChange={handleInputChange}
                          className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-0 text-gray-800 text-lg transition-colors"
                          placeholder="email@example.com"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Report Details */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-slideUp">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Detail Laporan</h2>
                    <p className="text-gray-500 text-sm">Jelaskan masalah yang Anda alami</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Jenis Layanan *</label>
                    <div className="space-y-3">
                      {[
                        { value: 'complaint', label: 'Pengaduan', icon: 'report_problem', color: 'from-red-400 to-rose-500', desc: 'Keluhan atau masalah' },
                        { value: 'request', label: 'Permintaan', icon: 'help_outline', color: 'from-blue-400 to-indigo-500', desc: 'Permintaan informasi' },
                        { value: 'suggestion', label: 'Saran', icon: 'lightbulb', color: 'from-amber-400 to-orange-500', desc: 'Saran & masukan' }
                      ].map((type) => (
                        <button 
                          key={type.value} 
                          type="button" 
                          onClick={() => setFormData(prev => ({ ...prev, service_type: type.value }))}
                          className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                            formData.service_type === type.value 
                              ? 'border-orange-500 bg-orange-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${type.color}`}>
                            <span className="material-symbols-outlined text-white text-2xl">{type.icon}</span>
                          </div>
                          <div className="flex-1 text-left">
                            <p className="font-semibold text-gray-800">{type.label}</p>
                            <p className="text-sm text-gray-500">{type.desc}</p>
                          </div>
                          {formData.service_type === type.value && (
                            <span className="material-symbols-outlined text-orange-500">check_circle</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Judul Laporan *</label>
                    <input 
                      type="text" 
                      name="title" 
                      value={formData.title} 
                      onChange={handleInputChange} 
                      required
                      className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-0 text-gray-800 text-lg transition-colors"
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
                      className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-0 text-gray-800 text-lg transition-colors resize-none"
                      placeholder="Jelaskan kronologi kejadian secara detail..."
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Attachments & Submit */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-slideUp">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Lampiran & Kirim</h2>
                    <p className="text-gray-500 text-sm">Tambahkan foto atau dokumen pendukung</p>
                  </div>

                  {/* File Upload */}
                  <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center relative hover:border-orange-400 transition-colors">
                    <input 
                      type="file" 
                      multiple 
                      accept=".jpg,.jpeg,.png,.pdf" 
                      onChange={handleFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/30">
                      <span className="material-symbols-outlined text-white text-3xl">cloud_upload</span>
                    </div>
                    <p className="font-semibold text-gray-700 mb-1">Tap untuk unggah</p>
                    <p className="text-sm text-gray-500">JPG, PNG, PDF (Maks. 5MB)</p>
                  </div>

                  {formData.attachments.length > 0 && (
                    <div className="space-y-2">
                      {formData.attachments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                              <span className="material-symbols-outlined text-orange-500">attach_file</span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-700 truncate max-w-[180px]">{file.name}</p>
                              <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                          </div>
                          <button 
                            type="button" 
                            onClick={() => removeFile(index)} 
                            className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center"
                          >
                            <span className="material-symbols-outlined text-red-500 text-lg">close</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Summary */}
                  <div className="bg-gradient-to-br from-orange-50 to-rose-50 rounded-2xl p-5 space-y-3">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                      <span className="material-symbols-outlined text-orange-500">summarize</span>
                      Ringkasan Laporan
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Jenis</span>
                        <span className="font-medium text-gray-800">
                          {formData.service_type === 'complaint' ? 'Pengaduan' : 
                           formData.service_type === 'request' ? 'Permintaan' : 'Saran'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Judul</span>
                        <span className="font-medium text-gray-800 truncate max-w-[180px]">{formData.title}</span>
                      </div>
                      {unitName && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Unit</span>
                          <span className="font-medium text-gray-800">{unitName}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Navigation */}
          <div className="px-6 py-4 bg-white border-t border-gray-100 safe-area-bottom">
            <div className="max-w-md mx-auto flex gap-3">
              {currentStep > 1 && (
                <button 
                  type="button" 
                  onClick={() => setCurrentStep(prev => prev - 1)}
                  className="px-6 py-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                >
                  Kembali
                </button>
              )}
              
              {currentStep < totalSteps ? (
                <button 
                  type="button" 
                  onClick={() => setCurrentStep(prev => prev + 1)}
                  disabled={
                    (currentStep === 1 && formData.reporter_identity_type === 'personal' && !formData.reporter_name) ||
                    (currentStep === 2 && (!formData.service_type || !formData.title || !formData.description))
                  }
                  className="flex-1 py-4 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-orange-500/30 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                >
                  Lanjutkan
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              ) : (
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="flex-1 py-4 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-orange-500/30 disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                >
                  {submitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Mengirim...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined">send</span>
                      Kirim Laporan
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </main>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideUp { animation: slideUp 0.4s ease-out; }
        .safe-area-bottom { padding-bottom: max(1rem, env(safe-area-inset-bottom)); }
      `}</style>
    </div>
  );
};

export default DirectExternalTicketForm;
