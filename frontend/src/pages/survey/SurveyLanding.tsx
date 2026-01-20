import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

interface Unit {
  id: string;
  name: string;
  code: string;
}

interface AppSettings {
  app_name?: string;
  app_logo?: string;
  app_footer?: string;
  institution_name?: string;
  institution_address?: string;
  contact_phone?: string;
  contact_email?: string;
  website?: string;
}

const surveyQuestions = [
  { id: 'q1', code: 'U1', title: 'Persyaratan', text: 'Bagaimana pendapat Anda tentang kesesuaian persyaratan pelayanan dengan jenis pelayanannya?' },
  { id: 'q2', code: 'U2', title: 'Prosedur', text: 'Bagaimana kemudahan prosedur pelayanan di unit ini?' },
  { id: 'q3', code: 'U3', title: 'Waktu Pelayanan', text: 'Bagaimana kecepatan waktu dalam memberikan pelayanan?' },
  { id: 'q4', code: 'U4', title: 'Biaya / Tarif', text: 'Bagaimana kewajaran biaya/tarif dalam pelayanan?' },
  { id: 'q5', code: 'U5', title: 'Produk Spesifikasi', text: 'Bagaimana kesesuaian produk pelayanan antara yang tercantum dalam standar pelayanan dengan hasil yang diberikan?' },
  { id: 'q6', code: 'U6', title: 'Kompetensi', text: 'Bagaimana kompetensi/kemampuan petugas dalam pelayanan?' },
  { id: 'q7', code: 'U7', title: 'Perilaku', text: 'Bagaimana perilaku petugas dalam pelayanan terkait kesopanan dan keramahan?' },
  { id: 'q8', code: 'U8', title: 'Pengaduan', text: 'Bagaimana kualitas penanganan pengaduan, saran dan masukan?' }
];

const ratingLabels = [
  { value: 1, label: 'Sangat Buruk', icon: 'sentiment_very_dissatisfied', color: '#ef4444', bgColor: '#fee2e2' },
  { value: 2, label: 'Buruk', icon: 'sentiment_dissatisfied', color: '#f97316', bgColor: '#fed7aa' },
  { value: 3, label: 'Cukup', icon: 'sentiment_neutral', color: '#eab308', bgColor: '#fef3c7' },
  { value: 4, label: 'Baik', icon: 'sentiment_satisfied', color: '#22c55e', bgColor: '#dcfce7' },
  { value: 5, label: 'Sangat Baik', icon: 'sentiment_very_satisfied', color: '#10b981', bgColor: '#d1fae5' }
];

const SurveyLanding = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const qrToken = searchParams.get('qr') || searchParams.get('token');
  const surveySuccess = searchParams.get('survey') === 'success';

  const [isLoading, setIsLoading] = useState(false);
  const [units, setUnits] = useState<Unit[]>([]);
  const [unitFromQR, setUnitFromQR] = useState<Unit | null>(null);
  const [appSettings, setAppSettings] = useState<AppSettings>({});
  const [currentStep, setCurrentStep] = useState(0);

  const [formData, setFormData] = useState({
    service_type: '',
    full_name: '',
    phone: '',
    email: '',
    job: '',
    is_anonymous: false,
    age: '',
    gender: '',
    q1: '', q2: '', q3: '', q4: '', q5: '', q6: '', q7: '', q8: '',
    overall_satisfaction: '',
    suggestions: '',
    unit_id: '',
    survey_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadMasterData();
    loadAppSettings();
  }, []);

  useEffect(() => {
    if (qrToken && units.length > 0) {
      detectUnitFromQR();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qrToken, units]);

  const loadAppSettings = async () => {
    try {
      const res = await fetch('/api/app-settings/public');
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

  const loadMasterData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/public/units');
      if (res.ok) {
        const r = await res.json();
        const unitsData = Array.isArray(r) ? r : (r.data || []);
        const activeUnits = unitsData.filter((u: Unit & { is_active?: boolean }) => u.is_active !== false);
        setUnits(activeUnits);
      }
    } catch (e) {
      console.error('Error loading units:', e);
    }
    setIsLoading(false);
  };

  const detectUnitFromQR = async () => {
    try {
      const res = await fetch('/api/public/qr-codes/validate/' + qrToken);
      if (res.ok) {
        const r = await res.json();
        if (r.data && r.data.unit_id) {
          const unit = units.find(u => u.id === r.data.unit_id);
          if (unit) {
            setUnitFromQR(unit);
            setFormData(p => ({ ...p, unit_id: r.data.unit_id }));
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.phone) {
      alert('Mohon isi nomor HP');
      return;
    }
    setIsLoading(true);
    try {
      const data = {
        service_type: formData.service_type,
        reporter_name: formData.is_anonymous ? null : formData.full_name,
        reporter_phone: formData.phone,
        reporter_email: formData.is_anonymous ? null : formData.email,
        job: formData.job,
        age_range: formData.age,
        gender: formData.gender,
        q1_score: formData.q1 ? parseInt(formData.q1) : null,
        q2_score: formData.q2 ? parseInt(formData.q2) : null,
        q3_score: formData.q3 ? parseInt(formData.q3) : null,
        q4_score: formData.q4 ? parseInt(formData.q4) : null,
        q5_score: formData.q5 ? parseInt(formData.q5) : null,
        q6_score: formData.q6 ? parseInt(formData.q6) : null,
        q7_score: formData.q7 ? parseInt(formData.q7) : null,
        q8_score: formData.q8 ? parseInt(formData.q8) : null,
        overall_satisfaction: formData.overall_satisfaction,
        comments: formData.suggestions,
        is_anonymous: formData.is_anonymous,
        qr_token: qrToken,
        unit_id: formData.unit_id || unitFromQR?.id
      };
      const res = await fetch('/api/public/surveys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Gagal');
      alert('Survei berhasil dikirim!');
      navigate('/form/survey?survey=success');
    } catch (err) {
      alert('Error: ' + (err instanceof Error ? err.message : 'Unknown'));
    }
    setIsLoading(false);
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(p => ({ ...p, [field]: value }));
  };

  const nextStep = () => setCurrentStep(p => Math.min(p + 1, 3));
  const prevStep = () => setCurrentStep(p => Math.max(p - 1, 0));

  // Success Page
  if (surveySuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 font-sans">
        {/* Decorative Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-green-200/30 to-emerald-200/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-64 h-64 bg-gradient-to-br from-teal-200/30 to-green-200/30 rounded-full blur-3xl"></div>
        </div>

        {/* Header Modern */}
        <header className="relative z-10 bg-white/80 backdrop-blur-xl border-b border-gray-100/50">
          <div className="max-w-lg mx-auto px-6 py-4">
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/30">
                <span className="material-symbols-outlined text-white text-xl">check_circle</span>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Survei Berhasil
              </h1>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="relative z-10 px-4 py-12">
          <div className="max-w-lg mx-auto">
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-green-500/40">
                <span className="material-symbols-outlined text-white text-5xl">check</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Terima Kasih!</h2>
              <p className="text-gray-600 mb-8 text-base leading-relaxed">
                Survei Anda telah berhasil dikirim. Masukan Anda sangat berharga untuk peningkatan layanan kami.
              </p>
              <button
                onClick={() => navigate('/form/survey')}
                className="w-full py-5 rounded-2xl bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white font-bold text-lg shadow-2xl shadow-green-500/40 hover:shadow-green-500/50 active:scale-[0.98] transition-all flex items-center justify-center gap-3 group"
              >
                <span className="material-symbols-outlined text-2xl group-hover:rotate-12 transition-transform">refresh</span>
                <span>Isi Survei Lagi</span>
              </button>
            </div>

            {/* Footer - Modern */}
            <div className="mt-8 text-center space-y-2">
              {appSettings.institution_name && (
                <p className="text-xs text-gray-600 font-semibold">{appSettings.institution_name}</p>
              )}
              {appSettings.institution_address && (
                <p className="text-xs text-gray-400">{appSettings.institution_address}</p>
              )}
              {appSettings.app_footer && (
                <p className="text-xs text-gray-400">{appSettings.app_footer}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading State
  if (isLoading && units.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">Memuat formulir...</p>
        </div>
      </div>
    );
  }

  // Step Indicator
  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-2 py-4 mb-4">
      {[0, 1, 2, 3].map(step => (
        <div
          key={step}
          className={`h-2 rounded-full transition-all duration-300 ${
            step === currentStep ? 'w-8 bg-gradient-to-r from-blue-500 to-indigo-500' : step < currentStep ? 'w-2 bg-blue-300' : 'w-2 bg-gray-200'
          }`}
        />
      ))}
    </div>
  );

  // Step 0: Unit Selection
  const renderUnitStep = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-blue-500/30 mb-4">
          <span className="material-symbols-outlined text-white text-3xl">location_on</span>
        </div>
        <h2 className="text-xl font-bold text-gray-800">Pilih Unit Layanan</h2>
        <p className="text-sm text-gray-500">Pilih unit yang ingin Anda nilai</p>
      </div>

      {unitFromQR ? (
        <div className="space-y-4">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-5">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-green-500/30">
                <span className="material-symbols-outlined text-white text-2xl">verified</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Unit Terverifikasi dari QR Code</span>
                </div>
                <h3 className="text-gray-900 font-bold text-lg truncate">
                  {unitFromQR.name}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Unit telah dipilih otomatis</p>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={nextStep}
            className="w-full py-5 rounded-2xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white font-bold text-lg shadow-2xl shadow-blue-500/40 hover:shadow-blue-500/50 active:scale-[0.98] transition-all flex items-center justify-center gap-3 group"
          >
            <span>Lanjutkan</span>
            <span className="material-symbols-outlined text-2xl group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Pilih Unit Layanan *</label>
            <select
              value={formData.unit_id}
              onChange={(e) => handleChange('unit_id', e.target.value)}
              className="w-full px-4 py-4 bg-white rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:ring-0 text-gray-800 text-base transition-colors appearance-none cursor-pointer"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 1rem center',
                backgroundSize: '1.5rem'
              }}
            >
              <option value="">-- Pilih Unit Layanan --</option>
              {units.length === 0 ? (
                <option value="" disabled>Tidak ada unit tersedia</option>
              ) : (
                units.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))
              )}
            </select>
            {units.length === 0 && (
              <button
                type="button"
                onClick={loadMasterData}
                className="w-full mt-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">refresh</span>
                <span>Muat Ulang Data Unit</span>
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={nextStep}
            disabled={!formData.unit_id}
            className="w-full py-5 rounded-2xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white font-bold text-lg shadow-2xl shadow-blue-500/40 hover:shadow-blue-500/50 active:scale-[0.98] transition-all flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>Lanjutkan</span>
            <span className="material-symbols-outlined text-2xl group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </button>
        </div>
      )}
    </div>
  );

  // Step 1: Respondent Data
  const renderRespondentStep = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg mb-4">
          <span className="material-symbols-outlined text-white text-3xl">person</span>
        </div>
        <h2 className="text-xl font-bold text-gray-800">Data Responden</h2>
        <p className="text-sm text-gray-500">Lengkapi informasi diri Anda</p>
      </div>

      {/* Service Type */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-gray-700">Jenis Layanan *</label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: 'rawat_jalan', label: 'Rawat Jalan', icon: 'directions_walk' },
            { value: 'rawat_inap', label: 'Rawat Inap', icon: 'hotel' },
            { value: 'darurat', label: 'IGD', icon: 'emergency' },
            { value: 'lainnya', label: 'Lainnya', icon: 'more_horiz' }
          ].map(type => (
            <button
              key={type.value}
              type="button"
              onClick={() => handleChange('service_type', type.value)}
              className={`p-4 rounded-2xl border-2 transition-all active:scale-95 ${
                formData.service_type === type.value
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-100 bg-white'
              }`}
            >
              <span className={`material-symbols-outlined text-2xl mb-2 block ${
                formData.service_type === type.value ? 'text-purple-500' : 'text-gray-400'
              }`}>{type.icon}</span>
              <span className="text-sm font-medium text-gray-700">{type.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Anonymous Toggle */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-gray-400">visibility_off</span>
          <span className="text-sm font-medium text-gray-700">Kirim Anonim</span>
        </div>
        <button
          type="button"
          onClick={() => handleChange('is_anonymous', !formData.is_anonymous)}
          className={`w-12 h-7 rounded-full transition-colors ${formData.is_anonymous ? 'bg-purple-500' : 'bg-gray-300'}`}
        >
          <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${formData.is_anonymous ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
      </div>

      {/* Name & Phone */}
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Nama Lengkap</label>
          <input
            type="text"
            placeholder="Masukkan nama Anda"
            value={formData.full_name}
            onChange={e => handleChange('full_name', e.target.value)}
            disabled={formData.is_anonymous}
            className="w-full px-4 py-3.5 bg-gray-50 rounded-xl border-0 focus:ring-2 focus:ring-purple-500 text-sm disabled:opacity-50"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Nomor HP (WhatsApp) *</label>
          <input
            type="tel"
            placeholder="08xxxxxxxxxx"
            value={formData.phone}
            onChange={e => handleChange('phone', e.target.value)}
            required
            className="w-full px-4 py-3.5 bg-gray-50 rounded-xl border-0 focus:ring-2 focus:ring-purple-500 text-sm"
          />
        </div>
      </div>

      {/* Age & Gender */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Usia</label>
          <select
            value={formData.age}
            onChange={e => handleChange('age', e.target.value)}
            className="w-full px-4 py-3.5 bg-gray-50 rounded-xl border-0 focus:ring-2 focus:ring-purple-500 text-sm"
          >
            <option value="">Pilih</option>
            <option value="< 20 Th">&lt; 20 Th</option>
            <option value="20 - 40 Th">20 - 40 Th</option>
            <option value="41 - 60 Th">41 - 60 Th</option>
            <option value="> 60 Th">&gt; 60 Th</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Jenis Kelamin</label>
          <select
            value={formData.gender}
            onChange={e => handleChange('gender', e.target.value)}
            className="w-full px-4 py-3.5 bg-gray-50 rounded-xl border-0 focus:ring-2 focus:ring-purple-500 text-sm"
          >
            <option value="">Pilih</option>
            <option value="male">Laki-laki</option>
            <option value="female">Perempuan</option>
          </select>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-3 pt-4">
        <button type="button" onClick={prevStep} className="flex-1 py-4 bg-gray-100 text-gray-600 font-semibold rounded-2xl active:scale-95 transition-transform">
          Kembali
        </button>
        <button type="button" onClick={nextStep} disabled={!formData.phone} className="flex-1 py-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold rounded-2xl shadow-lg active:scale-95 transition-transform disabled:opacity-50">
          Lanjutkan
        </button>
      </div>
    </div>
  );

  // Step 2: Rating Questions
  const renderRatingStep = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg mb-4">
          <span className="material-symbols-outlined text-white text-3xl">star</span>
        </div>
        <h2 className="text-xl font-bold text-gray-800">Penilaian Layanan</h2>
        <p className="text-sm text-gray-500">Beri penilaian untuk setiap aspek</p>
      </div>

      {/* Rating Legend - Diperbesar dan Diperjelas */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 border-2 border-amber-200">
        <p className="text-xs font-bold text-amber-700 text-center mb-3 uppercase tracking-wide">Panduan Penilaian</p>
        <div className="grid grid-cols-5 gap-2">
          {ratingLabels.map(rating => (
            <div key={rating.value} className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-xl bg-white shadow-md flex items-center justify-center">
                <span
                  className="material-symbols-outlined text-4xl"
                  style={{
                    color: rating.color,
                    fontVariationSettings: "'FILL' 1"
                  }}
                >
                  {rating.icon}
                </span>
              </div>
              <div className="text-center">
                <p className="text-xs font-bold text-gray-700">{rating.value}</p>
                <p className="text-[10px] text-gray-500 leading-tight">{rating.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
        {surveyQuestions.map((q, idx) => (
          <div key={q.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-amber-600">{idx + 1}</span>
              </div>
              <div>
                <p className="text-xs font-semibold text-amber-600 mb-1">{q.title}</p>
                <p className="text-sm text-gray-700 leading-relaxed">{q.text}</p>
              </div>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {ratingLabels.map(rating => (
                <button
                  key={rating.value}
                  type="button"
                  onClick={() => handleChange(q.id, rating.value.toString())}
                  className={`py-3 px-1 rounded-2xl transition-all active:scale-95 flex flex-col items-center gap-2 ${
                    formData[q.id as keyof typeof formData] === rating.value.toString()
                      ? 'shadow-xl border-2 scale-105'
                      : 'bg-gray-50 border-2 border-gray-200 hover:border-gray-300'
                  }`}
                  style={{
                    backgroundColor: formData[q.id as keyof typeof formData] === rating.value.toString() ? rating.bgColor : '#f9fafb',
                    borderColor: formData[q.id as keyof typeof formData] === rating.value.toString() ? rating.color : undefined
                  }}
                >
                  <span
                    className="material-symbols-outlined text-5xl block"
                    style={{
                      color: formData[q.id as keyof typeof formData] === rating.value.toString() ? rating.color : '#d1d5db',
                      fontVariationSettings: formData[q.id as keyof typeof formData] === rating.value.toString() ? "'FILL' 1" : "'FILL' 0"
                    }}
                  >
                    {rating.icon}
                  </span>
                  <span className={`text-[10px] font-bold text-center leading-tight ${
                    formData[q.id as keyof typeof formData] === rating.value.toString() ? 'text-gray-800' : 'text-gray-500'
                  }`}>
                    {rating.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex gap-3 pt-4">
        <button type="button" onClick={prevStep} className="flex-1 py-4 bg-gray-100 text-gray-600 font-semibold rounded-2xl active:scale-95 transition-transform">
          Kembali
        </button>
        <button type="button" onClick={nextStep} className="flex-1 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-2xl shadow-lg active:scale-95 transition-transform">
          Lanjutkan
        </button>
      </div>
    </div>
  );

  // Step 3: Overall & Submit
  const renderFinalStep = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg mb-4">
          <span className="material-symbols-outlined text-white text-3xl">thumb_up</span>
        </div>
        <h2 className="text-xl font-bold text-gray-800">Kepuasan Keseluruhan</h2>
        <p className="text-sm text-gray-500">Bagaimana kepuasan Anda secara umum?</p>
      </div>

      {/* Overall Rating */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-6">
        <div className="flex justify-center gap-3">
          {[
            { value: 'sangat_tidak_puas', icon: 'sentiment_very_dissatisfied', color: '#ef4444', label: 'Sangat Tidak Puas' },
            { value: 'tidak_puas', icon: 'sentiment_dissatisfied', color: '#f97316', label: 'Tidak Puas' },
            { value: 'kurang_puas', icon: 'sentiment_neutral', color: '#eab308', label: 'Cukup' },
            { value: 'puas', icon: 'sentiment_satisfied', color: '#22c55e', label: 'Puas' },
            { value: 'sangat_puas', icon: 'sentiment_very_satisfied', color: '#10b981', label: 'Sangat Puas' }
          ].map(item => (
            <button
              key={item.value}
              type="button"
              onClick={() => handleChange('overall_satisfaction', item.value)}
              className={`w-14 h-14 rounded-2xl transition-all active:scale-90 ${
                formData.overall_satisfaction === item.value ? 'bg-white shadow-lg scale-110' : 'bg-white/50'
              }`}
            >
              <span
                className="material-symbols-outlined text-3xl"
                style={{
                  color: formData.overall_satisfaction === item.value ? item.color : '#d1d5db',
                  fontVariationSettings: formData.overall_satisfaction === item.value ? "'FILL' 1" : "'FILL' 0"
                }}
              >
                {item.icon}
              </span>
            </button>
          ))}
        </div>
        {formData.overall_satisfaction && (
          <p className="text-center text-sm font-medium text-gray-600 mt-4">
            {formData.overall_satisfaction === 'sangat_puas' && '😊 Sangat Puas'}
            {formData.overall_satisfaction === 'puas' && '🙂 Puas'}
            {formData.overall_satisfaction === 'kurang_puas' && '😐 Cukup'}
            {formData.overall_satisfaction === 'tidak_puas' && '😕 Tidak Puas'}
            {formData.overall_satisfaction === 'sangat_tidak_puas' && '😞 Sangat Tidak Puas'}
          </p>
        )}
      </div>

      {/* Suggestions */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-700">Saran & Masukan</label>
        <textarea
          placeholder="Tuliskan saran atau keluhan Anda..."
          value={formData.suggestions}
          onChange={e => handleChange('suggestions', e.target.value)}
          rows={4}
          className="w-full px-4 py-3.5 bg-gray-50 rounded-xl border-0 focus:ring-2 focus:ring-green-500 text-sm resize-none"
        />
      </div>

      {/* Navigation */}
      <div className="flex gap-3 pt-4">
        <button type="button" onClick={prevStep} className="flex-1 py-4 bg-gray-100 text-gray-600 font-semibold rounded-2xl active:scale-95 transition-transform">
          Kembali
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-2xl shadow-lg active:scale-95 transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>Kirim Survei</span>
              <span className="material-symbols-outlined text-xl">send</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  // Main Render
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 font-sans">
      {/* Decorative Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-200/30 to-indigo-200/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-gradient-to-br from-purple-200/30 to-indigo-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-64 h-64 bg-gradient-to-br from-indigo-200/30 to-blue-200/30 rounded-full blur-3xl"></div>
      </div>

      {/* Header Modern */}
      <header className="relative z-10 bg-white/80 backdrop-blur-xl border-b border-gray-100/50 sticky top-0">
        <div className="max-w-lg mx-auto px-6 py-4">
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <span className="material-symbols-outlined text-white text-xl">poll</span>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Survei Kepuasan
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 px-4 py-6">
        <div className="max-w-lg mx-auto">
          {/* Progress Indicator */}
          {renderStepIndicator()}

          {/* Form Card - Modern */}
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
            <form onSubmit={handleSubmit} className="p-6">
              {currentStep === 0 && renderUnitStep()}
              {currentStep === 1 && renderRespondentStep()}
              {currentStep === 2 && renderRatingStep()}
              {currentStep === 3 && renderFinalStep()}
            </form>
          </div>

          {/* Footer - Modern */}
          <div className="mt-8 text-center space-y-2">
            {appSettings.institution_name && (
              <p className="text-xs text-gray-600 font-semibold">{appSettings.institution_name}</p>
            )}
            {appSettings.institution_address && (
              <p className="text-xs text-gray-400">{appSettings.institution_address}</p>
            )}
            <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
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
              <p className="text-xs text-gray-400">{appSettings.app_footer}</p>
            )}
            <p className="text-xs text-gray-400 pt-2">
              Masukan Anda sangat berharga untuk peningkatan layanan kami
            </p>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        input, select, textarea {
          -webkit-appearance: none;
          appearance: none;
        }
        ::-webkit-scrollbar {
          width: 4px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
};

export default SurveyLanding;
