import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

interface FormData {
  service_type: string;
  full_name: string;
  is_anonymous: boolean;
  phone: string;
  age: string;
  gender: string;
  education: string;
  job: string;
  patient_type: string;
  // 9 Unsur x 3 Indikator = 27 field
  u1_ind1: string; u1_ind2: string; u1_ind3: string;
  u2_ind1: string; u2_ind2: string; u2_ind3: string;
  u3_ind1: string; u3_ind2: string; u3_ind3: string;
  u4_ind1: string; u4_ind2: string; u4_ind3: string;
  u5_ind1: string; u5_ind2: string; u5_ind3: string;
  u6_ind1: string; u6_ind2: string; u6_ind3: string;
  u7_ind1: string; u7_ind2: string; u7_ind3: string;
  u8_ind1: string; u8_ind2: string; u8_ind3: string;
  u9_ind1: string; u9_ind2: string; u9_ind3: string;
  overall_satisfaction: string;
  suggestions: string;
}

interface AppSettings {
  institution_name?: string;
  institution_address?: string;
  contact_phone?: string;
  contact_email?: string;
  website?: string;
  app_footer?: string;
}

// Direct Form View - Survei Kepuasan (Public, Tanpa Login, Mobile-First)
// Route: /survey?unit_id=xxx&unit_name=xxx
const DirectSurveyForm: React.FC = () => {
  const [searchParams] = useSearchParams();
  
  const unitId = searchParams.get('unit_id') || searchParams.get('unit') || '';
  const unitName = decodeURIComponent(searchParams.get('unit_name') || searchParams.get('name') || '');
  const qrCode = searchParams.get('qr') || '';

  // Pastikan tidak ada scroll pada body untuk fullscreen experience
  // Dan sembunyikan sidebar jika ada
  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
    
    // Sembunyikan sidebar dan elemen layout lainnya
    const sidebar = document.querySelector('[class*="sidebar"]');
    const header = document.querySelector('header');
    const nav = document.querySelector('nav');
    
    if (sidebar) (sidebar as HTMLElement).style.display = 'none';
    if (header) (header as HTMLElement).style.display = 'none';
    if (nav) (nav as HTMLElement).style.display = 'none';
    
    return () => {
      document.body.style.overflow = 'auto';
      if (sidebar) (sidebar as HTMLElement).style.display = '';
      if (header) (header as HTMLElement).style.display = '';
      if (nav) (nav as HTMLElement).style.display = '';
    };
  }, []);

  // Load app settings untuk footer
  useEffect(() => {
    const fetchAppSettings = async () => {
      try {
        const response = await fetch('/api/public/app-settings');
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            setAppSettings(result.data);
            console.log('✅ App settings loaded:', result.data);
          }
        }
      } catch (err) {
        console.error('❌ Error loading app settings:', err);
      }
    };
    
    fetchAppSettings();
  }, []);

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [appSettings, setAppSettings] = useState<AppSettings>({});
  
  const [formData, setFormData] = useState<FormData>({
    service_type: '',
    full_name: '',
    is_anonymous: false,
    phone: '',
    age: '',
    gender: '',
    education: '',
    job: '',
    patient_type: '',
    u1_ind1: '', u1_ind2: '', u1_ind3: '',
    u2_ind1: '', u2_ind2: '', u2_ind3: '',
    u3_ind1: '', u3_ind2: '', u3_ind3: '',
    u4_ind1: '', u4_ind2: '', u4_ind3: '',
    u5_ind1: '', u5_ind2: '', u5_ind3: '',
    u6_ind1: '', u6_ind2: '', u6_ind3: '',
    u7_ind1: '', u7_ind2: '', u7_ind3: '',
    u8_ind1: '', u8_ind2: '', u8_ind3: '',
    u9_ind1: '', u9_ind2: '', u9_ind3: '',
    overall_satisfaction: '',
    suggestions: ''
  });

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const questions = [
    { 
      id: 'u1', 
      code: 'U1', 
      title: 'Persyaratan', 
      icon: '📋',
      indicators: [
        { id: 'u1_ind1', text: 'Persyaratan pelayanan yang diinformasikan jelas dan mudah dipahami' },
        { id: 'u1_ind2', text: 'Persyaratan pelayanan mudah dipenuhi oleh pengguna layanan' },
        { id: 'u1_ind3', text: 'Persyaratan pelayanan sesuai dengan jenis layanan yang diberikan' }
      ]
    },
    { 
      id: 'u2', 
      code: 'U2', 
      title: 'Prosedur', 
      icon: '📝',
      indicators: [
        { id: 'u2_ind1', text: 'Prosedur atau alur pelayanan diinformasikan dengan jelas' },
        { id: 'u2_ind2', text: 'Prosedur pelayanan mudah diikuti oleh pengguna layanan' },
        { id: 'u2_ind3', text: 'Pelaksanaan pelayanan sesuai dengan prosedur yang telah ditetapkan' }
      ]
    },
    { 
      id: 'u3', 
      code: 'U3', 
      title: 'Waktu Pelayanan', 
      icon: '⏱️',
      indicators: [
        { id: 'u3_ind1', text: 'Informasi mengenai jangka waktu pelayanan disampaikan dengan jelas' },
        { id: 'u3_ind2', text: 'Pelayanan diselesaikan sesuai dengan standar waktu pelayanan' },
        { id: 'u3_ind3', text: 'Tidak terdapat keterlambatan pelayanan tanpa alasan yang jelas' }
      ]
    },
    { 
      id: 'u4', 
      code: 'U4', 
      title: 'Biaya/Tarif', 
      icon: '💰',
      indicators: [
        { id: 'u4_ind1', text: 'Informasi biaya atau tarif pelayanan disampaikan secara jelas' },
        { id: 'u4_ind2', text: 'Biaya yang dibayarkan sesuai dengan ketentuan yang berlaku' },
        { id: 'u4_ind3', text: 'Tidak terdapat pungutan di luar biaya/tarif resmi' }
      ]
    },
    { 
      id: 'u5', 
      code: 'U5', 
      title: 'Produk Layanan', 
      icon: '📦',
      indicators: [
        { id: 'u5_ind1', text: 'Hasil pelayanan yang diterima sesuai dengan ketentuan yang ditetapkan' },
        { id: 'u5_ind2', text: 'Produk pelayanan diterima secara lengkap dan benar' },
        { id: 'u5_ind3', text: 'Kualitas produk pelayanan sesuai standar pelayanan' }
      ]
    },
    { 
      id: 'u6', 
      code: 'U6', 
      title: 'Kompetensi Pelaksana', 
      icon: '👨‍⚕️',
      indicators: [
        { id: 'u6_ind1', text: 'Petugas memiliki pengetahuan yang memadai dalam memberikan pelayanan' },
        { id: 'u6_ind2', text: 'Petugas memiliki keterampilan yang baik dalam melayani pengguna' },
        { id: 'u6_ind3', text: 'Petugas mampu memberikan pelayanan secara profesional' }
      ]
    },
    { 
      id: 'u7', 
      code: 'U7', 
      title: 'Perilaku Pelaksana', 
      icon: '😊',
      indicators: [
        { id: 'u7_ind1', text: 'Petugas bersikap sopan dan ramah dalam memberikan pelayanan' },
        { id: 'u7_ind2', text: 'Petugas memberikan pelayanan dengan sikap membantu' },
        { id: 'u7_ind3', text: 'Petugas melayani tanpa membedakan latar belakang pengguna' }
      ]
    },
    { 
      id: 'u8', 
      code: 'U8', 
      title: 'Sarana dan Prasarana', 
      icon: '🏥',
      indicators: [
        { id: 'u8_ind1', text: 'Sarana dan prasarana pelayanan tersedia dengan memadai' },
        { id: 'u8_ind2', text: 'Sarana dan prasarana pelayanan dalam kondisi baik dan layak digunakan' },
        { id: 'u8_ind3', text: 'Lingkungan pelayanan bersih, nyaman, dan aman' }
      ]
    },
    { 
      id: 'u9', 
      code: 'U9', 
      title: 'Penanganan Pengaduan', 
      icon: '📞',
      indicators: [
        { id: 'u9_ind1', text: 'Tersedia sarana pengaduan yang mudah diakses pengguna layanan' },
        { id: 'u9_ind2', text: 'Pengaduan ditindaklanjuti dengan cepat dan jelas' },
        { id: 'u9_ind3', text: 'Pengguna mendapatkan informasi hasil penanganan pengaduan' }
      ]
    }
  ];

  const ratingOptions = [
    { value: '1', label: 'Sangat Tidak Puas', emoji: '😞', color: 'from-red-500 to-red-600', bgColor: 'bg-red-500', desc: 'Sangat buruk' },
    { value: '2', label: 'Tidak Puas', emoji: '😕', color: 'from-orange-500 to-orange-600', bgColor: 'bg-orange-500', desc: 'Kurang baik' },
    { value: '3', label: 'Cukup Puas', emoji: '😐', color: 'from-yellow-500 to-yellow-600', bgColor: 'bg-yellow-500', desc: 'Cukup' },
    { value: '4', label: 'Puas', emoji: '🙂', color: 'from-lime-500 to-lime-600', bgColor: 'bg-lime-500', desc: 'Baik' },
    { value: '5', label: 'Sangat Puas', emoji: '😊', color: 'from-emerald-500 to-green-600', bgColor: 'bg-emerald-500', desc: 'Sangat baik' }
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
        body: JSON.stringify({ ...formData, qr_code: qrCode, unit_id: unitId, unit_name: unitName, source: qrCode ? 'qr_code' : 'web' })
      });
      
      // Cek apakah response adalah JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server mengembalikan response yang tidak valid');
      }
      
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
      education: '', job: '', patient_type: '',
      u1_ind1: '', u1_ind2: '', u1_ind3: '',
      u2_ind1: '', u2_ind2: '', u2_ind3: '',
      u3_ind1: '', u3_ind2: '', u3_ind3: '',
      u4_ind1: '', u4_ind2: '', u4_ind3: '',
      u5_ind1: '', u5_ind2: '', u5_ind3: '',
      u6_ind1: '', u6_ind2: '', u6_ind3: '',
      u7_ind1: '', u7_ind2: '', u7_ind3: '',
      u8_ind1: '', u8_ind2: '', u8_ind3: '',
      u9_ind1: '', u9_ind2: '', u9_ind3: '',
      overall_satisfaction: '', suggestions: ''
    });
  };

  // Success Screen
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 flex items-center justify-center p-6">
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
            className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl font-bold text-lg shadow-lg shadow-emerald-500/30 active:scale-95 transition-transform"
          >
            Isi Survei Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 flex flex-col">
      {/* Decorative */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-20 w-48 h-48 bg-teal-300/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-cyan-300/20 rounded-full blur-2xl"></div>
      </div>

      {/* Unit Info - Minimal Header */}
      {unitName && (
        <div className="relative z-10 px-6 pt-8 pb-4">
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

      {/* Form Content - Perbaikan Scroll */}
      <main className="relative z-10 flex-1 bg-white rounded-t-[2.5rem] overflow-hidden shadow-2xl mt-4 flex flex-col">
        <form onSubmit={handleSubmit} className="h-full flex flex-col">
          <div className="flex-1 overflow-y-auto px-6 py-8 pb-32" style={{ maxHeight: 'calc(100vh - 280px)' }}>
            <div className="max-w-md mx-auto space-y-6">
              
              {/* Progress Indicator */}
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500" 
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-gray-500 text-sm font-medium">{currentStep}/{totalSteps}</span>
              </div>

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

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Pendidikan</label>
                    <div className="relative">
                      <select
                        name="education"
                        value={formData.education}
                        onChange={handleInputChange}
                        className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-0 text-gray-800 text-base transition-colors appearance-none bg-white"
                      >
                        <option value="">Pilih Pendidikan</option>
                        <option value="SD">SD</option>
                        <option value="SMP">SMP</option>
                        <option value="SMA/SMK">SMA/SMK</option>
                        <option value="D3">D3</option>
                        <option value="S1">S1</option>
                        <option value="S2">S2</option>
                        <option value="S3">S3</option>
                      </select>
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">▼</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Pekerjaan</label>
                    <div className="relative">
                      <select
                        name="job"
                        value={formData.job}
                        onChange={handleInputChange}
                        className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-0 text-gray-800 text-base transition-colors appearance-none bg-white"
                      >
                        <option value="">Pilih Pekerjaan</option>
                        <option value="PNS">PNS</option>
                        <option value="TNI/Polri">TNI/Polri</option>
                        <option value="Pegawai Swasta">Pegawai Swasta</option>
                        <option value="Wiraswasta">Wiraswasta</option>
                        <option value="Petani">Petani</option>
                        <option value="Nelayan">Nelayan</option>
                        <option value="Pelajar/Mahasiswa">Pelajar/Mahasiswa</option>
                        <option value="Ibu Rumah Tangga">Ibu Rumah Tangga</option>
                        <option value="Pensiunan">Pensiunan</option>
                        <option value="Lainnya">Lainnya</option>
                      </select>
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">▼</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Jenis Pasien</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'BPJS', label: 'BPJS', icon: '🏥', color: 'blue' },
                        { value: 'Umum', label: 'Umum', icon: '💳', color: 'green' },
                        { value: 'Asuransi', label: 'Asuransi', icon: '🛡️', color: 'purple' }
                      ].map((opt) => (
                        <button 
                          key={opt.value} 
                          type="button" 
                          onClick={() => handleRadioChange('patient_type', opt.value)}
                          className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                            formData.patient_type === opt.value 
                              ? 'border-emerald-500 bg-emerald-50 shadow-lg' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <span className="text-3xl">{opt.icon}</span>
                          <span className={`font-semibold text-sm ${
                            formData.patient_type === opt.value ? 'text-emerald-600' : 'text-gray-600'
                          }`}>{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Survey Questions - 9 Unsur dengan Indikator */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-slideUp">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Penilaian Layanan</h2>
                    <p className="text-gray-500 text-sm">Berikan penilaian untuk setiap indikator</p>
                  </div>

                  {/* Rating Legend */}
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-5 mb-4 sticky top-0 z-10 border-2 border-amber-200 shadow-lg">
                    <p className="text-center text-sm font-extrabold text-amber-800 mb-4 uppercase tracking-wider">Panduan Penilaian</p>
                    <div className="grid grid-cols-5 gap-2">
                      {ratingOptions.map((opt) => (
                        <div key={opt.value} className="flex flex-col items-center gap-1.5">
                          <div className={`w-14 h-14 rounded-2xl ${opt.bgColor} flex items-center justify-center shadow-lg border-2 border-white`}>
                            <span className="text-3xl">{opt.emoji}</span>
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-extrabold text-gray-800 mb-0.5">{opt.value}</p>
                            <p className="text-[10px] font-semibold text-gray-700 leading-tight">{opt.label}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Questions - 9 Unsur */}
                  <div className="space-y-4">
                    {questions.map((q) => (
                      <div key={q.id} className="bg-white rounded-2xl p-4 border-2 border-gray-100 shadow-sm">
                        <div className="flex items-start gap-3 mb-4 pb-3 border-b border-gray-100">
                          <span className="text-3xl">{q.icon}</span>
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-800 text-base">{q.code} - {q.title}</h4>
                            <p className="text-xs text-gray-500">Nilai setiap indikator di bawah ini</p>
                          </div>
                        </div>
                        
                        {/* 3 Indikator per Unsur */}
                        <div className="space-y-3">
                          {q.indicators.map((ind, idx) => (
                            <div key={ind.id} className="bg-gray-50 rounded-xl p-3">
                              <p className="text-xs text-gray-600 mb-2 font-medium">
                                <span className="inline-block w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center mr-1">{idx + 1}</span>
                                {ind.text}
                              </p>
                              <div className="flex gap-1.5">
                                {ratingOptions.map((opt) => (
                                  <button 
                                    key={opt.value} 
                                    type="button" 
                                    onClick={() => handleRadioChange(ind.id, opt.value)}
                                    className={`flex-1 py-3.5 rounded-2xl transition-all relative flex flex-col items-center gap-1.5 ${
                                      formData[ind.id as keyof FormData] === opt.value 
                                        ? `${opt.bgColor} shadow-2xl scale-110 border-3` 
                                        : 'bg-white border-2 border-gray-200 hover:border-gray-300 hover:shadow-md'
                                    }`}
                                    style={{
                                      borderWidth: formData[ind.id as keyof FormData] === opt.value ? '3px' : '2px',
                                      borderColor: formData[ind.id as keyof FormData] === opt.value ? 'white' : undefined
                                    }}
                                  >
                                    <div className="text-4xl">{opt.emoji}</div>
                                    <div className={`text-[10px] font-extrabold leading-tight text-center ${
                                      formData[ind.id as keyof FormData] === opt.value ? 'text-white' : 'text-gray-700'
                                    }`}>{opt.label}</div>
                                    {formData[ind.id as keyof FormData] === opt.value && (
                                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-green-500">
                                        <span className="text-green-500 text-sm font-bold">✓</span>
                                      </div>
                                    )}
                                  </button>
                                ))}
                              </div>
                            </div>
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

          {/* Footer - Data dari Pengaturan Aplikasi */}
          {(appSettings.institution_name || appSettings.app_footer) && (
            <div className="px-6 py-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-t border-emerald-100">
              <div className="max-w-md mx-auto text-center space-y-2">
                {appSettings.institution_name && (
                  <p className="font-bold text-emerald-800 text-sm">{appSettings.institution_name}</p>
                )}
                {appSettings.institution_address && (
                  <p className="text-xs text-gray-600">{appSettings.institution_address}</p>
                )}
                <div className="flex items-center justify-center gap-4 text-xs text-gray-600">
                  {appSettings.contact_phone && (
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">phone</span>
                      {appSettings.contact_phone}
                    </span>
                  )}
                  {appSettings.contact_email && (
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">email</span>
                      {appSettings.contact_email}
                    </span>
                  )}
                </div>
                {appSettings.website && (
                  <p className="text-xs text-emerald-600">{appSettings.website}</p>
                )}
                {appSettings.app_footer && (
                  <p className="text-xs text-gray-500 mt-2">{appSettings.app_footer}</p>
                )}
              </div>
            </div>
          )}

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
                    (currentStep === 1 && (!formData.service_type || !formData.phone)) ||
                    (currentStep === 3 && !questions.every(q => 
                      q.indicators.every(ind => formData[ind.id as keyof FormData])
                    ))
                  }
                  className="flex-1 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                >
                  Lanjutkan
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              ) : (
                <button 
                  type="submit" 
                  disabled={submitting || !formData.overall_satisfaction}
                  className="flex-1 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-emerald-500/30 disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
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

      {/* App Footer */}
      <div className="relative z-10 bg-white">
        <AppFooter variant="compact" />
      </div>

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

export default DirectSurveyForm;
