import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

interface Unit {
  id: string;
  name: string;
  code: string;
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
  { value: 1, label: 'Sangat\nBuruk', icon: 'sentiment_very_dissatisfied' },
  { value: 2, label: 'Buruk', icon: 'sentiment_dissatisfied' },
  { value: 3, label: 'Cukup', icon: 'sentiment_neutral' },
  { value: 4, label: 'Baik', icon: 'sentiment_satisfied' },
  { value: 5, label: 'Sangat\nBaik', icon: 'sentiment_very_satisfied' }
];

const SurveyLanding = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const qrToken = searchParams.get('qr') || searchParams.get('token');
  const surveySuccess = searchParams.get('survey') === 'success';
  
  const [isLoading, setIsLoading] = useState(false);
  const [units, setUnits] = useState<Unit[]>([]);
  const [unitFromQR, setUnitFromQR] = useState<Unit | null>(null);
  const [showLegalInfo, setShowLegalInfo] = useState(false);
  
  const [formData, setFormData] = useState({
    service_type: '',
    full_name: '',
    phone: '',
    email: '',
    job: '',
    is_anonymous: false,
    age: '',
    gender: '',
    province: '',
    city: '',
    district: '',
    village: '',
    q1: '', q2: '', q3: '', q4: '', q5: '', q6: '', q7: '', q8: '',
    overall_satisfaction: '',
    suggestions: '',
    unit_id: '',
    survey_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadMasterData();
  }, []);

  useEffect(() => {
    if (qrToken && units.length > 0) {
      detectUnitFromQR();
    }
  }, [qrToken, units]);

  const loadMasterData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/public/units');
      if (res.ok) {
        const r = await res.json();
        setUnits(r.data || []);
      }
    } catch (e) {
      console.error(e);
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
      navigate('/survey?survey=success');
    } catch (err) {
      alert('Error: ' + (err instanceof Error ? err.message : 'Unknown'));
    }
    setIsLoading(false);
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(p => ({ ...p, [field]: value }));
  };

  if (surveySuccess) {
    return (
      <div className="min-h-screen bg-[#f6f7f8] flex flex-col">
        <header className="sticky top-0 z-50 w-full bg-white border-b border-[#e7edf3] shadow-sm">
          <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#137fec]/10 text-[#137fec]">
                <span className="material-symbols-outlined text-2xl">local_hospital</span>
              </div>
              <div>
                <h1 className="text-lg font-bold leading-tight text-[#0d141b]">Sistem Pengaduan RSUD</h1>
                <p className="text-xs text-[#4c739a] font-medium">Layanan Publik Terintegrasi</p>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-grow flex items-center justify-center p-8">
          <div className="bg-white rounded-2xl border border-green-200 p-8 max-w-md text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-green-600 text-3xl">check_circle</span>
            </div>
            <h2 className="text-2xl font-bold text-[#0d141b] mb-2">Survei Berhasil Dikirim!</h2>
            <p className="text-[#4c739a] mb-6">Terima kasih atas partisipasi Anda. Feedback Anda sangat berharga untuk peningkatan layanan kami.</p>
            <button
              onClick={() => navigate('/survey')}
              className="px-6 py-3 bg-[#137fec] hover:bg-blue-600 text-white font-bold rounded-xl transition-all"
            >
              Isi Survei Lagi
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (isLoading && units.length === 0) {
    return (
      <div className="min-h-screen bg-[#f6f7f8] flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-b-2 border-[#137fec] rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f7f8] flex flex-col font-['Public_Sans',sans-serif] text-[#0d141b] antialiased">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-white border-b border-[#e7edf3] shadow-sm">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#137fec]/10 text-[#137fec]">
              <span className="material-symbols-outlined text-2xl">local_hospital</span>
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight text-[#0d141b]">Sistem Pengaduan RSUD</h1>
              <p className="text-xs text-[#4c739a] font-medium">Layanan Publik Terintegrasi</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#f6f7f8] hover:bg-gray-200 transition-colors text-[#0d141b]">
              <span className="material-symbols-outlined">language</span>
            </button>
            <button className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#f6f7f8] hover:bg-gray-200 transition-colors text-[#0d141b]">
              <span className="material-symbols-outlined">help</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow w-full max-w-[960px] mx-auto px-4 py-8 md:px-8">
        {/* Introduction */}
        <div className="mb-8 space-y-4">
          <div className="space-y-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
              Edisi 2024
            </span>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-[#0d141b]">
              Survei Kepuasan Masyarakat (SKM)
            </h2>
            <p className="text-lg text-[#4c739a] max-w-2xl">
              Partisipasi Anda sangat berharga bagi kami. Bantu kami meningkatkan kualitas pelayanan kesehatan RSUD dengan mengisi survei singkat ini secara objektif.
            </p>
          </div>
          
          {/* Legal Info Accordion */}
          <div className="pt-2">
            <div className="border border-[#e7edf3] rounded-xl bg-white overflow-hidden transition-all duration-300">
              <button
                onClick={() => setShowLegalInfo(!showLegalInfo)}
                className="flex cursor-pointer items-center justify-between gap-4 p-4 hover:bg-gray-50 transition-colors w-full text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#4c739a]">gavel</span>
                  <span className="text-sm font-semibold text-[#0d141b]">Dasar Hukum & Kerahasiaan Data</span>
                </div>
                <span className={`material-symbols-outlined text-[#4c739a] transition-transform ${showLegalInfo ? 'rotate-180' : ''}`}>
                  expand_more
                </span>
              </button>
              {showLegalInfo && (
                <div className="px-4 pb-4 pt-0 text-sm text-[#4c739a] border-t border-[#e7edf3]">
                  <div className="mt-3 space-y-2">
                    <p>Survei ini dilaksanakan berdasarkan Peraturan Menteri Pendayagunaan Aparatur Negara dan Reformasi Birokrasi Nomor 14 Tahun 2017 tentang Pedoman Penyusunan Survei Kepuasan Masyarakat Unit Penyelenggara Pelayanan Publik.</p>
                    <p className="font-medium text-[#137fec]">Privasi Anda terjaga. Data yang dikumpulkan hanya digunakan untuk keperluan evaluasi dan peningkatan layanan.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Unit Section */}
          <section className="bg-blue-50/50 rounded-2xl border border-blue-100 p-6 flex items-start gap-4">
            <div className="p-3 bg-white rounded-xl shadow-sm text-[#137fec]">
              <span className="material-symbols-outlined text-3xl">qr_code_scanner</span>
            </div>
            <div className="flex-1 space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#137fec] mb-1">
                Unit Tujuan {unitFromQR ? '(Otomatis)' : ''}
              </label>
              {unitFromQR ? (
                <div className="text-xl font-bold text-[#0d141b] flex items-center gap-2">
                  <span>{unitFromQR.name}</span>
                  <span className="material-symbols-outlined text-green-500 text-lg" title="Terverifikasi">verified</span>
                </div>
              ) : (
                <select
                  className="w-full rounded-xl border-[#e7edf3] bg-white focus:border-[#137fec] focus:ring-[#137fec]/20 text-sm h-11"
                  value={formData.unit_id}
                  onChange={e => handleChange('unit_id', e.target.value)}
                >
                  <option value="">Pilih Unit</option>
                  {units.map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              )}
              <p className="text-sm text-[#4c739a]">
                {unitFromQR ? 'Unit terdeteksi otomatis dari kode QR lokasi.' : 'Pilih unit layanan yang ingin Anda nilai.'}
              </p>
            </div>
          </section>

          {/* Respondent Data Section */}
          <section className="bg-white rounded-2xl border border-[#e7edf3] shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-[#e7edf3] bg-gray-50/50 flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#137fec]/20 text-[#137fec]">
                <span className="material-symbols-outlined text-sm font-bold">person</span>
              </div>
              <h3 className="text-xl font-bold text-[#0d141b]">Data Responden</h3>
            </div>
            <div className="p-6 space-y-6">
              {/* Service Type */}
              <div className="space-y-3">
                <label className="block text-sm font-bold text-[#0d141b]">
                  Jenis Layanan yang Diterima <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { value: 'rawat_jalan', label: 'Rawat Jalan' },
                    { value: 'rawat_inap', label: 'Rawat Inap' },
                    { value: 'darurat', label: 'IGD / Darurat' },
                    { value: 'lainnya', label: 'Lainnya' }
                  ].map(type => (
                    <label key={type.value} className="cursor-pointer relative">
                      <input
                        className="sr-only peer"
                        name="service_type"
                        type="radio"
                        value={type.value}
                        checked={formData.service_type === type.value}
                        onChange={e => handleChange('service_type', e.target.value)}
                      />
                      <div className="flex items-center justify-center gap-2 p-3 rounded-xl border border-[#e7edf3] bg-white hover:border-[#137fec]/50 transition-all h-full peer-checked:border-[#137fec] peer-checked:bg-[#137fec]/5 peer-checked:text-[#137fec]">
                        <div className="w-4 h-4 rounded-full border-2 border-gray-300 bg-transparent flex-shrink-0 transition-all peer-checked:border-[#137fec] peer-checked:bg-[#137fec]"></div>
                        <span className="text-sm font-medium">{type.label}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <hr className="border-[#e7edf3]" />

              {/* Name Field */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-bold text-[#0d141b]" htmlFor="full_name">Nama Lengkap</label>
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      className="rounded border-gray-300 text-[#137fec] focus:ring-[#137fec] h-4 w-4"
                      type="checkbox"
                      checked={formData.is_anonymous}
                      onChange={e => handleChange('is_anonymous', e.target.checked)}
                    />
                    <span className="ml-2 text-sm text-[#4c739a]">Kirim sebagai Anonim</span>
                  </label>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#4c739a]">badge</span>
                  <input
                    className="w-full pl-10 rounded-xl border-[#e7edf3] bg-[#f6f7f8] focus:border-[#137fec] focus:ring-[#137fec]/20 text-sm h-11"
                    id="full_name"
                    placeholder="Masukkan nama lengkap Anda"
                    type="text"
                    value={formData.full_name}
                    onChange={e => handleChange('full_name', e.target.value)}
                    disabled={formData.is_anonymous}
                  />
                </div>
              </div>

              {/* Contact Fields */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-[#0d141b]" htmlFor="phone">
                    Nomor HP (WhatsApp) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#4c739a]">smartphone</span>
                    <input
                      className="w-full pl-10 rounded-xl border-[#e7edf3] bg-[#f6f7f8] focus:border-[#137fec] focus:ring-[#137fec]/20 text-sm h-11"
                      id="phone"
                      placeholder="08xxxxxxxxxx"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={e => handleChange('phone', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-[#0d141b]" htmlFor="email">
                    Email <span className="text-[#4c739a] font-normal">(Opsional)</span>
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#4c739a]">mail</span>
                    <input
                      className="w-full pl-10 rounded-xl border-[#e7edf3] bg-[#f6f7f8] focus:border-[#137fec] focus:ring-[#137fec]/20 text-sm h-11"
                      id="email"
                      placeholder="contoh@email.com"
                      type="email"
                      value={formData.email}
                      onChange={e => handleChange('email', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-3 md:col-span-2">
                  <label className="block text-sm font-bold text-[#0d141b]" htmlFor="job">
                    Pekerjaan <span className="text-[#4c739a] font-normal">(Opsional)</span>
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#4c739a]">work</span>
                    <input
                      className="w-full pl-10 rounded-xl border-[#e7edf3] bg-[#f6f7f8] focus:border-[#137fec] focus:ring-[#137fec]/20 text-sm h-11"
                      id="job"
                      placeholder="PNS, Swasta, Wiraswasta, dll"
                      type="text"
                      value={formData.job}
                      onChange={e => handleChange('job', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <hr className="border-[#e7edf3]" />

              {/* Age and Gender */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-[#0d141b]">Usia Responden</label>
                  <div className="flex flex-wrap gap-2">
                    {['< 20 Th', '20 - 40 Th', '41 - 60 Th', '> 60 Th'].map((age, idx) => (
                      <label key={idx} className="cursor-pointer group">
                        <input
                          className="peer sr-only"
                          name="age"
                          type="radio"
                          value={age}
                          checked={formData.age === age}
                          onChange={e => handleChange('age', e.target.value)}
                        />
                        <span className="inline-flex px-4 py-2 rounded-lg border border-[#e7edf3] bg-white text-sm font-medium text-[#4c739a] peer-checked:bg-[#137fec] peer-checked:text-white peer-checked:border-[#137fec] transition-all">
                          {age}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-[#0d141b]">Jenis Kelamin</label>
                  <div className="flex gap-3">
                    <label className="flex-1 cursor-pointer relative">
                      <input
                        className="sr-only peer"
                        name="gender"
                        type="radio"
                        value="male"
                        checked={formData.gender === 'male'}
                        onChange={e => handleChange('gender', e.target.value)}
                      />
                      <div className="flex items-center justify-center gap-2 p-2.5 rounded-lg border border-[#e7edf3] bg-white hover:border-[#137fec]/50 transition-all peer-checked:border-[#137fec] peer-checked:bg-[#137fec]/5 peer-checked:text-[#137fec]">
                        <span className="material-symbols-outlined text-[#4c739a] peer-checked:text-[#137fec]">male</span>
                        <span className="text-sm font-medium">Laki-laki</span>
                      </div>
                    </label>
                    <label className="flex-1 cursor-pointer relative">
                      <input
                        className="sr-only peer"
                        name="gender"
                        type="radio"
                        value="female"
                        checked={formData.gender === 'female'}
                        onChange={e => handleChange('gender', e.target.value)}
                      />
                      <div className="flex items-center justify-center gap-2 p-2.5 rounded-lg border border-[#e7edf3] bg-white hover:border-[#137fec]/50 transition-all peer-checked:border-[#137fec] peer-checked:bg-[#137fec]/5 peer-checked:text-[#137fec]">
                        <span className="material-symbols-outlined text-[#4c739a] peer-checked:text-[#137fec]">female</span>
                        <span className="text-sm font-medium">Perempuan</span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Rating Section */}
          <section className="bg-white rounded-2xl border border-[#e7edf3] shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-[#e7edf3] bg-gray-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#137fec]/20 text-[#137fec]">
                  <span className="material-symbols-outlined text-sm font-bold">analytics</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#0d141b]">Penilaian Layanan</h3>
                  <p className="text-xs text-[#4c739a]">Beri penilaian dari 1 (Sangat Buruk) hingga 5 (Sangat Baik)</p>
                </div>
              </div>
            </div>
            <div className="divide-y divide-[#e7edf3]">
              {surveyQuestions.map(q => (
                <div key={q.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center gap-6">
                    <div className="flex-1">
                      <span className="text-xs font-bold text-[#137fec] uppercase tracking-wider mb-1 block">
                        {q.code} - {q.title}
                      </span>
                      <p className="text-sm font-medium text-[#0d141b] leading-relaxed">{q.text}</p>
                    </div>
                    <div className="flex flex-col items-center w-full md:w-auto">
                      <div className="flex items-center justify-between gap-3 md:gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                        {ratingLabels.map(rating => (
                          <label key={rating.value} className="cursor-pointer group relative flex flex-col items-center gap-1 min-w-[60px]">
                            <input
                              className="sr-only peer"
                              name={q.id}
                              type="radio"
                              value={rating.value}
                              checked={formData[q.id as keyof typeof formData] === rating.value.toString()}
                              onChange={e => handleChange(q.id, e.target.value)}
                            />
                            <div className="w-12 h-12 md:w-14 md:h-14 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-300 transition-all duration-300 group-hover:bg-yellow-50 shadow-sm peer-checked:bg-[#FFF8E1] peer-checked:border-[#FFC107]">
                              <span 
                                className="material-symbols-outlined text-3xl md:text-4xl transition-transform duration-200 text-[#FFC107]"
                                style={{ fontVariationSettings: formData[q.id as keyof typeof formData] === rating.value.toString() ? "'FILL' 1, 'wght' 700" : "'FILL' 1, 'wght' 500" }}
                              >
                                {rating.icon}
                              </span>
                            </div>
                            <span className={`text-[10px] md:text-xs text-center font-medium whitespace-pre-line ${formData[q.id as keyof typeof formData] === rating.value.toString() ? 'text-[#0d141b] font-bold' : 'text-[#4c739a]'}`}>
                              {rating.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Overall Satisfaction */}
          <section className="grid md:grid-cols-12 gap-6">
            <div className="md:col-span-12 bg-white rounded-2xl p-6 md:p-8 border border-[#e7edf3] shadow-md relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-50/50 to-orange-50/50 pointer-events-none"></div>
              <div className="relative z-10 text-center mb-10">
                <h3 className="text-2xl font-black text-[#0d141b] mb-2">Kepuasan Keseluruhan Layanan</h3>
                <p className="text-[#4c739a]">Secara umum, bagaimana tingkat kepuasan Anda terhadap pelayanan kami?</p>
              </div>
              <div className="relative z-10 flex flex-wrap justify-center gap-4 md:gap-8">
                {[
                  { value: 'sangat_tidak_puas', label: 'Sangat\nBuruk', icon: 'sentiment_very_dissatisfied' },
                  { value: 'tidak_puas', label: 'Buruk', icon: 'sentiment_dissatisfied' },
                  { value: 'kurang_puas', label: 'Cukup', icon: 'sentiment_neutral' },
                  { value: 'puas', label: 'Baik', icon: 'sentiment_satisfied' },
                  { value: 'sangat_puas', label: 'Sangat\nBaik', icon: 'sentiment_very_satisfied' }
                ].map(item => (
                  <label key={item.value} className="cursor-pointer group flex flex-col items-center gap-3">
                    <input
                      className="sr-only peer"
                      name="overall_satisfaction"
                      type="radio"
                      value={item.value}
                      checked={formData.overall_satisfaction === item.value}
                      onChange={e => handleChange('overall_satisfaction', e.target.value)}
                    />
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-gray-100 bg-white flex items-center justify-center text-gray-300 transition-all duration-300 group-hover:bg-yellow-50 shadow-sm peer-checked:bg-[#FFF8E1] peer-checked:border-[#FFC107]">
                      <span 
                        className="material-symbols-outlined text-4xl md:text-5xl text-[#FFC107]"
                        style={{ fontVariationSettings: formData.overall_satisfaction === item.value ? "'FILL' 1, 'wght' 700" : "'FILL' 1, 'wght' 500" }}
                      >
                        {item.icon}
                      </span>
                    </div>
                    <span className={`text-sm font-bold text-center whitespace-pre-line transition-colors mt-1 ${formData.overall_satisfaction === item.value ? 'text-[#0d141b]' : 'text-[#4c739a] group-hover:text-[#0d141b]'}`}>
                      {item.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Suggestions */}
            <div className="md:col-span-12 bg-white rounded-2xl border border-[#e7edf3] p-6 space-y-6">
              <div>
                <label className="block text-sm font-bold text-[#0d141b] mb-2" htmlFor="suggestions">
                  Saran dan Keluhan
                </label>
                <textarea
                  className="w-full rounded-xl border-[#e7edf3] bg-[#f6f7f8] text-[#0d141b] focus:border-[#137fec] focus:ring-[#137fec]/20 placeholder:text-gray-400 text-sm p-4"
                  id="suggestions"
                  placeholder="Tuliskan saran atau keluhan Anda di sini untuk perbaikan pelayanan kami..."
                  rows={4}
                  value={formData.suggestions}
                  onChange={e => handleChange('suggestions', e.target.value)}
                />
              </div>
              <div className="pt-4 border-t border-[#e7edf3]">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#4c739a] mb-2" htmlFor="date">
                  Tanggal Survei
                </label>
                <div className="relative max-w-sm">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#4c739a] text-lg">calendar_today</span>
                  <input
                    className="w-full pl-10 rounded-lg border-[#e7edf3] bg-[#f6f7f8] text-[#0d141b] focus:border-[#137fec] focus:ring-[#137fec]/20 text-sm h-11"
                    id="date"
                    type="date"
                    value={formData.survey_date}
                    onChange={e => handleChange('survey_date', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Submit Button */}
          <div className="flex justify-end pt-4 pb-12">
            <button
              className="w-full md:w-auto px-8 py-3 bg-[#137fec] hover:bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-[#137fec]/30 transition-all flex items-center justify-center gap-2 group transform active:scale-95 disabled:opacity-50"
              type="submit"
              disabled={isLoading}
            >
              <span>{isLoading ? 'Mengirim...' : 'Kirim Survei'}</span>
              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">send</span>
            </button>
          </div>
        </form>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#e7edf3] mt-auto py-8">
        <div className="max-w-[960px] mx-auto px-4 md:px-8 text-center">
          <div className="flex justify-center items-center gap-2 mb-4 opacity-50 grayscale hover:grayscale-0 transition-all">
            <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
              <span className="material-symbols-outlined text-sm">apartment</span>
            </div>
            <span className="text-sm font-semibold text-[#0d141b]">RSUD Kabupaten</span>
          </div>
          <p className="text-xs text-[#4c739a]">
            © 2024 RSUD Kabupaten. Hak Cipta Dilindungi Undang-undang.<br />
            Sistem Survei Kepuasan Masyarakat Elektronik (e-SKM) v2.0
          </p>
        </div>
      </footer>
    </div>
  );
};

export default SurveyLanding;
