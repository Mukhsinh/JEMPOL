import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

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

// Direct Form View - Tiket Internal (Public, Tanpa Login, Mobile-First)
// Route: /form/internal?unit_id=xxx&unit_name=xxx
// PENTING: Halaman ini TANPA SIDEBAR - Full screen form
const DirectInternalTicketForm: React.FC = () => {
  const [searchParams] = useSearchParams();
  
  const unitId = searchParams.get('unit_id') || searchParams.get('unit') || '';
  const unitName = decodeURIComponent(searchParams.get('unit_name') || searchParams.get('name') || '');
  const qrCode = searchParams.get('qr') || '';
  
  // Debug logging
  React.useEffect(() => {
    console.log('DirectInternalTicketForm mounted');
    console.log('URL params:', { unitId, unitName, qrCode });
  }, [unitId, unitName, qrCode]);
  
  // Pastikan tidak ada scroll pada body untuk fullscreen experience
  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ticketNumber, setTicketNumber] = useState('');
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  
  const [formData, setFormData] = useState<FormData>({
    reporter_name: '',
    reporter_email: '',
    reporter_phone: '',
    reporter_department: unitName || '',
    reporter_position: '',
    category: '',
    priority: 'medium',
    title: '',
    description: '',
    attachments: []
  });

  useEffect(() => {
    if (unitName && !formData.reporter_department) {
      setFormData(prev => ({ ...prev, reporter_department: unitName }));
    }
  }, [unitName]);

  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

  const categories = [
    { value: 'it_support', label: 'IT & Sistem', icon: '💻', color: 'from-blue-400 to-indigo-500' },
    { value: 'facility', label: 'Fasilitas', icon: '🏥', color: 'from-emerald-400 to-teal-500' },
    { value: 'equipment', label: 'Peralatan', icon: '🔧', color: 'from-amber-400 to-orange-500' },
    { value: 'hr', label: 'SDM', icon: '👥', color: 'from-pink-400 to-rose-500' },
    { value: 'admin', label: 'Administrasi', icon: '📋', color: 'from-cyan-400 to-blue-500' },
    { value: 'other', label: 'Lainnya', icon: '📝', color: 'from-gray-400 to-slate-500' }
  ];

  const priorities = [
    { value: 'low', label: 'Rendah', color: 'bg-green-500', desc: 'Tidak mendesak' },
    { value: 'medium', label: 'Sedang', color: 'bg-yellow-500', desc: 'Perlu ditangani' },
    { value: 'high', label: 'Tinggi', color: 'bg-orange-500', desc: 'Mendesak' },
    { value: 'critical', label: 'Kritis', color: 'bg-red-500', desc: 'Sangat mendesak' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData(prev => ({ ...prev, attachments: [...prev.attachments, ...Array.from(e.target.files!)] }));
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
      console.log('Submitting ticket:', {
        ...formData,
        qr_code: qrCode,
        unit_id: unitId,
        source: 'direct_form'
      });

      const response = await fetch('/api/public/internal-tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          qr_code: qrCode,
          unit_id: unitId,
          source: 'direct_form'
        })
      });
      
      console.log('Response status:', response.status);
      const result = await response.json();
      console.log('Response data:', result);

      if (response.ok) {
        setTicketNumber(result.ticket_number || 'INT-' + Date.now());
        setSubmitted(true);
      } else {
        setError(result.error || 'Gagal mengirim tiket');
      }
    } catch (err: any) {
      console.error('Submit error:', err);
      setError('Terjadi kesalahan saat mengirim tiket: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setCurrentStep(1);
    setFormData({
      reporter_name: '',
      reporter_email: '',
      reporter_phone: '',
      reporter_department: unitName || '',
      reporter_position: '',
      category: '',
      priority: 'medium',
      title: '',
      description: '',
      attachments: []
    });
  };

  // Success Screen
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-700 flex items-center justify-center p-6">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 -left-20 w-48 h-48 bg-purple-300/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative bg-white rounded-[2rem] shadow-2xl p-8 max-w-sm w-full text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/30">
            <span className="material-symbols-outlined text-white text-5xl">check_circle</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Tiket Berhasil Dibuat!</h2>
          <p className="text-gray-500 mb-6">Tim terkait akan segera menindaklanjuti</p>
          
          <div className="bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl p-6 mb-6 text-white shadow-lg">
            <p className="text-white/80 text-sm mb-1">Nomor Tiket</p>
            <p className="text-3xl font-bold tracking-wider">{ticketNumber}</p>
          </div>
          
          <p className="text-gray-400 text-sm mb-6">Simpan nomor ini untuk melacak status tiket Anda</p>
          
          <button 
            onClick={resetForm} 
            className="w-full py-4 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-purple-500/30 active:scale-95 transition-transform"
          >
            Buat Tiket Baru
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-700 flex flex-col overflow-hidden">
      {/* Decorative */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-20 w-48 h-48 bg-purple-300/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-indigo-300/20 rounded-full blur-2xl"></div>
      </div>

      {/* Unit Info - Minimal Header */}
      {unitName && (
        <div className="relative z-10 px-6 pt-8 pb-4 flex-shrink-0">
          <div className="max-w-md mx-auto bg-white/20 backdrop-blur-xl rounded-xl px-4 py-3 flex items-center gap-3">
            <span className="material-symbols-outlined text-white">business</span>
            <span className="text-white font-medium flex-1">{unitName}</span>
            <span className="material-symbols-outlined text-green-300">verified</span>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="relative z-10 px-6 mb-4 flex-shrink-0">
          <div className="max-w-md mx-auto bg-red-500/90 backdrop-blur-xl rounded-xl px-4 py-3 flex items-center gap-3">
            <span className="material-symbols-outlined text-white">error</span>
            <span className="text-white text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Form Content */}
      <main className="relative z-10 flex-1 bg-white rounded-t-[2.5rem] overflow-hidden shadow-2xl flex flex-col">
        <form onSubmit={handleSubmit} className="h-full flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-8">
            <div className="max-w-md mx-auto space-y-6">
              
              {/* Progress Indicator */}
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-violet-500 to-purple-600 rounded-full transition-all duration-500" 
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-gray-500 text-sm font-medium">{currentStep}/{totalSteps}</span>
              </div>

              {/* Step 1: Reporter Info */}
              {currentStep === 1 && (
                <div className="space-y-5 animate-slideUp">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Data Pelapor</h2>
                    <p className="text-gray-500 text-sm">Informasi petugas yang melaporkan</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Lengkap *</label>
                    <input 
                      type="text" 
                      name="reporter_name" 
                      value={formData.reporter_name} 
                      onChange={handleInputChange} 
                      required
                      className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-0 text-gray-800 text-lg transition-colors"
                      placeholder="Masukkan nama lengkap"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                    <input 
                      type="email" 
                      name="reporter_email" 
                      value={formData.reporter_email} 
                      onChange={handleInputChange} 
                      required
                      className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-0 text-gray-800 text-lg transition-colors"
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
                      className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-0 text-gray-800 text-lg transition-colors"
                      placeholder="08xxxxxxxxxx"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Unit/Departemen *</label>
                    <input 
                      type="text" 
                      name="reporter_department" 
                      value={formData.reporter_department} 
                      onChange={handleInputChange} 
                      required
                      className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-0 text-gray-800 text-lg transition-colors"
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
                      className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-0 text-gray-800 text-lg transition-colors"
                      placeholder="Contoh: Perawat, Dokter"
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Ticket Details */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-slideUp">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Detail Tiket</h2>
                    <p className="text-gray-500 text-sm">Jelaskan masalah yang perlu ditangani</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Kategori *</label>
                    <div className="grid grid-cols-2 gap-3">
                      {categories.map((cat) => (
                        <button 
                          key={cat.value} 
                          type="button" 
                          onClick={() => setFormData(prev => ({ ...prev, category: cat.value }))}
                          className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                            formData.category === cat.value 
                              ? 'border-purple-500 bg-purple-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <span className="text-2xl">{cat.icon}</span>
                          <span className={`font-semibold text-sm ${
                            formData.category === cat.value ? 'text-purple-600' : 'text-gray-600'
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
                              ? 'border-purple-500 bg-purple-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full ${p.color}`}></div>
                          <span className={`text-xs font-semibold ${
                            formData.priority === p.value ? 'text-purple-600' : 'text-gray-600'
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
                      className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-0 text-gray-800 text-lg transition-colors"
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
                      rows={4}
                      className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-0 text-gray-800 text-lg transition-colors resize-none"
                      placeholder="Jelaskan masalah secara detail..."
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
                  <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center relative hover:border-purple-400 transition-colors">
                    <input 
                      type="file" 
                      multiple 
                      accept=".jpg,.jpeg,.png,.pdf,.doc,.docx" 
                      onChange={handleFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/30">
                      <span className="material-symbols-outlined text-white text-3xl">cloud_upload</span>
                    </div>
                    <p className="font-semibold text-gray-700 mb-1">Tap untuk unggah</p>
                    <p className="text-sm text-gray-500">JPG, PNG, PDF, DOC (Maks. 5MB)</p>
                  </div>

                  {formData.attachments.length > 0 && (
                    <div className="space-y-2">
                      {formData.attachments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                              <span className="material-symbols-outlined text-purple-500">attach_file</span>
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
                  <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-5 space-y-3">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                      <span className="material-symbols-outlined text-purple-500">summarize</span>
                      Ringkasan Tiket
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Pelapor</span>
                        <span className="font-medium text-gray-800">{formData.reporter_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Kategori</span>
                        <span className="font-medium text-gray-800">
                          {categories.find(c => c.value === formData.category)?.label || '-'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Prioritas</span>
                        <span className="font-medium text-gray-800 capitalize">{formData.priority}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Judul</span>
                        <span className="font-medium text-gray-800 truncate max-w-[180px]">{formData.title}</span>
                      </div>
                      {unitName && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Unit Tujuan</span>
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
                    (currentStep === 1 && (!formData.reporter_name || !formData.reporter_email || !formData.reporter_department)) ||
                    (currentStep === 2 && (!formData.category || !formData.title || !formData.description))
                  }
                  className="flex-1 py-4 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-purple-500/30 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                >
                  Lanjutkan
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              ) : (
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="flex-1 py-4 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-purple-500/30 disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
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

export default DirectInternalTicketForm;
