import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import AppFooter from '../../components/AppFooter';
import { wilayahIndonesia, getKecamatanByKabupaten } from '../../data/wilayahIndonesia';
import { downloadSurveyPDF } from '../../utils/pdfGenerator';

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
  // Alamat
  kota_kabupaten: string;
  kecamatan: string;
  alamat_detail: string;
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
  const [surveyId, setSurveyId] = useState('');
  const [submittedSurveyData, setSubmittedSurveyData] = useState<any>(null);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [appSettings, setAppSettings] = useState<AppSettings>({});
  
  const [formData, setFormData] = useState<FormData>({
    service_type: '', // Tetap ada di state tapi tidak ditampilkan
    full_name: '',
    is_anonymous: false,
    phone: '',
    age: '',
    gender: '',
    education: '',
    job: '',
    patient_type: '',
    kota_kabupaten: '',
    kecamatan: '',
    alamat_detail: '',
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

  const [kecamatanList, setKecamatanList] = useState<any[]>([]);

  const totalSteps = 2; // Step 1: Identitas, Step 2: Penilaian
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    // Jika yang diubah adalah kota_kabupaten, update kecamatan list
    if (name === 'kota_kabupaten') {
      const selectedKabupaten = wilayahIndonesia.find(k => k.nama === value);
      setKecamatanList(selectedKabupaten?.kecamatan || []);
      setFormData(prev => ({
        ...prev,
        kota_kabupaten: value,
        kecamatan: ''
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    }
  };

  const handleRadioChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // PENTING: Cegah submit jika masih di step 1 (identitas)
    if (currentStep < totalSteps) {
      console.log('⚠️ Mencegah submit prematur - masih di step', currentStep);
      e.stopPropagation(); // Stop event propagation
      return false; // Explicitly return false
    }
    
    setError('');
    setSubmitting(true);

    try {
      // Validasi unit_id
      if (!unitId) {
        setError('Unit harus dipilih');
        setSubmitting(false);
        return;
      }

      // Validasi phone
      if (!formData.phone) {
        setError('Nomor HP wajib diisi');
        setSubmitting(false);
        return;
      }

      // Validasi field identitas baru
      if (!formData.age) {
        setError('Usia wajib diisi');
        setSubmitting(false);
        return;
      }

      if (!formData.gender) {
        setError('Jenis kelamin wajib diisi');
        setSubmitting(false);
        return;
      }

      if (!formData.education) {
        setError('Pendidikan terakhir wajib diisi');
        setSubmitting(false);
        return;
      }

      if (!formData.job) {
        setError('Pekerjaan wajib diisi');
        setSubmitting(false);
        return;
      }

      if (!formData.kota_kabupaten || !formData.kecamatan || !formData.alamat_detail) {
        setError('Alamat domisili lengkap wajib diisi');
        setSubmitting(false);
        return;
      }

      // Siapkan data survey dengan format yang benar
      const surveyData = {
        unit_id: unitId,
        visitor_name: formData.is_anonymous ? null : formData.full_name,
        visitor_phone: formData.phone,
        is_anonymous: formData.is_anonymous,
        age_range: formData.age || null,
        gender: formData.gender || null,
        education: formData.education || null,
        job: formData.job || null,
        patient_type: formData.patient_type || null,
        service_type: formData.service_type || null,
        regency: formData.kota_kabupaten || null,
        district: formData.kecamatan || null,
        address_detail: formData.alamat_detail || null,
        // Skor indikator (9 unsur x 3 indikator)
        u1_ind1_score: formData.u1_ind1 ? parseInt(formData.u1_ind1) : null,
        u1_ind2_score: formData.u1_ind2 ? parseInt(formData.u1_ind2) : null,
        u1_ind3_score: formData.u1_ind3 ? parseInt(formData.u1_ind3) : null,
        u2_ind1_score: formData.u2_ind1 ? parseInt(formData.u2_ind1) : null,
        u2_ind2_score: formData.u2_ind2 ? parseInt(formData.u2_ind2) : null,
        u2_ind3_score: formData.u2_ind3 ? parseInt(formData.u2_ind3) : null,
        u3_ind1_score: formData.u3_ind1 ? parseInt(formData.u3_ind1) : null,
        u3_ind2_score: formData.u3_ind2 ? parseInt(formData.u3_ind2) : null,
        u3_ind3_score: formData.u3_ind3 ? parseInt(formData.u3_ind3) : null,
        u4_ind1_score: formData.u4_ind1 ? parseInt(formData.u4_ind1) : null,
        u4_ind2_score: formData.u4_ind2 ? parseInt(formData.u4_ind2) : null,
        u4_ind3_score: formData.u4_ind3 ? parseInt(formData.u4_ind3) : null,
        u5_ind1_score: formData.u5_ind1 ? parseInt(formData.u5_ind1) : null,
        u5_ind2_score: formData.u5_ind2 ? parseInt(formData.u5_ind2) : null,
        u5_ind3_score: formData.u5_ind3 ? parseInt(formData.u5_ind3) : null,
        u6_ind1_score: formData.u6_ind1 ? parseInt(formData.u6_ind1) : null,
        u6_ind2_score: formData.u6_ind2 ? parseInt(formData.u6_ind2) : null,
        u6_ind3_score: formData.u6_ind3 ? parseInt(formData.u6_ind3) : null,
        u7_ind1_score: formData.u7_ind1 ? parseInt(formData.u7_ind1) : null,
        u7_ind2_score: formData.u7_ind2 ? parseInt(formData.u7_ind2) : null,
        u7_ind3_score: formData.u7_ind3 ? parseInt(formData.u7_ind3) : null,
        u8_ind1_score: formData.u8_ind1 ? parseInt(formData.u8_ind1) : null,
        u8_ind2_score: formData.u8_ind2 ? parseInt(formData.u8_ind2) : null,
        u8_ind3_score: formData.u8_ind3 ? parseInt(formData.u8_ind3) : null,
        u9_ind1_score: formData.u9_ind1 ? parseInt(formData.u9_ind1) : null,
        u9_ind2_score: formData.u9_ind2 ? parseInt(formData.u9_ind2) : null,
        u9_ind3_score: formData.u9_ind3 ? parseInt(formData.u9_ind3) : null,
        overall_score: formData.overall_satisfaction ? parseInt(formData.overall_satisfaction) : null,
        comments: formData.suggestions || null,
        qr_code: qrCode || null,
        source: qrCode ? 'qr_code' : 'public_survey'
      };

      console.log('📤 Mengirim survey:', surveyData);

      // Gunakan relative path untuk production (Vercel)
      // Di production, /api akan di-route ke Vercel serverless functions
      const apiEndpoint = '/api/public/surveys';

      console.log('🌐 API Endpoint:', apiEndpoint);

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(surveyData)
      });
      
      console.log('📥 Response status:', response.status);
      console.log('📥 Response headers:', response.headers.get('content-type'));
      
      // Cek apakah response adalah JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('❌ Non-JSON response:', text);
        throw new Error(`Server mengembalikan response yang tidak valid (${response.status}). Silakan coba lagi.`);
      }
      
      const result = await response.json();
      console.log('📥 Response data:', result);
      
      if (!response.ok) {
        throw new Error(result.error || 'Gagal mengirim survei');
      }
      
      // Simpan data untuk PDF
      setSubmittedSurveyData({
        survey_id: result.data?.id || 'SRV-' + Date.now(),
        respondent_name: formData.is_anonymous ? 'Anonim' : formData.full_name,
        respondent_phone: formData.phone,
        service_type: formData.service_type || 'Umum',
        unit_name: unitName || 'Unit Umum',
        visit_date: new Date().toISOString(),
        responses: {
          q1: parseInt(formData.u1_ind1) || 0,
          q2: parseInt(formData.u2_ind1) || 0,
          q3: parseInt(formData.u3_ind1) || 0,
          q4: parseInt(formData.u4_ind1) || 0,
          q5: parseInt(formData.u5_ind1) || 0,
          q6: parseInt(formData.u6_ind1) || 0,
          q7: parseInt(formData.u7_ind1) || 0,
          q8: parseInt(formData.u8_ind1) || 0,
          q9: parseInt(formData.u9_ind1) || 0
        },
        suggestions: formData.suggestions,
        created_at: new Date().toISOString(),
        age_range: formData.age,
        gender: formData.gender,
        education: formData.education,
        job: formData.job,
        regency: formData.kota_kabupaten,
        district: formData.kecamatan,
        address_detail: formData.alamat_detail
      });
      
      setSurveyId(result.data?.id || 'SRV-' + Date.now());
      setSubmitted(true);
    } catch (err: any) {
      console.error('❌ Submit error:', err);
      setError(err.message || 'Terjadi kesalahan saat mengirim survei');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setCurrentStep(1);
    setSurveyId('');
    setSubmittedSurveyData(null);
    setFormData({
      service_type: '',
      full_name: '', 
      is_anonymous: false, 
      phone: '', 
      age: '', 
      gender: '',
      education: '', 
      job: '', 
      patient_type: '', 
      kota_kabupaten: '', 
      kecamatan: '', 
      alamat_detail: '',
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
  };

  const handleDownloadPDF = () => {
    if (submittedSurveyData) {
      downloadSurveyPDF(submittedSurveyData);
    }
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
          <p className="text-gray-500 mb-6">Survei Anda telah berhasil dikirim. Masukan Anda sangat berharga bagi kami.</p>
          
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-6 mb-6 text-white shadow-lg">
            <p className="text-white/80 text-sm mb-1">ID Survei</p>
            <p className="text-2xl font-bold tracking-wider">{surveyId}</p>
          </div>
          
          <div className="space-y-3">
            <button 
              onClick={handleDownloadPDF}
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-blue-500/30 active:scale-95 transition-transform flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">download</span>
              Unduh Survei (PDF)
            </button>
            
            <button 
              onClick={resetForm} 
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl font-bold text-lg shadow-lg shadow-emerald-500/30 active:scale-95 transition-transform"
            >
              Isi Survei Lagi
            </button>
          </div>
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

              {/* Step 1: Identitas Diri */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-slideUp">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Identitas Diri</h2>
                    <p className="text-gray-500 text-sm">Informasi responden dan alamat</p>
                  </div>

                  {/* Jenis Pasien */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Jenis Pasien (Opsional)</label>
                    <div className="relative">
                      <select
                        name="patient_type"
                        value={formData.patient_type}
                        onChange={handleInputChange}
                        className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-0 text-gray-800 text-lg transition-colors cursor-pointer appearance-none"
                      >
                        <option value="">Pilih Jenis Pasien</option>
                        <option value="BPJS">BPJS</option>
                        <option value="Umum">Umum</option>
                        <option value="Asuransi">Asuransi</option>
                        <option value="Lainnya">Lainnya</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">expand_more</span>
                    </div>
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

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Usia *</label>
                    <div className="relative">
                      <select
                        name="age"
                        value={formData.age}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-0 text-gray-800 text-lg transition-colors cursor-pointer appearance-none"
                      >
                        <option value="">Pilih Rentang Usia</option>
                        <option value="Kurang dari 20 Tahun">Kurang dari 20 Tahun</option>
                        <option value="20 - 40 Tahun">20 - 40 Tahun</option>
                        <option value="41 - 60 Tahun">41 - 60 Tahun</option>
                        <option value="Lebih dari 60 Tahun">Lebih dari 60 Tahun</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">expand_more</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Jenis Kelamin *</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: 'Laki-laki', icon: '👨', label: 'Laki-laki' },
                        { value: 'Perempuan', icon: '👩', label: 'Perempuan' }
                      ].map((option) => (
                        <label key={option.value} className="cursor-pointer">
                          <input
                            type="radio"
                            name="gender"
                            value={option.value}
                            checked={formData.gender === option.value}
                            onChange={(e) => handleRadioChange('gender', e.target.value)}
                            required
                            className="peer sr-only"
                          />
                          <div className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${formData.gender === option.value ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-bold' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}`}>
                            <span className="text-xl">{option.icon}</span>
                            <span>{option.label}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Pendidikan Terakhir *</label>
                    <select
                      name="education"
                      value={formData.education}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-0 text-gray-800 text-lg transition-colors cursor-pointer"
                    >
                      <option value="">Pilih Pendidikan</option>
                      <option value="SD">SD</option>
                      <option value="SMP">SMP</option>
                      <option value="SMA/SMK">SMA/SMK</option>
                      <option value="D1/D2/D3">D1/D2/D3</option>
                      <option value="D4/S1">D4/S1</option>
                      <option value="S2">S2</option>
                      <option value="S3">S3</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Pekerjaan *</label>
                    <div className="relative">
                      <select
                        name="job"
                        value={formData.job}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-0 text-gray-800 text-lg transition-colors cursor-pointer appearance-none"
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
                      <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">expand_more</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Alamat Domisili *</label>
                    <div className="space-y-3">
                      <select
                        name="kota_kabupaten"
                        value={formData.kota_kabupaten}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-0 text-gray-800 text-lg transition-colors cursor-pointer"
                      >
                        <option value="">Pilih Kabupaten/Kota</option>
                        {wilayahIndonesia.map((kab) => (
                          <option key={kab.id} value={kab.nama}>{kab.nama}</option>
                        ))}
                      </select>
                      
                      <select
                        name="kecamatan"
                        value={formData.kecamatan}
                        onChange={handleInputChange}
                        required
                        disabled={!formData.kota_kabupaten}
                        className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-0 text-gray-800 text-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="">Pilih Kecamatan</option>
                        {kecamatanList.map((kec) => (
                          <option key={kec.id} value={kec.nama}>{kec.nama}</option>
                        ))}
                      </select>
                      
                      <textarea
                        name="alamat_detail"
                        value={formData.alamat_detail}
                        onChange={handleInputChange}
                        required
                        placeholder="Masukkan alamat lengkap (Nama Jalan, RT/RW, Kelurahan/Desa)"
                        rows={3}
                        className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-0 text-gray-800 text-lg transition-colors resize-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Survey Questions - 9 Unsur dengan Indikator */}
              {currentStep === 2 && (
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

                  {/* Overall Satisfaction & Suggestions - Digabung di Step 2 */}
                  <div className="mt-8 space-y-6">
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 text-center">
                      <p className="text-gray-600 mb-4 font-semibold">Seberapa puas Anda dengan layanan kami?</p>
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
                </div>
              )}
            </div>
          </div>

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
                  onClick={(e) => {
                    e.preventDefault(); // Prevent form submission
                    e.stopPropagation(); // Stop event bubbling
                    setCurrentStep(prev => prev + 1);
                  }}
                  disabled={
                    (currentStep === 1 && (!formData.phone || !formData.age || !formData.gender || !formData.education || !formData.job || !formData.kota_kabupaten || !formData.kecamatan || !formData.alamat_detail))
                  }
                  className="flex-1 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                >
                  Lanjutkan
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              ) : (
                <button 
                  type="submit" 
                  disabled={submitting}
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
