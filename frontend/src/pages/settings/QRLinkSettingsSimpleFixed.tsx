import React, { useState, useEffect } from 'react';

const QRLinkSettingsSimpleFixed: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [qrCodes, setQrCodes] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadQRCodes();
  }, []);

  const loadQRCodes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Fetching QR codes...');
      
      const response = await fetch('http://localhost:3004/api/qr-codes');
      const data = await response.json();
      
      console.log('✅ Response:', data);
      
      if (response.ok) {
        setQrCodes(data.qr_codes || []);
      } else {
        setError('Gagal memuat data: ' + (data.error || 'Unknown error'));
      }
    } catch (err: any) {
      console.error('❌ Error:', err);
      setError('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Pengaturan QR Link - Simple Fixed
        </h1>

        {/* Status */}
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded">
          <div className="text-sm space-y-1">
            <div>Loading: {loading ? 'Ya' : 'Tidak'}</div>
            <div>QR Codes: {qrCodes.length}</div>
            <div>Error: {error || 'Tidak ada'}</div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-slate-600">Memuat data...</p>
          </div>
        )}

        {/* QR Codes List */}
        {!loading && qrCodes.length > 0 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-lg">Daftar QR Codes ({qrCodes.length})</h2>
            {qrCodes.map((qr, index) => (
              <div key={qr.id || index} className="border border-slate-200 dark:border-slate-700 rounded p-4">
                <div className="font-semibold text-slate-900 dark:text-white">{qr.name}</div>
                <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Code: {qr.code}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Unit: {qr.units?.name || 'N/A'}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Type: {qr.redirect_type || 'selection'}
                </div>
                <div className="mt-2">
                  <span className={`inline-block px-2 py-1 text-xs rounded ${
                    qr.is_active 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {qr.is_active ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && qrCodes.length === 0 && !error && (
          <div className="text-center py-8">
            <p className="text-slate-600">Belum ada QR Code</p>
          </div>
        )}

        {/* Reload Button */}
        <div className="mt-6">
          <button
            onClick={loadQRCodes}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            🔄 Reload Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRLinkSettingsSimpleFixed;
