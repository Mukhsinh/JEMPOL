import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

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

interface AppSettings {
  app_name?: string;
  app_footer?: string;
  institution_name?: string;
  institution_address?: string;
  contact_phone?: string;
  contact_email?: string;
}

// Mobile-optimized Public Survey Form
// Halaman ini diakses melalui scan QR Code - TANPA SIDEBAR
const PublicSurvey: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const qrCode = searchParams.get('qr') || '';
  const unitId = searchParams.get('unit_id') || '';
  const unitName = decodeURIComponent(searchParams.get('unit_name') || '');
  const autoFill = searchParams.get('auto_fill') === 'true';

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [appSettings, setAppSettings] = useState<AppSettings>({});

  useEffect(() => {
    loadAppSettings();
  }, []);

  const loadAppSettings = async () => {
    try {
      const res = await fetch('/api/public/app-settings');
      if (res.ok) {
        const r = await res.json();
        if (r.success && r.data) {
          const settings: AppSettings = {};
          r.data.forEach((item: { setting_key: string; setting_value: string }) => {
            settings[item.setting_key as keyof AppSettings] = item.setting_value;
          });
          setAppSettings(settings);
        }
      }
    } catch (e) {
      console.error('Error loading app settings:', e);
    }
  };
  
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
    { id: 'q1', code: 'U1', title: 'Persyaratan', text: 'Bagaimana pendapat Anda tentang kesesuaian persyaratan pelayanan dengan jenis pelayanannya?' },
    { id: 'q2', code: 'U2', title: 'Prosedur', text: 'Bagaimana kemudahan prosedur pelayanan di unit ini?' },
    { id: 'q3', code: 'U3', title: 'Waktu Pelayanan', text: 'Bagaimana kecepatan waktu dalam memberikan pelayanan?' },
    { id: 'q4', code: 'U4', title: 'Biaya / Tarif', text: 'Bagaimana kewajaran biaya/tarif dalam pelayanan?' },
    { id: 'q5', code: 'U5', title: 'Produk Spesifikasi', text: 'Bagaimana kesesuaian produk pelayanan antara yang tercantum dalam standar pelayanan dengan hasil yang diberikan?' },
    { id: 'q6', code: 'U6', title: 'Kompetensi', text: 'Bagaimana kompetensi/kemampuan petugas dalam pelayanan?' },
    { id: 'q7', code: 'U7', title: 'Perilaku', text: 'Bagaimana perilaku petugas dalam pelayanan terkait kesopanan dan keramahan?' },
    { id: 'q8', code: 'U8', title: 'Pengaduan', text: 'Bagaimana kualitas penanganan pengaduan, saran dan masukan?' }
  ];

  const ratingOptions = [
    { value: '1', label: 'Tidak Baik', color: 'bg-red-500' },
    { value: '2', label: 'Kurang Baik', color: 'bg-orange-500' },
    { value: '3', label: 'Baik', color: 'bg-yellow-500' },
    { value: '4', label: 'Sangat Baik', color: 'bg-green-500' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleRadioChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const response = await fetch('/api/public/surveys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          qr_code: qrCode,
          unit_id: unitId,
          unit_name: unitName,
          source: 'qr_code'
        })
      });

      // Validasi content-type response
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('❌ Non-JSON response:', text.substring(0, 200));
        throw new Error('Server mengembalikan response yang tidak valid');
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Gagal mengirim survei');
      }

      setSubmitted(true);
      window.scrollTo(0, 0);

    } catch (err: any) {
      console.error('Error submitting survey:', err);
      setError(err.message || 'Terjadi kesalahan saat mengirim survei');
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
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Terima Kasih!</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Survei Anda telah berhasil dikirim. Masukan Anda sangat berharga bagi peningkatan kualitas layanan kami.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => {
                setSubmitted(false);
                setFormData({
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
              }}
              className="w-full px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors"
            >
              Isi Survei Lagi
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
      {/* Header - Mobile App Style - No old header text */}
      <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-xl">arrow_back</span>
          </button>
          <h1 className="text-base font-semibold text-slate-900 dark:text-white">Survei Kepuasan</h1>
          <div className="w-8"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-6 px-4">
        <div className="max-w-lg mx-auto">
          {/* Unit Info Card - Auto-filled from QR */}
          {unitName && autoFill && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-primary text-2xl">qr_code_scanner</span>
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
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Respondent Data Section */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">person</span>
                  Data Responden
                </h3>
              </div>
              <div className="p-6 space-y-6">
                {/* Service Type */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                    Jenis Layanan yang Diterima <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {['rawat_jalan', 'rawat_inap', 'darurat', 'lainnya'].map((type) => (
                      <label key={type} className="cursor-pointer">
                        <input
                          type="radio"
                          name="service_type"
                          value={type}
                          checked={formData.service_type === type}
                          onChange={(e) => handleRadioChange('service_type', e.target.value)}
                          className="sr-only"
                          required
                        />
                        <div className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${formData.service_type === type ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 dark:border-slate-600 hover:border-primary/50'}`}>
                          <span className="text-sm font-medium capitalize">{type.replace('_', ' ')}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Name & Anonymous */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Nama Lengkap</label>
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="is_anonymous"
                        checked={formData.is_anonymous}
                        onChange={handleInputChange}
                        className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4"
                      />
                      <span className="ml-2 text-sm text-slate-500">Kirim sebagai Anonim</span>
                    </label>
                  </div>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    disabled={formData.is_anonymous}
                    placeholder="Masukkan nama lengkap Anda"
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50"
                  />
                </div>

                {/* Contact Info */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Nomor HP (WhatsApp) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      placeholder="08xxxxxxxxxx"
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Email (Opsional)</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="contoh@email.com"
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                </div>

                {/* Demographics */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Usia Responden</label>
                    <div className="flex flex-wrap gap-2">
                      {['< 20 Th', '20 - 40 Th', '41 - 60 Th', '> 60 Th'].map((range) => (
                        <label key={range} className="cursor-pointer">
                          <input
                            type="radio"
                            name="age"
                            value={range}
                            checked={formData.age === range}
                            onChange={(e) => handleRadioChange('age', e.target.value)}
                            className="sr-only"
                          />
                          <span className={`inline-flex px-4 py-2 rounded-lg border text-sm font-medium transition-all ${formData.age === range ? 'bg-primary text-white border-primary' : 'border-slate-200 dark:border-slate-600 hover:border-primary/50'}`}>
                            {range}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Jenis Kelamin</label>
                    <div className="flex gap-3">
                      {[{ value: 'male', label: 'Laki-laki', icon: 'male' }, { value: 'female', label: 'Perempuan', icon: 'female' }].map((option) => (
                        <label key={option.value} className="flex-1 cursor-pointer">
                          <input
                            type="radio"
                            name="gender"
                            value={option.value}
                            checked={formData.gender === option.value}
                            onChange={(e) => handleRadioChange('gender', e.target.value)}
                            className="sr-only"
                          />
                          <div className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${formData.gender === option.value ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 dark:border-slate-600 hover:border-primary/50'}`}>
                            <span className="material-symbols-outlined">{option.icon}</span>
                            <span className="text-sm font-medium">{option.label}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Survey Questions Section */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">quiz</span>
                  Penilaian Layanan
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Berikan penilaian Anda untuk setiap aspek layanan
                </p>
              </div>
              <div className="p-6 space-y-6">
                {/* Rating Legend */}
                <div className="flex flex-wrap gap-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  {ratingOptions.map((option) => (
                    <div key={option.value} className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full ${option.color}`}></div>
                      <span className="text-sm text-slate-600 dark:text-slate-400">{option.value} = {option.label}</span>
                    </div>
                  ))}
                </div>

                {/* Questions */}
                {questions.map((question, index) => (
                  <div key={question.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl">
                    <div className="flex items-start gap-3 mb-4">
                      <span className="flex-shrink-0 w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center text-sm font-bold">
                        {question.code}
                      </span>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white">{question.title}</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{question.text}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-11">
                      {ratingOptions.map((option) => (
                        <label key={option.value} className="flex-1 cursor-pointer">
                          <input
                            type="radio"
                            name={question.id}
                            value={option.value}
                            checked={formData[question.id as keyof FormData] === option.value}
                            onChange={(e) => handleRadioChange(question.id, e.target.value)}
                            className="sr-only"
                            required
                          />
                          <div className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${formData[question.id as keyof FormData] === option.value ? `border-primary ${option.color} text-white` : 'border-slate-200 dark:border-slate-600 hover:border-primary/50'}`}>
                            <span className="text-lg font-bold">{option.value}</span>
                            <span className="text-xs hidden md:block">{option.label}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Overall Satisfaction */}
                <div className="p-4 border-2 border-primary/20 bg-primary/5 rounded-xl">
                  <h4 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">star</span>
                    Kepuasan Keseluruhan
                  </h4>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <label key={star} className="cursor-pointer">
                        <input
                          type="radio"
                          name="overall_satisfaction"
                          value={star.toString()}
                          checked={formData.overall_satisfaction === star.toString()}
                          onChange={(e) => handleRadioChange('overall_satisfaction', e.target.value)}
                          className="sr-only"
                          required
                        />
                        <span className={`material-symbols-outlined text-4xl transition-all ${parseInt(formData.overall_satisfaction) >= star ? 'text-yellow-500' : 'text-slate-300 dark:text-slate-600'}`}>
                          star
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Suggestions */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Saran & Masukan (Opsional)
                  </label>
                  <textarea
                    name="suggestions"
                    value={formData.suggestions}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Berikan saran atau masukan untuk peningkatan layanan..."
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex flex-col-reverse md:flex-row gap-4 items-center justify-between">
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center md:text-left">
                Data Anda akan dijaga kerahasiaannya sesuai kebijakan privasi kami.
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
                  disabled={submitting}
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
                      Kirim Survei
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>

      {/* Footer - Dynamic from App Settings */}
      <footer className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 py-6 mt-8">
        <div className="max-w-lg mx-auto px-4 text-center space-y-2">
          {appSettings.institution_name && (
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{appSettings.institution_name}</p>
          )}
          {appSettings.institution_address && (
            <p className="text-xs text-slate-500 dark:text-slate-400">{appSettings.institution_address}</p>
          )}
          <div className="flex items-center justify-center gap-4 text-xs text-slate-400">
            {appSettings.contact_phone && (
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">call</span>
                {appSettings.contact_phone}
              </span>
            )}
            {appSettings.contact_email && (
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">mail</span>
                {appSettings.contact_email}
              </span>
            )}
          </div>
          {appSettings.app_footer && (
            <p className="text-xs text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-700">{appSettings.app_footer}</p>
          )}
        </div>
      </footer>
    </div>
  );
};

export default PublicSurvey;
