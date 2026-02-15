import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

interface FormData {
  reporter_identity_type: 'personal' | 'anonymous';
  reporter_name: string;
  reporter_email: string;
  reporter_phone: string;
  reporter_address: string;
  service_type: string;
  service_category_id: string;
  patient_type_id: string;
  category: string;
  title: string;
  description: string;
  attachments: File[];
}

// Fullscreen Mobile App Mode - External Ticket Form
// Halaman ini diakses melalui scan QR Code - TANPA HEADER, FOOTER, SIDEBAR
const FullscreenExternalTicket: React.FC = () => {
  const [searchParams] = useSearchParams();
  
  const qrCode = searchParams.get('qr') || '';
  const unitId = searchParams.get('unit_id') || '';
  const unitName = decodeURIComponent(searchParams.get('unit_name') || '');
  const autoFill = searchParams.get('auto_fill') === 'true';

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ticketNumber, setTicketNumber] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // Multi-step form
  
  const [formData, setFormData] = useState<FormData>({
    reporter_identity_type: 'personal',
    reporter_name: '',
    reporter_email: '',
    reporter_phone: '',
    reporter_address: '',
    service_type: '',
    service_category_id: '',
    patient_type_id: '',
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
      // Kirim sebagai JSON
      const submitData = {
        reporter_identity_type: formData.reporter_identity_type,
        reporter_name: formData.reporter_name,
        reporter_email: formData.reporter_email,
        reporter_phone: formData.reporter_phone,
        reporter_address: formData.reporter_address,
        service_type: formData.service_type,
        service_category_id: formData.service_category_id, // WAJIB
        patient_type_id: formData.patient_type_id, // WAJIB
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
      } else {
        setError(result.error || 'Gagal mengirim laporan');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat mengirim laporan');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setStep(1);
    setFormData({
      reporter_identity_type: 'personal',
      reporter_name: '', reporter_email: '', reporter_phone: '', reporter_address: '',
      service_type: '', service_category_id: '', patient_type_id: '', category: '', title: '', description: '', attachments: []
    });
    setCaptchaVerified(false);
  };

  // Success Screen
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <span className="material-symbols-outlined text-green-600 text-5xl">check_circle</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Berhasil!</h2>
          <p className="text-slate-500 mb-6">Laporan Anda telah dikirim</p>
          <div className="bg-slate-100 rounded-2xl p-5 mb-6">
            <p className="text-xs text-slate-400 mb-1 uppercase tracking-wider">Nomor Tiket</p>
            <p className="text-3xl font-bold text-primary">{ticketNumber}</p>
          </div>
          <p className="text-sm text-slate-400 mb-6">Simpan nomor ini untuk melacak status</p>
          <button onClick={resetForm} className="w-full py-4 bg-primary text-white rounded-2xl font-bold text-lg shadow-lg shadow-primary/30 active:scale-95 transition-transform">
            Buat Laporan Baru
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
      {/* Progress Bar */}
      <div className="bg-white dark:bg-slate-800 px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Langkah {step} dari 3</span>
          <span className="text-xs text-slate-400">{Math.round((step / 3) * 100)}%</span>
        </div>
        <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${(step / 3) * 100}%` }} />
        </div>
      </div>

      {/* Unit Info - Compact */}
      {unitName && autoFill && (
        <div className="mx-4 mt-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-white">business</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Unit Tujuan</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{unitName}</p>
          </div>
          <span className="material-symbols-outlined text-green-500">verified</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mx-4 mt-4 bg-red-50 dark:bg-red-900/20 rounded-xl p-3 flex items-center gap-3">
          <span className="material-symbols-outlined text-red-500">error</span>
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col p-4">
        {/* Step 1: Identity */}
        {step === 1 && (
          <div className="flex-1 space-y-4">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <span className="material-symbols-outlined text-primary text-3xl">person</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Identitas Pelapor</h2>
              <p className="text-sm text-slate-500">Pilih cara Anda ingin melapor</p>
            </div>

            {/* Identity Toggle */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { value: 'personal', icon: 'person', label: 'Dengan Identitas' },
                { value: 'anonymous', icon: 'visibility_off', label: 'Anonim' }
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, reporter_identity_type: opt.value as any }))}
                  className={`p-4 rounded-2xl border-2 transition-all ${formData.reporter_identity_type === opt.value ? 'border-primary bg-primary/5' : 'border-slate-200 dark:border-slate-700'}`}
                >
                  <span className={`material-symbols-outlined text-2xl mb-2 ${formData.reporter_identity_type === opt.value ? 'text-primary' : 'text-slate-400'}`}>{opt.icon}</span>
                  <p className={`text-sm font-medium ${formData.reporter_identity_type === opt.value ? 'text-primary' : 'text-slate-600 dark:text-slate-400'}`}>{opt.label}</p>
                </button>
              ))}
            </div>

            {formData.reporter_identity_type === 'personal' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Nama Lengkap *</label>
                  <input type="text" name="reporter_name" value={formData.reporter_name} onChange={handleInputChange} required
                    className="w-full px-4 py-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="Masukkan nama lengkap" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Nomor HP</label>
                  <input type="tel" name="reporter_phone" value={formData.reporter_phone} onChange={handleInputChange}
                    className="w-full px-4 py-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="08xxxxxxxxxx" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email</label>
                  <input type="email" name="reporter_email" value={formData.reporter_email} onChange={handleInputChange}
                    className="w-full px-4 py-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="email@example.com" />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Report Details */}
        {step === 2 && (
          <div className="flex-1 space-y-4">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <span className="material-symbols-outlined text-orange-600 text-3xl">description</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Detail Laporan</h2>
              <p className="text-sm text-slate-500">Jelaskan masalah yang ingin dilaporkan</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Jenis Layanan *</label>
              <select name="service_type" value={formData.service_type} onChange={handleInputChange} required
                className="w-full px-4 py-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-lg focus:ring-2 focus:ring-primary/20 focus:border-primary">
                <option value="">Pilih jenis layanan...</option>
                <option value="complaint">Pengaduan</option>
                <option value="request">Permintaan Informasi</option>
                <option value="suggestion">Saran & Masukan</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Kategori</label>
              <select name="category" value={formData.category} onChange={handleInputChange}
                className="w-full px-4 py-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-lg focus:ring-2 focus:ring-primary/20 focus:border-primary">
                <option value="">Pilih kategori...</option>
                <option value="service">Pelayanan Medis</option>
                <option value="facility">Fasilitas & Sarana</option>
                <option value="staff">Perilaku Petugas</option>
                <option value="admin">Administrasi</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Judul Laporan *</label>
              <input type="text" name="title" value={formData.title} onChange={handleInputChange} required
                className="w-full px-4 py-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="Ringkasan singkat masalah" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Deskripsi *</label>
              <textarea name="description" value={formData.description} onChange={handleInputChange} required rows={4}
                className="w-full px-4 py-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-lg focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                placeholder="Jelaskan kronologi kejadian..." />
            </div>
          </div>
        )}

        {/* Step 3: Attachments & Submit */}
        {step === 3 && (
          <div className="flex-1 space-y-4">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <span className="material-symbols-outlined text-green-600 text-3xl">attach_file</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Lampiran & Kirim</h2>
              <p className="text-sm text-slate-500">Tambahkan bukti pendukung (opsional)</p>
            </div>

            {/* File Upload */}
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl p-6 text-center relative">
              <input type="file" multiple accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              <span className="material-symbols-outlined text-slate-400 text-4xl mb-2">cloud_upload</span>
              <p className="text-sm text-slate-600 dark:text-slate-400">Tap untuk unggah foto/dokumen</p>
              <p className="text-xs text-slate-400 mt-1">JPG, PNG, PDF (Maks. 5MB)</p>
            </div>

            {formData.attachments.length > 0 && (
              <div className="space-y-2">
                {formData.attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-800 rounded-xl">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="material-symbols-outlined text-slate-400">attach_file</span>
                      <span className="text-sm text-slate-700 dark:text-slate-300 truncate">{file.name}</span>
                    </div>
                    <button type="button" onClick={() => removeFile(index)} className="p-2 text-red-500">
                      <span className="material-symbols-outlined">close</span>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Captcha */}
            <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl p-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={captchaVerified} onChange={(e) => setCaptchaVerified(e.target.checked)}
                  className="w-6 h-6 rounded-lg border-slate-300 text-primary focus:ring-primary" />
                <span className="text-slate-700 dark:text-slate-300">Saya bukan robot</span>
              </label>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="pt-4 space-y-3">
          {step < 3 ? (
            <button type="button" onClick={() => setStep(step + 1)}
              className="w-full py-4 bg-primary text-white rounded-2xl font-bold text-lg shadow-lg shadow-primary/30 active:scale-95 transition-transform flex items-center justify-center gap-2">
              Lanjutkan
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          ) : (
            <button type="submit" disabled={submitting || !captchaVerified}
              className="w-full py-4 bg-primary text-white rounded-2xl font-bold text-lg shadow-lg shadow-primary/30 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
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
          
          {step > 1 && (
            <button type="button" onClick={() => setStep(step - 1)}
              className="w-full py-4 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl font-medium text-lg active:scale-95 transition-transform flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">arrow_back</span>
              Kembali
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default FullscreenExternalTicket;
