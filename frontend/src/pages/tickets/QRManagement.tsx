import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { qrCodeService, QRCode, CreateQRCodeData } from '../../services/qrCodeService';
import unitService from '../../services/unitService';
import AppFooter from '../../components/AppFooter';

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
  { value: 'selection', label: 'Tampilkan Pilihan', icon: 'list_alt', description: 'Pelanggan memilih jenis layanan' },
  { value: 'internal_ticket', label: 'Form Tiket Internal', icon: 'assignment', description: 'Langsung ke form tiket internal' },
  { value: 'external_ticket', label: 'Form Tiket Eksternal', icon: 'description', description: 'Langsung ke form tiket eksternal' },
  { value: 'survey', label: 'Form Survei', icon: 'rate_review', description: 'Langsung ke form survei kepuasan' }
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
    
    // Generate direct link berdasarkan redirect_type
    const getDirectLink = () => {
      if (!qrCode) return '';
      const baseUrl = window.location.origin;
      const params = new URLSearchParams();
      if (qrCode.unit_id) params.append('unit_id', qrCode.unit_id);
      if (qrCode.units?.name) params.append('unit_name', qrCode.units.name);
      if (qrCode.code) params.append('qr', qrCode.code);
      const queryString = params.toString() ? `?${params.toString()}` : '';
      
      switch (redirectType) {
        case 'internal_ticket':
          return `${baseUrl}/form/internal${queryString}`;
        case 'external_ticket':
          return `${baseUrl}/form/eksternal${queryString}`;
        case 'survey':
          return `${baseUrl}/form/survey${queryString}`;
        default:
          return `${baseUrl}/m/${qrCode.code}`;
      }
    };
    
    const directLink = getDirectLink();
    const linkLabel = redirectType === 'internal_ticket' ? 'Form Tiket Internal' :
                      redirectType === 'external_ticket' ? 'Form Tiket Eksternal' :
                      redirectType === 'survey' ? 'Form Survei' : 'Pilihan Menu';
    
    return (
      <div className="space-y-1">
        <a
          href={directLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-sm">{option.icon}</span>
          {linkLabel}
        </a>
        {qrCode?.auto_fill_unit && (
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
    const url = qrCodeService.generateQRUrl(code, redirectType, unitId, unitName, autoFillUnit);
    navigator.clipboard.writeText(url);
    alert('Link QR Code berhasil disalin!');
  };

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex flex-col overflow-x-hidden transition-colors duration-200">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-surface-light dark:bg-surface-dark border-b border-slate-200 dark:border-slate-800 px-6 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="size-8 text-primary flex items-center justify-center bg-primary/10 rounded-lg">
              <span className="material-symbols-outlined text-2xl">local_police</span>
            </div>
            <h2 className="text-lg font-bold leading-tight tracking-tight text-slate-900 dark:text-white">
              Sistem Manajemen Keluhan
            </h2>
          </div>
          <nav className="hidden md:flex items-center gap-1">
            <Link className="text-slate-600 dark:text-slate-400 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800 px-3 py-2 rounded-lg text-sm font-medium transition-colors" to="/dashboard">
              Dashboard
            </Link>
            <Link className="text-slate-600 dark:text-slate-400 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800 px-3 py-2 rounded-lg text-sm font-medium transition-colors" to="/tickets">
              Keluhan
            </Link>
            <Link className="text-primary bg-primary/10 px-3 py-2 rounded-lg text-sm font-medium transition-colors" to="/qr-codes">
              Unit & QR Code
            </Link>
            <Link className="text-slate-600 dark:text-slate-400 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800 px-3 py-2 rounded-lg text-sm font-medium transition-colors" to="/reports">
              Laporan
            </Link>
            <Link className="text-slate-600 dark:text-slate-400 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800 px-3 py-2 rounded-lg text-sm font-medium transition-colors" to="/settings">
              Pengaturan
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-8">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 mb-6 text-sm">
          <Link className="text-slate-500 dark:text-slate-400 hover:text-primary transition-colors" to="/dashboard">
            Dashboard
          </Link>
          <span className="material-symbols-outlined text-slate-400 text-sm">chevron_right</span>
          <span className="text-slate-900 dark:text-white font-medium">Manajemen QR Code</span>
        </div>

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
              Manajemen QR Code Unit
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-base leading-relaxed">
              Kelola titik akses fisik untuk pengajuan keluhan warga. Generate, cetak, dan lacak QR code untuk setiap unit departemen. Atur kemana QR code akan mengarahkan pelanggan.
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
                  <div className="size-12 bg-white p-1 rounded border border-slate-200 shrink-0">
                    <img
                      alt={`QR Code untuk ${qrCode.name}`}
                      className="w-full h-full object-contain opacity-80 group-hover:opacity-100 transition-opacity"
                      src={qrCodeService.generateQRImageUrl(
                        qrCode.code, 
                        48, 
                        qrCode.redirect_type, 
                        qrCode.unit_id, 
                        qrCode.units?.name, 
                        qrCode.auto_fill_unit
                      )}
                    />
                  </div>
                  <div className="flex flex-col">
                    <button
                      onClick={() => window.open(qrCodeService.generateQRImageUrl(
                        qrCode.code, 
                        400, 
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
                    onClick={() => window.open(qrCodeService.generateQRImageUrl(
                      qrCode.code, 
                      400, 
                      qrCode.redirect_type, 
                      qrCode.unit_id, 
                      qrCode.units?.name, 
                      qrCode.auto_fill_unit
                    ), '_blank')}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    title="Lihat QR Code"
                  >
                    <span className="material-symbols-outlined">visibility</span>
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
                      Unit akan terisi otomatis, pelanggan tidak perlu memilih
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

      {/* Footer */}
      <AppFooter variant="default" className="mt-auto" />
    </div>
  );
};

export default QRManagement;
