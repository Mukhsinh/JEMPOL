import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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
  units?: {
    id: string;
    name: string;
    code: string;
    description?: string;
  };
}

// Mobile-First Landing Page untuk QR Code Scan
// Tampilan clean, modern, dan menarik dengan warna solid cerah
const MobileFormLanding: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  
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
      console.log('🔍 Fetching QR code:', code);
      const data = await qrCodeService.getByCode(code!);
      console.log('✅ QR data received:', data);
      setQrData(data as QRCodeData);
      
      // Cek redirect_type - jika bukan 'selection', langsung redirect
      const redirectType = data.redirect_type || 'external_ticket'; // Default ke pengaduan
      console.log('🎯 Redirect type:', redirectType);
      
      if (redirectType !== 'selection') {
        console.log('🚀 Auto-redirecting to form...');
        handleRedirect(data as QRCodeData, redirectType);
      } else {
        console.log('📋 Showing selection menu');
        setLoading(false);
      }
    } catch (err: any) {
      console.error('❌ Error fetching QR code:', err);
      setError('QR Code tidak valid atau sudah tidak aktif');
      setLoading(false);
    }
  };

  const handleRedirect = (data: QRCodeData, redirectType?: string) => {
    const params = new URLSearchParams({
      qr: data.code,
      unit_id: data.unit_id,
      unit_name: data.units?.name || '',
      auto_fill: data.auto_fill_unit !== false ? 'true' : 'false'
    });

    const type = redirectType || data.redirect_type || 'external_ticket';
    let targetUrl = '';
    
    switch (type) {
      case 'internal_ticket':
        targetUrl = `/m/tiket-internal?${params.toString()}`;
        break;
      case 'external_ticket':
        targetUrl = `/m/pengaduan?${params.toString()}`;
        break;
      case 'survey':
        // Gunakan ModernSurveyForm yang lebih praktis
        targetUrl = `/m/survei?${params.toString()}`;
        break;
      case 'selection':
        // Jika selection, tampilkan menu
        setLoading(false);
        return;
      default:
        // Default ke pengaduan jika tidak ada redirect_type
        targetUrl = `/m/pengaduan?${params.toString()}`;
        break;
    }
    
    console.log('🔀 Redirecting to:', targetUrl);
    // Gunakan replace agar tidak bisa back ke halaman loading
    window.location.replace(targetUrl);
  };

  const handleManualRedirect = (type: 'internal_ticket' | 'external_ticket' | 'survey') => {
    if (!qrData) return;
    
    const params = new URLSearchParams({
      qr: qrData.code,
      unit_id: qrData.unit_id,
      unit_name: qrData.units?.name || '',
      auto_fill: qrData.auto_fill_unit !== false ? 'true' : 'false'
    });

    let targetUrl = '';
    switch (type) {
      case 'internal_ticket':
        targetUrl = `/m/tiket-internal?${params.toString()}`;
        break;
      case 'external_ticket':
        targetUrl = `/m/pengaduan?${params.toString()}`;
        break;
      case 'survey':
        // Gunakan ModernSurveyForm yang lebih praktis
        targetUrl = `/m/survei?${params.toString()}`;
        break;
    }
    window.location.replace(targetUrl);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 relative">
            <div className="absolute inset-0 rounded-full border-4 border-white/30"></div>
            <div className="absolute inset-0 rounded-full border-4 border-white border-t-transparent animate-spin"></div>
          </div>
          <p className="text-white text-lg font-medium">Memuat...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-400 via-red-500 to-orange-500 flex items-center justify-center p-6">
        <div className="bg-white rounded-[2rem] shadow-2xl p-8 max-w-sm w-full text-center">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-red-500 text-5xl">error_outline</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Oops!</h2>
          <p className="text-gray-500 mb-8">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-4 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-2xl font-bold text-lg shadow-lg shadow-red-500/30 active:scale-95 transition-transform"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  const showOptions = qrData?.show_options || ['internal_ticket', 'external_ticket', 'survey'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 flex flex-col">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -left-20 w-48 h-48 bg-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-cyan-300/20 rounded-full blur-2xl"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 pt-12 pb-6 text-center">
        <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <span className="material-symbols-outlined text-white text-3xl">local_hospital</span>
        </div>
        <h1 className="text-white text-2xl font-bold mb-1">Layanan Digital</h1>
        <p className="text-white/80 text-sm">Sistem Pengaduan Terpadu</p>
      </header>

      {/* Unit Card */}
      {qrData?.units && (
        <div className="relative z-10 px-6 mb-6">
          <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-4 border border-white/30">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-lg">
                <span className="material-symbols-outlined text-blue-600 text-2xl">business</span>
              </div>
              <div className="flex-1">
                <p className="text-white/70 text-xs font-medium uppercase tracking-wider mb-1">Unit Tujuan</p>
                <h2 className="text-white text-lg font-bold leading-tight">{qrData.units.name}</h2>
              </div>
              <div className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-lg">check</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="relative z-10 flex-1 bg-white rounded-t-[2.5rem] px-6 pt-8 pb-10">
        <div className="max-w-md mx-auto">
          <h3 className="text-gray-800 text-lg font-bold mb-2 text-center">Pilih Layanan</h3>
          <p className="text-gray-500 text-sm mb-8 text-center">Silakan pilih jenis layanan yang Anda butuhkan</p>

          <div className="space-y-4">
            {/* Pengaduan */}
            {showOptions.includes('external_ticket') && (
              <button
                onClick={() => handleManualRedirect('external_ticket')}
                className="w-full bg-gradient-to-r from-orange-400 to-rose-500 rounded-2xl p-5 flex items-center gap-4 shadow-lg shadow-orange-500/30 active:scale-[0.98] transition-transform"
              >
                <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-3xl">support_agent</span>
                </div>
                <div className="flex-1 text-left">
                  <h4 className="text-white font-bold text-lg">Buat Pengaduan</h4>
                  <p className="text-white/80 text-sm">Keluhan, saran, atau permintaan</p>
                </div>
                <span className="material-symbols-outlined text-white/60 text-2xl">arrow_forward_ios</span>
              </button>
            )}

            {/* Survei */}
            {showOptions.includes('survey') && (
              <button
                onClick={() => handleManualRedirect('survey')}
                className="w-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-2xl p-5 flex items-center gap-4 shadow-lg shadow-emerald-500/30 active:scale-[0.98] transition-transform"
              >
                <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-3xl">rate_review</span>
                </div>
                <div className="flex-1 text-left">
                  <h4 className="text-white font-bold text-lg">Isi Survei</h4>
                  <p className="text-white/80 text-sm">Berikan penilaian layanan</p>
                </div>
                <span className="material-symbols-outlined text-white/60 text-2xl">arrow_forward_ios</span>
              </button>
            )}

            {/* Tiket Internal */}
            {showOptions.includes('internal_ticket') && (
              <button
                onClick={() => handleManualRedirect('internal_ticket')}
                className="w-full bg-gradient-to-r from-violet-400 to-purple-500 rounded-2xl p-5 flex items-center gap-4 shadow-lg shadow-violet-500/30 active:scale-[0.98] transition-transform"
              >
                <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-3xl">assignment</span>
                </div>
                <div className="flex-1 text-left">
                  <h4 className="text-white font-bold text-lg">Tiket Internal</h4>
                  <p className="text-white/80 text-sm">Khusus petugas internal</p>
                </div>
                <span className="material-symbols-outlined text-white/60 text-2xl">arrow_forward_ios</span>
              </button>
            )}
          </div>

          {/* Footer Info */}
          <div className="mt-10 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full">
              <span className="material-symbols-outlined text-green-500 text-lg">verified</span>
              <span className="text-gray-600 text-sm">Unit terisi otomatis dari QR Code</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MobileFormLanding;
