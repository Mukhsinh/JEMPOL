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
        targetUrl = `/public/tiket-internal?${params.toString()}`;
        break;
      case 'external_ticket':
        targetUrl = `/public/tiket-eksternal?${params.toString()}`;
        break;
      case 'survey':
        targetUrl = `/public/survei?${params.toString()}`;
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
        targetUrl = `/public/tiket-internal?${params.toString()}`;
        break;
      case 'external_ticket':
        targetUrl = `/public/tiket-eksternal?${params.toString()}`;
        break;
      case 'survey':
        targetUrl = `/public/survei?${params.toString()}`;
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

  // Tampilkan pilihan jika tidak ada auto-redirect
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-2xl">local_hospital</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">Sistem Pengaduan Terpadu</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Layanan Publik Digital</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          {/* Unit Info Card */}
          {qrData?.units && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6 mb-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-3xl">business</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-primary uppercase tracking-wider">Unit Tujuan</span>
                    <span className="material-symbols-outlined text-green-500 text-sm">verified</span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                    {qrData.units.name}
                  </h2>
                  {qrData.units.description && (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {qrData.units.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Action Cards */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Pilih Layanan
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Silakan pilih jenis layanan yang ingin Anda akses
            </p>

            <div className="grid gap-4">
              {/* Tiket Eksternal - tampilkan jika ada di show_options */}
              {showOptions.includes('external_ticket') && (
                <button
                  onClick={() => handleManualRedirect('external_ticket')}
                  className="group flex items-center gap-4 p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-primary hover:bg-primary/5 transition-all text-left"
                >
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-orange-600 dark:text-orange-400 text-2xl">support_agent</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                      Buat Pengaduan / Laporan
                    </h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Sampaikan keluhan, saran, atau permintaan informasi
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-slate-400 group-hover:text-primary group-hover:translate-x-1 transition-all">
                    arrow_forward
                  </span>
                </button>
              )}

              {/* Survei - tampilkan jika ada di show_options */}
              {showOptions.includes('survey') && (
                <button
                  onClick={() => handleManualRedirect('survey')}
                  className="group flex items-center gap-4 p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-primary hover:bg-primary/5 transition-all text-left"
                >
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-2xl">rate_review</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                      Isi Survei Kepuasan
                    </h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Berikan penilaian terhadap layanan yang Anda terima
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-slate-400 group-hover:text-primary group-hover:translate-x-1 transition-all">
                    arrow_forward
                  </span>
                </button>
              )}

              {/* Tiket Internal - tampilkan jika ada di show_options */}
              {showOptions.includes('internal_ticket') && (
                <button
                  onClick={() => handleManualRedirect('internal_ticket')}
                  className="group flex items-center gap-4 p-4 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-primary hover:bg-primary/5 transition-all text-left opacity-75 hover:opacity-100"
                >
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-purple-600 dark:text-purple-400 text-2xl">assignment</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                      Tiket Internal (Staff)
                    </h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Khusus untuk petugas internal rumah sakit
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-slate-400 group-hover:text-primary group-hover:translate-x-1 transition-all">
                    arrow_forward
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Footer Info */}
          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Unit akan otomatis terisi berdasarkan lokasi QR Code yang Anda scan
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 py-4">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm text-slate-500 dark:text-slate-400">
          © 2024 Sistem Pengaduan Terpadu. Hak Cipta Dilindungi.
        </div>
      </footer>
    </div>
  );
};

export default QRScanLanding;
