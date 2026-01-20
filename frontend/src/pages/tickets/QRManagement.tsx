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
  redirect_type?: 'selection' | 'internal_ticket' | 'external_ticket' | 'survey';
  auto_fill_unit?: boolean;
  show_options?: string[];
}

interface CreateQRCodeDataExtended extends CreateQRCodeData {
  redirect_type?: 'selection' | 'internal_ticket' | 'external_ticket' | 'survey';
  auto_fill_unit?: boolean;
  show_options?: string[];
}

const REDIRECT_OPTIONS = [
  { value: 'selection', label: 'Tampilkan Pilihan', icon: 'list_alt', description: 'Pengguna memilih jenis form (Internal/Eksternal/Survei)' },
  { value: 'internal_ticket', label: 'Form Tiket Internal', icon: 'assignment', description: 'Langsung ke form tiket internal tanpa login' },
  { value: 'external_ticket', label: 'Form Tiket Eksternal', icon: 'description', description: 'Langsung ke form tiket eksternal tanpa login' },
  { value: 'survey', label: 'Form Survei', icon: 'rate_review', description: 'Langsung ke form survei kepuasan tanpa login' }
];

const SHOW_OPTIONS_LIST = [
  { value: 'internal_ticket', label: 'Tiket Internal', icon: 'assignment' },
  { value: 'external_ticket', label: 'Tiket Eksternal', icon: 'description' },
  { value: 'survey', label: 'Survei Kepuasan', icon: 'rate_review' }
];

const QRManagement: React.FC = () => {
  const [qrCodes, setQrCodes] = useState<QRCodeWithAnalytics[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingQR, setEditingQR] = useState<QRCodeWithAnalytics | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState<'list' | 'qr-display' | 'qr-forms'>('list');
  const [selectedQRForDisplay, setSelectedQRForDisplay] = useState<QRCodeWithAnalytics | null>(null);
  const [formData, setFormData] = useState<CreateQRCodeDataExtended>({
    unit_id: '',
    name: '',
    description: '',
    redirect_type: 'selection',
    auto_fill_unit: true,
    show_options: ['internal_ticket', 'external_ticket', 'survey']
  });

  useEffect(() => {
    loadData();
  }, [currentPage, searchTerm, statusFilter]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load units for dropdown
      const unitsResponse = await unitService.getUnits();
      setUnits(unitsResponse.units || []);

      // Load QR codes with filters
      const params: any = {
        page: currentPage,
        limit: 10,
        include_analytics: true
      };

      if (searchTerm) {
        params.search = searchTerm;
      }

      if (statusFilter !== 'all') {
        params.is_active = statusFilter === 'active';
      }

      const response = await qrCodeService.getQRCodes(params);
      setQrCodes(response.qr_codes || []);
      setTotalPages(response.pagination?.pages || 1);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
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
        // Update existing QR code
        await qrCodeService.updateQRCode(editingQR.id, {
          name: formData.name,
          description: formData.description,
          redirect_type: formData.redirect_type,
          auto_fill_unit: formData.auto_fill_unit,
          show_options: formData.show_options
        });
      } else {
        // Create new QR code
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
        alert(`QR Code berhasil ${newStatus ? 'diaktifkan' : 'dinonaktifkan'}.`);
      }
    } catch (error) {
      console.error('Error updating QR status:', error);
      alert('Gagal mengubah status QR Code.');
    }
  };

  const handleDeleteQRCode = async (id: string, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus QR Code "${name}"? Tindakan ini tidak dapat dibatalkan.`)) {
      return;
    }

    try {
      await qrCodeService.deleteQRCode(id);
      alert('QR Code berhasil dihapus');
      loadData();
    } catch (error: any) {
      console.error('Error deleting QR code:', error);
      const errorMessage = error.response?.data?.error || 'Gagal menghapus QR Code';
      alert(errorMessage);
    }
  };

  const handleShowOptionsChange = (option: string) => {
    const currentOptions = formData.show_options || [];
    if (currentOptions.includes(option)) {
      setFormData({
        ...formData,
        show_options: currentOptions.filter(o => o !== option)
      });
    } else {
      setFormData({
        ...formData,
        show_options: [...currentOptions, option]
      });
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border border-green-200 dark:border-green-800/50">
          <span className="size-1.5 rounded-full bg-green-500"></span>
          Aktif
        </div>
      );
    } else {
      return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
          <span className="size-1.5 rounded-full bg-slate-400"></span>
          Tidak Aktif
        </div>
      );
    }
  };

  const getRedirectTypeBadge = (redirectType?: string, qrCode?: QRCodeWithAnalytics) => {
    const option = REDIRECT_OPTIONS.find(o => o.value === redirectType) || REDIRECT_OPTIONS[0];
    
    // Generate direct link berdasarkan redirect_type - LANGSUNG KE FORM TANPA LOGIN
    const getDirectLink = () => {
      if (!qrCode) return '';
      
      // GUNAKAN qrCodeService.generateQRUrl untuk konsistensi
      return qrCodeService.generateQRUrl(
        qrCode.code,
        redirectType,
        qrCode.unit_id,
        qrCode.units?.name,
        qrCode.auto_fill_unit
      );
    };
    
    const directLink = getDirectLink();
    const linkLabel = redirectType === 'internal_ticket' ? 'Form Tiket Internal' :
                      redirectType === 'external_ticket' ? 'Form Tiket Eksternal' :
                      redirectType === 'survey' ? 'Form Survei' : 'Pilihan Menu';
    
    return (
      <div className="space-y-1">
        <div className="flex flex-col gap-1">
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
            <span className="material-symbols-outlined text-sm">{option.icon}</span>
            {linkLabel}
          </div>
          <a
            href={directLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              e.stopPropagation();
              console.log('🔗 Opening direct link:', directLink);
            }}
            className="text-xs text-primary hover:text-blue-700 dark:hover:text-blue-300 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-xs">open_in_new</span>
            Buka Link
          </a>
        </div>
        {qrCode?.auto_fill_unit !== false && (
          <div className="text-xs text-slate-400 flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">check_circle</span>
            Auto-fill unit
          </div>
        )}
      </div>
    );
  };

  const generateSparkline = (trend: number[] = []) => {
    const maxValue = Math.max(...trend, 1);
    return trend.map((value, index) => (
      <div
        key={index}
        className="w-1 bg-green-500 dark:bg-green-600 rounded-t-sm"
        style={{ height: `${(value / maxValue) * 100}%` }}
      />
    ));
  };

  const copyQRLink = (code: string, redirectType?: string, unitId?: string, unitName?: string, autoFillUnit?: boolean) => {
    // Generate URL langsung ke form tanpa login dan tanpa sidebar
    const url = qrCodeService.generateQRUrl(code, redirectType, unitId, unitName, autoFillUnit);
    navigator.clipboard.writeText(url);
    
    // Tampilkan notifikasi dengan URL yang disalin
    const formType = redirectType === 'internal_ticket' ? 'Tiket Internal' :
                     redirectType === 'external_ticket' ? 'Tiket Eksternal' :
                     redirectType === 'survey' ? 'Survei' : 'Pilihan Menu';
    alert(`Link QR Code berhasil disalin!\n\nForm: ${formType}\nURL: ${url}\n\nLink ini langsung mengarah ke form tanpa perlu login.`);
  };

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex flex-col overflow-x-hidden transition-colors duration-200">
      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-8">

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
              Manajemen QR Code Unit
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-base leading-relaxed">
              Kelola QR Code untuk akses langsung ke form input. QR Code yang dibuat akan langsung mengarahkan pengguna ke form yang dipilih <strong>tanpa perlu login dan tanpa sidebar navigasi</strong>. Cocok untuk dipasang di lokasi fisik unit departemen.
            </p>
          </div>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="flex items-center justify-center gap-2 bg-primary hover:bg-blue-600 text-white px-5 py-2.5 rounded-lg shadow-sm transition-all active:scale-95 font-semibold text-sm whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-xl">qr_code_2_add</span>
            Buat QR Code Baru
          </button>
        </div>

        {/* Tabs Navigation */}
        <div className="mb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('list')}
              className={`px-6 py-3 font-semibold text-sm transition-all relative ${
                activeTab === 'list'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">list</span>
                Daftar QR Code
              </span>
            </button>
            <button
              onClick={() => setActiveTab('qr-display')}
              className={`px-6 py-3 font-semibold text-sm transition-all relative ${
                activeTab === 'qr-display'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">qr_code_2</span>
                Tampilan QR Code
              </span>
            </button>
            <button
              onClick={() => setActiveTab('qr-forms')}
              className={`px-6 py-3 font-semibold text-sm transition-all relative ${
                activeTab === 'qr-forms'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">description</span>
                QR Code Form
              </span>
            </button>
          </div>
        </div>

        {/* Tab Content: List View */}
        {activeTab === 'list' && (
          <>
            {/* Toolbar & Filters */}
            <div className="bg-surface-light dark:bg-surface-dark p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm mb-6 flex flex-col lg:flex-row gap-4 justify-between items-center">
          {/* Search */}
          <div className="relative w-full lg:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-slate-400">search</span>
            </div>
            <input
              className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg leading-5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
              placeholder="Cari berdasarkan Nama Unit, ID atau Lokasi..."
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Action Tools */}
          <div className="flex w-full lg:w-auto items-center gap-3 overflow-x-auto pb-1 lg:pb-0">
            <div className="flex items-center gap-2">
              <label className="hidden sm:block text-sm font-medium text-slate-500 dark:text-slate-400 mr-1">
                Status:
              </label>
              <select
                className="form-select block w-full pl-3 pr-10 py-2 text-base border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-lg bg-white dark:bg-slate-800 dark:text-white"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Semua Status</option>
                <option value="active">Aktif</option>
                <option value="inactive">Tidak Aktif</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data Grid Header */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 mb-2">
          <div className="col-span-3">Detail Unit</div>
          <div className="col-span-2">QR Code</div>
          <div className="col-span-2">Redirect</div>
          <div className="col-span-2">Performa</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-2 text-right">Aksi</div>
        </div>

        {/* Data Grid Content */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-3">
            {qrCodes.map((qrCode) => (
              <div
                key={qrCode.id}
                className="group relative bg-surface-light dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-primary/30 transition-all p-4 md:p-0 md:grid md:grid-cols-12 md:gap-4 md:items-center"
              >
                {/* Mobile Header */}
                <div className="md:hidden flex justify-between items-start mb-4">
                  <div className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                    Unit #{qrCode.units?.code || qrCode.code}
                  </div>
                  {getStatusBadge(qrCode.is_active)}
                </div>

                {/* Unit Details */}
                <div className="col-span-3 md:pl-6 md:py-4">
                  <div className="flex items-center gap-4">
                    <div className="hidden sm:flex size-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 items-center justify-center shrink-0">
                      <span className="material-symbols-outlined">business</span>
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                        {qrCode.name}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {qrCode.units?.name || 'Unit tidak ditemukan'}
                      </p>
                      <span className="md:hidden text-xs text-slate-400 mt-1 block">
                        ID: {qrCode.code}
                      </span>
                    </div>
                  </div>
                </div>

                {/* QR Preview */}
                <div className="col-span-2 md:py-4 flex items-center gap-3">
                  <div className="size-12 bg-white p-1 rounded border border-slate-200 shrink-0 relative">
                    <img
                      alt={`QR Code untuk ${qrCode.name}`}
                      className="w-full h-full object-contain opacity-80 group-hover:opacity-100 transition-opacity"
                      src={qrCodeService.generateQRImageUrl(
                        qrCode.code, 
                        128, 
                        qrCode.redirect_type, 
                        qrCode.unit_id, 
                        qrCode.units?.name, 
                        qrCode.auto_fill_unit
                      )}
                      onError={(e) => {
                        // Fallback jika gambar gagal load
                        const img = e.target as HTMLImageElement;
                        if (!img.src.includes('qrserver.com')) {
                          img.src = `https://api.qrserver.com/v1/create-qr-code/?size=128x128&data=${encodeURIComponent(
                            qrCodeService.generateQRUrl(qrCode.code, qrCode.redirect_type, qrCode.unit_id, qrCode.units?.name, qrCode.auto_fill_unit)
                          )}&ecc=H`;
                        }
                      }}
                      loading="lazy"
                    />
                  </div>
                  <div className="flex flex-col">
                    <button
                      onClick={() => window.open(qrCodeService.generateQRImageUrl(
                        qrCode.code, 
                        512, 
                        qrCode.redirect_type, 
                        qrCode.unit_id, 
                        qrCode.units?.name, 
                        qrCode.auto_fill_unit
                      ), '_blank')}
                      className="text-xs font-medium text-primary hover:underline text-left"
                    >
                      Lihat
                    </button>
                    <button
                      onClick={() => copyQRLink(qrCode.code, qrCode.redirect_type, qrCode.unit_id, qrCode.units?.name, qrCode.auto_fill_unit)}
                      className="text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-left flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[14px]">content_copy</span>
                      Salin
                    </button>
                  </div>
                </div>

                {/* Redirect Type */}
                <div className="col-span-2 md:py-4">
                  {getRedirectTypeBadge(qrCode.redirect_type, qrCode)}
                </div>

                {/* Stats */}
                <div className="col-span-2 md:py-4 mt-4 md:mt-0">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wide">Scan</p>
                      <p className="text-lg font-bold text-slate-900 dark:text-white">
                        {qrCode.analytics?.scans_30d || qrCode.usage_count || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wide">Tiket</p>
                      <p className="text-lg font-bold text-slate-900 dark:text-white">
                        {qrCode.analytics?.tickets_30d || 0}
                      </p>
                    </div>
                    {/* Sparkline visual */}
                    <div className="hidden lg:flex items-end gap-0.5 h-8 w-12 pb-1">
                      {generateSparkline(qrCode.analytics?.trend)}
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="hidden md:flex col-span-1 md:py-4 items-center">
                  {getStatusBadge(qrCode.is_active)}
                </div>

                {/* Actions */}
                <div className="col-span-2 md:pr-6 md:py-4 flex justify-end items-center gap-1 mt-4 md:mt-0 border-t border-slate-100 dark:border-slate-800 md:border-0 pt-3 md:pt-0">
                  <button
                    onClick={() => handleEditQRCode(qrCode)}
                    className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    title="Edit Pengaturan"
                  >
                    <span className="material-symbols-outlined">settings</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedQRForDisplay(qrCode);
                      setActiveTab('qr-display');
                    }}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    title="Tampilkan QR Code"
                  >
                    <span className="material-symbols-outlined">qr_code_2</span>
                  </button>
                  <button
                    onClick={() => toggleQRStatus(qrCode.id, qrCode.is_active)}
                    className={`p-2 rounded-lg transition-colors ${qrCode.is_active
                        ? 'text-orange-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-slate-700'
                        : 'text-green-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-slate-700'
                      }`}
                    title={qrCode.is_active ? "Nonaktifkan" : "Aktifkan"}
                  >
                    <span className="material-symbols-outlined">
                      {qrCode.is_active ? 'toggle_on' : 'toggle_off'}
                    </span>
                  </button>
                  <button
                    onClick={() => handleDeleteQRCode(qrCode.id, qrCode.name)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    title="Hapus"
                  >
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 mt-6 pt-4">
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Menampilkan <span className="font-medium text-slate-900 dark:text-white">{((currentPage - 1) * 10) + 1}</span> sampai{' '}
            <span className="font-medium text-slate-900 dark:text-white">{Math.min(currentPage * 10, qrCodes.length)}</span> dari{' '}
            <span className="font-medium text-slate-900 dark:text-white">{qrCodes.length}</span> unit
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sebelumnya
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Selanjutnya
            </button>
          </div>
        </div>
          </>
        )}

        {/* Tab Content: QR Display View */}
        {activeTab === 'qr-display' && (
          <div className="space-y-6">
            {/* QR Code Selection */}
            <div className="bg-surface-light dark:bg-surface-dark p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                Pilih QR Code untuk Ditampilkan
              </label>
              <select
                value={selectedQRForDisplay?.id || ''}
                onChange={(e) => {
                  const selected = qrCodes.find(qr => qr.id === e.target.value);
                  setSelectedQRForDisplay(selected || null);
                }}
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              >
                <option value="">-- Pilih QR Code --</option>
                {qrCodes.filter(qr => qr.is_active).map((qr) => (
                  <option key={qr.id} value={qr.id}>
                    {qr.name} - {qr.units?.name || 'Unit tidak ditemukan'}
                  </option>
                ))}
              </select>
            </div>

            {/* QR Code Display */}
            {selectedQRForDisplay && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 max-w-2xl mx-auto">
                {/* Header Info */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full mb-4">
                    <span className="material-symbols-outlined">business</span>
                    <span className="font-semibold">{selectedQRForDisplay.units?.name}</span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    {selectedQRForDisplay.name}
                  </h2>
                  {selectedQRForDisplay.description && (
                    <p className="text-slate-500 dark:text-slate-400">
                      {selectedQRForDisplay.description}
                    </p>
                  )}
                </div>

                {/* QR Code Image */}
                <div className="bg-white p-8 rounded-2xl shadow-lg mb-6 flex items-center justify-center">
                  <img
                    src={qrCodeService.generateQRImageUrl(
                      selectedQRForDisplay.code,
                      512,
                      selectedQRForDisplay.redirect_type,
                      selectedQRForDisplay.unit_id,
                      selectedQRForDisplay.units?.name,
                      selectedQRForDisplay.auto_fill_unit
                    )}
                    alt={`QR Code ${selectedQRForDisplay.name}`}
                    className="w-full max-w-md"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      if (!img.src.includes('qrserver.com')) {
                        img.src = `https://api.qrserver.com/v1/create-qr-code/?size=512x512&data=${encodeURIComponent(
                          qrCodeService.generateQRUrl(
                            selectedQRForDisplay.code,
                            selectedQRForDisplay.redirect_type,
                            selectedQRForDisplay.unit_id,
                            selectedQRForDisplay.units?.name,
                            selectedQRForDisplay.auto_fill_unit
                          )
                        )}&ecc=H`;
                      }
                    }}
                  />
                </div>

                {/* Instructions */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="size-10 bg-primary rounded-lg flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-white">qr_code_scanner</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900 dark:text-white mb-2">
                        Cara Menggunakan QR Code
                      </h3>
                      <ol className="text-sm text-slate-600 dark:text-slate-300 space-y-1 list-decimal list-inside">
                        <li>Scan QR Code menggunakan kamera smartphone</li>
                        <li>Akan langsung diarahkan ke form input</li>
                        <li>Isi form tanpa perlu login</li>
                        <li>Kirim tiket dan dapatkan nomor tracking</li>
                      </ol>
                    </div>
                  </div>
                </div>

                {/* Redirect Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Tipe Redirect</p>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {REDIRECT_OPTIONS.find(o => o.value === selectedQRForDisplay.redirect_type)?.label || 'Tampilkan Pilihan'}
                    </p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Auto-fill Unit</p>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {selectedQRForDisplay.auto_fill_unit !== false ? 'Aktif' : 'Tidak Aktif'}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button
                    onClick={() => {
                      const link = qrCodeService.generateQRUrl(
                        selectedQRForDisplay.code,
                        selectedQRForDisplay.redirect_type,
                        selectedQRForDisplay.unit_id,
                        selectedQRForDisplay.units?.name,
                        selectedQRForDisplay.auto_fill_unit
                      );
                      navigator.clipboard.writeText(link);
                      alert('Link berhasil disalin!');
                    }}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                  >
                    <span className="material-symbols-outlined">content_copy</span>
                    <span className="font-medium">Salin Link</span>
                  </button>
                  <button
                    onClick={() => {
                      const link = qrCodeService.generateQRImageUrl(
                        selectedQRForDisplay.code,
                        1024,
                        selectedQRForDisplay.redirect_type,
                        selectedQRForDisplay.unit_id,
                        selectedQRForDisplay.units?.name,
                        selectedQRForDisplay.auto_fill_unit
                      );
                      window.open(link, '_blank');
                    }}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <span className="material-symbols-outlined">download</span>
                    <span className="font-medium">Unduh QR</span>
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                  >
                    <span className="material-symbols-outlined">print</span>
                    <span className="font-medium">Cetak</span>
                  </button>
                </div>

                {/* Direct Link Display */}
                <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Link Langsung</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 px-3 py-2 rounded border border-slate-200 dark:border-slate-600 overflow-x-auto">
                      {qrCodeService.generateQRUrl(
                        selectedQRForDisplay.code,
                        selectedQRForDisplay.redirect_type,
                        selectedQRForDisplay.unit_id,
                        selectedQRForDisplay.units?.name,
                        selectedQRForDisplay.auto_fill_unit
                      )}
                    </code>
                    <button
                      onClick={() => {
                        const link = qrCodeService.generateQRUrl(
                          selectedQRForDisplay.code,
                          selectedQRForDisplay.redirect_type,
                          selectedQRForDisplay.unit_id,
                          selectedQRForDisplay.units?.name,
                          selectedQRForDisplay.auto_fill_unit
                        );
                        window.open(link, '_blank');
                      }}
                      className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                      title="Buka Link"
                    >
                      <span className="material-symbols-outlined">open_in_new</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {!selectedQRForDisplay && (
              <div className="text-center py-12">
                <div className="size-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-4xl text-slate-400">qr_code_2</span>
                </div>
                <p className="text-slate-500 dark:text-slate-400">
                  Pilih QR Code dari dropdown di atas untuk menampilkan
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab Content: QR Forms - Direct Links to Forms */}
        {activeTab === 'qr-forms' && (
          <div className="space-y-6">
            {/* Info Banner */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
              <div className="flex gap-4">
                <div className="size-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-2xl">info</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-2">
                    QR Code Form Langsung
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                    QR Code di bawah ini mengarahkan langsung ke halaman form <strong>tanpa perlu login</strong> dan <strong>tanpa sidebar navigasi</strong>. 
                    Cocok untuk dipasang di area publik seperti loket, ruang tunggu, atau tempat pelayanan.
                  </p>
                </div>
              </div>
            </div>

            {/* QR Code Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* QR Code: Form Tiket Internal */}
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-xl transition-shadow">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="size-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <span className="material-symbols-outlined">assignment</span>
                    </div>
                    <h3 className="text-lg font-bold">Form Tiket Internal</h3>
                  </div>
                  <p className="text-sm text-blue-50">
                    Untuk keluhan internal rumah sakit
                  </p>
                </div>
                
                <div className="p-6">
                  {/* QR Code Image */}
                  <div className="bg-white p-4 rounded-lg shadow-inner mb-4 flex items-center justify-center">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                        `${window.location.origin}/form/internal`
                      )}&ecc=H`}
                      alt="QR Code Form Tiket Internal"
                      className="w-full h-auto max-w-[200px]"
                    />
                  </div>

                  {/* Link Display */}
                  <div className="mb-4">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Link Langsung:</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-700 px-3 py-2 rounded border border-slate-200 dark:border-slate-600 overflow-x-auto">
                        {window.location.origin}/form/internal
                      </code>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/form/internal`);
                        alert('Link berhasil disalin!');
                      }}
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-sm"
                    >
                      <span className="material-symbols-outlined text-lg">content_copy</span>
                      <span>Salin</span>
                    </button>
                    <button
                      onClick={() => {
                        window.open(`https://api.qrserver.com/v1/create-qr-code/?size=1024x1024&data=${encodeURIComponent(
                          `${window.location.origin}/form/internal`
                        )}&ecc=H`, '_blank');
                      }}
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                    >
                      <span className="material-symbols-outlined text-lg">download</span>
                      <span>Unduh</span>
                    </button>
                  </div>

                  {/* Test Link */}
                  <a
                    href={`${window.location.origin}/form/internal`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 flex items-center justify-center gap-2 px-3 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors text-sm"
                  >
                    <span className="material-symbols-outlined text-lg">open_in_new</span>
                    <span>Buka Form</span>
                  </a>
                </div>
              </div>

              {/* QR Code: Form Tiket Eksternal */}
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-xl transition-shadow">
                <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 text-white">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="size-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <span className="material-symbols-outlined">description</span>
                    </div>
                    <h3 className="text-lg font-bold">Form Tiket Eksternal</h3>
                  </div>
                  <p className="text-sm text-green-50">
                    Untuk keluhan dari pasien/pengunjung
                  </p>
                </div>
                
                <div className="p-6">
                  {/* QR Code Image */}
                  <div className="bg-white p-4 rounded-lg shadow-inner mb-4 flex items-center justify-center">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                        `${window.location.origin}/form/eksternal`
                      )}&ecc=H`}
                      alt="QR Code Form Tiket Eksternal"
                      className="w-full h-auto max-w-[200px]"
                    />
                  </div>

                  {/* Link Display */}
                  <div className="mb-4">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Link Langsung:</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-700 px-3 py-2 rounded border border-slate-200 dark:border-slate-600 overflow-x-auto">
                        {window.location.origin}/form/eksternal
                      </code>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/form/eksternal`);
                        alert('Link berhasil disalin!');
                      }}
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-sm"
                    >
                      <span className="material-symbols-outlined text-lg">content_copy</span>
                      <span>Salin</span>
                    </button>
                    <button
                      onClick={() => {
                        window.open(`https://api.qrserver.com/v1/create-qr-code/?size=1024x1024&data=${encodeURIComponent(
                          `${window.location.origin}/form/eksternal`
                        )}&ecc=H`, '_blank');
                      }}
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                    >
                      <span className="material-symbols-outlined text-lg">download</span>
                      <span>Unduh</span>
                    </button>
                  </div>

                  {/* Test Link */}
                  <a
                    href={`${window.location.origin}/form/eksternal`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 flex items-center justify-center gap-2 px-3 py-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors text-sm"
                  >
                    <span className="material-symbols-outlined text-lg">open_in_new</span>
                    <span>Buka Form</span>
                  </a>
                </div>
              </div>

              {/* QR Code: Form Survei */}
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-xl transition-shadow">
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 text-white">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="size-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <span className="material-symbols-outlined">rate_review</span>
                    </div>
                    <h3 className="text-lg font-bold">Form Survei Kepuasan</h3>
                  </div>
                  <p className="text-sm text-purple-50">
                    Untuk survei kepuasan pelayanan
                  </p>
                </div>
                
                <div className="p-6">
                  {/* QR Code Image */}
                  <div className="bg-white p-4 rounded-lg shadow-inner mb-4 flex items-center justify-center">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                        `${window.location.origin}/form/survey`
                      )}&ecc=H`}
                      alt="QR Code Form Survei"
                      className="w-full h-auto max-w-[200px]"
                    />
                  </div>

                  {/* Link Display */}
                  <div className="mb-4">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Link Langsung:</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-700 px-3 py-2 rounded border border-slate-200 dark:border-slate-600 overflow-x-auto">
                        {window.location.origin}/form/survey
                      </code>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/form/survey`);
                        alert('Link berhasil disalin!');
                      }}
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-sm"
                    >
                      <span className="material-symbols-outlined text-lg">content_copy</span>
                      <span>Salin</span>
                    </button>
                    <button
                      onClick={() => {
                        window.open(`https://api.qrserver.com/v1/create-qr-code/?size=1024x1024&data=${encodeURIComponent(
                          `${window.location.origin}/form/survey`
                        )}&ecc=H`, '_blank');
                      }}
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm"
                    >
                      <span className="material-symbols-outlined text-lg">download</span>
                      <span>Unduh</span>
                    </button>
                  </div>

                  {/* Test Link */}
                  <a
                    href={`${window.location.origin}/form/survey`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 flex items-center justify-center gap-2 px-3 py-2 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors text-sm"
                  >
                    <span className="material-symbols-outlined text-lg">open_in_new</span>
                    <span>Buka Form</span>
                  </a>
                </div>
              </div>

            </div>

            {/* Usage Instructions */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">help</span>
                Cara Menggunakan QR Code
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Untuk Cetak/Pasang:</h4>
                  <ol className="text-sm text-slate-600 dark:text-slate-300 space-y-2 list-decimal list-inside">
                    <li>Klik tombol "Unduh" pada QR Code yang diinginkan</li>
                    <li>Simpan gambar QR Code (ukuran 1024x1024px)</li>
                    <li>Cetak QR Code dan pasang di lokasi strategis</li>
                    <li>Pastikan QR Code mudah terlihat dan dapat di-scan</li>
                  </ol>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Untuk Pengguna:</h4>
                  <ol className="text-sm text-slate-600 dark:text-slate-300 space-y-2 list-decimal list-inside">
                    <li>Scan QR Code menggunakan kamera smartphone</li>
                    <li>Akan langsung diarahkan ke halaman form</li>
                    <li>Isi form tanpa perlu login atau registrasi</li>
                    <li>Kirim dan dapatkan nomor tracking tiket</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Features Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3 mb-2">
                  <div className="size-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-green-600 dark:text-green-400">check_circle</span>
                  </div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">Tanpa Login</h4>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Pengguna dapat langsung mengisi form tanpa perlu login atau membuat akun
                </p>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3 mb-2">
                  <div className="size-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">visibility_off</span>
                  </div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">Tanpa Sidebar</h4>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Tampilan bersih tanpa menu navigasi, fokus hanya pada form input
                </p>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3 mb-2">
                  <div className="size-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-purple-600 dark:text-purple-400">smartphone</span>
                  </div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">Mobile Friendly</h4>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Tampilan responsif dan optimal untuk perangkat mobile
                </p>
              </div>
            </div>
          </div>
        )}

      </main>


      {/* Create/Edit QR Code Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {editingQR ? 'Edit QR Code' : 'Buat QR Code Baru'}
                </h3>
                <button
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <form onSubmit={handleCreateQRCode} className="space-y-5">
                {/* Unit Selection - Only for new QR codes */}
                {!editingQR && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Unit <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.unit_id}
                      onChange={(e) => setFormData({ ...formData, unit_id: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    >
                      <option value="">Pilih Unit</option>
                      {units.filter(unit => unit.is_active).map((unit) => (
                        <option key={unit.id} value={unit.id}>
                          {unit.name} ({unit.code})
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-slate-500 mt-1">
                      Unit yang dipilih akan otomatis terisi saat pelanggan scan QR code
                    </p>
                  </div>
                )}

                {/* QR Code Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Nama QR Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
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
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    rows={2}
                    placeholder="Deskripsi lokasi atau tujuan QR Code..."
                  />
                </div>

                {/* Redirect Type */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                    Arahkan ke <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {REDIRECT_OPTIONS.map((option) => (
                      <label
                        key={option.value}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
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
                          className="sr-only"
                        />
                        <div className={`size-10 rounded-lg flex items-center justify-center ${
                          formData.redirect_type === option.value
                            ? 'bg-primary text-white'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                        }`}>
                          <span className="material-symbols-outlined">{option.icon}</span>
                        </div>
                        <div className="flex-1">
                          <p className={`font-medium ${
                            formData.redirect_type === option.value
                              ? 'text-primary'
                              : 'text-slate-900 dark:text-white'
                          }`}>
                            {option.label}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {option.description}
                          </p>
                        </div>
                        {formData.redirect_type === option.value && (
                          <span className="material-symbols-outlined text-primary">check_circle</span>
                        )}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Show Options - Only when redirect_type is 'selection' */}
                {formData.redirect_type === 'selection' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                      Pilihan yang Ditampilkan
                    </label>
                    <div className="space-y-2">
                      {SHOW_OPTIONS_LIST.map((option) => (
                        <label
                          key={option.value}
                          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                            formData.show_options?.includes(option.value)
                              ? 'border-primary bg-primary/5 dark:bg-primary/10'
                              : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={formData.show_options?.includes(option.value) || false}
                            onChange={() => handleShowOptionsChange(option.value)}
                            className="size-4 rounded border-slate-300 text-primary focus:ring-primary"
                          />
                          <span className="material-symbols-outlined text-slate-500">{option.icon}</span>
                          <span className="text-sm text-slate-700 dark:text-slate-300">{option.label}</span>
                        </label>
                      ))}
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      Pilih minimal satu opsi yang akan ditampilkan kepada pelanggan
                    </p>
                  </div>
                )}

                {/* Auto Fill Unit Toggle */}
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white text-sm">
                      Otomatis Isi Unit
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Unit akan terisi otomatis di form, pengguna tidak perlu memilih unit lagi
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.auto_fill_unit}
                      onChange={(e) => setFormData({ ...formData, auto_fill_unit: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer dark:bg-slate-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-primary"></div>
                  </label>
                </div>

                {/* Informasi Penting */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex gap-3">
                    <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-xl">info</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                        QR Code Langsung ke Form
                      </p>
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        QR Code yang dibuat akan langsung mengarahkan pengguna ke form input <strong>tanpa perlu login</strong> dan <strong>tanpa sidebar navigasi</strong>. Cocok untuk dipasang di lokasi fisik seperti loket, ruang tunggu, atau area publik.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); resetForm(); }}
                    className="flex-1 px-4 py-2 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={formData.redirect_type === 'selection' && (!formData.show_options || formData.show_options.length === 0)}
                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {editingQR ? 'Simpan Perubahan' : 'Buat QR Code'}
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

export default QRManagement;
