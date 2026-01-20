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

const QRScanLanding: React.FC = () => {
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
      console.log('🔄 Fetching QR code data for:', code);
      const data = await qrCodeService.getByCode(code!);
      console.log('✅ QR code data received:', data);
      
      // Set data dulu untuk digunakan di handleRedirect
      setQrData(data as QRCodeData);
      
      // PERBAIKAN: Langsung redirect ke form berdasarkan redirect_type
      // Jika tidak ada redirect_type, default ke 'selection' untuk menampilkan menu
      const redirectType = data.redirect_type || 'selection';
      
      console.log('🔍 Redirect type:', redirectType);
      
      if (redirectType !== 'selection') {
        // Langsung redirect ke form tanpa menampilkan menu
        console.log('🚀 Auto-redirecting to:', redirectType);
        handleRedirect(data as QRCodeData, redirectType);
        // JANGAN set loading false, biarkan di loading state karena akan redirect
      } else {
        // Tampilkan menu pilihan
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
    const type = redirectType || data.redirect_type || 'external_ticket';
    
    // Jika selection, tampilkan menu pilihan (tidak redirect)
    if (type === 'selection') {
      console.log('📋 Showing selection menu');
      setQrData(data);
      setLoading(false);
      return;
    }
    
    // PERBAIKAN: Gunakan route /form/:type untuk tampilan fullscreen tanpa sidebar
    const params = new URLSearchParams();
    params.append('qr', data.code);
    params.append('unit_id', data.unit_id);
    if (data.units?.name) params.append('unit_name', encodeURIComponent(data.units.name));
    if (data.auto_fill_unit !== false) params.append('auto_fill', 'true');

    let targetUrl = '';
    
    // Route langsung ke form fullscreen (tanpa sidebar, tanpa login)
    switch (type) {
      case 'internal_ticket':
        targetUrl = `/form/internal?${params.toString()}`;
        break;
      case 'external_ticket':
        targetUrl = `/form/eksternal?${params.toString()}`;
        break;
      case 'survey':
        targetUrl = `/form/survey?${params.toString()}`;
        break;
      default:
        // Default ke pengaduan eksternal
        targetUrl = `/form/eksternal?${params.toString()}`;
        break;
    }
    
    console.log('🔀 Redirecting to:', targetUrl);
    console.log('📍 Full URL:', window.location.origin + targetUrl);
    
    // Gunakan window.location.href untuk redirect langsung
    window.location.href = targetUrl;
  };

  const handleManualRedirect = (type: 'internal_ticket' | 'external_ticket' | 'survey') => {
    if (!qrData) return;
    
    // PERBAIKAN: Gunakan handleRedirect yang sudah diperbaiki
    handleRedirect(qrData, type);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 relative">
            <div className="absolute inset-0 rounded-full border-4 border-white/30"></div>
            <div className="absolute inset-0 rounded-full border-4 border-white border-t-transparent animate-spin"></div>
          </div>
          <p className="text-white text-xl font-medium">Memuat...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-400 via-red-500 to-orange-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">QR Code Tidak Valid</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <button 
            onClick={() => window.history.back()}
            className="inline-block w-full py-4 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  const showOptions = qrData?.show_options || ['internal_ticket', 'external_ticket', 'survey'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 flex flex-col">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 px-4 pt-safe-top">
        <div className="max-w-lg mx-auto py-6">
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="text-white">
              <h1 className="text-xl font-bold">Layanan Publik</h1>
              <p className="text-sm text-white/80">Sistem Pengaduan Terpadu</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-6">
        <div className="max-w-lg w-full space-y-5">
          
          {/* Unit Card */}
          {qrData?.units && (
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-6 transform hover:scale-[1.02] transition-all">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Unit Tujuan</span>
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">{qrData.units.name}</h2>
                </div>
              </div>
            </div>
          )}

          {/* Title */}
          <div className="text-center py-2">
            <h2 className="text-white text-lg font-medium">Pilih layanan yang Anda butuhkan</h2>
          </div>

          {/* Service Options */}
          <div className="space-y-4">
            
            {/* Pengaduan - Orange/Amber */}
            {showOptions.includes('external_ticket') && (
              <button
                onClick={() => handleManualRedirect('external_ticket')}
                className="w-full bg-gradient-to-r from-orange-400 to-amber-500 rounded-3xl p-5 flex items-center gap-4 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-white font-bold text-lg">Buat Pengaduan</h3>
                  <p className="text-white/80 text-sm">Keluhan, saran, atau permintaan</p>
                </div>
                <svg className="w-6 h-6 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}

            {/* Survei - Green/Emerald */}
            {showOptions.includes('survey') && (
              <button
                onClick={() => handleManualRedirect('survey')}
                className="w-full bg-gradient-to-r from-emerald-400 to-green-500 rounded-3xl p-5 flex items-center gap-4 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-white font-bold text-lg">Isi Survei Kepuasan</h3>
                  <p className="text-white/80 text-sm">Berikan penilaian layanan</p>
                </div>
                <svg className="w-6 h-6 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}

            {/* Tiket Internal - Purple/Violet */}
            {showOptions.includes('internal_ticket') && (
              <button
                onClick={() => handleManualRedirect('internal_ticket')}
                className="w-full bg-gradient-to-r from-violet-400 to-purple-500 rounded-3xl p-5 flex items-center gap-4 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-white font-bold text-lg">Tiket Internal</h3>
                  <p className="text-white/80 text-sm">Khusus petugas internal</p>
                </div>
                <svg className="w-6 h-6 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>

          {/* Footer Info */}
          <p className="text-center text-white/70 text-sm pt-4">
            Unit akan otomatis terisi dari QR Code
          </p>
        </div>
      </main>

      {/* Safe Area CSS */}
      <style>{`
        .pt-safe-top { padding-top: max(env(safe-area-inset-top), 1rem); }
      `}</style>
    </div>
  );
};

export default QRScanLanding;
