import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppFooter from '../../components/AppFooter';

interface Unit {
  id: string;
  name: string;
  code: string;
  description?: string;
}

interface QRCode {
  id: string;
  unit_id: string;
  code: string;
  name: string;
  unit?: Unit;
}

const ExternalTicketForm: React.FC = () => {
  const { qrCode } = useParams<{ qrCode: string }>();
  const navigate = useNavigate();
  
  const [qrData, setQrData] = useState<QRCode | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    reporter_identity_type: 'personal',
    reporter_name: '',
    reporter_email: '',
    reporter_phone: '',
    reporter_address: '',
    service_type: '',
    category: '',
    title: '',
    description: '',
    attachments: [] as File[]
  });

  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [characterCount, setCharacterCount] = useState(0);

  useEffect(() => {
    if (qrCode) {
      fetchQRCodeData();
    } else {
      // Jika tidak ada QR code, gunakan unit default
      setQrData({
        id: 'default',
        unit_id: 'default-unit',
        code: 'DEFAULT',
        name: 'Formulir Umum',
        unit: {
          id: 'default-unit',
          name: 'Instalasi Gawat Darurat (IGD)',
          code: 'IGD',
          description: 'Unit default untuk pengaduan umum'
        }
      });
      setLoading(false);
    }
  }, [qrCode]);

  const fetchQRCodeData = async () => {
    try {
      const response = await fetch(`/api/qr-codes/${qrCode}`);
      if (response.ok) {
        const data = await response.json();
        setQrData(data);
      } else {
        console.error('QR Code tidak ditemukan');
        navigate('/');
      }
    } catch (error) {
      console.error('Error fetching QR code data:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'description') {
      setCharacterCount(value.length);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!captchaVerified) {
      alert('Silakan verifikasi captcha terlebih dahulu');
      return;
    }

    setSubmitting(true);

    try {
      // Kirim sebagai JSON
      const submitData = {
        reporter_identity_type: formData.reporter_identity_type,
        reporter_name: formData.reporter_name,
        reporter_email: formData.reporter_email,
        reporter_phone: formData.reporter_phone,
        reporter_address: formData.reporter_address,
        service_type: formData.service_type,
        category: formData.category,
        title: formData.title,
        description: formData.description,
        qr_code_id: qrData?.id !== 'default' ? qrData?.id : null,
        unit_id: qrData?.unit_id,
        source: qrCode ? 'qr_code' : 'web'
      };

      const response = await fetch('/api/external-tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
      });

      const result = await response.json();

      if (response.ok && result.success) {
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
        setCharacterCount(0);
      } else {
        alert(`Error: ${result.error || 'Gagal mengirim laporan'}`);
      }
    } catch (error) {
      console.error('Error submitting ticket:', error);
      alert('Terjadi kesalahan saat mengirim laporan');
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
      {/* Top Navigation */}
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
          {qrData?.unit && (
            <div className="bg-white dark:bg-[#1a2632] rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="flex flex-col md:flex-row items-stretch">
                <div className="p-6 flex-1 flex flex-col justify-center gap-2">
                  <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-wide">
                    <span className="material-symbols-outlined text-lg">verified</span>
                    <span>Unit Terverifikasi</span>
                  </div>
                  <h3 className="text-slate-900 dark:text-white text-xl font-bold leading-tight">
                    {qrData.unit.name}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-normal leading-normal">
                    {qrCode ? 
                      `Anda sedang membuat laporan untuk unit ini berdasarkan kode QR yang dipindai.` :
                      `Formulir pengaduan umum untuk unit ini.`
                    }
                  </p>
                </div>
                <div className="h-32 md:h-auto md:w-48 bg-cover bg-center bg-gradient-to-br from-primary/20 to-primary/10">
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
                    checked={formData.reporter_identity_type === 'personal'}
                    onChange={() => setFormData(prev => ({ ...prev, reporter_identity_type: 'personal' }))}
                    className="peer sr-only" 
                    name="identity" 
                    type="radio" 
                    value="personal"
                  />
                  <div className="px-4 py-2 rounded-md text-sm font-medium text-slate-500 dark:text-slate-400 peer-checked:bg-white dark:peer-checked:bg-[#2c3b4b] peer-checked:text-primary peer-checked:shadow-sm transition-all text-center flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-lg">person</span>
                    Identitas Pribadi
                  </div>
                </label>
                <label className="flex-1 sm:flex-none cursor-pointer">
                  <input 
                    checked={formData.reporter_identity_type === 'anonymous'}
                    onChange={() => setFormData(prev => ({ ...prev, reporter_identity_type: 'anonymous' }))}
                    className="peer sr-only" 
                    name="identity" 
                    type="radio" 
                    value="anonymous"
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

            <hr className="border-slate-100 dark:border-slate-800"/>

            {/* Personal Information (conditional) */}
            {formData.reporter_identity_type === 'personal' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-slate-900 dark:text-white text-sm font-semibold" htmlFor="reporter_name">
                    Nama Lengkap *
                  </label>
                  <input 
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors" 
                    id="reporter_name"
                    name="reporter_name"
                    value={formData.reporter_name}
                    onChange={handleInputChange}
                    placeholder="Masukkan nama lengkap Anda" 
                    type="text"
                    required
                  />
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="text-slate-900 dark:text-white text-sm font-semibold" htmlFor="reporter_email">
                    Email
                  </label>
                  <input 
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors" 
                    id="reporter_email"
                    name="reporter_email"
                    value={formData.reporter_email}
                    onChange={handleInputChange}
                    placeholder="email@example.com" 
                    type="email"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-slate-900 dark:text-white text-sm font-semibold" htmlFor="reporter_phone">
                    Nomor Telepon
                  </label>
                  <input 
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors" 
                    id="reporter_phone"
                    name="reporter_phone"
                    value={formData.reporter_phone}
                    onChange={handleInputChange}
                    placeholder="08xxxxxxxxxx" 
                    type="tel"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-slate-900 dark:text-white text-sm font-semibold" htmlFor="reporter_address">
                    Alamat
                  </label>
                  <input 
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors" 
                    id="reporter_address"
                    name="reporter_address"
                    value={formData.reporter_address}
                    onChange={handleInputChange}
                    placeholder="Alamat lengkap" 
                    type="text"
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
                    className="w-full appearance-none rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 px-4 py-3 pr-10 text-slate-900 dark:text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors" 
                    id="service_type"
                    name="service_type"
                    value={formData.service_type}
                    onChange={handleInputChange}
                    required
                  >
                    <option disabled value="">Pilih jenis layanan...</option>
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

              {/* Category */}
              <div className="flex flex-col gap-2 md:col-span-1">
                <label className="text-slate-900 dark:text-white text-sm font-semibold" htmlFor="category">
                  Kategori
                </label>
                <div className="relative">
                  <select 
                    className="w-full appearance-none rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 px-4 py-3 pr-10 text-slate-900 dark:text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors" 
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                  >
                    <option disabled value="">Pilih kategori...</option>
                    <option value="service">Pelayanan Medis</option>
                    <option value="facility">Fasilitas & Sarana</option>
                    <option value="staff">Perilaku Petugas</option>
                    <option value="admin">Administrasi</option>
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
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors" 
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Ringkasan singkat masalah Anda (Contoh: AC di ruang tunggu mati)" 
                  type="text"
                  required
                />
              </div>

              {/* Description */}
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-slate-900 dark:text-white text-sm font-semibold" htmlFor="description">
                  Deskripsi Lengkap *
                  <span className="text-slate-400 font-normal ml-1 text-xs">(Jelaskan kronologi kejadian secara detail)</span>
                </label>
                <textarea 
                  className="w-full resize-y rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors" 
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Sampaikan detail laporan anda di sini..." 
                  rows={5}
                  maxLength={2000}
                  required
                />
                <div className="text-right text-xs text-slate-400">
                  {characterCount} / 2000 karakter
                </div>
              </div>

              {/* Attachments */}
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
                    className="absolute h-full w-full cursor-pointer opacity-0" 
                    type="file"
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
                        <li key={index} className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                          <span className="material-symbols-outlined text-sm">attach_file</span>
                          {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
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
                      className="peer size-6 cursor-pointer rounded border-slate-300 text-primary focus:ring-primary/20" 
                      id="captcha" 
                      type="checkbox"
                      checked={captchaVerified}
                      onChange={(e) => setCaptchaVerified(e.target.checked)}
                    />
                  </div>
                  <label className="text-sm text-slate-600 dark:text-slate-300 cursor-pointer select-none" htmlFor="captcha">
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
                  <a className="text-primary hover:underline" href="#">Kebijakan Privasi</a> kami.
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
      <AppFooter variant="default" className="mt-auto" />
    </div>
  );
};

export default ExternalTicketForm;