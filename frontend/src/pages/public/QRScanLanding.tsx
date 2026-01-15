import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { qrCodeService } from '../../services/qrCodeService';

interface QRCodeData {
  id: string;
  unit_id: string;
  code: string;
  name: string;
  description?: string;
  redirect_type?: 'selection' | 'internal_ticket' | 'external_ticket' | 'survey';
  auto_fill_unit?: boolean;
  show_options?: string[];
  redirect_settings?: {
    auto_fill_unit?: boolean;
    show_unit_info?: boolean;
    custom_title?: string;
    custom_description?: string;
  };
  units?: {
    id: string;
    name: string;
    code: string;
    description?: string;
    contact_email?: string;
    contact_phone?: string;
  };
}

const QRScanLanding: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  
  const [qrData, setQrData] = useState<QRCodeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (code) {
      fetchQRCodeData();
    }
  }, [code]);

  const fetchQRCodeData = async () => {
    try {
      setLoading(true);
      const data = await qrCodeService.getByCode(code!);
      console.log('QR Code data loaded:', data);
      setQrData(data as QRCodeData);
      
      // Auto redirect jika redirect_type BUKAN 'selection' dan sudah ditentukan
      if (data.redirect_type && data.redirect_type !== 'selection') {
        console.log('Auto redirecting to:', data.redirect_type);
        handleRedirect(data as QRCodeData);
      } else {
        // Jika selection atau tidak ada, tampilkan pilihan
        setLoading(false);
      }
    } catch (err: any) {
      console.error('Error fetching QR code:', err);
      setError('QR Code tidak valid atau sudah tidak aktif');
      setLoading(false);
    }
  };

  const handleRedirect = (data: QRCodeData) => {
    const unitId = data.unit_id;
    const unitName = data.units?.name || '';
    const qrCode = data.code;
    const autoFillUnit = data.auto_fill_unit !== false;
    
    // Encode parameter untuk URL - pastikan unit_name di-encode dengan benar
    const params = new URLSearchParams({
      qr: qrCode,
      unit_id: unitId,
      unit_name: encodeURIComponent(unitName),
      auto_fill: autoFillUnit ? 'true' : 'false'
    });

    let targetUrl = '';
    
    switch (data.redirect_type) {
      case 'internal_ticket':
        // Arahkan ke halaman fullscreen mobile untuk tiket internal
        targetUrl = `/public/form-tiket-internal?${params.toString()}`;
        break;
      case 'external_ticket':
        // Arahkan ke halaman fullscreen untuk mobile
        targetUrl = `/public/form-pengaduan?${params.toString()}`;
        break;
      case 'survey':
        // Arahkan ke halaman fullscreen untuk mobile
        targetUrl = `/public/form-survei?${params.toString()}`;
        break;
      default:
        // Jika tidak ada redirect_type atau selection, tampilkan pilihan
        setLoading(false);
        return;
    }
    
    // Gunakan window.location untuk redirect langsung tanpa login
    window.location.href = targetUrl;
  };

  const handleManualRedirect = (type: 'internal_ticket' | 'external_ticket' | 'survey') => {
    if (!qrData) return;
    
    const autoFillUnit = qrData.auto_fill_unit !== false;
    const unitName = qrData.units?.name || '';
    
    // Encode parameter untuk URL - pastikan unit_name di-encode dengan benar
    const params = new URLSearchParams({
      qr: qrData.code,
      unit_id: qrData.unit_id,
      unit_name: encodeURIComponent(unitName),
      auto_fill: autoFillUnit ? 'true' : 'false'
    });

    let targetUrl = '';
    
    switch (type) {
      case 'internal_ticket':
        // Arahkan ke halaman fullscreen mobile untuk tiket internal
        targetUrl = `/public/form-tiket-internal?${params.toString()}`;
        break;
      case 'external_ticket':
        // Arahkan ke halaman fullscreen untuk mobile
        targetUrl = `/public/form-pengaduan?${params.toString()}`;
        break;
      case 'survey':
        // Arahkan ke halaman fullscreen untuk mobile
        targetUrl = `/public/form-survei?${params.toString()}`;
        break;
    }
    
    // Gunakan window.location untuk redirect langsung tanpa login
    window.location.href = targetUrl;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400 text-lg">Memuat informasi...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-4xl">error</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">QR Code Tidak Valid</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  // Ambil show_options dari pengaturan QR Code, default semua opsi
  const showOptions = qrData?.show_options || ['internal_ticket', 'external_ticket', 'survey'];

  // Tampilkan pilihan jika tidak ada auto-redirect - Mode Fullscreen Mobile
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 flex flex-col">
      {/* Minimal Header */}
      <div className="bg-white dark:bg-slate-800 px-4 py-3 shadow-sm safe-area-top">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-2xl">local_hospital</span>
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 dark:text-white">Layanan Publik</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Sistem Pengaduan Terpadu</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-4">
          {/* Unit Info Card - Compact */}
          {qrData?.units && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-3xl">business</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-primary uppercase tracking-wider">Unit Tujuan</span>
                    <span className="material-symbols-outlined text-green-500 text-sm">verified</span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    {qrData.units.name}
                  </h2>
                </div>
              </div>
            </div>
          )}

          {/* Action Cards - Mobile Optimized */}
          <div className="space-y-3">
            <p className="text-center text-sm text-slate-600 dark:text-slate-400 font-medium">
              Pilih layanan yang Anda butuhkan
            </p>

            {/* Tiket Eksternal */}
            {showOptions.includes('external_ticket') && (
              <button
                onClick={() => handleManualRedirect('external_ticket')}
                className="w-full bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-5 flex items-center gap-4 hover:shadow-xl transition-all active:scale-[0.98]"
              >
                <div className="w-14 h-14 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-orange-600 dark:text-orange-400 text-3xl">support_agent</span>
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-bold text-slate-900 dark:text-white text-base">Buat Pengaduan</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Keluhan, saran, atau permintaan</p>
                </div>
                <span className="material-symbols-outlined text-slate-400">chevron_right</span>
              </button>
            )}

            {/* Survei */}
            {showOptions.includes('survey') && (
              <button
                onClick={() => handleManualRedirect('survey')}
                className="w-full bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-5 flex items-center gap-4 hover:shadow-xl transition-all active:scale-[0.98]"
              >
                <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-3xl">rate_review</span>
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-bold text-slate-900 dark:text-white text-base">Isi Survei Kepuasan</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Berikan penilaian layanan</p>
                </div>
                <span className="material-symbols-outlined text-slate-400">chevron_right</span>
              </button>
            )}

            {/* Tiket Internal */}
            {showOptions.includes('internal_ticket') && (
              <button
                onClick={() => handleManualRedirect('internal_ticket')}
                className="w-full bg-slate-100 dark:bg-slate-800/50 rounded-2xl p-5 flex items-center gap-4 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-[0.98] border border-dashed border-slate-300 dark:border-slate-600"
              >
                <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-purple-600 dark:text-purple-400 text-3xl">assignment</span>
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-bold text-slate-700 dark:text-slate-300 text-base">Tiket Internal</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Khusus petugas internal</p>
                </div>
                <span className="material-symbols-outlined text-slate-400">chevron_right</span>
              </button>
            )}
          </div>

          {/* Footer Info */}
          <p className="text-center text-xs text-slate-500 dark:text-slate-400 pt-4">
            Unit akan otomatis terisi dari QR Code
          </p>
        </div>
      </main>

      {/* CSS for safe area */}
      <style>{`
        .safe-area-top { padding-top: env(safe-area-inset-top); }
      `}</style>
    </div>
  );
};

export default QRScanLanding;
