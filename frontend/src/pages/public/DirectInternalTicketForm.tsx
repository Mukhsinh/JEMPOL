import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import AppFooter from '../../components/AppFooter';

interface FormData {
  reporter_name: string;
  reporter_email: string;
  reporter_phone: string;
  reporter_department: string;
  reporter_position: string;
  category: string;
  priority: string;
  title: string;
  description: string;
  unit_id: string;
}

interface Unit {
  id: string;
  name: string;
  code: string;
}

interface AppSettings {
  institution_name?: string;
  institution_address?: string;
  contact_phone?: string;
  contact_email?: string;
  website?: string;
  app_footer?: string;
}

// Direct Form View - Tiket Internal (Public, Tanpa Login, Mobile-First)
// Route: /form/internal?unit_id=xxx&unit_name=xxx
// PENTING: Halaman ini TANPA SIDEBAR - Full screen form
const DirectInternalTicketForm: React.FC = () => {
  const [searchParams] = useSearchParams();
  
  const unitId = searchParams.get('unit_id') || searchParams.get('unit') || '';
  const unitName = decodeURIComponent(searchParams.get('unit_name') || searchParams.get('name') || '');
  const qrCode = searchParams.get('qr') || '';
  
  // Debug logging
  React.useEffect(() => {
    console.log('✅ DirectInternalTicketForm mounted - TANPA SIDEBAR');
    console.log('📍 Current URL:', window.location.href);
    console.log('📋 URL params:', { unitId, unitName, qrCode });
    console.log('🎯 This is the CORRECT component for /form/internal route');
  }, [unitId, unitName, qrCode]);
  
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
  const [units, setUnits] = useState<Unit[]>([]);
  const [loadingUnits, setLoadingUnits] = useState(true);
  const [appSettings, setAppSettings] = useState<AppSettings>({});
  
  const [formData, setFormData] = useState<FormData>({
    reporter_name: '',
    reporter_email: '',
    reporter_phone: '',
    reporter_department: unitName || '',
    reporter_position: '',
    category: '',
    priority: 'medium',
    title: '',
    description: '',
    unit_id: unitId || ''
  });

  // Load units from master data
  useEffect(() => {
    const fetchUnits = async () => {
      try {
        setLoadingUnits(true);
        console.log('🔄 Fetching units from /api/public/units...');
        
        const response = await fetch('/api/public/units', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        
        console.log('📥 Response status:', response.status);
        console.log('📥 Response headers:', response.headers.get('content-type'));
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Cek apakah response adalah JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          console.error('❌ Non-JSON response:', text.substring(0, 200));
          throw new Error('Server mengembalikan response yang tidak valid');
        }
        
        const result = await response.json();
        console.log('📥 Response data:', result);
        
        // API mengembalikan { success: true, data: [...] }
        let unitsArray: Unit[] = [];
        if (result?.success && Array.isArray(result.data)) {
          unitsArray = result.data;
        } else if (Array.isArray(result.data)) {
          unitsArray = result.data;
        } else if (Array.isArray(result)) {
          unitsArray = result;
        }
        
        setUnits(unitsArray);
        console.log('✅ Units loaded successfully:', unitsArray.length, 'units');
        
        // Jika ada unitId dari URL dan belum terisi, set otomatis
        if (unitId && !formData.unit_id && unitsArray.length > 0) {
          const matchedUnit = unitsArray.find(u => u.id === unitId);
          if (matchedUnit) {
            setFormData(prev => ({ 
              ...prev, 
              unit_id: unitId,
              reporter_department: matchedUnit.name 
            }));
            console.log('✅ Auto-selected unit from URL:', matchedUnit.name);
          }
        }
      } catch (err: any) {
        console.error('❌ Error loading units:', err);
        setError('Gagal memuat data unit. Silakan refresh halaman.');
        setUnits([]); // Set empty array jika error
      } finally {
        setLoadingUnits(false);
      }
    };
    
    fetchUnits();
  }, [unitId]);

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

  useEffect(() => {
    if (unitId && !formData.unit_id) {
      setFormData(prev => ({ ...prev, unit_id: unitId }));
    }
    if (unitName && !formData.reporter_department) {
      setFormData(prev => ({ ...prev, reporter_department: unitName }));
    }
  }, [unitId, unitName]);

  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

  const categories = [
    { value: 'it_support', label: 'IT & Sistem', icon: '💻', color: 'from-blue-400 to-indigo-500' },
    { value: 'facility', label: 'Fasilitas', icon: '🏥', color: 'from-emerald-400 to-teal-500' },
    { value: 'equipment', label: 'Peralatan', icon: '🔧', color: 'from-amber-400 to-orange-500' },
    { value: 'hr', label: 'SDM', icon: '👥', color: 'from-pink-400 to-rose-500' },
    { value: 'admin', label: 'Administrasi', icon: '📋', color: 'from-cyan-400 to-blue-500' },
    { value: 'other', label: 'Lainnya', icon: '📝', color: 'from-gray-400 to-slate-500' }
  ];

  const priorities = [
    { value: 'low', label: 'Rendah', color: 'bg-green-500', desc: 'Tidak mendesak' },
    { value: 'medium', label: 'Sedang', color: 'bg-yellow-500', desc: 'Perlu ditangani' },
    { value: 'high', label: 'Tinggi', color: 'bg-orange-500', desc: 'Mendesak' },
    { value: 'critical', label: 'Kritis', color: 'bg-red-500', desc: 'Sangat mendesak' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Update reporter_department when unit_id changes
    if (name === 'unit_id' && Array.isArray(units)) {
      const selectedUnit = units.find(u => u.id === value);
      if (selectedUnit) {
        setFormData(prev => ({ ...prev, reporter_department: selectedUnit.name }));
      }
    }
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const payload = {
        reporter_name: formData.reporter_name,
        reporter_email: formData.reporter_email,
        reporter_phone: formData.reporter_phone,
        reporter_department: formData.reporter_department,
        reporter_position: formData.reporter_position,
        category: formData.category,
        priority: formData.priority,
        title: formData.title,
        description: formData.description,
        qr_code: qrCode,
        unit_id: formData.unit_id || unitId,
        source: qrCode ? 'qr_code' : 'web'  // PERBAIKAN: gunakan 'qr_code' jika dari QR, atau 'web' jika langsung
      };

      console.log('📤 Mengirim tiket internal:', payload);

      // Gunakan relative path untuk production (Vercel)
      // Di production, /api akan di-route ke Vercel serverless functions
      const apiEndpoint = '/api/public/internal-tickets';

      console.log('🌐 API Endpoint:', apiEndpoint);

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      console.log('📥 Response status:', response.status);
      console.log('📥 Response headers:', response.headers.get('content-type'));
      
      // Cek apakah response adalah JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('❌ Non-JSON response:', text.substring(0, 200));
        throw new Error('Server mengembalikan response yang tidak valid (bukan JSON)');
      }
      
      const result = await response.json();
      console.log('📥 Response data:', result);

      if (response.ok && result.success) {
        setTicketNumber(result.ticket_number || 'INT-' + Date.now());
        setSubmitted(true);
      } else {
        setError(result.error || 'Gagal mengirim tiket');
      }
    } catch (err: any) {
      console.error('❌ Submit error:', err);
      
      let errorMessage = 'Terjadi kesalahan saat mengirim tiket';
      if (err.message.includes('JSON')) {
        errorMessage = 'Server mengembalikan response yang tidak valid. Silakan coba lagi.';
      } else if (err.message.includes('Network')) {
        errorMessage = 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setCurrentStep(1);
    setFormData({
      reporter_name: '',
      reporter_email: '',
      reporter_phone: '',
      reporter_department: unitName || '',
      reporter_position: '',
      category: '',
      priority: 'medium',
      title: '',
      description: '',
      unit_id: unitId || ''
    });
  };

  // Success Screen
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-700 flex items-center justify-center p-6">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 -left-20 w-48 h-48 bg-purple-300/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative bg-white rounded-[2rem] shadow-2xl p-8 max-w-sm w-full text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/30">
            <span className="material-symbols-outlined text-white text-5xl">check_circle</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Tiket Berhasil Dibuat!</h2>
          <p className="text-gray-500 mb-6">Tim terkait akan segera menindaklanjuti</p>
          
          <div className="bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl p-6 mb-6 text-white shadow-lg">
            <p className="text-white/80 text-sm mb-1">Nomor Tiket</p>
            <p className="text-3xl font-bold tracking-wider">{ticketNumber}</p>
          </div>
          
          <p className="text-gray-400 text-sm mb-6">Simpan nomor ini untuk melacak status tiket Anda</p>
          
          <button 
            onClick={resetForm} 
            className="w-full py-4 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-purple-500/30 active:scale-95 transition-transform"
          >
            Buat Tiket Baru
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-700 flex flex-col overflow-hidden">
      {/* Decorative */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-20 w-48 h-48 bg-purple-300/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-indigo-300/20 rounded-full blur-2xl"></div>
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
          <div className="flex-1 overflow-y-auto px-6 py-8 pb-24">
            <div className="max-w-md mx-auto space-y-6">
              
              {/* Progress Indicator */}
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-violet-500 to-purple-600 rounded-full transition-all duration-500" 
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-gray-500 text-sm font-medium">{currentStep}/{totalSteps}</span>
              </div>

              {/* Step 1: Reporter Info */}
              {currentStep === 1 && (
                <div className="space-y-5 animate-slideUp">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Data Pelapor</h2>
                    <p className="text-gray-500 text-sm">Informasi petugas yang melaporkan</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Lengkap *</label>
                    <input 
                      type="text" 
                      name="reporter_name" 
                      value={formData.reporter_name} 
                      onChange={handleInputChange} 
                      required
                      className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-0 text-gray-800 text-lg transition-colors"
                      placeholder="Masukkan nama lengkap"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                    <input 
                      type="email" 
                      name="reporter_email" 
                      value={formData.reporter_email} 
                      onChange={handleInputChange} 
                      required
                      className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-0 text-gray-800 text-lg transition-colors"
                      placeholder="email@rumahsakit.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nomor Telepon</label>
                    <input 
                      type="tel" 
                      name="reporter_phone" 
                      value={formData.reporter_phone} 
                      onChange={handleInputChange}
                      className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-0 text-gray-800 text-lg transition-colors"
                      placeholder="08xxxxxxxxxx"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Unit/Departemen *</label>
                    {loadingUnits ? (
                      <div className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 bg-gray-50 flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-gray-500">Memuat data unit...</span>
                      </div>
                    ) : (
                      <select
                        name="unit_id"
                        value={formData.unit_id}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-0 text-gray-800 text-lg transition-colors appearance-none bg-white"
                        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%236b7280\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.5rem' }}
                      >
                        <option value="">Pilih Unit/Departemen</option>
                        {Array.isArray(units) && units.map((unit) => (
                          <option key={unit.id} value={unit.id}>
                            {unit.name} ({unit.code})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Jabatan</label>
                    <input 
                      type="text" 
                      name="reporter_position" 
                      value={formData.reporter_position} 
                      onChange={handleInputChange}
                      className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-0 text-gray-800 text-lg transition-colors"
                      placeholder="Contoh: Perawat, Dokter"
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Ticket Details */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-slideUp">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Detail Tiket</h2>
                    <p className="text-gray-500 text-sm">Jelaskan masalah yang perlu ditangani</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Kategori *</label>
                    <div className="grid grid-cols-2 gap-3">
                      {categories.map((cat) => (
                        <button 
                          key={cat.value} 
                          type="button" 
                          onClick={() => setFormData(prev => ({ ...prev, category: cat.value }))}
                          className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                            formData.category === cat.value 
                              ? 'border-purple-500 bg-purple-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <span className="text-2xl">{cat.icon}</span>
                          <span className={`font-semibold text-sm ${
                            formData.category === cat.value ? 'text-purple-600' : 'text-gray-600'
                          }`}>{cat.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Prioritas *</label>
                    <div className="grid grid-cols-4 gap-2">
                      {priorities.map((p) => (
                        <button 
                          key={p.value} 
                          type="button" 
                          onClick={() => setFormData(prev => ({ ...prev, priority: p.value }))}
                          className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                            formData.priority === p.value 
                              ? 'border-purple-500 bg-purple-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full ${p.color}`}></div>
                          <span className={`text-xs font-semibold ${
                            formData.priority === p.value ? 'text-purple-600' : 'text-gray-600'
                          }`}>{p.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Judul Tiket *</label>
                    <input 
                      type="text" 
                      name="title" 
                      value={formData.title} 
                      onChange={handleInputChange} 
                      required
                      className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-0 text-gray-800 text-lg transition-colors"
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
                      rows={4}
                      className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-0 text-gray-800 text-lg transition-colors resize-none"
                      placeholder="Jelaskan masalah secara detail..."
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Review & Submit */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-slideUp">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Review & Kirim</h2>
                    <p className="text-gray-500 text-sm">Periksa kembali informasi tiket Anda</p>
                  </div>

                  {/* File Upload - DISABLED (Sesuai permintaan) */}
                  <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center bg-gray-100">
                    <div className="w-14 h-14 bg-gray-400 rounded-xl flex items-center justify-center mx-auto mb-3 opacity-50">
                      <span className="material-symbols-outlined text-white text-2xl">block</span>
                    </div>
                    <p className="font-semibold text-gray-600 mb-1 text-sm">Lampiran Tidak Tersedia</p>
                    <p className="text-xs text-gray-500">Fitur upload file dinonaktifkan untuk form ini</p>
                  </div>

                  {/* Summary */}
                  <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-5 space-y-3">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                      <span className="material-symbols-outlined text-purple-500">summarize</span>
                      Ringkasan Tiket
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Pelapor</span>
                        <span className="font-medium text-gray-800">{formData.reporter_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Kategori</span>
                        <span className="font-medium text-gray-800">
                          {categories.find(c => c.value === formData.category)?.label || '-'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Prioritas</span>
                        <span className="font-medium text-gray-800 capitalize">{formData.priority}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Judul</span>
                        <span className="font-medium text-gray-800 truncate max-w-[180px]">{formData.title}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Unit Tujuan</span>
                        <span className="font-medium text-gray-800">
                          {(Array.isArray(units) ? units.find(u => u.id === formData.unit_id)?.name : null) || formData.reporter_department || '-'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer - Data dari Pengaturan Aplikasi */}
          {(appSettings.institution_name || appSettings.app_footer) && (
            <div className="px-6 py-4 bg-gradient-to-r from-violet-50 to-purple-50 border-t border-violet-100">
              <div className="max-w-md mx-auto text-center space-y-2">
                {appSettings.institution_name && (
                  <p className="font-bold text-violet-800 text-sm">{appSettings.institution_name}</p>
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
                  <p className="text-xs text-violet-600">{appSettings.website}</p>
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
                    (currentStep === 1 && (!formData.reporter_name || !formData.reporter_email || !formData.unit_id)) ||
                    (currentStep === 2 && (!formData.category || !formData.title || !formData.description))
                  }
                  className="flex-1 py-4 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-purple-500/30 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                >
                  Lanjutkan
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              ) : (
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="flex-1 py-4 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-purple-500/30 disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                >
                  {submitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Mengirim...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined">send</span>
                      Kirim Tiket
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

export default DirectInternalTicketForm;
