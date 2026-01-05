import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { qrCodeService, QRCode } from '../../services/qrCodeService';

const OPTION_CONFIG = {
  internal_ticket: {
    icon: 'assignment',
    title: 'Buat Tiket Internal',
    description: 'Sampaikan keluhan atau permintaan untuk ditangani oleh unit terkait',
    color: 'blue',
    path: '/public/tiket-internal'
  },
  external_ticket: {
    icon: 'description',
    title: 'Buat Tiket Eksternal',
    description: 'Sampaikan pengaduan, saran, atau permintaan informasi',
    color: 'green',
    path: '/public/tiket-eksternal'
  },
  survey: {
    icon: 'rate_review',
    title: 'Isi Survei Kepuasan',
    description: 'Berikan penilaian terhadap layanan yang telah Anda terima',
    color: 'purple',
    path: '/public/survei'
  }
};

const QRLanding: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  
  const [qrData, setQrData] = useState<QRCode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (code) {
      loadQRData();
    }
  }, [code]);

  const loadQRData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await qrCodeService.getByCode(code!);
      setQrData(data);
      
      // Auto redirect jika bukan tipe selection
      if (data.redirect_type && data.redirect_type !== 'selection') {
        handleRedirect(data.redirect_type, data);
      }
    } catch (err: any) {
      console.error('Error loading QR data:', err);
      setError('QR Code tidak ditemukan atau tidak aktif');
    } finally {
      setLoading(false);
    }
  };

  const handleRedirect = (type: string, qr: QRCode) => {
    const config = OPTION_CONFIG[type as keyof typeof OPTION_CONFIG];
    if (!config) return;

    // Build URL dengan parameter unit - selalu kirim parameter untuk public pages
    const params = new URLSearchParams();
    const unitName = qr.units?.name || '';
    
    // Selalu kirim parameter unit untuk auto-fill - encode unit_name dengan benar
    params.append('qr', qr.code);
    params.append('unit_id', qr.unit_id);
    params.append('unit_name', encodeURIComponent(unitName));
    params.append('auto_fill', qr.auto_fill_unit !== false ? 'true' : 'false');
    
    const url = `${config.path}?${params.toString()}`;
    
    // Gunakan window.location untuk redirect langsung tanpa login
    window.location.href = url;
  };

  const handleOptionClick = (optionType: string) => {
    if (!qrData) return;
    
    const config = OPTION_CONFIG[optionType as keyof typeof OPTION_CONFIG];
    if (!config) return;

    // Build URL dengan parameter unit untuk public pages
    const params = new URLSearchParams();
    const unitName = qrData.units?.name || '';
    
    // Encode unit_name dengan benar
    params.append('qr', qrData.code);
    params.append('unit_id', qrData.unit_id);
    params.append('unit_name', encodeURIComponent(unitName));
    params.append('auto_fill', qrData.auto_fill_unit !== false ? 'true' : 'false');
    
    const url = `${config.path}?${params.toString()}`;
    
    // Gunakan window.location untuk redirect ke public route tanpa login
    window.location.href = url;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Memuat...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="size-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-3xl text-red-500">error</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            QR Code Tidak Valid
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            {error}
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  // Jika redirect_type bukan selection, tampilkan loading (akan auto redirect)
  if (qrData?.redirect_type && qrData.redirect_type !== 'selection') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Mengalihkan...</p>
        </div>
      </div>
    );
  }

  // Tampilkan pilihan
  const showOptions = qrData?.show_options || ['internal_ticket', 'external_ticket', 'survey'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 flex flex-col">
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <div className="size-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-2xl">local_hospital</span>
          </div>
          <div>
            <h1 className="font-bold text-slate-900 dark:text-white">Sistem Pengaduan Terpadu</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Layanan Pengaduan Masyarakat</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          {/* Unit Info Card */}
          {qrData?.units && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 mb-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-4">
                <div className="size-14 bg-primary/10 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-3xl">business</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="material-symbols-outlined text-green-500 text-sm">verified</span>
                    <span className="text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wide">
                      Unit Terverifikasi
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {qrData.units.name}
                  </h2>
                  {qrData.units.description && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      {qrData.units.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Selection Title */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Pilih Layanan
            </h2>
            <p className="text-slate-500 dark:text-slate-400">
              Silakan pilih jenis layanan yang Anda butuhkan
            </p>
          </div>

          {/* Options Grid */}
          <div className="grid gap-4">
            {showOptions.map((optionKey) => {
              const option = OPTION_CONFIG[optionKey as keyof typeof OPTION_CONFIG];
              if (!option) return null;

              const colorClasses = {
                blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 border-blue-200 dark:border-blue-800',
                green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 border-green-200 dark:border-green-800',
                purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30 border-purple-200 dark:border-purple-800'
              };

              return (
                <button
                  key={optionKey}
                  onClick={() => handleOptionClick(optionKey)}
                  className={`w-full p-5 rounded-xl border-2 transition-all text-left group ${colorClasses[option.color as keyof typeof colorClasses]}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="size-12 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm">
                      <span className="material-symbols-outlined text-2xl">{option.icon}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                        {option.title}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {option.description}
                      </p>
                    </div>
                    <span className="material-symbols-outlined text-slate-400 group-hover:text-primary group-hover:translate-x-1 transition-all">
                      arrow_forward
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Help Text */}
          <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-6">
            Butuh bantuan? Hubungi petugas terdekat atau kunjungi pusat informasi
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-t border-slate-200 dark:border-slate-700 py-4">
        <div className="max-w-2xl mx-auto px-6 text-center text-xs text-slate-500 dark:text-slate-400">
          © 2024 Sistem Pengaduan Terpadu. Hak Cipta Dilindungi.
        </div>
      </footer>
    </div>
  );
};

export default QRLanding;
