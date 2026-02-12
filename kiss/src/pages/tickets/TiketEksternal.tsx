import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { masterDataService, ServiceCategory } from '../../services/masterDataService';
import { qrCodeService, QRCode } from '../../services/qrCodeService';
import { externalTicketService } from '../../services/externalTicketService';
import { downloadExternalTicketPDF } from '../../utils/pdfGenerator';

interface AppSettings {
  app_name?: string;
  app_footer?: string;
  institution_name?: string;
  institution_address?: string;
}

interface FormData {
  reporter_identity_type: 'personal' | 'anonymous';
  reporter_name: string;
  reporter_email: string;
  reporter_phone: string;
  reporter_address: string;
  age_range: string;
  service_type: string;
  category: string;
  title: string;
  description: string;
}

const TiketEksternal: React.FC = () => {
  const { qrCode } = useParams<{ qrCode: string }>();
  const [searchParams] = useSearchParams();
  
  const unitIdFromUrl = searchParams.get('unit_id');
  const unitNameFromUrl = searchParams.get('unit_name');
  const qrCodeFromUrl = searchParams.get('qr_code');
  
  const [qrData, setQrData] = useState<QRCode | null>(null);
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ticketNumber, setTicketNumber] = useState('');
  const [submittedTicketData, setSubmittedTicketData] = useState<any>(null);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [unitLocked, setUnitLocked] = useState(false);
  const [appSettings, setAppSettings] = useState<AppSettings>({});
  
  const [formData, setFormData] = useState<FormData>({
    reporter_identity_type: 'personal',
    reporter_name: '',
    reporter_email: '',
    reporter_phone: '',
    reporter_address: '',
    age_range: '',
    service_type: '',
    category: '',
    title: '',
    description: ''
  });

  useEffect(() => {
    initializeForm();
  }, [qrCode, unitIdFromUrl]);

  const initializeForm = async () => {
    try {
      setLoading(true);
      
      try {
        const response = await fetch('/api/app-settings/public');
        const result = await response.json();
        if (result.success && result.data) {
          setAppSettings(result.data);
        }
      } catch (error) {
        console.error('Error loading app settings:', error);
      }
      
      const categories = await masterDataService.getServiceCategories();
      setServiceCategories(categories.filter(cat => cat.is_active));
      
      if (unitIdFromUrl && unitNameFromUrl) {
        setQrData({
          id: 'from-qr-landing',
          unit_id: unitIdFromUrl,
          code: qrCodeFromUrl || 'QR',
          token: '',
          name: 'QR Code',
          is_active: true,
          usage_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          units: {
            id: unitIdFromUrl,
            name: decodeURIComponent(unitNameFromUrl),
            code: '',
          }
        });
        setUnitLocked(true);
        setLoading(false);
        return;
      }
      
      if (qrCode) {
        try {
          const qrCodeData = await qrCodeService.getByCode(qrCode);
          setQrData(qrCodeData);
          setUnitLocked(qrCodeData.auto_fill_unit !== false);
        } catch (error) {
          console.error('QR Code tidak ditemukan:', error);
          setDefaultUnit();
        }
      } else {
        setDefaultUnit();
      }
    } catch (error) {
      console.error('Error initializing form:', error);
      setDefaultUnit();
    } finally {
      setLoading(false);
    }
  };

  const setDefaultUnit = () => {
    setQrData({
      id: 'default',
      unit_id: 'default-unit',
      code: 'DEFAULT',
      token: 'default-token',
      name: 'Formulir Umum',
      description: 'Formulir pengaduan umum',
      is_active: true,
      usage_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      units: {
        id: 'default-unit',
        name: 'Instalasi Gawat Darurat (IGD)',
        code: 'IGD',
        description: 'Unit default untuk pengaduan umum'
      }
    });
    setUnitLocked(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'description') {
      setCharCount(value.length);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!captchaVerified) {
      alert('Silakan verifikasi captcha terlebih dahulu');
      return;
    }

    setSubmitting(true);

    try {
      const submitData = {
        qr_code_id: qrData?.id !== 'default' ? qrData?.id : undefined,
        unit_id: qrData?.unit_id || 'default-unit',
        reporter_identity_type: formData.reporter_identity_type,
        reporter_name: formData.reporter_identity_type === 'personal' ? formData.reporter_name : undefined,
        reporter_email: formData.reporter_identity_type === 'personal' ? formData.reporter_email : undefined,
        reporter_phone: formData.reporter_identity_type === 'personal' ? formData.reporter_phone : undefined,
        reporter_address: formData.reporter_identity_type === 'personal' ? formData.reporter_address : undefined,
        age_range: formData.reporter_identity_type === 'personal' ? formData.age_range : undefined,
        service_type: formData.service_type,
        category: formData.category,
        title: formData.title,
        description: formData.description
      };

      const result = await externalTicketService.createTicket(submitData);
      
      // Simpan data untuk PDF
      const selectedCategory = serviceCategories.find(c => c.id === formData.category);
      
      setSubmittedTicketData({
        ticket_number: result.ticket_number,
        title: formData.title,
        description: formData.description,
        category: selectedCategory?.name || formData.category || '-',
        priority: 'medium',
        unit_name: qrData?.units?.name || 'Unit Umum',
        reporter_name: formData.reporter_identity_type === 'personal' ? formData.reporter_name : 'Anonim',
        reporter_email: formData.reporter_identity_type === 'personal' ? formData.reporter_email : null,
        reporter_phone: formData.reporter_identity_type === 'personal' ? formData.reporter_phone : null,
        reporter_address: formData.reporter_identity_type === 'personal' ? formData.reporter_address : null,
        created_at: new Date().toISOString(),
        type: 'external'
      });
      
      setTicketNumber(result.ticket_number);
      setSubmitted(true);
      setCaptchaVerified(false);
      
    } catch (error) {
      console.error('Error submitting ticket:', error);
      alert('Terjadi kesalahan saat mengirim laporan. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setTicketNumber('');
    setSubmittedTicketData(null);
    setFormData({
      reporter_identity_type: 'personal',
      reporter_name: '',
      reporter_email: '',
      reporter_phone: '',
      reporter_address: '',
      age_range: '',
      service_type: '',
      category: '',
      title: '',
      description: ''
    });
    setCharCount(0);
  };

  const handleDownloadPDF = () => {
    if (submittedTicketData) {
      downloadExternalTicketPDF(submittedTicketData);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">Memuat formulir...</p>
        </div>
      </div>
    );
  }

  // Success Screen
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-rose-50 to-pink-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30">
            <span className="material-symbols-outlined text-white text-5xl">check_circle</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Laporan Berhasil Dikirim!</h2>
          <p className="text-gray-500 mb-6">Terima kasih atas laporan Anda. Tim kami akan segera menindaklanjuti.</p>
          
          <div className="bg-gradient-to-r from-orange-500 to-rose-500 rounded-2xl p-6 mb-6 text-white shadow-lg">
            <p className="text-white/80 text-sm mb-1">Nomor Tiket</p>
            <p className="text-3xl font-bold tracking-wider">{ticketNumber}</p>
          </div>
          
          <p className="text-gray-400 text-sm mb-6">Simpan nomor ini untuk melacak status laporan Anda</p>
          
          <div className="space-y-3">
            <button 
              onClick={handleDownloadPDF}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-emerald-500/30 active:scale-95 transition-transform flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">download</span>
              Unduh Tiket (PDF)
            </button>
            
            <button 
              onClick={resetForm} 
              className="w-full py-4 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-2xl font-bold text-lg shadow-lg shadow-orange-500/30 active:scale-95 transition-transform"
            >
              Buat Laporan Baru
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-rose-50 to-pink-50 font-sans">
      {/* Decorative Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-orange-200/30 to-rose-200/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-gradient-to-br from-pink-200/30 to-rose-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-64 h-64 bg-gradient-to-br from-rose-200/30 to-orange-200/30 rounded-full blur-3xl"></div>
      </div>

      {/* Header Modern */}
      <header className="relative z-10 bg-white/80 backdrop-blur-xl border-b border-gray-100/50 sticky top-0">
        <div className="max-w-lg mx-auto px-6 py-4">
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
              <span className="material-symbols-outlined text-white text-xl">support_agent</span>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-rose-600 bg-clip-text text-transparent">
              Formulir Pengaduan
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 px-4 py-6">
        <div className="max-w-lg mx-auto">
          {/* Unit Info Card - Modern */}
          {qrData?.units && (
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-5 mb-6 transform hover:scale-[1.02] transition-transform">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-green-500/30">
                  <span className="material-symbols-outlined text-white text-2xl">verified</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Unit Terverifikasi</span>
                    {unitLocked && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                        <span className="material-symbols-outlined text-xs">lock</span>
                        Auto
                      </span>
                    )}
                  </div>
                  <h3 className="text-gray-900 font-bold text-lg truncate">
                    {qrData.units.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">Tujuan laporan Anda</p>
                </div>
              </div>
            </div>
          )}

          {/* Form Card - Modern */}
          <form onSubmit={handleSubmit} className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
            {/* Identity Type Toggle - Modern */}
            <div className="p-6 border-b border-gray-100/50 bg-gradient-to-br from-gray-50/50 to-white">
              <label className="text-gray-800 text-sm font-bold mb-4 block flex items-center gap-2">
                <span className="material-symbols-outlined text-orange-500">badge</span>
                Identitas Pelapor
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="cursor-pointer group">
                  <input
                    type="radio"
                    name="reporter_identity_type"
                    value="personal"
                    checked={formData.reporter_identity_type === 'personal'}
                    onChange={() => setFormData(prev => ({ ...prev, reporter_identity_type: 'personal' }))}
                    className="peer sr-only"
                  />
                  <div className="flex items-center justify-center gap-2 px-4 py-4 rounded-2xl border-2 border-gray-200 bg-white text-gray-500 peer-checked:border-orange-500 peer-checked:bg-gradient-to-br peer-checked:from-orange-50 peer-checked:to-rose-50 peer-checked:text-orange-600 transition-all shadow-sm peer-checked:shadow-lg peer-checked:shadow-orange-500/20 group-hover:border-gray-300">
                    <span className="material-symbols-outlined text-2xl">person</span>
                    <span className="text-sm font-bold">Pribadi</span>
                  </div>
                </label>
                <label className="cursor-pointer group">
                  <input
                    type="radio"
                    name="reporter_identity_type"
                    value="anonymous"
                    checked={formData.reporter_identity_type === 'anonymous'}
                    onChange={() => setFormData(prev => ({ ...prev, reporter_identity_type: 'anonymous' }))}
                    className="peer sr-only"
                  />
                  <div className="flex items-center justify-center gap-2 px-4 py-4 rounded-2xl border-2 border-gray-200 bg-white text-gray-500 peer-checked:border-orange-500 peer-checked:bg-gradient-to-br peer-checked:from-orange-50 peer-checked:to-rose-50 peer-checked:text-orange-600 transition-all shadow-sm peer-checked:shadow-lg peer-checked:shadow-orange-500/20 group-hover:border-gray-300">
                    <span className="material-symbols-outlined text-2xl">visibility_off</span>
                    <span className="text-sm font-bold">Anonim</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Personal Info Fields - Modern */}
            {formData.reporter_identity_type === 'personal' && (
              <div className="p-6 space-y-5 border-b border-gray-100/50 bg-gradient-to-br from-white to-gray-50/30">
                {/* Nama */}
                <div>
                  <label className="text-gray-800 text-sm font-bold mb-2.5 block">
                    Nama Lengkap <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl group-focus-within:text-orange-500 transition-colors">badge</span>
                    <input
                      type="text"
                      name="reporter_name"
                      value={formData.reporter_name}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 focus:outline-none transition-all text-base shadow-sm"
                      placeholder="Masukkan nama lengkap"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="text-gray-800 text-sm font-bold mb-2.5 block">
                    Email
                  </label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl group-focus-within:text-orange-500 transition-colors">mail</span>
                    <input
                      type="email"
                      name="reporter_email"
                      value={formData.reporter_email}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 focus:outline-none transition-all text-base shadow-sm"
                      placeholder="email@contoh.com"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="text-gray-800 text-sm font-bold mb-2.5 block">
                    Nomor Telepon
                  </label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl group-focus-within:text-orange-500 transition-colors">phone</span>
                    <input
                      type="tel"
                      name="reporter_phone"
                      value={formData.reporter_phone}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 focus:outline-none transition-all text-base shadow-sm"
                      placeholder="08xxxxxxxxxx"
                    />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="text-gray-800 text-sm font-bold mb-2.5 block">
                    Alamat
                  </label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-4 text-gray-400 text-xl group-focus-within:text-orange-500 transition-colors">location_on</span>
                    <input
                      type="text"
                      name="reporter_address"
                      value={formData.reporter_address}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 focus:outline-none transition-all text-base shadow-sm"
                      placeholder="Alamat lengkap"
                    />
                  </div>
                </div>

                {/* Age Range */}
                <div>
                  <label className="text-gray-800 text-sm font-bold mb-2.5 block">
                    Usia
                  </label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl group-focus-within:text-orange-500 transition-colors pointer-events-none">cake</span>
                    <select
                      name="age_range"
                      value={formData.age_range}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-10 py-4 rounded-2xl border-2 border-gray-200 bg-white text-gray-900 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 focus:outline-none transition-all text-base appearance-none shadow-sm cursor-pointer"
                    >
                      <option value="">Pilih rentang usia</option>
                      <option value="< 20 Th">Kurang dari 20 Tahun</option>
                      <option value="20-40 Th">20 - 40 Tahun</option>
                      <option value="41-60 Th">41 - 60 Tahun</option>
                      <option value="> 60 Th">Lebih dari 60 Tahun</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">expand_more</span>
                  </div>
                </div>
              </div>
            )}

            {/* Report Details - Modern */}
            <div className="p-6 space-y-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-orange-500">description</span>
                <h3 className="text-gray-800 text-base font-bold">Detail Laporan</h3>
              </div>

              {/* Service Type */}
              <div>
                <label className="text-gray-800 text-sm font-bold mb-2.5 block">
                  Jenis Layanan <span className="text-rose-500">*</span>
                </label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl group-focus-within:text-orange-500 transition-colors pointer-events-none">category</span>
                  <select
                    name="service_type"
                    value={formData.service_type}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-10 py-4 rounded-2xl border-2 border-gray-200 bg-white text-gray-900 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 focus:outline-none transition-all text-base appearance-none shadow-sm cursor-pointer"
                    required
                  >
                    <option value="">Pilih jenis layanan</option>
                    <option value="complaint">📢 Pengaduan</option>
                    <option value="request">📋 Permintaan Informasi</option>
                    <option value="suggestion">💡 Saran & Masukan</option>
                    <option value="survey">📊 Survei Kepuasan</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">expand_more</span>
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="text-gray-800 text-sm font-bold mb-2.5 block">
                  Kategori
                </label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl group-focus-within:text-orange-500 transition-colors pointer-events-none">folder</span>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-10 py-4 rounded-2xl border-2 border-gray-200 bg-white text-gray-900 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 focus:outline-none transition-all text-base appearance-none shadow-sm cursor-pointer"
                  >
                    <option value="">Pilih kategori</option>
                    {serviceCategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">expand_more</span>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="text-gray-800 text-sm font-bold mb-2.5 block">
                  Judul Laporan <span className="text-rose-500">*</span>
                </label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl group-focus-within:text-orange-500 transition-colors">title</span>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 focus:outline-none transition-all text-base shadow-sm"
                    placeholder="Ringkasan singkat masalah Anda"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-gray-800 text-sm font-bold mb-2.5 block">
                  Deskripsi Lengkap <span className="text-rose-500">*</span>
                </label>
                <div className="relative group">
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={5}
                    maxLength={2000}
                    className="w-full px-4 py-4 rounded-2xl border-2 border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 focus:outline-none transition-all text-base resize-none shadow-sm"
                    placeholder="Jelaskan detail laporan Anda di sini..."
                    required
                  />
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-gray-400">Maksimal 2000 karakter</span>
                  <span className={`text-xs font-medium ${charCount > 1800 ? 'text-rose-500' : 'text-gray-500'}`}>
                    {charCount}/2000
                  </span>
                </div>
              </div>
            </div>

            {/* Captcha & Submit - Modern */}
            <div className="p-6 bg-gradient-to-br from-gray-50/50 to-white border-t border-gray-100/50">
              {/* Captcha */}
              <div className="flex items-center gap-4 p-5 bg-white rounded-2xl border-2 border-gray-200 mb-5 shadow-sm hover:border-orange-300 transition-colors">
                <input
                  type="checkbox"
                  id="captcha"
                  checked={captchaVerified}
                  onChange={(e) => setCaptchaVerified(e.target.checked)}
                  className="w-6 h-6 rounded-lg border-gray-300 text-orange-500 focus:ring-orange-500/20 cursor-pointer"
                  required
                />
                <label htmlFor="captcha" className="text-base text-gray-700 cursor-pointer flex-1 font-medium">
                  Saya bukan robot
                </label>
                <div className="flex flex-col items-center opacity-60">
                  <span className="material-symbols-outlined text-xl text-gray-400">security</span>
                  <span className="text-[9px] text-gray-400 font-bold tracking-wider">CAPTCHA</span>
                </div>
              </div>

              {/* Privacy Notice */}
              <p className="text-xs text-gray-500 text-center mb-5 leading-relaxed">
                Dengan mengirim, Anda menyetujui{' '}
                <a href="#" className="text-orange-600 hover:text-orange-700 font-semibold hover:underline">Kebijakan Privasi</a> kami
              </p>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting || !captchaVerified}
                className="w-full py-5 rounded-2xl bg-gradient-to-r from-orange-500 via-rose-500 to-pink-500 text-white font-bold text-lg shadow-2xl shadow-orange-500/40 hover:shadow-orange-500/50 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 disabled:shadow-lg flex items-center justify-center gap-3 group"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-3 border-white border-t-transparent"></div>
                    <span>Mengirim Laporan...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-2xl group-hover:rotate-12 transition-transform">send</span>
                    <span>Kirim Laporan</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Footer - Modern */}
          <div className="mt-8 text-center space-y-2">
            <p className="text-xs text-gray-400">
              {appSettings.app_footer || `© ${new Date().getFullYear()} ${appSettings.institution_name || 'Sistem Pengaduan Terpadu'}`}
            </p>
            <p className="text-xs text-gray-400">
              Laporan Anda akan diproses dalam 1x24 jam
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TiketEksternal;
