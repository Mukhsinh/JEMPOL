import React, { useState, useEffect } from 'react';
import { masterDataService } from '../../services/masterDataService';

const AITrustManagement: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    confidence_threshold: 85,
    auto_routing_enabled: true,
    auto_classification_enabled: true,
    manual_review_required: false,
    description: ''
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await masterDataService.getAITrustSettings();
      if (data.length > 0) {
        const setting = data[0];
        setFormData({
          confidence_threshold: setting.confidence_threshold || 85,
          auto_routing_enabled: setting.auto_routing_enabled || true,
          auto_classification_enabled: setting.auto_classification_enabled || true,
          manual_review_required: setting.manual_review_required || false,
          description: setting.description || ''
        });
      }
    } catch (err) {
      setError('Gagal memuat pengaturan AI');
      console.error('Error loading AI trust settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      
      await masterDataService.updateAITrustSetting('default', formData);
      
      setSuccessMessage('Pengaturan AI berhasil disimpan');
      setTimeout(() => setSuccessMessage(null), 3000);
      
      await loadSettings();
    } catch (err) {
      setError('Gagal menyimpan pengaturan AI');
      console.error('Error saving AI trust settings:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Pengaturan Kepercayaan AI</h2>
          <p className="text-slate-500 mt-1">Konfigurasi ambang batas dan pengaturan AI untuk klasifikasi otomatis.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-blue-600 disabled:bg-blue-400 text-white font-medium px-4 py-2 rounded-lg transition-colors text-sm shadow-sm shadow-blue-500/20"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Menyimpan...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">save</span>
                Simpan Pengaturan
              </>
            )}
          </button>
        </div>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-green-600">check_circle</span>
            <p className="text-green-600 font-medium">{successMessage}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-red-600">error</span>
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Main Settings Card */}
      <div className="bg-surface-light dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-6">
        <div className="space-y-8">
          {/* Confidence Threshold */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                <span className="material-symbols-outlined text-[20px]">psychology</span>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">Ambang Batas Kepercayaan</h3>
                <p className="text-sm text-slate-500">Minimum skor kepercayaan untuk klasifikasi otomatis</p>
              </div>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-6">
              <div className="mb-4 flex justify-between items-end">
                <span className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase">Ambang Batas</span>
                <span className="text-3xl font-bold text-primary">{formData.confidence_threshold}%</span>
              </div>
              
              <div className="relative h-8 mb-4">
                <input 
                  className="absolute w-full z-20 opacity-0 cursor-pointer h-full" 
                  max="100" 
                  min="0" 
                  type="range" 
                  value={formData.confidence_threshold}
                  onChange={(e) => handleInputChange('confidence_threshold', Number(e.target.value))}
                />
                <div className="absolute top-1/2 -translate-y-1/2 w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-400 to-primary rounded-full transition-all duration-300" 
                    style={{width: `${formData.confidence_threshold}%`}}
                  ></div>
                </div>
                <div 
                  className="absolute top-1/2 -translate-y-1/2 -ml-4 w-8 h-8 bg-white border-4 border-primary rounded-full shadow-lg z-10 pointer-events-none transition-all duration-300" 
                  style={{left: `${formData.confidence_threshold}%`}}
                ></div>
              </div>
              
              <div className="flex justify-between text-xs text-slate-400 font-mono mb-4">
                <span>0% (Longgar)</span>
                <span>100% (Ketat)</span>
              </div>
              
              <div className="text-sm text-slate-600 dark:text-slate-300">
                <p>Tiket dengan skor kepercayaan di bawah {formData.confidence_threshold}% akan memerlukan tinjauan manual sebelum diproses otomatis.</p>
              </div>
            </div>
          </div>

          {/* AI Features */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                <span className="material-symbols-outlined text-[20px]">smart_toy</span>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">Fitur AI</h3>
                <p className="text-sm text-slate-500">Aktifkan atau nonaktifkan fitur AI tertentu</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Auto Routing */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">route</span>
                    <div>
                      <h4 className="font-medium text-slate-900 dark:text-white">Routing Otomatis</h4>
                      <p className="text-xs text-slate-500">Arahkan tiket ke unit yang tepat</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={formData.auto_routing_enabled}
                      onChange={(e) => handleInputChange('auto_routing_enabled', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  AI akan secara otomatis mengarahkan tiket ke unit kerja yang paling sesuai berdasarkan konten.
                </p>
              </div>

              {/* Auto Classification */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">category</span>
                    <div>
                      <h4 className="font-medium text-slate-900 dark:text-white">Klasifikasi Otomatis</h4>
                      <p className="text-xs text-slate-500">Kategorikan tiket secara otomatis</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={formData.auto_classification_enabled}
                      onChange={(e) => handleInputChange('auto_classification_enabled', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  AI akan menganalisis dan mengkategorikan tiket berdasarkan jenis dan prioritas.
                </p>
              </div>

              {/* Manual Review Required */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">person_check</span>
                    <div>
                      <h4 className="font-medium text-slate-900 dark:text-white">Tinjauan Manual Wajib</h4>
                      <p className="text-xs text-slate-500">Semua hasil AI harus ditinjau</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={formData.manual_review_required}
                      onChange={(e) => handleInputChange('manual_review_required', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Semua keputusan AI akan memerlukan persetujuan manual sebelum diterapkan.
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                <span className="material-symbols-outlined text-[20px]">description</span>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">Catatan Konfigurasi</h3>
                <p className="text-sm text-slate-500">Tambahkan catatan tentang pengaturan ini</p>
              </div>
            </div>

            <textarea
              className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder-slate-400 focus:border-primary focus:ring-1 focus:ring-primary text-sm resize-none"
              rows={4}
              placeholder="Masukkan catatan atau deskripsi tentang konfigurasi AI ini..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Status Information */}
      <div className="bg-surface-light dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-6">
        <h3 className="font-bold text-slate-900 dark:text-white mb-4">Status Sistem AI</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">98.5%</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Akurasi Klasifikasi</div>
          </div>
          <div className="text-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">1,247</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Tiket Diproses Hari Ini</div>
          </div>
          <div className="text-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">23</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Menunggu Tinjauan</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AITrustManagement;
export { AITrustManagement };