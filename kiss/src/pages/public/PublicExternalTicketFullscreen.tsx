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
  const [captchaVerified, setCaptchaVerified] = useState(false);
  
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
    if (!captchaVerified) {
      setError('Silakan verifikasi captcha terlebih dahulu');
      return;
    }
    setSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/public/external-tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reporter_identity_type: formData.reporter_identity_type,
          reporter_name: formData.reporter_name,
          reporter_email: formData.reporter_email,
          reporter_phone: formData.reporter_phone,
          service_type: formData.service_type,
          title: formData.title,
          description: formData.description,
          qr_code: qrCode,
          unit_id: unitId,
          source: 'qr_code'
        })
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
      service_type: '',
      title: '',
      description: '',
      attachments: []
    });
    setCaptchaVerified(false);
  };

  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

  // Success Screen
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-400 via-green-500 to-teal-600 flex items-center justify-center p-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        </div>
        <div className="relative bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-bounce">
            <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Laporan Terkirim!</h2>
          <p className="text-gray-500 mb-6">Terima kasih. Tim kami akan segera menindaklanjuti.</p>
          <div className="bg-gradient-to-r from-orange-400 to-amber-500 rounded-2xl p-5 mb-6 text-white shadow-lg">
            <p className="text-sm opacity-90 mb-1">Nomor Tiket Anda</p>
            <p className="text-3xl font-bold tracking-wider">{ticketNumber}</p>
          </div>
          <p className="text-sm text-gray-400 mb-6">Simpan nomor ini untuk melacak status laporan.</p>
          <button onClick={resetForm} className="w-full py-4 bg-gradient-to-r from-orange-400 to-amber-500 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all active:scale-95">
            Buat Laporan Baru
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-amber-500 to-yellow-500 flex flex-col">
      {/* Decorative */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-white/95 backdrop-blur-xl shadow-lg pt-safe-top">
        <div className="px-4 py-4">
          <div className="max-w-lg mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl flex items-center justify-center shadow-md">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <div>
                <h1 className="font-bold text-gray-800">Buat Pengaduan</h1>
                <p className="text-xs text-gray-500">Langkah {currentStep} dari {totalSteps}</p>
              </div>
            </div>
          </div>
        </div>
        {/* Progress Bar */}
        <div className="h-1.5 bg-gray-100">
          <div className="h-full bg-gradient-to-r from-orange-400 to-amber-500 transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
        </div>
      </header>

      {/* Unit Info */}
      {unitName && autoFill && (
        <div className="relative z-10 bg-white/90 backdrop-blur px-4 py-3 border-b border-orange-200">
          <div className="max-w-lg mx-auto flex items-center gap-2">
            <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-sm font-medium text-gray-700">{unitName}</span>
            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center ml-1">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="relative z-10 bg-red-50 px-4 py-3 border-b border-red-200">
          <div className="max-w-lg mx-auto flex items-center gap-2">
            <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="relative z-10 flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto px-4 py-6 space-y-6">

          {/* Step 1: Identity */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="bg-white rounded-3xl shadow-xl p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Identitas Pelapor</h2>
                
                {/* Identity Toggle */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <button type="button" onClick={() => setFormData(prev => ({ ...prev, reporter_identity_type: 'personal' }))}
                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${formData.reporter_identity_type === 'personal' ? 'border-orange-400 bg-orange-50' : 'border-gray-200'}`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${formData.reporter_identity_type === 'personal' ? 'bg-orange-400' : 'bg-gray-100'}`}>
                      <svg className={`w-6 h-6 ${formData.reporter_identity_type === 'personal' ? 'text-white' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <span className="text-sm font-semibold text-gray-700">Identitas Pribadi</span>
                  </button>
                  <button type="button" onClick={() => setFormData(prev => ({ ...prev, reporter_identity_type: 'anonymous' }))}
                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${formData.reporter_identity_type === 'anonymous' ? 'border-orange-400 bg-orange-50' : 'border-gray-200'}`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${formData.reporter_identity_type === 'anonymous' ? 'bg-orange-400' : 'bg-gray-100'}`}>
                      <svg className={`w-6 h-6 ${formData.reporter_identity_type === 'anonymous' ? 'text-white' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    </div>
                    <span className="text-sm font-semibold text-gray-700">Anonim</span>
                  </button>
                </div>

                {formData.reporter_identity_type === 'personal' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-2">Nama Lengkap *</label>
                      <input type="text" name="reporter_name" value={formData.reporter_name} onChange={handleInputChange} required
                        className="w-full px-4 py-4 rounded-2xl border-2 border-gray-200 bg-gray-50 text-gray-800 text-lg focus:border-orange-400 focus:bg-white transition-all outline-none"
                        placeholder="Masukkan nama lengkap" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-2">Nomor Telepon</label>
                      <input type="tel" name="reporter_phone" value={formData.reporter_phone} onChange={handleInputChange}
                        className="w-full px-4 py-4 rounded-2xl border-2 border-gray-200 bg-gray-50 text-gray-800 text-lg focus:border-orange-400 focus:bg-white transition-all outline-none"
                        placeholder="08xxxxxxxxxx" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-2">Email</label>
                      <input type="email" name="reporter_email" value={formData.reporter_email} onChange={handleInputChange}
                        className="w-full px-4 py-4 rounded-2xl border-2 border-gray-200 bg-gray-50 text-gray-800 text-lg focus:border-orange-400 focus:bg-white transition-all outline-none"
                        placeholder="email@example.com" />
                    </div>
                  </div>
                )}
              </div>

              <button type="button" onClick={() => setCurrentStep(2)}
                className="w-full py-4 bg-gradient-to-r from-orange-400 to-amber-500 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2">
                Lanjutkan
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          )}

          {/* Step 2: Report Details */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="bg-white rounded-3xl shadow-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <button type="button" onClick={() => setCurrentStep(1)} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-all">
                    <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <h2 className="text-xl font-bold text-gray-800">Detail Laporan</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-3">Jenis Layanan *</label>
                    <div className="space-y-2">
                      {[{ value: 'complaint', label: 'Pengaduan', icon: '⚠️', desc: 'Keluhan atau masalah', color: 'from-red-400 to-rose-500' },
                        { value: 'request', label: 'Permintaan Informasi', icon: '❓', desc: 'Pertanyaan atau informasi', color: 'from-blue-400 to-cyan-500' },
                        { value: 'suggestion', label: 'Saran & Masukan', icon: '💡', desc: 'Ide atau masukan', color: 'from-yellow-400 to-amber-500' }
                      ].map((type) => (
                        <button key={type.value} type="button" onClick={() => setFormData(prev => ({ ...prev, service_type: type.value }))}
                          className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center gap-4 ${formData.service_type === type.value ? 'border-orange-400 bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}>
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${type.color} flex items-center justify-center text-2xl shadow-md`}>
                            {type.icon}
                          </div>
                          <div className="text-left flex-1">
                            <p className="font-bold text-gray-800">{type.label}</p>
                            <p className="text-sm text-gray-500">{type.desc}</p>
                          </div>
                          {formData.service_type === type.value && (
                            <div className="w-6 h-6 bg-orange-400 rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-2">Judul Laporan *</label>
                    <input type="text" name="title" value={formData.title} onChange={handleInputChange} required
                      className="w-full px-4 py-4 rounded-2xl border-2 border-gray-200 bg-gray-50 text-gray-800 text-lg focus:border-orange-400 focus:bg-white transition-all outline-none"
                      placeholder="Ringkasan singkat masalah" />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-2">Deskripsi Lengkap *</label>
                    <textarea name="description" value={formData.description} onChange={handleInputChange} required rows={5}
                      className="w-full px-4 py-4 rounded-2xl border-2 border-gray-200 bg-gray-50 text-gray-800 text-lg focus:border-orange-400 focus:bg-white transition-all outline-none resize-none"
                      placeholder="Jelaskan kronologi kejadian secara detail..." />
                  </div>
                </div>
              </div>

              <button type="button" onClick={() => setCurrentStep(3)}
                disabled={!formData.service_type || !formData.title || !formData.description}
                className="w-full py-4 bg-gradient-to-r from-orange-400 to-amber-500 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                Lanjutkan
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          )}

          {/* Step 3: Attachments & Submit */}
          {currentStep === 3 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="bg-white rounded-3xl shadow-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <button type="button" onClick={() => setCurrentStep(2)} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-all">
                    <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <h2 className="text-xl font-bold text-gray-800">Lampiran & Kirim</h2>
                </div>

                {/* File Upload */}
                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center relative mb-4 hover:border-orange-400 transition-all">
                  <input type="file" multiple accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-8 h-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <p className="font-semibold text-gray-700">Tap untuk unggah foto/dokumen</p>
                  <p className="text-sm text-gray-500 mt-1">JPG, PNG, PDF (Maks. 5MB)</p>
                </div>

                {formData.attachments.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {formData.attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-orange-50 rounded-xl border border-orange-200">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-orange-400 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700 truncate max-w-[180px]">{file.name}</p>
                            <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        </div>
                        <button type="button" onClick={() => removeFile(index)} className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center hover:bg-red-200 transition-all">
                          <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Captcha */}
                <div className="bg-gray-50 rounded-2xl p-4 mb-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all ${captchaVerified ? 'bg-orange-400 border-orange-400' : 'border-gray-300'}`}>
                      {captchaVerified && (
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <input type="checkbox" checked={captchaVerified} onChange={(e) => setCaptchaVerified(e.target.checked)} className="hidden" />
                    <span className="font-medium text-gray-700">Saya bukan robot</span>
                  </label>
                </div>

                {/* Summary */}
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-4 border border-orange-200">
                  <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                    <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Ringkasan Laporan
                  </h3>
                  <div className="text-sm space-y-1">
                    <p><span className="text-gray-500">Jenis:</span> <span className="font-medium text-gray-700">{formData.service_type === 'complaint' ? 'Pengaduan' : formData.service_type === 'request' ? 'Permintaan Informasi' : 'Saran & Masukan'}</span></p>
                    <p><span className="text-gray-500">Judul:</span> <span className="font-medium text-gray-700">{formData.title}</span></p>
                    {unitName && <p><span className="text-gray-500">Unit:</span> <span className="font-medium text-gray-700">{unitName}</span></p>}
                  </div>
                </div>
              </div>

              <button type="submit" disabled={submitting || !captchaVerified}
                className="w-full py-4 bg-gradient-to-r from-orange-400 to-amber-500 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Mengirim...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Kirim Laporan
                  </>
                )}
              </button>

              <p className="text-center text-white/80 text-sm">
                Dengan mengirim, Anda menyetujui kebijakan privasi kami.
              </p>
            </div>
          )}
        </div>
      </form>

      {/* CSS */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .pt-safe-top { padding-top: max(env(safe-area-inset-top), 0.5rem); }
      `}</style>
    </div>
  );
};

export default PublicExternalTicketFullscreen;
