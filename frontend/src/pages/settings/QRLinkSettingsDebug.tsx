import React, { useState, useEffect } from 'react';
import { qrCodeService } from '../../services/qrCodeService';
import unitService from '../../services/unitService';

const QRLinkSettingsDebug: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [qrCodes, setQrCodes] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    console.log(message);
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    addLog('🎯 Component mounted');
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      addLog('🔄 Starting data load...');

      // Load units
      try {
        addLog('📦 Loading units...');
        const unitsResponse = await unitService.getUnits();
        addLog(`✅ Units loaded: ${unitsResponse.units?.length || 0} items`);
        setUnits(unitsResponse.units || []);
      } catch (unitError: any) {
        addLog(`❌ Units error: ${unitError.message}`);
        setError('Gagal memuat units: ' + unitError.message);
      }

      // Load QR codes
      try {
        addLog('📱 Loading QR codes...');
        const response = await qrCodeService.getQRCodes({
          page: 1,
          limit: 100,
          include_analytics: true
        });
        addLog(`✅ QR codes loaded: ${response.qr_codes?.length || 0} items`);
        setQrCodes(response.qr_codes || []);
      } catch (qrError: any) {
        addLog(`❌ QR codes error: ${qrError.message}`);
        // QR codes kosong adalah valid, jadi tidak set error
        setQrCodes([]);
      }

      addLog('✅ Data load complete');
    } catch (error: any) {
      addLog(`❌ Fatal error: ${error.message}`);
      setError('Terjadi kesalahan: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          🔍 QR Link Settings - Debug Mode
        </h1>

        {/* Status */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-lg">Status:</span>
            {loading ? (
              <span className="text-blue-600">⏳ Loading...</span>
            ) : error ? (
              <span className="text-red-600">❌ Error</span>
            ) : (
              <span className="text-green-600">✅ Ready</span>
            )}
          </div>
          
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-3 text-red-700 dark:text-red-300">
              {error}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="text-sm text-blue-600 dark:text-blue-400 mb-1">Units</div>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-200">
              {units.length}
            </div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <div className="text-sm text-green-600 dark:text-green-400 mb-1">QR Codes</div>
            <div className="text-2xl font-bold text-green-900 dark:text-green-200">
              {qrCodes.length}
            </div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
            <div className="text-sm text-purple-600 dark:text-purple-400 mb-1">Logs</div>
            <div className="text-2xl font-bold text-purple-900 dark:text-purple-200">
              {logs.length}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={loadData}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            🔄 Reload Data
          </button>
          <button
            onClick={() => setLogs([])}
            className="px-4 py-2 bg-slate-600 text-white rounded hover:bg-slate-700"
          >
            🗑️ Clear Logs
          </button>
        </div>

        {/* Logs */}
        <div className="mb-6">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
            📋 Logs ({logs.length})
          </h3>
          <div className="bg-slate-900 text-green-400 rounded p-4 max-h-60 overflow-y-auto font-mono text-sm">
            {logs.length === 0 ? (
              <div className="text-slate-500">No logs yet...</div>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="mb-1">{log}</div>
              ))
            )}
          </div>
        </div>

        {/* Units Data */}
        {units.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
              📦 Units Data
            </h3>
            <div className="bg-slate-50 dark:bg-slate-900 rounded p-4 max-h-60 overflow-y-auto">
              <pre className="text-xs">{JSON.stringify(units, null, 2)}</pre>
            </div>
          </div>
        )}

        {/* QR Codes Data */}
        {qrCodes.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
              📱 QR Codes Data
            </h3>
            <div className="bg-slate-50 dark:bg-slate-900 rounded p-4 max-h-60 overflow-y-auto">
              <pre className="text-xs">{JSON.stringify(qrCodes, null, 2)}</pre>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && qrCodes.length === 0 && (
          <div className="text-center py-8">
            <span className="text-6xl mb-4 block">📱</span>
            <p className="text-slate-600 dark:text-slate-400">
              Belum ada QR Code. Silakan buat QR Code baru.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRLinkSettingsDebug;
