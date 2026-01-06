import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

interface FormData {
  service_type: string;
  full_name: string;
  is_anonymous: boolean;
  phone: string;
  email: string;
  age: string;
  gender: string;
  q1: string; q2: string; q3: string; q4: string; q5: string; q6: string; q7: string; q8: string;
  overall_satisfaction: string;
  suggestions: string;
}

// Fullscreen Mobile-optimized Public Survey Form
// Halaman ini diakses melalui scan QR Code - TANPA SIDEBAR, HEADER, FOOTER
const PublicSurveyFullscreen: React.FC = () => {
  const [searchParams] = useSearchParams();
  
  const qrCode = searchParams.get('qr') || '';
  const unitId = searchParams.get('unit_id') || '';
  const unitName = decodeURIComponent(searchParams.get('unit_name') || '');
  const autoFill = searchParams.get('auto_fill') === 'true';

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  
  const [formData, setFormData] = useState<FormData>({
    service_type: '',
    full_name: '',
    is_anonymous: false,
    phone: '',
    email: '',
    age: '',
    gender: '',
    q1: '', q2: '', q3: '', q4: '', q5: '', q6: '', q7: '', q8: '',
    overall_satisfaction: '',
    suggestions: ''
  });

  const questions = [
    { id: 'q1', code: 'U1', title: 'Persyaratan', text: 'Kesesuaian persyaratan pelayanan' },
    { id: 'q2', code: 'U2', title: 'Prosedur', text: 'Kemudahan prosedur pelayanan' },
    { id: 'q3', code: 'U3', title: 'Waktu', text: 'Kecepatan waktu pelayanan' },
    { id: 'q4', code: 'U4', title: 'Biaya', text: 'Kewajaran biaya/tarif' },
    { id: 'q5', code: 'U5', title: 'Produk', text: 'Kesesuaian produk pelayanan' },
    { id: 'q6', code: 'U6', title: 'Kompetensi', text: 'Kemampuan petugas' },
    { id: 'q7', code: 'U7', title: 'Perilaku', text: 'Kesopanan & keramahan petugas' },
    { id: 'q8', code: 'U8', title: 'Pengaduan', text: 'Kualitas penanganan pengaduan' }
  ];

  const ratingOptions = [
    { value: '1', label: 'Tidak Baik', emoji: '😞', color: 'bg-red-500' },
    { value: '2', label: 'Kurang Baik', emoji: '😐', color: 'bg-orange-500' },
    { value: '3', label: 'Baik', emoji: '🙂', color: 'bg-yellow-500' },
    { value: '4', label: 'Sangat Baik', emoji: '😊', color: 'bg-green-500' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleRadioChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const response = await fetch('/api/public/survey/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, qr_code: qrCode, unit_id: unitId, unit_name: unitName, source: 'qr_code' })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Gagal mengirim survei');
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setCurrentStep(1);
    setFormData({
      service_type: '', full_name: '', is_anonymous: false, phone: '', email: '', age: '', gender: '',
      q1: '', q2: '', q3: '', q4: '', q5: '', q6: '', q7: '', q8: '', overall_satisfaction: '', suggestions: ''
    });
  };

  // Calculate progress
  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  // Success Screen
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-6xl">🎉</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Terima Kasih!</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">Survei Anda telah berhasil dikirim. Masukan Anda sangat berharga bagi kami.</p>
          <button onClick={resetForm} className="w-full py-4 bg-primary text-white rounded-2xl font-semibold text-lg hover:bg-blue-600 transition-all active:scale-95">
            Isi Survei Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
      {/* Minimal Header with Progress */}
      <div className="bg-white dark:bg-slate-800 shadow-sm safe-area-top">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between max-w-lg mx-auto">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-green-600 text-xl">rate_review</span>
              </div>
              <span className="font-bold text-slate-900 dark:text-white">Survei Kepuasan</span>
            </div>
            <span className="text-sm text-slate-500">{currentStep}/{totalSteps}</span>
          </div>
        </div>
        {/* Progress Bar */}
        <div className="h-1 bg-slate-200 dark:bg-slate-700">
          <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Unit Info */}
      {unitName && autoFill && (
        <div className="bg-green-50 dark:bg-green-900/20 px-4 py-2">
          <div className="max-w-lg mx-auto flex items-center gap-2">
            <span className="material-symbols-outlined text-green-600 text-sm">location_on</span>
            <span className="text-sm text-green-700 dark:text-green-300 font-medium">{unitName}</span>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 px-4 py-3">
          <div className="max-w-lg mx-auto flex items-center gap-2">
            <span className="material-symbols-outlined text-red-600 text-sm">error</span>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto px-4 py-6 space-y-6">

          {/* Step 1: Service Type & Identity */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Jenis Layanan</h2>
              
              <div className="grid grid-cols-2 gap-3">
                {[{ value: 'rawat_jalan', label: 'Rawat Jalan', icon: '🏥' },
                  { value: 'rawat_inap', label: 'Rawat Inap', icon: '🛏️' },
                  { value: 'darurat', label: 'Darurat', icon: '🚑' },
                  { value: 'lainnya', label: 'Lainnya', icon: '📋' }
                ].map((type) => (
                  <button key={type.value} type="button" onClick={() => handleRadioChange('service_type', type.value)}
                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${formData.service_type === type.value ? 'border-primary bg-primary/5' : 'border-slate-200 dark:border-slate-700'}`}>
                    <span className="text-3xl">{type.icon}</span>
                    <span className="text-sm font-medium">{type.label}</span>
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Nama Lengkap</label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="is_anonymous" checked={formData.is_anonymous} onChange={handleInputChange}
                      className="w-5 h-5 rounded border-slate-300 text-primary" />
                    <span className="text-sm text-slate-500">Anonim</span>
                  </label>
                </div>
                <input type="text" name="full_name" value={formData.full_name} onChange={handleInputChange} disabled={formData.is_anonymous}
                  className="w-full px-4 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-lg disabled:opacity-50"
                  placeholder="Masukkan nama lengkap" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Nomor HP (WhatsApp) *</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required
                  className="w-full px-4 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-lg"
                  placeholder="08xxxxxxxxxx" />
              </div>

              <button type="button" onClick={() => setCurrentStep(2)} disabled={!formData.service_type || !formData.phone}
                className="w-full py-4 bg-primary text-white rounded-2xl font-semibold text-lg disabled:opacity-50 flex items-center justify-center gap-2">
                Lanjutkan <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          )}

          {/* Step 2: Demographics */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setCurrentStep(1)} className="p-2 -ml-2 text-slate-400">
                  <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Data Diri</h2>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Usia</label>
                <div className="grid grid-cols-2 gap-2">
                  {['< 20 Th', '20-40 Th', '41-60 Th', '> 60 Th'].map((range) => (
                    <button key={range} type="button" onClick={() => handleRadioChange('age', range)}
                      className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${formData.age === range ? 'border-primary bg-primary text-white' : 'border-slate-200 dark:border-slate-700'}`}>
                      {range}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Jenis Kelamin</label>
                <div className="grid grid-cols-2 gap-3">
                  {[{ value: 'male', label: 'Laki-laki', icon: '👨' }, { value: 'female', label: 'Perempuan', icon: '👩' }].map((opt) => (
                    <button key={opt.value} type="button" onClick={() => handleRadioChange('gender', opt.value)}
                      className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-center gap-2 ${formData.gender === opt.value ? 'border-primary bg-primary/5' : 'border-slate-200 dark:border-slate-700'}`}>
                      <span className="text-2xl">{opt.icon}</span>
                      <span className="font-medium">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button type="button" onClick={() => setCurrentStep(3)}
                className="w-full py-4 bg-primary text-white rounded-2xl font-semibold text-lg flex items-center justify-center gap-2">
                Lanjutkan <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          )}

          {/* Step 3: Survey Questions */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setCurrentStep(2)} className="p-2 -ml-2 text-slate-400">
                  <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Penilaian Layanan</h2>
              </div>

              {/* Rating Legend */}
              <div className="flex justify-between px-2 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs">
                {ratingOptions.map((opt) => (
                  <div key={opt.value} className="flex flex-col items-center gap-1">
                    <span className="text-lg">{opt.emoji}</span>
                    <span className="text-slate-500">{opt.value}</span>
                  </div>
                ))}
              </div>

              {/* Questions */}
              <div className="space-y-4">
                {questions.map((q) => (
                  <div key={q.id} className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-start gap-3 mb-3">
                      <span className="flex-shrink-0 w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center text-xs font-bold">{q.code}</span>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">{q.title}</h4>
                        <p className="text-xs text-slate-500">{q.text}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {ratingOptions.map((opt) => (
                        <button key={opt.value} type="button" onClick={() => handleRadioChange(q.id, opt.value)}
                          className={`flex-1 py-3 rounded-xl border-2 text-lg transition-all ${formData[q.id as keyof FormData] === opt.value ? `${opt.color} text-white border-transparent` : 'border-slate-200 dark:border-slate-700'}`}>
                          {opt.emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <button type="button" onClick={() => setCurrentStep(4)}
                disabled={!questions.every(q => formData[q.id as keyof FormData])}
                className="w-full py-4 bg-primary text-white rounded-2xl font-semibold text-lg disabled:opacity-50 flex items-center justify-center gap-2">
                Lanjutkan <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          )}

          {/* Step 4: Overall & Submit */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setCurrentStep(3)} className="p-2 -ml-2 text-slate-400">
                  <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Kepuasan Keseluruhan</h2>
              </div>

              {/* Star Rating */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-slate-800 dark:to-slate-800 rounded-2xl p-6 text-center">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Berikan rating keseluruhan</p>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} type="button" onClick={() => handleRadioChange('overall_satisfaction', star.toString())}
                      className="p-1 transition-transform hover:scale-110 active:scale-95">
                      <span className={`text-4xl ${parseInt(formData.overall_satisfaction) >= star ? 'text-yellow-500' : 'text-slate-300'}`}>★</span>
                    </button>
                  ))}
                </div>
                {formData.overall_satisfaction && (
                  <p className="mt-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                    {parseInt(formData.overall_satisfaction) <= 2 ? 'Kurang Puas' : parseInt(formData.overall_satisfaction) <= 3 ? 'Cukup Puas' : parseInt(formData.overall_satisfaction) <= 4 ? 'Puas' : 'Sangat Puas'}
                  </p>
                )}
              </div>

              {/* Suggestions */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Saran & Masukan (Opsional)</label>
                <textarea name="suggestions" value={formData.suggestions} onChange={handleInputChange} rows={4}
                  className="w-full px-4 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-lg resize-none"
                  placeholder="Berikan saran untuk peningkatan layanan..." />
              </div>

              <button type="submit" disabled={submitting || !formData.overall_satisfaction}
                className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl font-semibold text-lg disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-green-500/30">
                {submitting ? (
                  <><div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div> Mengirim...</>
                ) : (
                  <><span className="material-symbols-outlined">send</span> Kirim Survei</>
                )}
              </button>

              <p className="text-xs text-slate-500 text-center">Data Anda dijaga kerahasiaannya.</p>
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

export default PublicSurveyFullscreen;
