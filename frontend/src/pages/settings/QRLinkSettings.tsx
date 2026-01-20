import React, { useState, useEffect } from 'react';
import { qrCodeService, QRCode, CreateQRCodeData } from '../../services/qrCodeService';
import unitService from '../../services/unitService';

interface Unit {
  id: string;
  name: string;
  code: string;
  description?: string;
  unit_type_id?: string;
  is_active: boolean;
}

interface QRCodeWithAnalytics extends QRCode {
  analytics?: {
    scans_30d: number;
    tickets_30d: number;
    trend: number[];
  };
}

interface CreateQRCodeDataExtended extends CreateQRCodeData {
  redirect_type?: 'selection' | 'internal_ticket' | 'external_ticket' | 'survey';
  auto_fill_unit?: boolean;
  show_options?: string[];
}

const REDIRECT_OPTIONS = [
  { 
    value: 'selection', 
    label: 'Tampilkan Pilihan', 
    icon: 'list_alt', 
    description: 'Pengguna memilih jenis form (Internal/Eksternal/Survei)',
    color: 'blue'
  },
  { 
    value: 'internal_ticket', 
    label: 'Form Tiket Internal', 
    icon: 'assignment', 
    description: 'Langsung ke form tiket internal tanpa login',
    color: 'green'
  },
  { 
    value: 'external_ticket', 
    label: 'Form Tiket Eksternal', 
    icon: 'description', 
    description: 'Langsung ke form tiket eksternal tanpa login',
    color: 'purple'
  },
  { 
    value: 'survey', 
    label: 'Form Survei', 
    icon: 'rate_review', 
    description: 'Langsung ke form survei kepuasan tanpa login',
    color: 'orange'
  }
];

const QRLinkSettings: React.FC = () => {
  const [qrCodes, setQrCodes] = useState<QRCodeWithAnalytics[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingQR, setEditingQR] = useState<QRCodeWithAnalytics | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateQRCodeDataExtended>({
    unit_id: '',
    name: '',
    description: '',
    redirect_type: 'selection',
    auto_fill_unit: true,
    show_options: ['internal_ticket', 'external_ticket', 'survey']
  });

  useEffect(() => {
    console.log('🎯 QRLinkSettings component mounted');
    loadData();
  }, []);

  // Separate effect for search
  useEffect(() => {
    if (searchTerm) {
      const timer = setTimeout(() => {
        loadData();
      }, 500); // Debounce 500ms
      return () => clearTimeout(timer);
    }
  }, [searchTerm]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Loading QR Link Settings data...');
      console.log('API Base URL:', import.meta.env.VITE_API_URL || 'http://localhost:3001');

      // Load units
      try {
        console.log('📍 Fetching units...');
        const unitsResponse = await unitService.getUnits();
        console.log('✅ Units response:', unitsResponse);
        
        if (unitsResponse && unitsResponse.units) {
          setUnits(unitsResponse.units || []);
          console.log(`✅ Loaded ${unitsResponse.units.length} units`);
        } else {
          console.warn('⚠️ Units response tidak sesuai format:', unitsResponse);
          setUnits([]);
        }
      } catch (unitError: any) {
        console.error('❌ Error loading units:', unitError);
        console.error('Unit error details:', {
          message: unitError.message,
          response: unitError.response?.data,
          status: unitError.response?.status
        });
        setError('Gagal memuat data unit. ' + (unitError.message || ''));
        setUnits([]);
      }

      // Load QR codes
      try {
        console.log('📱 Fetching QR codes...');
        const params: any = {
          page: 1,
          limit: 100,
          include_analytics: true
        };

        if (searchTerm) {
          params.search = searchTerm;
          console.log('🔍 Search term:', searchTerm);
        }

        const response = await qrCodeService.getQRCodes(params);
        console.log('✅ QR Codes response:', response);
        
        if (response && response.qr_codes) {
          setQrCodes(response.qr_codes || []);
          console.log(`✅ Loaded ${response.qr_codes.length} QR codes`);
        } else {
          console.warn('⚠️ QR codes response tidak sesuai format:', response);
          setQrCodes([]);
        }
      } catch (qrError: any) {
        console.error('❌ Error loading QR codes:', qrError);
        console.error('QR error details:', {
          message: qrError.message,
          response: qrError.response?.data,
          status: qrError.response?.status
        });
        // Tidak set error di sini karena QR codes kosong adalah valid
        setQrCodes([]);
      }
    } catch (error: any) {
      console.error('❌ Error loading data:', error);
      console.error('Error stack:', error.stack);
      setError('Gagal memuat data. Silakan refresh halaman.');
    } finally {
      setLoading(false);
      console.log('✅ Loading complete');
      console.log('Final state:', {
        units: units.length,
        qrCodes: qrCodes.length,
        loading: false,
        error: error
      });
    }
  };

  const resetForm = () => {
    setFormData({
      unit_id: '',
      name: '',
      description: '',
      redirect_type: 'selection',
      auto_fill_unit: true,
      show_options: ['internal_ticket', 'external_ticket', 'survey']
    });
    setEditingQR(null);
  };

  const handleCreateQRCode = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingQR) {
        await qrCodeService.updateQRCode(editingQR.id, {
          name: formData.name,
          description: formData.description,
          redirect_type: formData.redirect_type,
          auto_fill_unit: formData.auto_fill_unit,
          show_options: formData.show_options
        });
      } else {
        await qrCodeService.createQRCode(formData);
      }
      setShowModal(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error saving QR code:', error);
      alert('Gagal menyimpan QR Code. Silakan coba lagi.');
    }
  };

  const handleEditQRCode = (qrCode: QRCodeWithAnalytics) => {
    setEditingQR(qrCode);
    setFormData({
      unit_id: qrCode.unit_id,
      name: qrCode.name,
      description: qrCode.description || '',
      redirect_type: qrCode.redirect_type || 'selection',
      auto_fill_unit: qrCode.auto_fill_unit !== false,
      show_options: qrCode.show_options || ['internal_ticket', 'external_ticket', 'survey']
    });
    setShowModal(true);
  };

  const toggleQRStatus = async (id: string, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;
      const statusText = newStatus ? 'mengaktifkan' : 'menonaktifkan';

      if (confirm(`Apakah Anda yakin ingin ${statusText} QR Code ini?`)) {
        await qrCodeService.updateQRCode(id, { is_active: newStatus });
        loadData();
      }
    } catch (error) {
      console.error('Error updating QR status:', error);
      alert('Gagal mengubah status QR Code.');
    }
  };

  const handleDeleteQRCode = async (id: string, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus QR Code "${name}"?`)) {
      return;
    }

    try {
      await qrCodeService.deleteQRCode(id);
      alert('QR Code berhasil dihapus');
      loadData();
    } catch (error: any) {
      console.error('Error deleting QR code:', error);
      alert(error.response?.data?.error || 'Gagal menghapus QR Code');
    }
  };

  const copyQRLink = (code: string, redirectType?: string, unitId?: string, unitName?: string, autoFillUnit?: boolean) => {
    const url = qrCodeService.generateQRUrl(code, redirectType, unitId, unitName, autoFillUnit);
    navigator.clipboard.writeText(url);
    
    const formType = redirectType === 'internal_ticket' ? 'Tiket Internal' :
                     redirectType === 'external_ticket' ? 'Tiket Eksternal' :
                     redirectType === 'survey' ? 'Survei' : 'Pilihan Menu';
    alert(`Link QR Code berhasil disalin!\n\nForm: ${formType}\nURL: ${url}`);
  };

  const getRedirectOption = (redirectType?: string) => {
    return REDIRECT_OPTIONS.find(o => o.value === redirectType) || REDIRECT_OPTIONS[0];
  };

  return (
    <div className="space-y-6">
      {/* Debug Info - Hapus setelah testing */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-xs">
        <div className="flex items-center gap-2 mb-2">
          <span className="material-symbols-outlined text-sm text-blue-600">info</span>
          <span className="font-semibold text-blue-900 dark:text-blue-200">Debug Info</span>
        </div>
        <div className="space-y-1 text-blue-700 dark:text-blue-300">
          <div>Loading: {loading ? '✅ Ya' : '❌ Tidak'}</div>
          <div>QR Codes: {qrCodes.length} item</div>
          <div>Units: {units.length} item</div>
          <div>Error: {error || '❌ Tidak ada'}</div>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Pengaturan QR Link
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Kelola link QR Code untuk setiap unit dengan pengaturan form yang dituju
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-sm transition-all"
        >
          <span className="material-symbols-outlined text-xl">add</span>
          Buat QR Link Baru
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-red-600 dark:text-red-400">error</span>
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 dark:text-red-200 mb-1">Terjadi Kesalahan</h3>
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              <button
                onClick={() => loadData()}
                className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline"
              >
                Coba Lagi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="material-symbols-outlined text-slate-400">search</span>
        </div>
        <input
          className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Cari berdasarkan nama unit atau kode..."
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* QR Codes Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {qrCodes.map((qrCode) => {
            const option = getRedirectOption(qrCode.redirect_type);
            return (
              <div
                key={qrCode.id}
                className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      {qrCode.name}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {qrCode.units?.name}
                    </p>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    qrCode.is_active 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                  }`}>
                    {qrCode.is_active ? 'Aktif' : 'Nonaktif'}
                  </div>
                </div>

                {/* QR Code Preview */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="size-16 bg-white p-1 rounded border border-slate-200 shrink-0">
                    <img
                      alt={`QR Code ${qrCode.name}`}
                      className="w-full h-full object-contain"
                      src={qrCodeService.generateQRImageUrl(
                        qrCode.code, 
                        64, 
                        qrCode.redirect_type, 
                        qrCode.unit_id, 
                        qrCode.units?.name, 
                        qrCode.auto_fill_unit
                      )}
                    />
                  </div>
                  <div className="flex-1">
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                      option.color === 'blue' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' :
                      option.color === 'green' ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' :
                      option.color === 'purple' ? 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400' :
                      'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400'
                    }`}>
                      <span className="material-symbols-outlined text-sm">{option.icon}</span>
                      {option.label}
                    </div>
                    {qrCode.auto_fill_unit !== false && (
                      <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">check_circle</span>
                        Auto-fill unit
                      </div>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 mb-3 text-sm">
                  <div>
                    <span className="text-slate-500">Scan:</span>
                    <span className="font-semibold text-slate-900 dark:text-white ml-1">
                      {qrCode.analytics?.scans_30d || qrCode.usage_count || 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">Tiket:</span>
                    <span className="font-semibold text-slate-900 dark:text-white ml-1">
                      {qrCode.analytics?.tickets_30d || 0}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
                  <button
                    onClick={() => copyQRLink(qrCode.code, qrCode.redirect_type, qrCode.unit_id, qrCode.units?.name, qrCode.auto_fill_unit)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-sm text-primary hover:bg-blue-50 dark:hover:bg-slate-700 rounded transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">content_copy</span>
                    Salin Link
                  </button>
                  <button
                    onClick={() => handleEditQRCode(qrCode)}
                    className="p-1.5 text-slate-400 hover:text-primary hover:bg-blue-50 dark:hover:bg-slate-700 rounded transition-colors"
                    title="Edit"
                  >
                    <span className="material-symbols-outlined text-lg">edit</span>
                  </button>
                  <button
                    onClick={() => toggleQRStatus(qrCode.id, qrCode.is_active)}
                    className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-slate-700 rounded transition-colors"
                    title={qrCode.is_active ? "Nonaktifkan" : "Aktifkan"}
                  >
                    <span className="material-symbols-outlined text-lg">
                      {qrCode.is_active ? 'toggle_on' : 'toggle_off'}
                    </span>
                  </button>
                  <button
                    onClick={() => handleDeleteQRCode(qrCode.id, qrCode.name)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-700 rounded transition-colors"
                    title="Hapus"
                  >
                    <span className="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {qrCodes.length === 0 && !loading && (
        <div className="text-center py-12">
          <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-600 mb-4">
            qr_code_2
          </span>
          <p className="text-slate-500 dark:text-slate-400">
            Belum ada QR Link. Klik tombol "Buat QR Link Baru" untuk memulai.
          </p>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {editingQR ? 'Edit QR Link' : 'Buat QR Link Baru'}
                </h3>
                <button
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <form onSubmit={handleCreateQRCode} className="space-y-4">
                {/* Unit Selection */}
                {!editingQR && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Unit <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.unit_id}
                      onChange={(e) => setFormData({ ...formData, unit_id: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    >
                      <option value="">Pilih Unit</option>
                      {units.filter(unit => unit.is_active).map((unit) => (
                        <option key={unit.id} value={unit.id}>
                          {unit.name} ({unit.code})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* QR Code Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Nama QR Link <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    placeholder="Contoh: QR Loket Pendaftaran"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Deskripsi
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    rows={2}
                    placeholder="Deskripsi lokasi atau tujuan QR Code..."
                  />
                </div>

                {/* Redirect Type */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                    Arahkan ke <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-2">
                    {REDIRECT_OPTIONS.map((option) => (
                      <label
                        key={option.value}
                        className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                          formData.redirect_type === option.value
                            ? 'border-primary bg-primary/5 dark:bg-primary/10'
                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                      >
                        <input
                          type="radio"
                          name="redirect_type"
                          value={option.value}
                          checked={formData.redirect_type === option.value}
                          onChange={(e) => setFormData({ ...formData, redirect_type: e.target.value as any })}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="material-symbols-outlined text-lg">{option.icon}</span>
                            <span className="font-medium text-slate-900 dark:text-white">
                              {option.label}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {option.description}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Auto Fill Unit */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="auto_fill_unit"
                    checked={formData.auto_fill_unit}
                    onChange={(e) => setFormData({ ...formData, auto_fill_unit: e.target.checked })}
                    className="rounded border-slate-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="auto_fill_unit" className="text-sm text-slate-700 dark:text-slate-300">
                    Otomatis isi unit saat scan QR Code
                  </label>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); resetForm(); }}
                    className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary hover:bg-blue-600 text-white rounded-lg transition-colors"
                  >
                    {editingQR ? 'Simpan Perubahan' : 'Buat QR Link'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRLinkSettings;
