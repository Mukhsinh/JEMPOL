import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { masterDataService, ServiceCategory } from '../../services/masterDataService';
import { qrCodeService, QRCode } from '../../services/qrCodeService';
import { externalTicketService } from '../../services/externalTicketService';

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
  attachments: File[];
}

const TiketEksternal: React.FC = () => {
  const { qrCode } = useParams<{ qrCode: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Ambil parameter dari URL (dari QR Landing)
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
  
  const [formData, setFormData] = useState<FormData>({
    reporter_identity_type: 'personal',
    reporter_name: '',
    reporter_email: '',
    reporter_phone: '',
    reporter_address: '',
    service_type: '',
    category: '',
    title: '',
    description: '',
    attachments: []
  });

  useEffect(() => {
    initializeForm();
  }, [qrCode, unitIdFromUrl]);

  const initializeForm = async () => {
    try {
      setLoading(true);
      
      // Load service categories from master data
      const categories = await masterDataService.getServiceCategories();
      setServiceCategories(categories.filter(cat => cat.is_active));
      
      // Jika ada unit_id dari URL (dari QR Landing dengan auto_fill_unit)
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
      
      // Load QR code data if available
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...files]
      }));
    }
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
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
        description: formData.description,
        attachments: formData.attachments
      };

      const result = await externalTicketService.createTicket(submitData);
      
      alert(`Laporan berhasil dikirim! Nomor tiket: ${result.ticket_number}`);
      
      // Reset form
      setFormData({
        reporter_identity_type: 'personal',
        reporter_name: '',
        reporter_email: '',
        reporter_phone: '',
        reporter_address: '',
        service_type: '',
        category: '',
        title: '',
        description: '',
        attachments: []
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
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Memuat formulir...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between whitespace-nowrap border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1a2632] px-6 lg:px-10 py-3 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="size-8 text-primary flex items-center justify-center bg-primary/10 rounded-lg">
            <span className="material-symbols-outlined text-2xl">local_hospital</span>
          </div>
          <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">
            Sistem Pengaduan Terpadu
          </h2>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => navigate('/login')}
            className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-9 px-4 bg-primary text-white hover:bg-primary/90 transition-colors text-sm font-bold leading-normal tracking-[0.015em]"
          >
            <span className="truncate">Masuk</span>
          </button>
          <button className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-9 px-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm font-bold leading-normal tracking-[0.015em]">
            <span className="truncate">Bantuan</span>
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center py-8 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-4xl space-y-6">
          {/* Page Heading */}
          <div className="flex flex-col gap-2">
            <h1 className="text-slate-900 dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">
              Sampaikan Laporan Anda
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-base md:text-lg font-normal leading-normal max-w-2xl">
              Silakan isi formulir di bawah ini untuk menyampaikan pengaduan, permintaan, saran, atau survei secara aman dan terpercaya.
            </p>
          </div>

          {/* Pre-filled Unit Info Card */}
          {qrData?.units && (
            <div className="bg-white dark:bg-[#1a2632] rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="flex flex-col md:flex-row items-stretch">
                <div className="p-6 flex-1 flex flex-col justify-center gap-2">
                  <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-wide">
                    <span className="material-symbols-outlined text-lg">verified</span>
                    <span>Unit Terverifikasi</span>
                    {unitLocked && (
                      <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs">
                        <span className="material-symbols-outlined text-xs">lock</span>
                        Otomatis Terisi
                      </span>
                    )}
                  </div>
                  <h3 className="text-slate-900 dark:text-white text-xl font-bold leading-tight">
                    {qrData.units.name}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-normal leading-normal">
                    {unitLocked ? 
                      `Unit ini telah dipilih secara otomatis berdasarkan QR Code yang dipindai.` :
                      `Formulir pengaduan umum untuk unit ini.`
                    }
                  </p>
                </div>
                <div className="h-32 md:h-auto md:w-48 bg-gradient-to-br from-primary/20 to-primary/10">
                  <div className="h-full w-full bg-primary/10 backdrop-blur-[1px] flex items-center justify-center">
                    <span className="material-symbols-outlined text-6xl text-primary/30">local_hospital</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Main Form Container */}
          <form onSubmit={handleSubmit} className="bg-white dark:bg-[#1a2632] rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 md:p-8 space-y-8">
            {/* Identity Toggle */}
            <div className="space-y-3">
              <label className="text-slate-900 dark:text-white text-sm font-bold uppercase tracking-wider">
                Identitas Pelapor
              </label>
              <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg w-full sm:w-fit">
                <label className="flex-1 sm:flex-none cursor-pointer">
                  <input
                    type="radio"
                    name="reporter_identity_type"
                    value="personal"
                    checked={formData.reporter_identity_type === 'personal'}
                    onChange={() => setFormData(prev => ({ ...prev, reporter_identity_type: 'personal' }))}
                    className="peer sr-only"
                  />
                  <div className="px-4 py-2 rounded-md text-sm font-medium text-slate-500 dark:text-slate-400 peer-checked:bg-white dark:peer-checked:bg-[#2c3b4b] peer-checked:text-primary peer-checked:shadow-sm transition-all text-center flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-lg">person</span>
                    Identitas Pribadi
                  </div>
                </label>
                <label className="flex-1 sm:flex-none cursor-pointer">
                  <input
                    type="radio"
                    name="reporter_identity_type"
                    value="anonymous"
                    checked={formData.reporter_identity_type === 'anonymous'}
                    onChange={() => setFormData(prev => ({ ...prev, reporter_identity_type: 'anonymous' }))}
                    className="peer sr-only"
                  />
                  <div className="px-4 py-2 rounded-md text-sm font-medium text-slate-500 dark:text-slate-400 peer-checked:bg-white dark:peer-checked:bg-[#2c3b4b] peer-checked:text-primary peer-checked:shadow-sm transition-all text-center flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-lg">visibility_off</span>
                    Anonim
                  </div>
                </label>
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Pilih "Anonim" jika Anda tidak ingin identitas Anda diketahui oleh unit terkait.
              </p>
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* Personal Information (conditional) */}
            {formData.reporter_identity_type === 'personal' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-slate-900 dark:text-white text-sm font-semibold" htmlFor="reporter_name">
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    id="reporter_name"
                    name="reporter_name"
                    value={formData.reporter_name}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                    placeholder="Masukkan nama lengkap Anda"
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-slate-900 dark:text-white text-sm font-semibold" htmlFor="reporter_email">
                    Email
                  </label>
                  <input
                    type="email"
                    id="reporter_email"
                    name="reporter_email"
                    value={formData.reporter_email}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                    placeholder="email@example.com"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-slate-900 dark:text-white text-sm font-semibold" htmlFor="reporter_phone">
                    Nomor Telepon
                  </label>
                  <input
                    type="tel"
                    id="reporter_phone"
                    name="reporter_phone"
                    value={formData.reporter_phone}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                    placeholder="08xxxxxxxxxx"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-slate-900 dark:text-white text-sm font-semibold" htmlFor="reporter_address">
                    Alamat
                  </label>
                  <input
                    type="text"
                    id="reporter_address"
                    name="reporter_address"
                    value={formData.reporter_address}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                    placeholder="Alamat lengkap"
                  />
                </div>
              </div>
            )}

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Service Type */}
              <div className="flex flex-col gap-2 md:col-span-1">
                <label className="text-slate-900 dark:text-white text-sm font-semibold" htmlFor="service_type">
                  Jenis Layanan *
                </label>
                <div className="relative">
                  <select
                    id="service_type"
                    name="service_type"
                    value={formData.service_type}
                    onChange={handleInputChange}
                    className="w-full appearance-none rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 px-4 py-3 pr-10 text-slate-900 dark:text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                    required
                  >
                    <option value="">Pilih jenis layanan...</option>
                    <option value="complaint">Pengaduan</option>
                    <option value="request">Permintaan Informasi</option>
                    <option value="suggestion">Saran & Masukan</option>
                    <option value="survey">Survei Kepuasan</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                    <span className="material-symbols-outlined">expand_more</span>
                  </div>
                </div>
              </div>

              {/* Category - Integrated with Master Data */}
              <div className="flex flex-col gap-2 md:col-span-1">
                <label className="text-slate-900 dark:text-white text-sm font-semibold" htmlFor="category">
                  Kategori
                </label>
                <div className="relative">
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full appearance-none rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 px-4 py-3 pr-10 text-slate-900 dark:text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                  >
                    <option value="">Pilih kategori...</option>
                    {serviceCategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                    <span className="material-symbols-outlined">expand_more</span>
                  </div>
                </div>
              </div>

              {/* Title */}
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-slate-900 dark:text-white text-sm font-semibold" htmlFor="title">
                  Judul Laporan *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                  placeholder="Ringkasan singkat masalah Anda (Contoh: AC di ruang tunggu mati)"
                  required
                />
              </div>

              {/* Description */}
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-slate-900 dark:text-white text-sm font-semibold" htmlFor="description">
                  Deskripsi Lengkap *
                  <span className="text-slate-400 font-normal ml-1 text-xs">
                    (Jelaskan kronologi kejadian secara detail)
                  </span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={5}
                  maxLength={2000}
                  className="w-full resize-y rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                  placeholder="Sampaikan detail laporan anda di sini..."
                  required
                />
                <div className="text-right text-xs text-slate-400">
                  {charCount} / 2000 karakter
                </div>
              </div>

              {/* File Upload - Removed "terlampir" text */}
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-slate-900 dark:text-white text-sm font-semibold">
                  Lampiran Bukti (Opsional)
                </label>
                <div className="group relative flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 py-8 hover:border-primary hover:bg-primary/5 transition-all">
                  <div className="flex flex-col items-center justify-center gap-2 pb-2 text-center">
                    <div className="rounded-full bg-slate-200 dark:bg-slate-700 p-3 text-slate-500 dark:text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      <span className="material-symbols-outlined text-2xl">cloud_upload</span>
                    </div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      <span className="text-primary font-bold">Klik untuk unggah</span> atau seret file ke sini
                    </p>
                    <p className="text-xs text-slate-500">JPG, PNG, PDF (Maks. 5MB)</p>
                  </div>
                  <input 
                    type="file" 
                    className="absolute h-full w-full cursor-pointer opacity-0"
                    multiple
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={handleFileUpload}
                  />
                </div>
                {formData.attachments.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">File terpilih:</p>
                    <ul className="space-y-1">
                      {formData.attachments.map((file, index) => (
                        <li key={index} className="text-sm text-slate-600 dark:text-slate-400 flex items-center justify-between gap-2 bg-slate-100 dark:bg-slate-800 p-2 rounded">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">attach_file</span>
                            {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <span className="material-symbols-outlined text-sm">close</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Security & Submit */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 md:p-6 border border-slate-100 dark:border-slate-800 flex flex-col gap-6">
              {/* CAPTCHA Placeholder */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 bg-white dark:bg-[#1a2632] border border-slate-300 dark:border-slate-600 rounded-md p-3 shadow-sm min-w-[240px]">
                  <div className="relative flex items-center justify-center">
                    <input
                      type="checkbox"
                      id="captcha"
                      checked={captchaVerified}
                      onChange={(e) => setCaptchaVerified(e.target.checked)}
                      className="peer size-6 cursor-pointer rounded border-slate-300 text-primary focus:ring-primary/20"
                      required
                    />
                  </div>
                  <label htmlFor="captcha" className="text-sm text-slate-600 dark:text-slate-300 cursor-pointer select-none">
                    Saya bukan robot
                  </label>
                  <div className="ml-auto flex flex-col items-center justify-center gap-0.5 opacity-50">
                    <span className="material-symbols-outlined text-[18px]">security</span>
                    <span className="text-[8px] uppercase font-bold tracking-tighter">Captcha</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col-reverse md:flex-row gap-4 items-center justify-between">
                <p className="text-xs text-slate-500 dark:text-slate-400 text-center md:text-left max-w-sm">
                  Dengan mengirimkan laporan ini, Anda menyetujui{' '}
                  <a href="#" className="text-primary hover:underline">
                    Kebijakan Privasi
                  </a>{' '}
                  kami.
                </p>
                <div className="flex w-full md:w-auto gap-3">
                  <button
                    type="button"
                    onClick={() => navigate('/')}
                    className="flex-1 md:flex-none h-11 px-6 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-transparent text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !captchaVerified}
                    className="flex-1 md:flex-none h-11 px-8 rounded-lg bg-primary text-white shadow-lg shadow-primary/30 hover:bg-primary/90 hover:shadow-primary/40 active:translate-y-0.5 transition-all font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Mengirim...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[20px]">send</span>
                        Kirim Laporan
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1a2632] py-6">
        <div className="px-6 lg:px-10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500 dark:text-slate-400">
          <p>© 2024 Sistem Pengaduan Terpadu. Hak Cipta Dilindungi.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-primary transition-colors">
              Tentang Kami
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              Panduan
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              Hubungi Kami
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TiketEksternal;