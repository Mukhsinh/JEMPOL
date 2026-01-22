import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getServiceCategories, getPatientTypes } from '../../services/masterDataService';
import AppFooter from '../../components/AppFooter';

interface FormData {
  reporter_identity_type: 'personal' | 'anonymous';
  reporter_name: string;
  reporter_email: string;
  reporter_phone: string;
  service_type: string;
  service_category_id: string;
  patient_type_id: string;
  title: string;
  description: string;
  unit_id: string; // Tambahkan unit_id ke form data
}

interface AppSettings {
  institution_name?: string;
  institution_address?: string;
  contact_phone?: string;
  contact_email?: string;
  website?: string;
  app_footer?: string;
}

// Direct Form View - Tiket Eksternal/Pengaduan (Public, Tanpa Login, Mobile-First)
// Route: /form/eksternal?unit_id=xxx&unit_name=xxx
// PENTING: Halaman ini TANPA SIDEBAR - Full screen form
const DirectExternalTicketForm: React.FC = () => {
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
  const [ticketNumber, setTicketNumber] = useState('');
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [units, setUnits] = useState<any[]>([]);
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [serviceCategories, setServiceCategories] = useState<any[]>([]);
  const [patientTypes, setPatientTypes] = useState<any[]>([]);
  const [loadingMasterData, setLoadingMasterData] = useState(false);
  const [appSettings, setAppSettings] = useState<AppSettings>({});
  
  const [formData, setFormData] = useState<FormData>({
    reporter_identity_type: 'personal',
    reporter_name: '',
    reporter_email: '',
    reporter_phone: '',
    service_type: '',
    service_category_id: '',
    patient_type_id: '',
    title: '',
    description: '',
    unit_id: unitId || '' // Gunakan unit_id dari URL jika ada
  });

  // Load master data (service categories dan patient types)
  React.useEffect(() => {
    const loadMasterData = async () => {
      setLoadingMasterData(true);
      try {
        const [categories, patientTypesData] = await Promise.all([
          getServiceCategories(),
          getPatientTypes()
        ]);
        
        setServiceCategories(categories);
        setPatientTypes(patientTypesData);
        console.log('✅ Loaded service categories:', categories.length);
        console.log('✅ Loaded patient types:', patientTypesData.length);
      } catch (err) {
        console.error('❌ Error loading master data:', err);
      } finally {
        setLoadingMasterData(false);
      }
    };
    
    loadMasterData();
  }, []);

  // Load app settings untuk footer
  React.useEffect(() => {
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

  // Load units jika unit_id tidak ada di URL
  React.useEffect(() => {
    const loadUnits = async () => {
      if (!unitId) {
        console.log('⚠️ Unit ID tidak ada di URL, loading units...');
        setLoadingUnits(true);
        try {
          const response = await fetch('/api/public/units');
          const result = await response.json();
          if (result.success && result.data) {
            setUnits(result.data);
            console.log('✅ Loaded units:', result.data.length);
          } else {
            console.error('❌ Failed to load units:', result);
            setError('Gagal memuat daftar unit');
          }
        } catch (err) {
          console.error('❌ Error loading units:', err);
          setError('Gagal memuat daftar unit');
        } finally {
          setLoadingUnits(false);
        }
      } else {
        console.log('✅ Unit ID dari URL:', unitId);
        console.log('✅ Unit Name:', unitName);
        console.log('✅ QR Code:', qrCode || 'tidak ada');
        // Set unit_id ke form data
        setFormData(prev => ({ ...prev, unit_id: unitId }));
      }
    };
    
    loadUnits();
  }, [unitId, unitName, qrCode]);

  // Load master data (service categories dan patient types)
  React.useEffect(() => {
    const loadMasterData = async () => {
      setLoadingMasterData(true);
      try {
        console.log('🔍 Loading master data...');
        
        // Load service categories
        const categories = await getServiceCategories();
        setServiceCategories(categories.filter((c: any) => c.is_active));
        console.log('✅ Loaded service categories:', categories.length);
        
        // Load patient types
        const types = await getPatientTypes();
        setPatientTypes(types.filter((t: any) => t.is_active));
        console.log('✅ Loaded patient types:', types.length);
      } catch (err) {
        console.error('❌ Error loading master data:', err);
      } finally {
        setLoadingMasterData(false);
      }
    };
    
    loadMasterData();
  }, []);

  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      // Validasi unit_id - gunakan dari form data
      const finalUnitId = formData.unit_id || unitId;
      if (!finalUnitId) {
        setError('Unit harus dipilih');
        setSubmitting(false);
        return;
      }

      // Validasi field wajib untuk personal identity
      if (formData.reporter_identity_type === 'personal' && !formData.reporter_name) {
        setError('Nama wajib diisi untuk identitas pribadi');
        setSubmitting(false);
        return;
      }

      // Kirim sebagai JSON
      const submitData = {
        reporter_identity_type: formData.reporter_identity_type,
        reporter_name: formData.reporter_identity_type === 'personal' ? formData.reporter_name : null,
        reporter_email: formData.reporter_identity_type === 'personal' ? formData.reporter_email : null,
        reporter_phone: formData.reporter_identity_type === 'personal' ? formData.reporter_phone : null,
        service_type: formData.service_type,
        service_category_id: formData.service_category_id || null,
        patient_type_id: formData.patient_type_id || null,
        title: formData.title,
        description: formData.description,
        qr_code: qrCode || null,
        unit_id: finalUnitId,
        source: qrCode ? 'qr_code' : 'web'
      };

      console.log('📤 Mengirim tiket eksternal:', submitData);

      const response = await fetch('/api/public/external-tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(submitData)
      });
      
      console.log('📥 Response status:', response.status);
      console.log('📥 Response headers:', response.headers.get('content-type'));

      // Cek apakah response adalah JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.error('❌ Response bukan JSON:', textResponse);
        throw new Error(`Server mengembalikan response yang tidak valid (${response.status}). Silakan coba lagi.`);
      }

      const result = await response.json();
      console.log('📥 Response data:', result);

      if (response.ok && result.success) {
        setTicketNumber(result.ticket_number || 'TKT-' + Date.now());
        setSubmitted(true);
      } else {
        const errorMsg = result.error || result.message || 'Gagal mengirim laporan';
        const errorDetails = result.details ? ` (${result.details})` : '';
        setError(errorMsg + errorDetails);
        console.error('❌ Server error:', result);
      }
    } catch (err: any) {
      console.error('❌ Submit error:', err);
      setError('Terjadi kesalahan saat mengirim laporan: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setCurrentStep(1);
    setFormData({
      reporter_identity_type: 'personal',
      reporter_name: '',
      reporter_email: '',
      reporter_phone: '',
      service_type: '',
      service_category_id: '',
      patient_type_id: '',
      title: '',
      description: '',
      unit_id: unitId || ''
    });
  };

  // Success Screen
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-500 via-rose-500 to-pink-600 flex items-center justify-center p-6">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 -left-20 w-48 h-48 bg-rose-300/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative bg-white rounded-[2rem] shadow-2xl p-8 max-w-sm w-full text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30">
            <span className="material-symbols-outlined text-white text-5xl">check_circle</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Berhasil Terkirim!</h2>
          <p className="text-gray-500 mb-6">Terima kasih atas laporan Anda</p>
          
          <div className="bg-gradient-to-r from-orange-500 to-rose-500 rounded-2xl p-6 mb-6 text-white shadow-lg">
            <p className="text-white/80 text-sm mb-1">Nomor Tiket Anda</p>
            <p className="text-3xl font-bold tracking-wider">{ticketNumber}</p>
          </div>
          
          <p className="text-gray-400 text-sm mb-6">Simpan nomor ini untuk melacak status laporan Anda</p>
          
          <button 
            onClick={resetForm} 
            className="w-full py-4 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-2xl font-bold text-lg shadow-lg shadow-orange-500/30 active:scale-95 transition-transform"
          >
            Buat Laporan Baru
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-orange-500 via-rose-500 to-pink-600 flex flex-col overflow-hidden">
      {/* Decorative */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-20 w-48 h-48 bg-rose-300/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-pink-300/20 rounded-full blur-2xl"></div>
      </div>

      {/* Unit Info - Minimal Header */}
      {unitName && (
        <div className="relative z-10 px-6 pt-8 pb-4 flex-shrink-0">
          <div className="max-w-md mx-auto bg-white/20 backdrop-blur-xl rounded-xl px-4 py-3 flex items-center gap-3">
            <span className="material-symbols-outlined text-white">business</span>
            <span className="text-white font-medium flex-1">{unitName}</span>
            <span className="material-symbols-outlined text-green-300">verified</span>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="relative z-10 px-6 mb-4 flex-shrink-0">
          <div className="max-w-md mx-auto bg-red-500/90 backdrop-blur-xl rounded-xl px-4 py-3 flex items-center gap-3">
            <span className="material-symbols-outlined text-white">error</span>
            <span className="text-white text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Form Content */}
      <main className="relative z-10 flex-1 bg-white rounded-t-[2.5rem] overflow-hidden shadow-2xl flex flex-col">
        <form onSubmit={handleSubmit} className="h-full flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-8">
            <div className="max-w-md mx-auto space-y-6">
              
              {/* Progress Indicator */}
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-orange-500 to-rose-500 rounded-full transition-all duration-500" 
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-gray-500 text-sm font-medium">{currentStep}/{totalSteps}</span>
              </div>

              {/* Step 1: Identity */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-slideUp">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Identitas Pelapor</h2>
                    <p className="text-gray-500 text-sm">Pilih cara Anda ingin melapor</p>
                  </div>

                  {/* Unit Selection - Tampilkan jika tidak ada unit_id dari URL */}
                  {!unitId && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Pilih Unit *</label>
                      {loadingUnits ? (
                        <div className="flex items-center justify-center py-4">
                          <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                          <span className="ml-2 text-gray-500">Memuat unit...</span>
                        </div>
                      ) : (
                        <select
                          name="unit_id"
                          value={formData.unit_id}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-0 text-gray-800 text-lg transition-colors"
                        >
                          <option value="">-- Pilih Unit --</option>
                          {units.map((unit) => (
                            <option key={unit.id} value={unit.id}>
                              {unit.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  )}

                  {/* Identity Toggle */}
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      type="button" 
                      onClick={() => setFormData(prev => ({ ...prev, reporter_identity_type: 'personal' }))}
                      className={`p-5 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${
                        formData.reporter_identity_type === 'personal' 
                          ? 'border-orange-500 bg-orange-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                        formData.reporter_identity_type === 'personal' 
                          ? 'bg-gradient-to-br from-orange-500 to-rose-500' 
                          : 'bg-gray-100'
                      }`}>
                        <span className={`material-symbols-outlined text-2xl ${
                          formData.reporter_identity_type === 'personal' ? 'text-white' : 'text-gray-400'
                        }`}>person</span>
                      </div>
                      <span className={`font-semibold ${
                        formData.reporter_identity_type === 'personal' ? 'text-orange-600' : 'text-gray-600'
                      }`}>Dengan Identitas</span>
                    </button>
                    
                    <button 
                      type="button" 
                      onClick={() => setFormData(prev => ({ ...prev, reporter_identity_type: 'anonymous' }))}
                      className={`p-5 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${
                        formData.reporter_identity_type === 'anonymous' 
                          ? 'border-orange-500 bg-orange-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                        formData.reporter_identity_type === 'anonymous' 
                          ? 'bg-gradient-to-br from-orange-500 to-rose-500' 
                          : 'bg-gray-100'
                      }`}>
                        <span className={`material-symbols-outlined text-2xl ${
                          formData.reporter_identity_type === 'anonymous' ? 'text-white' : 'text-gray-400'
                        }`}>visibility_off</span>
                      </div>
                      <span className={`font-semibold ${
                        formData.reporter_identity_type === 'anonymous' ? 'text-orange-600' : 'text-gray-600'
                      }`}>Anonim</span>
                    </button>
                  </div>

                  {formData.reporter_identity_type === 'personal' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Lengkap *</label>
                        <input 
                          type="text" 
                          name="reporter_name" 
                          value={formData.reporter_name} 
                          onChange={handleInputChange} 
                          required
                          className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-0 text-gray-800 text-lg transition-colors"
                          placeholder="Masukkan nama lengkap"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Nomor HP (WhatsApp)</label>
                        <input 
                          type="tel" 
                          name="reporter_phone" 
                          value={formData.reporter_phone} 
                          onChange={handleInputChange}
                          className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-0 text-gray-800 text-lg transition-colors"
                          placeholder="08xxxxxxxxxx"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                        <input 
                          type="email" 
                          name="reporter_email" 
                          value={formData.reporter_email} 
                          onChange={handleInputChange}
                          className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-0 text-gray-800 text-lg transition-colors"
                          placeholder="email@example.com"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Report Details */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-slideUp">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Detail Laporan</h2>
                    <p className="text-gray-500 text-sm">Jelaskan masalah yang Anda alami</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Jenis Layanan *</label>
                    <div className="space-y-3">
                      {[
                        { value: 'complaint', label: 'Pengaduan', icon: 'report_problem', color: 'from-red-400 to-rose-500', desc: 'Keluhan atau masalah' },
                        { value: 'request', label: 'Permintaan', icon: 'help_outline', color: 'from-blue-400 to-indigo-500', desc: 'Permintaan informasi' },
                        { value: 'suggestion', label: 'Saran', icon: 'lightbulb', color: 'from-amber-400 to-orange-500', desc: 'Saran & masukan' }
                      ].map((type) => (
                        <button 
                          key={type.value} 
                          type="button" 
                          onClick={() => setFormData(prev => ({ ...prev, service_type: type.value }))}
                          className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                            formData.service_type === type.value 
                              ? 'border-orange-500 bg-orange-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${type.color}`}>
                            <span className="material-symbols-outlined text-white text-2xl">{type.icon}</span>
                          </div>
                          <div className="flex-1 text-left">
                            <p className="font-semibold text-gray-800">{type.label}</p>
                            <p className="text-sm text-gray-500">{type.desc}</p>
                          </div>
                          {formData.service_type === type.value && (
                            <span className="material-symbols-outlined text-orange-500">check_circle</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Kategori Layanan - Opsional */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Kategori Layanan (Opsional)</label>
                    {loadingMasterData ? (
                      <div className="flex items-center justify-center py-4">
                        <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="ml-2 text-gray-500 text-sm">Memuat kategori...</span>
                      </div>
                    ) : (
                      <select
                        name="service_category_id"
                        value={formData.service_category_id}
                        onChange={handleInputChange}
                        className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-0 text-gray-800 text-lg transition-colors"
                      >
                        <option value="">-- Pilih Kategori (Opsional) --</option>
                        {serviceCategories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Jenis Pasien - Opsional */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Jenis Pasien (Opsional)</label>
                    {loadingMasterData ? (
                      <div className="flex items-center justify-center py-4">
                        <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="ml-2 text-gray-500 text-sm">Memuat jenis pasien...</span>
                      </div>
                    ) : (
                      <select
                        name="patient_type_id"
                        value={formData.patient_type_id}
                        onChange={handleInputChange}
                        className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-0 text-gray-800 text-lg transition-colors"
                      >
                        <option value="">-- Pilih Jenis Pasien (Opsional) --</option>
                        {patientTypes.map((type) => (
                          <option key={type.id} value={type.id}>
                            {type.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Judul Laporan *</label>
                    <input 
                      type="text" 
                      name="title" 
                      value={formData.title} 
                      onChange={handleInputChange} 
                      required
                      className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-0 text-gray-800 text-lg transition-colors"
                      placeholder="Ringkasan singkat masalah"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Deskripsi Lengkap *</label>
                    <textarea 
                      name="description" 
                      value={formData.description} 
                      onChange={handleInputChange} 
                      required 
                      rows={5}
                      className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-0 text-gray-800 text-lg transition-colors resize-none"
                      placeholder="Jelaskan kronologi kejadian secara detail..."
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Review & Submit */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-slideUp">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Review & Kirim</h2>
                    <p className="text-gray-500 text-sm">Periksa kembali informasi laporan Anda</p>
                  </div>

                  {/* Summary */}
                  <div className="bg-gradient-to-br from-orange-50 to-rose-50 rounded-2xl p-5 space-y-3">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                      <span className="material-symbols-outlined text-orange-500">summarize</span>
                      Ringkasan Laporan
                    </h3>
                    <div className="space-y-2 text-sm">
                      {formData.reporter_identity_type === 'personal' && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Pelapor</span>
                          <span className="font-medium text-gray-800">{formData.reporter_name}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-500">Jenis</span>
                        <span className="font-medium text-gray-800">
                          {formData.service_type === 'complaint' ? 'Pengaduan' : 
                           formData.service_type === 'request' ? 'Permintaan' : 'Saran'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Judul</span>
                        <span className="font-medium text-gray-800 truncate max-w-[180px]">{formData.title}</span>
                      </div>
                      {unitName && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Unit</span>
                          <span className="font-medium text-gray-800">{unitName}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                    <span className="material-symbols-outlined text-blue-500 text-xl">info</span>
                    <div className="flex-1">
                      <p className="text-sm text-blue-800 font-medium mb-1">Informasi</p>
                      <p className="text-xs text-blue-600">
                        Laporan akan segera diproses oleh tim terkait. Anda akan menerima nomor tiket untuk tracking.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer - Data dari Pengaturan Aplikasi */}
          {(appSettings.institution_name || appSettings.app_footer) && (
            <div className="px-6 py-4 bg-gradient-to-r from-orange-50 to-rose-50 border-t border-orange-100">
              <div className="max-w-md mx-auto text-center space-y-2">
                {appSettings.institution_name && (
                  <p className="font-bold text-orange-800 text-sm">{appSettings.institution_name}</p>
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
                  <p className="text-xs text-orange-600">{appSettings.website}</p>
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
                    (currentStep === 1 && (
                      (!unitId && !formData.unit_id) ||
                      (formData.reporter_identity_type === 'personal' && !formData.reporter_name)
                    )) ||
                    (currentStep === 2 && (!formData.service_type || !formData.title || !formData.description))
                  }
                  className="flex-1 py-4 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-orange-500/30 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                >
                  Lanjutkan
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              ) : (
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="flex-1 py-4 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-orange-500/30 disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                >
                  {submitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Mengirim...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined">send</span>
                      Kirim Laporan
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

export default DirectExternalTicketForm;
