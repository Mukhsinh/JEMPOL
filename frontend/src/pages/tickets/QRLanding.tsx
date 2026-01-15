import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { qrCodeService, QRCode } from '../../services/qrCodeService';

const OPTION_CONFIG = {
  internal_ticket: {
    icon: '📋',
    title: 'Buat Tiket Internal',
    description: 'Sampaikan keluhan atau permintaan untuk ditangani oleh unit terkait',
    color: 'from-violet-400 to-purple-500',
    path: '/public/form-tiket-internal'
  },
  external_ticket: {
    icon: '💬',
    title: 'Buat Pengaduan',
    description: 'Sampaikan pengaduan, saran, atau permintaan informasi',
    color: 'from-orange-400 to-amber-500',
    path: '/public/form-pengaduan'
  },
  survey: {
    icon: '⭐',
    title: 'Isi Survei Kepuasan',
    description: 'Berikan penilaian terhadap layanan yang telah Anda terima',
    color: 'from-emerald-400 to-green-500',
    path: '/public/form-survei'
  }
};

const QRLanding: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  
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
      
      if (data.redirect_type && data.redirect_type !== 'selection') {
        handleRedirect(data.redirect_type, data);
      }
    } catch (err: any) {
      setError('QR Code tidak ditemukan atau tidak aktif');
    } finally {
      setLoading(false);
    }
  };

  const handleRedirect = (type: string, qr: QRCode) => {
    const config = OPTION_CONFIG[type as keyof typeof OPTION_CONFIG];
    if (!config) return;

    const params = new URLSearchParams();
    const unitName = qr.units?.name || '';
    
    params.append('qr', qr.code);
    params.append('unit_id', qr.unit_id);
    params.append('unit_name', encodeURIComponent(unitName));
    params.append('auto_fill', qr.auto_fill_unit !== false ? 'true' : 'false');
    
    window.location.href = `${config.path}?${params.toString()}`;
  };

  const handleOptionClick = (optionType: string) => {
    if (!qrData) return;
    
    const config = OPTION_CONFIG[optionType as keyof typeof OPTION_CONFIG];
    if (!config) return;

    const params = new URLSearchParams();
    const unitName = qrData.units?.name || '';
    
    params.append('qr', qrData.code);
    params.append('unit_id', qrData.unit_id);
    params.append('unit_name', encodeURIComponent(unitName));
    params.append('auto_fill', qrData.auto_fill_unit !== false ? 'true' : 'false');
    
    window.location.href = `${config.path}?${params.toString()}`;
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
          <button onClick={() => window.history.back()} className="w-full py-4 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-2xl font-bold text-lg shadow-lg">
            Kembali
          </button>
        </div>
      </div>
    );
  }

  if (qrData?.redirect_type && qrData.redirect_type !== 'selection') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 relative">
            <div className="absolute inset-0 rounded-full border-4 border-white/30"></div>
            <div className="absolute inset-0 rounded-full border-4 border-white border-t-transparent animate-spin"></div>
          </div>
          <p className="text-white text-xl font-medium">Mengalihkan...</p>
        </div>
      </div>
    );
  }

  const showOptions = qrData?.show_options || ['internal_ticket', 'external_ticket', 'survey'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 flex flex-col">
      {/* Decorative */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
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
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-6">
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
            {showOptions.map((optionKey) => {
              const option = OPTION_CONFIG[optionKey as keyof typeof OPTION_CONFIG];
              if (!option) return null;

              return (
                <button
                  key={optionKey}
                  onClick={() => handleOptionClick(optionKey)}
                  className={`w-full bg-gradient-to-r ${option.color} rounded-3xl p-5 flex items-center gap-4 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] active:scale-[0.98] transition-all`}
                >
                  <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center text-3xl">
                    {option.icon}
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-white font-bold text-lg">{option.title}</h3>
                    <p className="text-white/80 text-sm">{option.description}</p>
                  </div>
                  <svg className="w-6 h-6 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <p className="text-center text-white/70 text-sm pt-4">
            Unit akan otomatis terisi dari QR Code
          </p>
        </div>
      </main>

      {/* CSS */}
      <style>{`
        .pt-safe-top { padding-top: max(env(safe-area-inset-top), 1rem); }
      `}</style>
    </div>
  );
};

export default QRLanding;
