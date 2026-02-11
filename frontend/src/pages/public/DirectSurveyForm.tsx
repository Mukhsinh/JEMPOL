import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { wilayahIndonesia } from '../../data/wilayahIndonesia';
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
  // 11 Unsur IKM
  u1: string;
  u2: string;
  u3: string;
  u4: string;
  u5: string;
  u6: string;
  u7: string;
  u8: string;
  u9: string;
  u10: string;
  u11: string;
  overall_satisfaction: string;
  suggestions: string;
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

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [surveyId, setSurveyId] = useState('');
  const [submittedSurveyData, setSubmittedSurveyData] = useState<any>(null);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  
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
    u1: '', u2: '', u3: '', u4: '', u5: '', u6: '', u7: '', u8: '', u9: '', u10: '', u11: '',
    overall_satisfaction: '',
    suggestions: ''
  });

  const [kecamatanList, setKecamatanList] = useState<any[]>([]);

  const totalSteps = 2; // Step 1: Identitas, Step 2: Penilaian
  const progress = (currentStep / totalSteps) * 100;

  const surveyQuestions = [
    { 
      id: 'u1', 
      code: 'U1', 
      title: 'Persyaratan', 
      icon: '📋',
      question: 'Bagaimana pendapat Saudara tentang kesesuaian persyaratan pelayanan dengan jenis pelayanannya?',
      options: [
        { value: '1', label: 'Tidak Sesuai', emoji: '😞' },
        { value: '2', label: 'Kurang Sesuai', emoji: '😕' },
        { value: '3', label: 'Sesuai', emoji: '🙂' },
        { value: '4', label: 'Sangat Sesuai', emoji: '😊' }
      ]
    },
    { 
      id: 'u2', 
      code: 'U2', 
      title: 'Prosedur', 
      icon: '📝',
      question: 'Bagaimana pemahaman Saudara tentang kemudahan prosedur pelayanan di unit ini?',
      options: [
        { value: '1', label: 'Tidak Mudah', emoji: '😞' },
        { value: '2', label: 'Kurang Mudah', emoji: '😕' },
        { value: '3', label: 'Mudah', emoji: '🙂' },
        { value: '4', label: 'Sangat Mudah', emoji: '😊' }
      ]
    },
    { 
      id: 'u3', 
      code: 'U3', 
      title: 'Waktu Pelayanan', 
      icon: '⏱️',
      question: 'Bagaimana pendapat Saudara tentang kecepatan waktu dalam memberikan pelayanan?',
      options: [
        { value: '1', label: 'Tidak Cepat', emoji: '😞' },
        { value: '2', label: 'Kurang Cepat', emoji: '😕' },
        { value: '3', label: 'Cepat', emoji: '🙂' },
        { value: '4', label: 'Sangat Cepat', emoji: '😊' }
      ]
    },
    { 
      id: 'u4', 
      code: 'U4', 
      title: 'Biaya/Tarif', 
      icon: '🏷️',
      question: 'Bagaimana pendapat Saudara tentang kewajaran biaya/tarif dalam pelayanan?',
      options: [
        { value: '1', label: 'Sangat Mahal', emoji: '😞' },
        { value: '2', label: 'Cukup Mahal', emoji: '😕' },
        { value: '3', label: 'Murah', emoji: '🙂' },
        { value: '4', label: 'Gratis', emoji: '😊' }
      ]
    },
    { 
      id: 'u5', 
      code: 'U5', 
      title: 'Produk Spesifikasi Jenis Layanan', 
      icon: '📦',
      question: 'Bagaimana pendapat Saudara tentang kesesuaian produk pelayanan antara yang tercantum dalam standar pelayanan dengan hasil yang diberikan?',
      options: [
        { value: '1', label: 'Tidak Sesuai', emoji: '😞' },
        { value: '2', label: 'Kurang Sesuai', emoji: '😕' },
        { value: '3', label: 'Sesuai', emoji: '🙂' },
        { value: '4', label: 'Sangat Sesuai', emoji: '😊' }
      ]
    },
    { 
      id: 'u6', 
      code: 'U6', 
      title: 'Kompetensi Pelaksana', 
      icon: '👨‍⚕️',
      question: 'Bagaimana pendapat Saudara tentang kompetensi/kemampuan petugas dalam pelayanan?',
      options: [
        { value: '1', label: 'Tidak Kompeten', emoji: '😞' },
        { value: '2', label: 'Kurang Kompeten', emoji: '😕' },
        { value: '3', label: 'Kompeten', emoji: '🙂' },
        { value: '4', label: 'Sangat Kompeten', emoji: '😊' }
      ]
    },
    { 
      id: 'u7', 
      code: 'U7', 
      title: 'Perilaku Pelaksana', 
      icon: '😊',
      question: 'Bagaimana pendapat Saudara perilaku petugas dalam pelayanan terkait kesopanan dan keramahan?',
      options: [
        { value: '1', label: 'Tidak Sopan dan Ramah', emoji: '😞' },
        { value: '2', label: 'Kurang Sopan dan Ramah', emoji: '😕' },
        { value: '3', label: 'Sopan dan Ramah', emoji: '🙂' },
        { value: '4', label: 'Sangat Sopan dan Ramah', emoji: '😊' }
      ]
    },
    { 
      id: 'u8', 
      code: 'U8', 
      title: 'Sarana dan Prasarana', 
      icon: '🏥',
      question: 'Bagaimana pendapat Saudara tentang kualitas sarana dan prasarana?',
      options: [
        { value: '1', label: 'Buruk', emoji: '😞' },
        { value: '2', label: 'Cukup Baik', emoji: '😕' },
        { value: '3', label: 'Baik', emoji: '🙂' },
        { value: '4', label: 'Sangat Baik', emoji: '😊' }
      ]
    },
    { 
      id: 'u9', 
      code: 'U9', 
      title: 'Penanganan Pengaduan', 
      icon: '📞',
      question: 'Bagaimana pendapat Saudara tentang penanganan pengaduan pengguna layanan?',
      options: [
        { value: '1', label: 'Tidak Ada', emoji: '😞' },
        { value: '2', label: 'Ada Tetapi Tidak Berfungsi', emoji: '😕' },
        { value: '3', label: 'Berfungsi Kurang Maksimal', emoji: '🙂' },
        { value: '4', label: 'Dikelola dengan Baik', emoji: '😊' }
      ]
    },
    { 
      id: 'u10', 
      code: 'U10', 
      title: 'Transparansi Pelayanan', 
      icon: '🔍',
      question: 'Bagaimana pendapat Saudara tentang transparansi pelayanan yang diberikan? (kecukupan informasi mengenai persyaratan, biaya, waktu pelayanan, prosedur dan sebagainya)',
      options: [
        { value: '1', label: 'Tidak Transparan', emoji: '😞' },
        { value: '2', label: 'Kurang Transparan', emoji: '😕' },
        { value: '3', label: 'Transparan', emoji: '🙂' },
        { value: '4', label: 'Sangat Transparan', emoji: '😊' }
      ]
    },
    { 
      id: 'u11', 
      code: 'U11', 
      title: 'Integritas Petugas Pelayanan', 
      icon: '🛡️',
      question: 'Bagaimana pendapat Saudara tentang integritas petugas pelayanan? (terkait suap, pungutan liar, gratifikasi, dan sebagainya)',
      options: [
        { value: '1', label: 'Petugas Tidak Berintegritas', emoji: '😞' },
        { value: '2', label: 'Petugas Kurang Berintegritas', emoji: '😕' },
        { value: '3', label: 'Petugas Berintegritas', emoji: '🙂' },
        { value: '4', label: 'Petugas Sangat Berintegritas', emoji: '😊' }
      ]
    }
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

      // Siapkan data survey dengan format yang benar (11 unsur)
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
        // Skor 11 unsur
        u1_score: formData.u1 ? parseInt(formData.u1) : null,
        u2_score: formData.u2 ? parseInt(formData.u2) : null,
        u3_score: formData.u3 ? parseInt(formData.u3) : null,
        u4_score: formData.u4 ? parseInt(formData.u4) : null,
        u5_score: formData.u5 ? parseInt(formData.u5) : null,
        u6_score: formData.u6 ? parseInt(formData.u6) : null,
        u7_score: formData.u7 ? parseInt(formData.u7) : null,
        u8_score: formData.u8 ? parseInt(formData.u8) : null,
        u9_score: formData.u9 ? parseInt(formData.u9) : null,
        u10_score: formData.u10 ? parseInt(formData.u10) : null,
        u11_score: formData.u11 ? parseInt(formData.u11) : null,
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

      let result;
      let usedFallback = false;

      try {
        const response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(surveyData)
        });
        
        console.log('📥 Response status:', response.status);
        
        // Jika 404, gunakan fallback langsung ke Supabase
        if (response.status === 404) {
          console.log('⚠️ API endpoint tidak ditemukan (404), menggunakan fallback ke Supabase');
          usedFallback = true;
          
          // Import dan gunakan fallback
          const { submitSurveyDirectly } = await import('../../utils/surveyFallback');
          
          // Konversi format data untuk fallback
          const fallbackData = {
            unit_id: unitId,
            visitor_name: formData.is_anonymous ? null : formData.full_name,
            phone: formData.phone,
            is_anonymous: formData.is_anonymous,
            age: formData.age,
            gender: formData.gender,
            education: formData.education,
            job: formData.job,
            patient_type: formData.patient_type,
            service_type: formData.service_type,
            kota_kabupaten: formData.kota_kabupaten,
            kecamatan: formData.kecamatan,
            alamat_detail: formData.alamat_detail,
            q1: formData.u1,
            q2: formData.u2,
            q3: formData.u3,
            q4: formData.u4,
            q5: formData.u5,
            q6: formData.u6,
            q7: formData.u7,
            q8: formData.u8,
            q9: formData.u9,
            q10: formData.u10,
            q11: formData.u11,
            overall_satisfaction: formData.overall_satisfaction,
            suggestions: formData.suggestions,
            qr_code: qrCode
          };
          
          result = await submitSurveyDirectly(fallbackData);
        } else {
          // Cek apakah response adalah JSON
          const contentType = response.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error('❌ Non-JSON response:', text);
            throw new Error(`Server mengembalikan response yang tidak valid (${response.status}). Silakan coba lagi.`);
          }
          
          result = await response.json();
          console.log('📥 Response data:', result);
          
          if (!response.ok) {
            throw new Error(result.error || 'Gagal mengirim survei');
          }
        }
      } catch (fetchError: any) {
        console.error('❌ Fetch error:', fetchError);
        
        // Jika error network atau timeout, gunakan fallback
        if (fetchError.message.includes('Failed to fetch') || fetchError.message.includes('NetworkError')) {
          console.log('⚠️ Network error, menggunakan fallback ke Supabase');
          usedFallback = true;
          
          const { submitSurveyDirectly } = await import('../../utils/surveyFallback');
          
          const fallbackData = {
            unit_id: unitId,
            visitor_name: formData.is_anonymous ? null : formData.full_name,
            phone: formData.phone,
            is_anonymous: formData.is_anonymous,
            age: formData.age,
            gender: formData.gender,
            education: formData.education,
            job: formData.job,
            patient_type: formData.patient_type,
            service_type: formData.service_type,
            kota_kabupaten: formData.kota_kabupaten,
            kecamatan: formData.kecamatan,
            alamat_detail: formData.alamat_detail,
            q1: formData.u1,
            q2: formData.u2,
            q3: formData.u3,
            q4: formData.u4,
            q5: formData.u5,
            q6: formData.u6,
            q7: formData.u7,
            q8: formData.u8,
            q9: formData.u9,
            q10: formData.u10,
            q11: formData.u11,
            overall_satisfaction: formData.overall_satisfaction,
            suggestions: formData.suggestions,
            qr_code: qrCode
          };
          
          result = await submitSurveyDirectly(fallbackData);
        } else {
          throw fetchError;
        }
      }
      
      if (usedFallback) {
        console.log('✅ Survey berhasil dikirim via fallback');
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
          q1: parseInt(formData.u1) || 0,
          q2: parseInt(formData.u2) || 0,
          q3: parseInt(formData.u3) || 0,
          q4: parseInt(formData.u4) || 0,
          q5: parseInt(formData.u5) || 0,
          q6: parseInt(formData.u6) || 0,
          q7: parseInt(formData.u7) || 0,
          q8: parseInt(formData.u8) || 0,
          q9: parseInt(formData.u9) || 0,
          q10: parseInt(formData.u10) || 0,
          q11: parseInt(formData.u11) || 0
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
      u1: '', u2: '', u3: '', u4: '', u5: '', u6: '', u7: '', u8: '', u9: '', u10: '', u11: '',
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
                    <p className="text-gray-500 text-sm">Berikan penilaian untuk setiap pertanyaan</p>
                  </div>



                  {/* Questions - 11 Unsur IKM */}
                  <div className="space-y-5">
                    {surveyQuestions.map((q, index) => (
                      <div key={q.id} className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border-2 border-gray-200 shadow-md hover:shadow-lg transition-shadow">
                        <div className="flex items-start gap-4 mb-5">
                          <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <span className="text-3xl">{q.icon}</span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">{q.code}</span>
                              <h4 className="font-bold text-gray-900 text-lg">{q.title}</h4>
                            </div>
                            <p className="text-sm text-gray-700 font-medium leading-relaxed">{q.question}</p>
                          </div>
                        </div>
                        
                        {/* Rating Options - 4 Pilihan dengan Label Spesifik */}
                        <div className="grid grid-cols-2 gap-3">
                          {q.options.map((opt) => (
                            <button 
                              key={opt.value} 
                              type="button" 
                              onClick={() => handleRadioChange(q.id, opt.value)}
                              className={`relative py-4 px-3 rounded-2xl transition-all duration-200 flex items-center gap-3 ${
                                formData[q.id as keyof FormData] === opt.value 
                                  ? 'bg-gradient-to-br from-emerald-500 to-teal-500 shadow-2xl scale-105 border-3 border-white ring-4 ring-emerald-500/30' 
                                  : 'bg-white border-2 border-gray-200 hover:border-gray-400 hover:shadow-lg hover:scale-102'
                              }`}
                            >
                              <div className={`text-4xl flex-shrink-0 transition-transform ${
                                formData[q.id as keyof FormData] === opt.value ? 'scale-110' : ''
                              }`}>{opt.emoji}</div>
                              <div className="text-left flex-1">
                                <div className={`text-sm font-bold leading-tight ${
                                  formData[q.id as keyof FormData] === opt.value ? 'text-white' : 'text-gray-900'
                                }`}>{opt.label}</div>
                              </div>
                              {formData[q.id as keyof FormData] === opt.value && (
                                <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-xl border-3 border-green-500 animate-bounce">
                                  <span className="text-green-600 text-lg font-black">✓</span>
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                        
                        {/* Progress Indicator per Question */}
                        {formData[q.id as keyof FormData] && (
                          <div className="mt-4 flex items-center gap-2 text-sm text-green-600 font-semibold animate-slideUp">
                            <span className="material-symbols-outlined text-base">check_circle</span>
                            <span>Pertanyaan {index + 1} dari {surveyQuestions.length} terjawab</span>
                          </div>
                        )}
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
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-slideUp { animation: slideUp 0.4s ease-out; }
        .animate-bounce { animation: bounce 1s ease-in-out infinite; }
        .safe-area-bottom { padding-bottom: max(1rem, env(safe-area-inset-bottom)); }
        
        /* Custom scrollbar untuk area form */
        .overflow-y-auto::-webkit-scrollbar {
          width: 8px;
        }
        .overflow-y-auto::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #10b981, #14b8a6);
          border-radius: 10px;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #059669, #0d9488);
        }
      `}</style>
    </div>
  );
};

export default DirectSurveyForm;
