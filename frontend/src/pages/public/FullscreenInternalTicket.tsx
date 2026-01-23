import React, { useState } from 'react';
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

const FullscreenInternalTicket: React.FC = () => {
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
    reporter_name: '', reporter_email: '', reporter_phone: '',
    reporter_department: '', reporter_position: '',
    category: '', priority: 'medium', title: '', description: '', attachments: []
  });

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
      const response = await fetch('/api/public/internal-tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, qr_code: qrCode, unit_id: unitId, source: 'qr_code' })
      });
      const result = await response.json();

      if (response.ok) {
        setTicketNumber(result.ticket_number || 'INT-' + Date.now());
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
    setCurrentStep(1);
    setFormData({
      reporter_name: '', reporter_email: '', reporter_phone: '',
      reporter_department: '', reporter_position: '',
      category: '', priority: 'medium', title: '', description: '', attachments: []
    });
  };

  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-purple-600 text-5xl">check_circle</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Tiket Berhasil Dibuat!</h2>
          <p className="text-gray-500 mb-6">Tim terkait akan segera menindaklanjuti.</p>
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl p-6 mb-6 text-white">
            <p className="text-sm opacity-80 mb-1">Nomor Tiket</p>
            <p className="text-3xl font-bold tracking-wider">{ticketNumber}</p>
          </div>
          <button onClick={resetForm} className="w-full py-4 bg-purple-600 text-white rounded-2xl font-bold text-lg">
            Buat Tiket Baru
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="bg-white shadow-sm safe-area-top">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between max-w-lg mx-auto">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-purple-600 text-xl">assignment</span>
              </div>
              <span className="font-bold text-gray-800">Tiket Internal</span>
            </div>
            <span className="text-sm text-gray-500">{currentStep}/{totalSteps}</span>
          </div>
        </div>
        <div className="h-1 bg-gray-200">
          <div className="h-full bg-purple-500 transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {unitName && autoFill && (
        <div className="bg-purple-50 px-4 py-2">
          <div className="max-w-lg mx-auto flex items-center gap-2">
            <span className="material-symbols-outlined text-purple-600 text-sm">location_on</span>
            <span className="text-sm text-purple-700 font-medium">{unitName}</span>
            <span className="material-symbols-outlined text-green-500 text-sm">verified</span>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 px-4 py-3">
          <div className="max-w-lg mx-auto flex items-center gap-2">
            <span className="material-symbols-outlined text-red-600 text-sm">error</span>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
          {currentStep === 1 && (
            <div className="space-y-4 animate-fadeIn">
              <h2 className="text-xl font-bold text-gray-800">Data Pelapor</h2>
              <p className="text-sm text-gray-500">Khusus untuk petugas internal</p>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap *</label>
                <input type="text" name="reporter_name" value={formData.reporter_name} onChange={handleInputChange} required
                  className="w-full px-4 py-4 rounded-2xl border border-gray-200 text-lg" placeholder="Masukkan nama lengkap" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input type="email" name="reporter_email" value={formData.reporter_email} onChange={handleInputChange} required
                  className="w-full px-4 py-4 rounded-2xl border border-gray-200 text-lg" placeholder="email@rumahsakit.com" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nomor Telepon</label>
                <input type="tel" name="reporter_phone" value={formData.reporter_phone} onChange={handleInputChange}
                  className="w-full px-4 py-4 rounded-2xl border border-gray-200 text-lg" placeholder="08xxxxxxxxxx" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Unit/Departemen *</label>
                <input type="text" name="reporter_department" value={formData.reporter_department} onChange={handleInputChange} required
                  className="w-full px-4 py-4 rounded-2xl border border-gray-200 text-lg" placeholder="Contoh: Unit Rawat Inap" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Jabatan</label>
                <input type="text" name="reporter_position" value={formData.reporter_position} onChange={handleInputChange}
                  className="w-full px-4 py-4 rounded-2xl border border-gray-200 text-lg" placeholder="Contoh: Perawat, Dokter" />
              </div>

              <button type="button" onClick={() => setCurrentStep(2)} disabled={!formData.reporter_name || !formData.reporter_email || !formData.reporter_department}
                className="w-full py-4 bg-purple-600 text-white rounded-2xl font-bold text-lg disabled:opacity-50 flex items-center justify-center gap-2">
                Lanjutkan <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center gap-2 mb-2">
                <button type="button" onClick={() => setCurrentStep(1)} className="p-2 -ml-2 text-gray-400">
                  <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h2 className="text-xl font-bold text-gray-800">Detail Tiket</h2>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kategori *</label>
                <div className="grid grid-cols-2 gap-2">
                  {[{ value: 'it_support', label: 'IT & Sistem', icon: '💻' },
                    { value: 'facility', label: 'Fasilitas', icon: '🏥' },
                    { value: 'equipment', label: 'Peralatan', icon: '🔧' },
                    { value: 'hr', label: 'SDM', icon: '👥' },
                    { value: 'admin', label: 'Administrasi', icon: '📋' },
                    { value: 'other', label: 'Lainnya', icon: '📝' }
                  ].map((cat) => (
                    <button key={cat.value} type="button" onClick={() => setFormData(prev => ({ ...prev, category: cat.value }))}
                      className={`p-3 rounded-2xl border-2 flex items-center gap-2 ${formData.category === cat.value ? 'border-purple-500 bg-purple-50' : 'border-gray-200'}`}>
                      <span className="text-xl">{cat.icon}</span>
                      <span className="text-sm font-medium">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prioritas *</label>
                <div className="grid grid-cols-4 gap-2">
                  {[{ value: 'low', label: 'Rendah', color: 'bg-green-500' },
                    { value: 'medium', label: 'Sedang', color: 'bg-yellow-500' },
                    { value: 'high', label: 'Tinggi', color: 'bg-orange-500' },
                    { value: 'critical', label: 'Kritis', color: 'bg-red-500' }
                  ].map((p) => (
                    <button key={p.value} type="button" onClick={() => setFormData(prev => ({ ...prev, priority: p.value }))}
                      className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1 ${formData.priority === p.value ? 'border-purple-500' : 'border-gray-200'}`}>
                      <div className={`w-3 h-3 rounded-full ${p.color}`}></div>
                      <span className="text-xs font-medium">{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Judul Tiket *</label>
                <input type="text" name="title" value={formData.title} onChange={handleInputChange} required
                  className="w-full px-4 py-4 rounded-2xl border border-gray-200 text-lg" placeholder="Ringkasan singkat masalah" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi Lengkap *</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} required rows={4}
                  className="w-full px-4 py-4 rounded-2xl border border-gray-200 text-lg resize-none" placeholder="Jelaskan masalah secara detail..." />
              </div>

              <button type="button" onClick={() => setCurrentStep(3)} disabled={!formData.category || !formData.title || !formData.description}
                className="w-full py-4 bg-purple-600 text-white rounded-2xl font-bold text-lg disabled:opacity-50 flex items-center justify-center gap-2">
                Lanjutkan <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center gap-2 mb-2">
                <button type="button" onClick={() => setCurrentStep(2)} className="p-2 -ml-2 text-gray-400">
                  <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h2 className="text-xl font-bold text-gray-800">Lampiran & Kirim</h2>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center relative">
                <input type="file" multiple accept=".jpg,.jpeg,.png,.pdf,.doc,.docx" onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="material-symbols-outlined text-gray-400 text-3xl">cloud_upload</span>
                </div>
                <p className="text-sm font-medium text-gray-700">Tap untuk unggah foto/dokumen</p>
                <p className="text-xs text-gray-500 mt-1">JPG, PNG, PDF, DOC (Maks. 5MB)</p>
              </div>

              {formData.attachments.length > 0 && (
                <div className="space-y-2">
                  {formData.attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-100 rounded-xl">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-gray-400">attach_file</span>
                        <div>
                          <p className="text-sm font-medium text-gray-700 truncate max-w-[200px]">{file.name}</p>
                          <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                      <button type="button" onClick={() => removeFile(index)} className="p-2 text-red-500">
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="bg-purple-50 rounded-2xl p-4 space-y-2">
                <h3 className="font-bold text-gray-800">Ringkasan Tiket</h3>
                <div className="text-sm space-y-1">
                  <p><span className="text-gray-500">Pelapor:</span> <span className="font-medium">{formData.reporter_name}</span></p>
                  <p><span className="text-gray-500">Kategori:</span> <span className="font-medium">{formData.category}</span></p>
                  <p><span className="text-gray-500">Prioritas:</span> <span className="font-medium capitalize">{formData.priority}</span></p>
                  <p><span className="text-gray-500">Judul:</span> <span className="font-medium">{formData.title}</span></p>
                  {unitName && <p><span className="text-gray-500">Unit Tujuan:</span> <span className="font-medium">{unitName}</span></p>}
                </div>
              </div>

              <button type="submit" disabled={submitting}
                className="w-full py-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-2xl font-bold text-lg disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-purple-500/30">
                {submitting ? (
                  <><div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div> Mengirim...</>
                ) : (
                  <><span className="material-symbols-outlined">send</span> Kirim Tiket</>
                )}
              </button>
            </div>
          )}
        </div>
      </form>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .safe-area-top { padding-top: env(safe-area-inset-top); }
      `}</style>
    </div>
  );
};

export default FullscreenInternalTicket;
