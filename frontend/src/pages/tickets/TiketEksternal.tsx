import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { masterDataService, ServiceCategory } from '../../services/masterDataService';
import { qrCodeService, QRCode } from '../../services/qrCodeService';
import { externalTicketService } from '../../services/externalTicketService';

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
        service_type: formData.service_type,
        category: formData.category,
        title: formData.title,
        description: formData.description
      };

      const result = await externalTicketService.createTicket(submitData);
      
      alert(`Laporan berhasil dikirim! Nomor tiket: ${result.ticket_number}`);
      
      setFormData({
        reporter_identity_type: 'personal',
        reporter_name: '',
        reporter_email: '',
        reporter_phone: '',
        reporter_address: '',
        service_type: '',
        category: '',
        title: '',
        description: ''
      });
      setCharCount(0);
      setCaptchaVerified(false);
      
    } catch (error) {
      console.error('Error submitting ticket:', error);
      alert('Terjadi kesalahan saat mengirim laporan. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
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

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Main Content */}
      <div className="px-4 py-6">
        <div className="max-w-lg mx-auto">
          {/* Unit Info Card */}
          {qrData?.units && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 mb-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-green-500 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-white text-2xl">verified</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-green-600 uppercase tracking-wide">Unit Terverifikasi</span>
                    {unitLocked && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-medium">
                        <span className="material-symbols-outlined text-[10px]">lock</span>
                        Auto
                      </span>
                    )}
                  </div>
                  <h3 className="text-gray-900 font-semibold text-base truncate">
                    {qrData.units.name}
                  </h3>
                </div>
              </div>
            </div>
          )}

          {/* Form Card */}
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            {/* Identity Type Toggle */}
            <div className="p-5 border-b border-gray-100">
              <label className="text-gray-700 text-xs font-semibold uppercase tracking-wider mb-3 block">
                Identitas Pelapor
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label className="cursor-pointer">
                  <input
                    type="radio"
                    name="reporter_identity_type"
                    value="personal"
                    checked={formData.reporter_identity_type === 'personal'}
                    onChange={() => setFormData(prev => ({ ...prev, reporter_identity_type: 'personal' }))}
                    className="peer sr-only"
                  />
                  <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 text-gray-500 peer-checked:border-primary peer-checked:bg-primary/5 peer-checked:text-primary transition-all">
                    <span className="material-symbols-outlined text-xl">person</span>
                    <span className="text-sm font-medium">Pribadi</span>
                  </div>
                </label>
                <label className="cursor-pointer">
                  <input
                    type="radio"
                    name="reporter_identity_type"
                    value="anonymous"
                    checked={formData.reporter_identity_type === 'anonymous'}
                    onChange={() => setFormData(prev => ({ ...prev, reporter_identity_type: 'anonymous' }))}
                    className="peer sr-only"
                  />
                  <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 text-gray-500 peer-checked:border-primary peer-checked:bg-primary/5 peer-checked:text-primary transition-all">
                    <span className="material-symbols-outlined text-xl">visibility_off</span>
                    <span className="text-sm font-medium">Anonim</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Personal Info Fields */}
            {formData.reporter_identity_type === 'personal' && (
              <div className="p-5 space-y-4 border-b border-gray-100 bg-gray-50/50">
                {/* Nama */}
                <div>
                  <label className="text-gray-700 text-xs font-semibold mb-2 block">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">badge</span>
                    <input
                      type="text"
                      name="reporter_name"
                      value={formData.reporter_name}
                      onChange={handleInputChange}
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl border-2 border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-primary focus:outline-none transition-colors text-sm"
                      placeholder="Masukkan nama lengkap"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="text-gray-700 text-xs font-semibold mb-2 block">
                    Email
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">mail</span>
                    <input
                      type="email"
                      name="reporter_email"
                      value={formData.reporter_email}
                      onChange={handleInputChange}
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl border-2 border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-primary focus:outline-none transition-colors text-sm"
                      placeholder="email@contoh.com"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="text-gray-700 text-xs font-semibold mb-2 block">
                    Nomor Telepon
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">phone</span>
                    <input
                      type="tel"
                      name="reporter_phone"
                      value={formData.reporter_phone}
                      onChange={handleInputChange}
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl border-2 border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-primary focus:outline-none transition-colors text-sm"
                      placeholder="08xxxxxxxxxx"
                    />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="text-gray-700 text-xs font-semibold mb-2 block">
                    Alamat
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-3 text-gray-400 text-xl">location_on</span>
                    <input
                      type="text"
                      name="reporter_address"
                      value={formData.reporter_address}
                      onChange={handleInputChange}
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl border-2 border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-primary focus:outline-none transition-colors text-sm"
                      placeholder="Alamat lengkap"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Report Details */}
            <div className="p-5 space-y-4">
              {/* Service Type */}
              <div>
                <label className="text-gray-700 text-xs font-semibold mb-2 block">
                  Jenis Layanan <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">category</span>
                  <select
                    name="service_type"
                    value={formData.service_type}
                    onChange={handleInputChange}
                    className="w-full pl-11 pr-10 py-3.5 rounded-xl border-2 border-gray-200 bg-white text-gray-900 focus:border-primary focus:outline-none transition-colors text-sm appearance-none"
                    required
                  >
                    <option value="">Pilih jenis layanan</option>
                    <option value="complaint">📢 Pengaduan</option>
                    <option value="request">📋 Permintaan Informasi</option>
                    <option value="suggestion">💡 Saran & Masukan</option>
                    <option value="survey">📊 Survei Kepuasan</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">expand_more</span>
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="text-gray-700 text-xs font-semibold mb-2 block">
                  Kategori
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">folder</span>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full pl-11 pr-10 py-3.5 rounded-xl border-2 border-gray-200 bg-white text-gray-900 focus:border-primary focus:outline-none transition-colors text-sm appearance-none"
                  >
                    <option value="">Pilih kategori</option>
                    {serviceCategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">expand_more</span>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="text-gray-700 text-xs font-semibold mb-2 block">
                  Judul Laporan <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">title</span>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border-2 border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-primary focus:outline-none transition-colors text-sm"
                    placeholder="Ringkasan singkat masalah Anda"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-gray-700 text-xs font-semibold mb-2 block">
                  Deskripsi Lengkap <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    maxLength={2000}
                    className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-primary focus:outline-none transition-colors text-sm resize-none"
                    placeholder="Jelaskan detail laporan Anda di sini..."
                    required
                  />
                </div>
                <div className="flex justify-end mt-1">
                  <span className="text-xs text-gray-400">{charCount}/2000</span>
                </div>
              </div>
            </div>

            {/* Captcha & Submit */}
            <div className="p-5 bg-gray-50 border-t border-gray-100">
              {/* Captcha */}
              <div className="flex items-center gap-3 p-4 bg-white rounded-xl border-2 border-gray-200 mb-4">
                <input
                  type="checkbox"
                  id="captcha"
                  checked={captchaVerified}
                  onChange={(e) => setCaptchaVerified(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary/20 cursor-pointer"
                  required
                />
                <label htmlFor="captcha" className="text-sm text-gray-600 cursor-pointer flex-1">
                  Saya bukan robot
                </label>
                <div className="flex flex-col items-center opacity-50">
                  <span className="material-symbols-outlined text-lg text-gray-400">security</span>
                  <span className="text-[8px] text-gray-400 font-bold">CAPTCHA</span>
                </div>
              </div>

              {/* Privacy Notice */}
              <p className="text-xs text-gray-500 text-center mb-4">
                Dengan mengirim, Anda menyetujui{' '}
                <a href="#" className="text-primary hover:underline">Kebijakan Privasi</a>
              </p>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting || !captchaVerified}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-blue-600 text-white font-semibold text-base shadow-lg shadow-primary/30 hover:shadow-primary/40 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Mengirim...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">send</span>
                    <span>Kirim Laporan</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-400">
              {appSettings.app_footer || `© ${new Date().getFullYear()} ${appSettings.institution_name || 'Sistem Pengaduan Terpadu'}`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TiketEksternal;
