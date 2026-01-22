import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

interface FormData {
  service_type: string;
  full_name: string;
  is_anonymous: boolean;
  phone: string;
  age: string;
  gender: string;
  q1: string; q2: string; q3: string; q4: string; q5: string; q6: string; q7: string; q8: string;
  overall_satisfaction: string;
  suggestions: string;
}

// Mobile-First Survei Form - Tampilan Clean & Modern
const MobileSurveiForm: React.FC = () => {
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
    age: '',
    gender: '',
    q1: '', q2: '', q3: '', q4: '', q5: '', q6: '', q7: '', q8: '',
    overall_satisfaction: '',
    suggestions: ''
  });

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const questions = [
    { id: 'q1', code: 'U1', title: 'Persyaratan', text: 'Kesesuaian persyaratan pelayanan', icon: '📋' },
    { id: 'q2', code: 'U2', title: 'Prosedur', text: 'Kemudahan prosedur pelayanan', icon: '📝' },
    { id: 'q3', code: 'U3', title: 'Waktu', text: 'Kecepatan waktu pelayanan', icon: '⏱️' },
    { id: 'q4', code: 'U4', title: 'Biaya', text: 'Kewajaran biaya/tarif', icon: '💰' },
    { id: 'q5', code: 'U5', title: 'Produk', text: 'Kesesuaian produk pelayanan', icon: '📦' },
    { id: 'q6', code: 'U6', title: 'Kompetensi', text: 'Kemampuan petugas', icon: '👨‍⚕️' },
    { id: 'q7', code: 'U7', title: 'Perilaku', text: 'Kesopanan & keramahan', icon: '😊' },
    { id: 'q8', code: 'U8', title: 'Pengaduan', text: 'Kualitas penanganan pengaduan', icon: '📞' }
  ];

  const ratingOptions = [
    { value: '1', label: 'Tidak Baik', emoji: '😞', color: 'from-red-400 to-rose-500' },
    { value: '2', label: 'Kurang Baik', emoji: '😐', color: 'from-orange-400 to-amber-500' },
    { value: '3', label: 'Baik', emoji: '🙂', color: 'from-yellow-400 to-amber-500' },
    { value: '4', label: 'Sangat Baik', emoji: '😊', color: 'from-emerald-400 to-green-500' }
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
      const response = await fetch('/api/public/surveys', {
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
      service_type: '', full_name: '', is_anonymous: false, phone: '', age: '', gender: '',
      q1: '', q2: '', q3: '', q4: '', q5: '', q6: '', q7: '', q8: '', overall_satisfaction: '', suggestions: ''
    });
  };

  // Success Screen
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-400 via-green-500 to-teal-600 flex items-center justify-center p-6">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 -left-20 w-48 h-48 bg-teal-300/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative bg-white rounded-[2rem] shadow-2xl p-8 max-w-sm w-full text-center">
          <div className="text-7xl mb-6">🎉</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Terima Kasih!</h2>
          <p className="text-gray-500 mb-8">Survei Anda telah berhasil dikirim. Masukan Anda sangat berharga bagi kami.</p>
          
          <button 
            onClick={resetForm} 
            className="w-full py-4 bg-gradient-to-r from-emerald-400 to-teal-500 text-white rounded-2xl font-bold text-lg shadow-lg shadow-emerald-500/30 active:scale-95 transition-transform"
          >
            Isi Survei Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 flex flex-col">
      {/* Decorative */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-20 w-48 h-48 bg-teal-300/20 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 pt-8 pb-4">
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={() => window.history.back()} 
            className="w-10 h-10 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-white">arrow_back</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-white">rate_review</span>
            </div>
          </div>
        </div>
        
        <h1 className="text-white text-2xl font-bold mb-1">Survei Kepuasan</h1>
        <p className="text-white/80 text-sm">Berikan penilaian layanan kami</p>
        
        {/* Progress */}
        <div className="mt-4 flex items-center gap-3">
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
      {unitName && autoFill && (
        <div className="relative z-10 px-6 mb-4">
          <div className="bg-white/20 backdrop-blur-xl rounded-xl px-4 py-3 flex items-center gap-3">
            <span className="material-symbols-outlined text-white">location_on</span>
            <span className="text-white font-medium flex-1">{unitName}</span>
            <span className="material-symbols-outlined text-green-300">verified</span>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="relative z-10 px-6 mb-4">
          <div className="bg-red-500/90 backdrop-blur-xl rounded-xl px-4 py-3 flex items-center gap-3">
            <span className="material-symbols-outlined text-white">error</span>
            <span className="text-white text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Form Content */}
      <main className="relative z-10 flex-1 bg-white rounded-t-[2rem] overflow-hidden">
        <form onSubmit={handleSubmit} className="h-full flex flex-col">
          <div className="flex-1 overflow-y-auto px-6 py-8">
            <div className="max-w-md mx-auto space-y-6">

              {/* Step 1: Service Type & Identity */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-slideUp">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Jenis Layanan</h2>
                    <p className="text-gray-500 text-sm">Pilih layanan yang Anda gunakan</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: 'rawat_jalan', label: 'Rawat Jalan', icon: '🏥' },
                      { value: 'rawat_inap', label: 'Rawat Inap', icon: '🛏️' },
                      { value: 'darurat', label: 'Darurat', icon: '🚑' },
                      { value: 'lainnya', label: 'Lainnya', icon: '📋' }
                    ].map((type) => (
                      <button 
                        key={type.value} 
                        type="button" 
                        onClick={() => handleRadioChange('service_type', type.value)}
                        className={`p-5 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                          formData.service_type === type.value 
                            ? 'border-emerald-500 bg-emerald-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span className="text-3xl">{type.icon}</span>
                        <span className={`font-semibold text-sm ${
                          formData.service_type === type.value ? 'text-emerald-600' : 'text-gray-600'
                        }`}>{type.label}</span>
                      </button>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-semibold text-gray-700">Nama Lengkap</label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          name="is_anonymous" 
                          checked={formData.is_anonymous} 
                          onChange={handleInputChange}
                          className="w-5 h-5 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
                        />
                        <span className="text-sm text-gray-500">Anonim</span>
                      </label>
                    </div>
                    <input 
                      type="text" 
                      name="full_name" 
                      value={formData.full_name} 
                      onChange={handleInputChange} 
                      disabled={formData.is_anonymous}
                      className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-0 text-gray-800 text-lg transition-colors disabled:opacity-50 disabled:bg-gray-50"
                      placeholder="Masukkan nama lengkap"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nomor HP (WhatsApp) *</label>
                    <input 
                      type="tel" 
                      name="phone" 
                      value={formData.phone} 
                      onChange={handleInputChange} 
                      required
                      className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-0 text-gray-800 text-lg transition-colors"
                      placeholder="08xxxxxxxxxx"
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Demographics */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-slideUp">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Data Diri</h2>
                    <p className="text-gray-500 text-sm">Informasi tambahan untuk analisis</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Usia</label>
                    <div className="grid grid-cols-2 gap-3">
                      {['< 20 Th', '20-40 Th', '41-60 Th', '> 60 Th'].map((range) => (
                        <button 
                          key={range} 
                          type="button" 
                          onClick={() => handleRadioChange('age', range)}
                          className={`p-4 rounded-xl border-2 font-medium transition-all ${
                            formData.age === range 
                              ? 'border-emerald-500 bg-emerald-500 text-white' 
                              : 'border-gray-200 text-gray-600 hover:border-gray-300'
                          }`}
                        >
                          {range}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Jenis Kelamin</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: 'male', label: 'Laki-laki', icon: '👨' }, 
                        { value: 'female', label: 'Perempuan', icon: '👩' }
                      ].map((opt) => (
                        <button 
                          key={opt.value} 
                          type="button" 
                          onClick={() => handleRadioChange('gender', opt.value)}
                          className={`p-5 rounded-2xl border-2 transition-all flex items-center justify-center gap-3 ${
                            formData.gender === opt.value 
                              ? 'border-emerald-500 bg-emerald-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <span className="text-2xl">{opt.icon}</span>
                          <span className={`font-semibold ${
                            formData.gender === opt.value ? 'text-emerald-600' : 'text-gray-600'
                          }`}>{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Survey Questions */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-slideUp">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Penilaian Layanan</h2>
                    <p className="text-gray-500 text-sm">Berikan penilaian untuk setiap aspek</p>
                  </div>

                  {/* Rating Legend */}
                  <div className="flex justify-between px-4 py-3 bg-gray-50 rounded-xl">
                    {ratingOptions.map((opt) => (
                      <div key={opt.value} className="flex flex-col items-center gap-1">
                        <span className="text-xl">{opt.emoji}</span>
                        <span className="text-xs text-gray-500">{opt.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Questions */}
                  <div className="space-y-4">
                    {questions.map((q) => (
                      <div key={q.id} className="bg-gray-50 rounded-2xl p-4">
                        <div className="flex items-start gap-3 mb-3">
                          <span className="text-2xl">{q.icon}</span>
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-800 text-sm">{q.title}</h4>
                            <p className="text-xs text-gray-500">{q.text}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {ratingOptions.map((opt) => (
                            <button 
                              key={opt.value} 
                              type="button" 
                              onClick={() => handleRadioChange(q.id, opt.value)}
                              className={`flex-1 py-3 rounded-xl text-xl transition-all ${
                                formData[q.id as keyof FormData] === opt.value 
                                  ? `bg-gradient-to-r ${opt.color} shadow-lg` 
                                  : 'bg-white border-2 border-gray-200'
                              }`}
                            >
                              {opt.emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 4: Overall & Submit */}
              {currentStep === 4 && (
                <div className="space-y-6 animate-slideUp">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Kepuasan Keseluruhan</h2>
                    <p className="text-gray-500 text-sm">Berikan rating keseluruhan</p>
                  </div>

                  {/* Star Rating */}
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 text-center">
                    <p className="text-gray-600 mb-4">Seberapa puas Anda dengan layanan kami?</p>
                    <div className="flex justify-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button 
                          key={star} 
                          type="button" 
                          onClick={() => handleRadioChange('overall_satisfaction', star.toString())}
                          className="p-1 transition-transform hover:scale-110 active:scale-95"
                        >
                          <span className={`text-5xl ${
                            parseInt(formData.overall_satisfaction) >= star 
                              ? 'text-amber-400 drop-shadow-lg' 
                              : 'text-gray-300'
                          }`}>★</span>
                        </button>
                      ))}
                    </div>
                    {formData.overall_satisfaction && (
                      <p className="mt-3 font-semibold text-gray-700">
                        {parseInt(formData.overall_satisfaction) <= 2 ? 'Kurang Puas 😔' : 
                         parseInt(formData.overall_satisfaction) <= 3 ? 'Cukup Puas 🙂' : 
                         parseInt(formData.overall_satisfaction) <= 4 ? 'Puas 😊' : 'Sangat Puas 🤩'}
                      </p>
                    )}
                  </div>

                  {/* Suggestions */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Saran & Masukan (Opsional)</label>
                    <textarea 
                      name="suggestions" 
                      value={formData.suggestions} 
                      onChange={handleInputChange} 
                      rows={4}
                      className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-0 text-gray-800 text-lg transition-colors resize-none"
                      placeholder="Berikan saran untuk peningkatan layanan..."
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Navigation */}
          <div className="px-6 py-4 bg-white border-t border-gray-100">
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
                    (currentStep === 1 && (!formData.service_type || !formData.phone)) ||
                    (currentStep === 3 && !questions.every(q => formData[q.id as keyof FormData]))
                  }
                  className="flex-1 py-4 bg-gradient-to-r from-emerald-400 to-teal-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                >
                  Lanjutkan
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              ) : (
                <button 
                  type="submit" 
                  disabled={submitting || !formData.overall_satisfaction}
                  className="flex-1 py-4 bg-gradient-to-r from-emerald-400 to-teal-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-emerald-500/30 disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                >
                  {submitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Mengirim...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined">send</span>
                      Kirim Survei
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
      `}</style>
    </div>
  );
};

export default MobileSurveiForm;
