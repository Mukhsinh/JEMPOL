import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { wilayahIndonesia, getKecamatanByKabupaten } from '../../data/wilayahIndonesia';
import { downloadSurveyPDF } from '../../utils/pdfGenerator';

interface Unit {
  id: string;
  name: string;
  code: string;
}



const surveyQuestions = [
  { 
    id: 'q1', 
    code: 'U1', 
    title: 'Persyaratan', 
    text: 'Bagaimana pendapat Saudara tentang kesesuaian persyaratan pelayanan dengan jenis pelayanannya?',
    options: [
      { value: 1, label: 'Tidak Sesuai', emoji: '😞' },
      { value: 2, label: 'Kurang Sesuai', emoji: '😕' },
      { value: 3, label: 'Sesuai', emoji: '🙂' },
      { value: 4, label: 'Sangat Sesuai', emoji: '😊' }
    ]
  },
  { 
    id: 'q2', 
    code: 'U2', 
    title: 'Prosedur', 
    text: 'Bagaimana pemahaman Saudara tentang kemudahan prosedur pelayanan di unit ini?',
    options: [
      { value: 1, label: 'Tidak Mudah', emoji: '😞' },
      { value: 2, label: 'Kurang Mudah', emoji: '😕' },
      { value: 3, label: 'Mudah', emoji: '🙂' },
      { value: 4, label: 'Sangat Mudah', emoji: '😊' }
    ]
  },
  { 
    id: 'q3', 
    code: 'U3', 
    title: 'Waktu Pelayanan', 
    text: 'Bagaimana pendapat Saudara tentang kecepatan waktu dalam memberikan pelayanan?',
    options: [
      { value: 1, label: 'Tidak Cepat', emoji: '😞' },
      { value: 2, label: 'Kurang Cepat', emoji: '😕' },
      { value: 3, label: 'Cepat', emoji: '🙂' },
      { value: 4, label: 'Sangat Cepat', emoji: '😊' }
    ]
  },
  { 
    id: 'q4', 
    code: 'U4', 
    title: 'Biaya/Tarif', 
    text: 'Bagaimana pendapat Saudara tentang kewajaran biaya/tarif dalam pelayanan?',
    options: [
      { value: 1, label: 'Sangat Mahal', emoji: '😞' },
      { value: 2, label: 'Cukup Mahal', emoji: '😕' },
      { value: 3, label: 'Murah', emoji: '🙂' },
      { value: 4, label: 'Gratis', emoji: '😊' }
    ]
  },
  { 
    id: 'q5', 
    code: 'U5', 
    title: 'Produk Spesifikasi Jenis Layanan', 
    text: 'Bagaimana pendapat Saudara tentang kesesuaian produk pelayanan antara yang tercantum dalam standar pelayanan dengan hasil yang diberikan?',
    options: [
      { value: 1, label: 'Tidak Sesuai', emoji: '😞' },
      { value: 2, label: 'Kurang Sesuai', emoji: '😕' },
      { value: 3, label: 'Sesuai', emoji: '🙂' },
      { value: 4, label: 'Sangat Sesuai', emoji: '😊' }
    ]
  },
  { 
    id: 'q6', 
    code: 'U6', 
    title: 'Kompetensi Pelaksana', 
    text: 'Bagaimana pendapat Saudara tentang kompetensi/kemampuan petugas dalam pelayanan?',
    options: [
      { value: 1, label: 'Tidak Kompeten', emoji: '😞' },
      { value: 2, label: 'Kurang Kompeten', emoji: '😕' },
      { value: 3, label: 'Kompeten', emoji: '🙂' },
      { value: 4, label: 'Sangat Kompeten', emoji: '😊' }
    ]
  },
  { 
    id: 'q7', 
    code: 'U7', 
    title: 'Perilaku Pelaksana', 
    text: 'Bagaimana pendapat Saudara perilaku petugas dalam pelayanan terkait kesopanan dan keramahan?',
    options: [
      { value: 1, label: 'Tidak Sopan dan Ramah', emoji: '😞' },
      { value: 2, label: 'Kurang Sopan dan Ramah', emoji: '😕' },
      { value: 3, label: 'Sopan dan Ramah', emoji: '🙂' },
      { value: 4, label: 'Sangat Sopan dan Ramah', emoji: '😊' }
    ]
  },
  { 
    id: 'q8', 
    code: 'U8', 
    title: 'Sarana dan Prasarana', 
    text: 'Bagaimana pendapat Saudara tentang kualitas sarana dan prasarana?',
    options: [
      { value: 1, label: 'Buruk', emoji: '😞' },
      { value: 2, label: 'Cukup Baik', emoji: '😕' },
      { value: 3, label: 'Baik', emoji: '🙂' },
      { value: 4, label: 'Sangat Baik', emoji: '😊' }
    ]
  },
  { 
    id: 'q9', 
    code: 'U9', 
    title: 'Penanganan Pengaduan', 
    text: 'Bagaimana pendapat Saudara tentang penanganan pengaduan pengguna layanan?',
    options: [
      { value: 1, label: 'Tidak Ada', emoji: '😞' },
      { value: 2, label: 'Ada Tetapi Tidak Berfungsi', emoji: '😕' },
      { value: 3, label: 'Berfungsi Kurang Maksimal', emoji: '🙂' },
      { value: 4, label: 'Dikelola dengan Baik', emoji: '😊' }
    ]
  },
  { 
    id: 'q10', 
    code: 'U10', 
    title: 'Transparansi Pelayanan', 
    text: 'Bagaimana pendapat Saudara tentang transparansi pelayanan yang diberikan? (kecukupan informasi mengenai persyaratan, biaya, waktu pelayanan, prosedur dan sebagainya)',
    options: [
      { value: 1, label: 'Tidak Transparan', emoji: '😞' },
      { value: 2, label: 'Kurang Transparan', emoji: '😕' },
      { value: 3, label: 'Transparan', emoji: '🙂' },
      { value: 4, label: 'Sangat Transparan', emoji: '😊' }
    ]
  },
  { 
    id: 'q11', 
    code: 'U11', 
    title: 'Integritas Petugas Pelayanan', 
    text: 'Bagaimana pendapat Saudara tentang integritas petugas pelayanan? (terkait suap, pungutan liar, gratifikasi, dan sebagainya)',
    options: [
      { value: 1, label: 'Petugas Tidak Berintegritas', emoji: '😞' },
      { value: 2, label: 'Petugas Kurang Berintegritas', emoji: '😕' },
      { value: 3, label: 'Petugas Berintegritas', emoji: '🙂' },
      { value: 4, label: 'Petugas Sangat Berintegritas', emoji: '😊' }
    ]
  }
];

const SurveyForm: React.FC = () => {
  const [searchParams] = useSearchParams();
  const qrToken = searchParams.get('qr') || searchParams.get('token');
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 2;
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [surveyId, setSurveyId] = useState('');
  const [submittedSurveyData, setSubmittedSurveyData] = useState<any>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [unitFromQR, setUnitFromQR] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    service_type: 'rawat_jalan',
    full_name: '',
    phone: '',
    email: '',
    is_anonymous: false,
    age: '',
    gender: '',
    education: '',
    occupation: '',
    address_detail: '', // Alamat detail (Jalan, RT/RW, Kelurahan/Desa)
    regency: '', // Kab/Kota
    district: '', // Kecamatan
    q1: '', q2: '', q3: '', q4: '', q5: '', q6: '', q7: '', q8: '', q9: '', q10: '', q11: '',
    overall_satisfaction: '',
    suggestions: '',
    unit_id: ''
  });
  const [availableKecamatan, setAvailableKecamatan] = useState<any[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

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
        const unitsData = Array.isArray(r) ? r : (r.data || []);
        const activeUnits = unitsData.filter((u: any) => u.is_active !== false);
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
          setUnitFromQR(r.data.unit_id);
          setFormData(p => ({ ...p, unit_id: r.data.unit_id }));
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.unit_id && !unitFromQR) {
      alert('Mohon pilih unit tujuan');
      return;
    }

    setIsLoading(true);
    try {
      const data = {
        unit_id: formData.unit_id || unitFromQR,
        service_type: formData.service_type || 'rawat_jalan',
        reporter_name: formData.is_anonymous ? null : formData.full_name,
        reporter_phone: formData.phone,
        reporter_email: formData.is_anonymous ? null : formData.email,
        is_anonymous: formData.is_anonymous,
        age_range: formData.age || null,
        gender: formData.gender || null,
        education: formData.education || null,
        job: formData.occupation || null,
        regency: formData.regency || null,
        district: formData.district || null,
        address_detail: formData.address_detail || null,
        q1_score: formData.q1 ? parseInt(formData.q1) : null,
        q2_score: formData.q2 ? parseInt(formData.q2) : null,
        q3_score: formData.q3 ? parseInt(formData.q3) : null,
        q4_score: formData.q4 ? parseInt(formData.q4) : null,
        q5_score: formData.q5 ? parseInt(formData.q5) : null,
        q6_score: formData.q6 ? parseInt(formData.q6) : null,
        q7_score: formData.q7 ? parseInt(formData.q7) : null,
        q8_score: formData.q8 ? parseInt(formData.q8) : null,
        q9_score: formData.q9 ? parseInt(formData.q9) : null,
        q10_score: formData.q10 ? parseInt(formData.q10) : null,
        q11_score: formData.q11 ? parseInt(formData.q11) : null,
        overall_satisfaction: formData.overall_satisfaction || null,
        comments: formData.suggestions || null,
        qr_token: qrToken || null,
        phone: formData.phone,
        source: qrToken ? 'qr_code' : 'web'
      };

      console.log('📤 Mengirim data survey:', data);

      const res = await fetch('/api/public/surveys', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await res.text();
        console.error('❌ Non-JSON response:', text.substring(0, 200));
        throw new Error('Server mengembalikan response yang tidak valid');
      }

      const result = await res.json();
      console.log('📥 Response dari server:', result);

      if (!res.ok) {
        throw new Error(result.error || 'Gagal mengirim survei');
      }

      if (result.success) {
        const selectedUnit = units.find(u => u.id === (formData.unit_id || unitFromQR));
        
        setSubmittedSurveyData({
          survey_id: result.data?.id || 'SRV-' + Date.now(),
          respondent_name: formData.is_anonymous ? 'Anonim' : formData.full_name,
          respondent_phone: formData.phone,
          respondent_email: formData.email,
          service_type: formData.service_type,
          unit_name: selectedUnit?.name || 'Unit Umum',
          visit_date: new Date().toISOString(),
          responses: {
            q1: parseInt(formData.q1) || 0,
            q2: parseInt(formData.q2) || 0,
            q3: parseInt(formData.q3) || 0,
            q4: parseInt(formData.q4) || 0,
            q5: parseInt(formData.q5) || 0,
            q6: parseInt(formData.q6) || 0,
            q7: parseInt(formData.q7) || 0,
            q8: parseInt(formData.q8) || 0,
            q9: parseInt(formData.q9) || 0,
            q10: parseInt(formData.q10) || 0,
            q11: parseInt(formData.q11) || 0
          },
          suggestions: formData.suggestions,
          created_at: new Date().toISOString(),
          // Data identitas lengkap
          age_range: formData.age,
          gender: formData.gender,
          education: formData.education,
          job: formData.occupation,
          regency: formData.regency,
          district: formData.district,
          address_detail: formData.address_detail
        });
        
        setSurveyId(result.data?.id || 'SRV-' + Date.now());
        setSubmitted(true);
        setValidationErrors([]);
      } else {
        throw new Error(result.error || 'Gagal mengirim survei');
      }
    } catch (err) {
      console.error('❌ Error submit survey:', err);
      alert('Error: ' + (err instanceof Error ? err.message : 'Terjadi kesalahan saat mengirim survei'));
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setSurveyId('');
    setSubmittedSurveyData(null);
    setFormData({
      service_type: 'rawat_jalan',
      full_name: '',
      phone: '',
      email: '',
      is_anonymous: false,
      age: '',
      gender: '',
      education: '',
      occupation: '',
      address_detail: '',
      regency: '',
      district: '',
      q1: '', q2: '', q3: '', q4: '', q5: '', q6: '', q7: '', q8: '', q9: '', q10: '', q11: '',
      overall_satisfaction: '',
      suggestions: '',
      unit_id: unitFromQR || ''
    });
    setCurrentStep(1);
    setAvailableKecamatan([]);
  };

  const handleDownloadPDF = () => {
    if (submittedSurveyData) {
      downloadSurveyPDF(submittedSurveyData);
    }
  };

  const handleChange = (f: string, v: string | boolean) => {
    setFormData(p => ({ ...p, [f]: v }));
    
    // Jika Kab/Kota berubah, update kecamatan dan reset kecamatan yang dipilih
    if (f === 'regency') {
      const kecamatanList = getKecamatanByKabupaten(v as string);
      setAvailableKecamatan(kecamatanList);
      setFormData(p => ({ ...p, district: '' })); // Reset kecamatan
    }
  };

  const handleSetAllRatings = (value: string) => {
    setFormData(p => ({
      ...p,
      q1: value,
      q2: value,
      q3: value,
      q4: value,
      q5: value,
      q6: value,
      q7: value,
      q8: value,
      q9: value,
      q10: value,
      q11: value
    }));
  };

  const canProceedToStep2 = () => {
    const errors: string[] = [];
    
    if (!formData.phone || formData.phone.length < 10) {
      errors.push('Nomor HP harus diisi minimal 10 digit');
    }
    if (!(formData.unit_id || unitFromQR)) {
      errors.push('Unit harus dipilih');
    }
    if (!formData.age) {
      errors.push('Usia harus diisi');
    }
    if (!formData.gender) {
      errors.push('Jenis kelamin harus diisi');
    }
    if (!formData.education) {
      errors.push('Pendidikan harus diisi');
    }
    if (!formData.occupation) {
      errors.push('Pekerjaan harus diisi');
    }
    if (!formData.regency) {
      errors.push('Kab/Kota harus dipilih');
    }
    if (!formData.district) {
      errors.push('Kecamatan harus dipilih');
    }
    if (!formData.address_detail) {
      errors.push('Alamat detail harus diisi');
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const isStep2Complete = () => {
    return formData.q1 && formData.q2 && formData.q3 && formData.q4 && 
           formData.q5 && formData.q6 && formData.q7 && formData.q8 &&
           formData.q9 && formData.q10 && formData.q11;
  };

  if (isLoading && units.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">Memuat...</p>
        </div>
      </div>
    );
  }

  // Success Screen
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30">
            <span className="material-symbols-outlined text-white text-5xl">check_circle</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Terima Kasih!</h2>
          <p className="text-gray-500 mb-6">Survei Anda telah berhasil dikirim. Masukan Anda sangat berharga bagi kami.</p>
          
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 mb-6 text-white shadow-lg">
            <p className="text-white/80 text-sm mb-1">ID Survei</p>
            <p className="text-2xl font-bold tracking-wider">{surveyId}</p>
          </div>
          
          <div className="space-y-3">
            <button 
              onClick={handleDownloadPDF}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-emerald-500/30 active:scale-95 transition-transform flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">download</span>
              Unduh Survei (PDF)
            </button>
            
            <button 
              onClick={resetForm} 
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-blue-500/30 active:scale-95 transition-transform"
            >
              Isi Survei Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Progress Bar */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-600">Step {currentStep} dari {totalSteps}</span>
            <span className="text-xs text-gray-500">{Math.round((currentStep / totalSteps) * 100)}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <main className="max-w-lg mx-auto w-full px-4 py-6 pb-24">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Step 1: Identitas Diri + Alamat */}
          {currentStep === 1 && (
            <>
              {/* Unit Selection */}
              <div className="bg-white rounded-2xl shadow-lg p-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-2xl">📍</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Unit Tujuan</p>
                    {unitFromQR ? (
                      <p className="text-lg font-bold text-gray-800">{units.find(u => u.id === unitFromQR)?.name}</p>
                    ) : (
                      <select
                        className="w-full mt-1 text-sm border-0 border-b-2 border-gray-200 focus:border-blue-500 focus:ring-0 bg-transparent font-medium text-gray-800 py-1"
                        value={formData.unit_id}
                        onChange={e => handleChange('unit_id', e.target.value)}
                      >
                        <option value="">Pilih Unit</option>
                        {units.map(u => (
                          <option key={u.id} value={u.id}>{u.name}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              </div>

              {/* Identitas Diri */}
              <div className="bg-white rounded-2xl shadow-lg p-5">
                <h3 className="text-base font-bold text-gray-800 mb-1 flex items-center gap-2">
                  <span className="text-xl">👤</span> Identitas Diri
                </h3>
                <p className="text-xs text-gray-500 mb-4">Informasi responden lengkap</p>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium text-gray-600">Nama Lengkap</label>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.is_anonymous}
                          onChange={e => handleChange('is_anonymous', e.target.checked)}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600"
                        />
                        <span className="text-xs text-gray-500">Anonim</span>
                      </label>
                    </div>
                    <input
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border-0 text-sm focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                      placeholder="Masukkan nama lengkap"
                      value={formData.full_name}
                      onChange={e => handleChange('full_name', e.target.value)}
                      disabled={formData.is_anonymous}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 mb-2 block">Nomor HP (WhatsApp) <span className="text-red-500">*</span></label>
                    <input
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border-0 text-sm focus:ring-2 focus:ring-blue-500"
                      type="tel"
                      placeholder="08xxxxxxxxxx"
                      value={formData.phone}
                      onChange={e => handleChange('phone', e.target.value)}
                      required
                    />
                  </div>
                  
                  {/* Usia */}
                  <div>
                    <label className="text-sm font-medium text-gray-600 mb-2 block">Usia <span className="text-red-500">*</span></label>
                    <select
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border-0 text-sm focus:ring-2 focus:ring-blue-500"
                      value={formData.age}
                      onChange={e => handleChange('age', e.target.value)}
                      required
                    >
                      <option value="">Pilih Rentang Usia</option>
                      <option value="Kurang dari 20 Tahun">Kurang dari 20 Tahun</option>
                      <option value="20 - 40 Tahun">20 - 40 Tahun</option>
                      <option value="41 - 60 Tahun">41 - 60 Tahun</option>
                      <option value="Lebih dari 60 Tahun">Lebih dari 60 Tahun</option>
                    </select>
                  </div>

                  {/* Jenis Kelamin */}
                  <div>
                    <label className="text-sm font-medium text-gray-600 mb-2 block">Jenis Kelamin <span className="text-red-500">*</span></label>
                    <div className="grid grid-cols-2 gap-3">
                      <label className="cursor-pointer">
                        <input
                          type="radio"
                          name="gender"
                          value="Laki-laki"
                          checked={formData.gender === 'Laki-laki'}
                          onChange={e => handleChange('gender', e.target.value)}
                          className="sr-only peer"
                        />
                        <div className="px-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-200 text-sm text-center font-medium peer-checked:bg-blue-50 peer-checked:border-blue-500 peer-checked:text-blue-700 transition-all">
                          👨 Laki-laki
                        </div>
                      </label>
                      <label className="cursor-pointer">
                        <input
                          type="radio"
                          name="gender"
                          value="Perempuan"
                          checked={formData.gender === 'Perempuan'}
                          onChange={e => handleChange('gender', e.target.value)}
                          className="sr-only peer"
                        />
                        <div className="px-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-200 text-sm text-center font-medium peer-checked:bg-pink-50 peer-checked:border-pink-500 peer-checked:text-pink-700 transition-all">
                          👩 Perempuan
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Pendidikan */}
                  <div>
                    <label className="text-sm font-medium text-gray-600 mb-2 block">Pendidikan Terakhir <span className="text-red-500">*</span></label>
                    <select
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border-0 text-sm focus:ring-2 focus:ring-blue-500"
                      value={formData.education}
                      onChange={e => handleChange('education', e.target.value)}
                      required
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
                  </div>

                  {/* Pekerjaan */}
                  <div>
                    <label className="text-sm font-medium text-gray-600 mb-2 block">Pekerjaan <span className="text-red-500">*</span></label>
                    <select
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border-0 text-sm focus:ring-2 focus:ring-blue-500"
                      value={formData.occupation}
                      onChange={e => handleChange('occupation', e.target.value)}
                      required
                    >
                      <option value="">Pilih Pekerjaan</option>
                      <option value="PNS">PNS</option>
                      <option value="TNI/Polri">TNI/Polri</option>
                      <option value="Swasta">Swasta</option>
                      <option value="Wiraswasta">Wiraswasta</option>
                      <option value="Petani">Petani</option>
                      <option value="Nelayan">Nelayan</option>
                      <option value="Pelajar/Mahasiswa">Pelajar/Mahasiswa</option>
                      <option value="Ibu Rumah Tangga">Ibu Rumah Tangga</option>
                      <option value="Pensiunan">Pensiunan</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>

                  {/* Alamat Domisili */}
                  <div>
                    <label className="text-sm font-medium text-gray-600 mb-2 block">Alamat Domisili <span className="text-red-500">*</span></label>
                    
                    {/* Kab/Kota Dropdown */}
                    <div className="mb-3">
                      <label className="text-xs text-gray-500 mb-1 block">Kabupaten/Kota</label>
                      <select
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border-0 text-sm focus:ring-2 focus:ring-blue-500"
                        value={formData.regency}
                        onChange={e => handleChange('regency', e.target.value)}
                        required
                      >
                        <option value="">Pilih Kabupaten/Kota</option>
                        {wilayahIndonesia.map(kab => (
                          <option key={kab.id} value={kab.nama}>{kab.nama}</option>
                        ))}
                      </select>
                    </div>

                    {/* Kecamatan Dropdown */}
                    <div className="mb-3">
                      <label className="text-xs text-gray-500 mb-1 block">Kecamatan</label>
                      <select
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border-0 text-sm focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        value={formData.district}
                        onChange={e => handleChange('district', e.target.value)}
                        disabled={!formData.regency || availableKecamatan.length === 0}
                        required
                      >
                        <option value="">Pilih Kecamatan</option>
                        {availableKecamatan.map(kec => (
                          <option key={kec.id} value={kec.nama}>{kec.nama}</option>
                        ))}
                      </select>
                      {formData.regency && availableKecamatan.length === 0 && (
                        <p className="text-xs text-red-500 mt-1">Tidak ada kecamatan tersedia</p>
                      )}
                    </div>

                    {/* Alamat Detail (Jalan, RT/RW, Kelurahan/Desa) */}
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Alamat Lengkap (Jalan, RT/RW, Kelurahan/Desa)</label>
                      <textarea
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border-0 text-sm focus:ring-2 focus:ring-blue-500 resize-none"
                        rows={3}
                        placeholder="Contoh: Jl. Merdeka No. 123, RT 02/RW 05, Kelurahan Pabean"
                        value={formData.address_detail}
                        onChange={e => handleChange('address_detail', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Notifikasi Error Validasi */}
              {validationErrors.length > 0 && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <span className="text-red-500 text-2xl">⚠️</span>
                    </div>
                    <div className="ml-3 flex-1">
                      <h3 className="text-sm font-bold text-red-800 mb-2">Data Belum Lengkap!</h3>
                      <ul className="list-disc list-inside space-y-1">
                        {validationErrors.map((error, idx) => (
                          <li key={idx} className="text-sm text-red-700">
                            {error}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <button
                type="button"
                onClick={() => {
                  if (canProceedToStep2()) {
                    setCurrentStep(2);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/30 active:scale-95 transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
                disabled={!canProceedToStep2()}
              >
                Lanjutkan <span className="text-xl">→</span>
              </button>
            </>
          )}

          {/* Step 2: Penilaian + Saran */}
          {currentStep === 2 && (
            <>
              {/* Rating Section - 11 Unsur IKM */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-5 py-4">
                  <h3 className="text-white font-bold flex items-center gap-2 mb-1">
                    <span className="text-xl">⭐</span> Form Survey IKM
                  </h3>
                  <p className="text-white/90 text-xs">Penilaian 11 unsur pelayanan (U1 - U11)</p>
                </div>
                <div className="divide-y divide-gray-100">
                  {surveyQuestions.map((q, idx) => (
                    <div key={q.id} className="p-4">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="flex flex-col items-center gap-1 flex-shrink-0">
                            <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                              {idx + 1}
                            </span>
                            <span className="text-xs font-bold text-blue-600">{q.code}</span>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-bold text-gray-800 mb-1">{q.title}</p>
                            <p className="text-sm text-gray-600 leading-relaxed">{q.text}</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Pilihan Jawaban - 4 Alternatif dengan Label Spesifik */}
                      <div className="grid grid-cols-2 gap-3 pl-12">
                        {q.options.map(option => (
                          <label key={option.value} className="cursor-pointer">
                            <input
                              className="sr-only peer"
                              name={q.id}
                              type="radio"
                              value={option.value}
                              checked={formData[q.id as keyof typeof formData] === option.value.toString()}
                              onChange={e => handleChange(q.id, e.target.value)}
                              required
                            />
                            <div className={`flex items-center gap-3 px-3 py-3 rounded-xl border-2 transition-all ${
                              formData[q.id as keyof typeof formData] === option.value.toString() 
                                ? 'border-blue-500 bg-blue-50 scale-105 shadow-lg' 
                                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                            }`}>
                              <span className="text-3xl flex-shrink-0">{option.emoji}</span>
                              <span className={`text-xs font-bold leading-tight text-left flex-1 ${
                                formData[q.id as keyof typeof formData] === option.value.toString()
                                  ? 'text-blue-700'
                                  : 'text-gray-700'
                              }`}>
                                {option.label}
                              </span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Suggestions */}
              <div className="bg-white rounded-2xl shadow-lg p-5">
                <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="text-xl">💬</span> Saran & Masukan
                </h3>
                <textarea
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border-0 text-sm focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={4}
                  placeholder="Tuliskan saran atau masukan Anda untuk perbaikan layanan kami..."
                  value={formData.suggestions}
                  onChange={e => handleChange('suggestions', e.target.value)}
                />
              </div>

              {/* Navigation */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="flex-1 py-4 bg-gray-200 text-gray-700 font-bold rounded-2xl active:scale-95 transition-transform"
                >
                  ← Kembali
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/30 active:scale-95 transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
                  disabled={isLoading || !isStep2Complete()}
                >
                  {isLoading ? 'Mengirim...' : 'Kirim Survei'} 📤
                </button>
              </div>
            </>
          )}
        </form>
      </main>

      {/* Footer dihapus sesuai permintaan */}
    </div>
  );
};

export default SurveyForm;
