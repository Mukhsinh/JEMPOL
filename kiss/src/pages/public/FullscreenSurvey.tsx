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

// Fullscreen Mobile App Mode - Survey Form
// Halaman ini diakses melalui scan QR Code - TANPA HEADER, FOOTER, SIDEBAR
const FullscreenSurvey: React.FC = () => {
  const [searchParams] = useSearchParams();
  
  const qrCode = searchParams.get('qr') || '';
  const unitId = searchParams.get('unit_id') || '';
  const unitName = decodeURIComponent(searchParams.get('unit_name') || '');
  const autoFill = searchParams.get('auto_fill') === 'true';

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // Multi-step form (1: Info, 2: Questions 1-4, 3: Questions 5-8, 4: Overall)
  
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
    { value: '1', label: 'Tidak Baik', color: 'bg-red-500', emoji: '😞' },
    { value: '2', label: 'Kurang Baik', color: 'bg-orange-500', emoji: '😐' },
    { value: '3', label: 'Baik', color: 'bg-yellow-500', emoji: '🙂' },
    { value: '4', label: 'Sangat Baik', color: 'bg-green-500', emoji: '😊' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
        body: JSON.stringify({
          ...formData,
          qr_code: qrCode,
          unit_id: unitId,
          unit_name: unitName,
          source: 'qr_code'
        })
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
    setStep(1);
    setFormData({
      service_type: '', full_name: '', is_anonymous: false, phone: '', email: '',
      age: '', gender: '', q1: '', q2: '', q3: '', q4: '', q5: '', q6: '', q7: '', q8: '',
      overall_satisfaction: '', suggestions: ''
    });
  };

  // Success Screen
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-6xl">🎉</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Terima Kasih!</h2>
          <p className="text-slate-500 mb-6">Survei Anda telah berhasil dikirim. Masukan Anda sangat berharga bagi kami.</p>
          <button onClick={resetForm} className="w-full py-4 bg-primary text-white rounded-2xl font-bold text-lg shadow-lg shadow-primary/30 active:scale-95 transition-transform">
            Isi Survei Lagi
          </button>
        </div>
      </div>
    );
  }

  const totalSteps = 4;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
      {/* Progress Bar */}
      <div className="bg-white dark:bg-slate-800 px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Langkah {step} dari {totalSteps}</span>
          <span className="text-xs text-slate-400">{Math.round((step / totalSteps) * 100)}%</span>
        </div>
        <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${(step / totalSteps) * 100}%` }} />
        </div>
      </div>

      {/* Unit Info */}
      {unitName && autoFill && (
        <div className="mx-4 mt-4 bg-green-50 dark:bg-green-900/20 rounded-xl p-3 flex items-center gap-3">
          <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-white">business</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-green-600 dark:text-green-400 font-medium">Unit Layanan</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{unitName}</p>
          </div>
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
        {/* Step 1: Respondent Info */}
        {step === 1 && (
          <div className="flex-1 space-y-4">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <span className="material-symbols-outlined text-blue-600 text-3xl">person</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Data Responden</h2>
              <p className="text-sm text-slate-500">Informasi dasar tentang Anda</p>
            </div>

            {/* Service Type */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Jenis Layanan *</label>
              <div className="grid grid-cols-2 gap-2">
                {['rawat_jalan', 'rawat_inap', 'darurat', 'lainnya'].map((type) => (
                  <button key={type} type="button" onClick={() => handleRadioChange('service_type', type)}
                    className={`p-3 rounded-xl border-2 text-sm font-medium capitalize transition-all ${formData.service_type === type ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>
                    {type.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Anonymous Toggle */}
            <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-4">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-slate-700 dark:text-slate-300 font-medium">Kirim sebagai Anonim</span>
                <input type="checkbox" name="is_anonymous" checked={formData.is_anonymous} onChange={handleInputChange}
                  className="w-6 h-6 rounded-lg border-slate-300 text-primary focus:ring-primary" />
              </label>
            </div>

            {!formData.is_anonymous && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Nama Lengkap</label>
                  <input type="text" name="full_name" value={formData.full_name} onChange={handleInputChange}
                    className="w-full px-4 py-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-lg"
                    placeholder="Masukkan nama" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Nomor HP *</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required
                    className="w-full px-4 py-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-lg"
                    placeholder="08xxxxxxxxxx" />
                </div>
              </>
            )}

            {/* Demographics */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Usia</label>
              <div className="flex flex-wrap gap-2">
                {['< 20 Th', '20-40 Th', '41-60 Th', '> 60 Th'].map((range) => (
                  <button key={range} type="button" onClick={() => handleRadioChange('age', range)}
                    className={`px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all ${formData.age === range ? 'border-primary bg-primary text-white' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>
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
                    className={`p-4 rounded-xl border-2 flex items-center justify-center gap-2 transition-all ${formData.gender === opt.value ? 'border-primary bg-primary/5' : 'border-slate-200 dark:border-slate-700'}`}>
                    <span className="text-2xl">{opt.icon}</span>
                    <span className={`font-medium ${formData.gender === opt.value ? 'text-primary' : 'text-slate-600 dark:text-slate-400'}`}>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Questions 1-4 */}
        {step === 2 && (
          <div className="flex-1 space-y-6">
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Penilaian Layanan (1/2)</h2>
              <p className="text-sm text-slate-500">Berikan penilaian Anda</p>
            </div>

            {questions.slice(0, 4).map((q) => (
              <div key={q.id} className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center text-sm font-bold">{q.code}</span>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white text-sm">{q.title}</p>
                    <p className="text-xs text-slate-500">{q.text}</p>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {ratingOptions.map((opt) => (
                    <button key={opt.value} type="button" onClick={() => handleRadioChange(q.id, opt.value)}
                      className={`p-3 rounded-xl border-2 flex flex-col items-center transition-all ${formData[q.id as keyof FormData] === opt.value ? `border-primary ${opt.color} text-white` : 'border-slate-200 dark:border-slate-700'}`}>
                      <span className="text-xl mb-1">{opt.emoji}</span>
                      <span className="text-xs font-medium">{opt.value}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Step 3: Questions 5-8 */}
        {step === 3 && (
          <div className="flex-1 space-y-6">
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Penilaian Layanan (2/2)</h2>
              <p className="text-sm text-slate-500">Lanjutkan penilaian Anda</p>
            </div>

            {questions.slice(4, 8).map((q) => (
              <div key={q.id} className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center text-sm font-bold">{q.code}</span>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white text-sm">{q.title}</p>
                    <p className="text-xs text-slate-500">{q.text}</p>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {ratingOptions.map((opt) => (
                    <button key={opt.value} type="button" onClick={() => handleRadioChange(q.id, opt.value)}
                      className={`p-3 rounded-xl border-2 flex flex-col items-center transition-all ${formData[q.id as keyof FormData] === opt.value ? `border-primary ${opt.color} text-white` : 'border-slate-200 dark:border-slate-700'}`}>
                      <span className="text-xl mb-1">{opt.emoji}</span>
                      <span className="text-xs font-medium">{opt.value}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Step 4: Overall & Submit */}
        {step === 4 && (
          <div className="flex-1 space-y-6">
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Kepuasan Keseluruhan</h2>
              <p className="text-sm text-slate-500">Berikan penilaian akhir Anda</p>
            </div>

            {/* Star Rating */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm text-center">
              <p className="text-sm text-slate-500 mb-4">Seberapa puas Anda dengan layanan kami?</p>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} type="button" onClick={() => handleRadioChange('overall_satisfaction', star.toString())}
                    className="p-2 transition-transform active:scale-90">
                    <span className={`text-4xl ${parseInt(formData.overall_satisfaction) >= star ? 'text-yellow-400' : 'text-slate-300 dark:text-slate-600'}`}>
                      ★
                    </span>
                  </button>
                ))}
              </div>
              {formData.overall_satisfaction && (
                <p className="mt-3 text-sm font-medium text-primary">
                  {formData.overall_satisfaction === '5' ? 'Sangat Puas!' : 
                   formData.overall_satisfaction === '4' ? 'Puas' :
                   formData.overall_satisfaction === '3' ? 'Cukup Puas' :
                   formData.overall_satisfaction === '2' ? 'Kurang Puas' : 'Tidak Puas'}
                </p>
              )}
            </div>

            {/* Suggestions */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Saran & Masukan (Opsional)</label>
              <textarea name="suggestions" value={formData.suggestions} onChange={handleInputChange} rows={4}
                className="w-full px-4 py-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white resize-none"
                placeholder="Berikan saran untuk peningkatan layanan..." />
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="pt-4 space-y-3">
          {step < totalSteps ? (
            <button type="button" onClick={() => setStep(step + 1)}
              className="w-full py-4 bg-primary text-white rounded-2xl font-bold text-lg shadow-lg shadow-primary/30 active:scale-95 transition-transform flex items-center justify-center gap-2">
              Lanjutkan
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          ) : (
            <button type="submit" disabled={submitting || !formData.overall_satisfaction}
              className="w-full py-4 bg-primary text-white rounded-2xl font-bold text-lg shadow-lg shadow-primary/30 active:scale-95 transition-transform disabled:opacity-50 flex items-center justify-center gap-2">
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
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

export default FullscreenSurvey;
