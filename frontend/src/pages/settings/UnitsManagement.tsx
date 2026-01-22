import { useState, useEffect } from 'react';
import unitService, { Unit, UnitType } from '../../services/unitService';

const UnitsManagement = () => {
    const [units, setUnits] = useState<Unit[]>([]);
    const [unitTypes, setUnitTypes] = useState<UnitType[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [importing, setImporting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        fetchUnits();
    }, [searchTerm, typeFilter, statusFilter]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [unitsData, unitTypesData] = await Promise.all([
                unitService.getUnits(),
                unitService.getUnitTypes()
            ]);
            
            setUnits(unitsData.units || []);
            setUnitTypes(unitTypesData);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUnits = async () => {
        try {
            const params: any = {};
            if (searchTerm) params.search = searchTerm;
            if (typeFilter) params.type = typeFilter;
            if (statusFilter) params.status = statusFilter;
            
            const unitsData = await unitService.getUnits(params);
            setUnits(unitsData.units || []);
        } catch (error) {
            console.error('Error fetching units:', error);
        }
    };

    const formatSlaTime = (hours: number) => {
        if (hours < 24) {
            return `${hours} Jam`;
        } else {
            const days = Math.floor(hours / 24);
            return `${days} Hari`;
        }
    };

    const getTypeBadge = (unitType: any) => {
        if (!unitType) {
            return (
                <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                    Tidak Diketahui
                </span>
            );
        }

        const color = unitType.color || '#6B7280';
        return (
            <span 
                className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border"
                style={{
                    backgroundColor: `${color}20`,
                    color: color,
                    borderColor: `${color}40`
                }}
            >
                {unitType.name}
            </span>
        );
    };

    const getStatusBadge = (isActive: boolean) => {
        if (isActive) {
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800">
                    <span className="size-1.5 rounded-full bg-emerald-500"></span>
                    Aktif
                </span>
            );
        } else {
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-100 dark:border-amber-800">
                    <span className="size-1.5 rounded-full bg-amber-500"></span>
                    Pemeliharaan
                </span>
            );
        }
    };

    const handleDownloadTemplate = () => {
        // Create template data
        const template = [
            {
                'Nama Unit': 'Contoh Unit',
                'Kode': 'CONT',
                'Deskripsi': 'Deskripsi unit',
                'Tipe Unit (Kode)': 'ADM',
                'Unit Induk (Kode)': '',
                'Email Kontak': 'unit@example.com',
                'Telepon Kontak': '021-12345678',
                'SLA (Jam)': '24',
                'Status (Aktif/Tidak Aktif)': 'Aktif'
            }
        ];

        // Convert to CSV
        const headers = Object.keys(template[0]);
        const csvContent = [
            headers.join(','),
            template.map(row => headers.map(header => `"${row[header as keyof typeof row]}"`).join(',')).join('\n')
        ].join('\n');

        // Download
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'template_unit_kerja.csv';
        link.click();
    };

    const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        const validTypes = ['.csv', '.xlsx', '.xls'];
        const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
        if (!validTypes.includes(fileExt)) {
            alert('Format file tidak valid. Gunakan file CSV, XLS, atau XLSX');
            event.target.value = '';
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('Ukuran file terlalu besar. Maksimal 5MB');
            event.target.value = '';
            return;
        }

        setImporting(true);
        try {
            const result = await unitService.importUnits(file);
            
            if (result.success) {
                const message = result.errors && result.errors.length > 0
                    ? `Berhasil import ${result.imported} dari ${result.total} unit kerja.\n\nPeringatan:\n${result.errors.slice(0, 5).join('\n')}${result.errors.length > 5 ? '\n...' : ''}`
                    : `Berhasil import ${result.imported} unit kerja!`;
                
                alert(message);
                fetchData(); // Refresh data
            } else {
                alert(`Import gagal: ${result.message || 'Terjadi kesalahan'}`);
            }
        } catch (error: any) {
            console.error('Import error:', error);
            alert(`Import gagal: ${error.message || 'Terjadi kesalahan'}`);
        } finally {
            setImporting(false);
            // Reset input
            event.target.value = '';
        }
    };

    const handleExport = async () => {
        try {
            const csvContent = convertToCSV(units);
            const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `unit_kerja_${new Date().toISOString().split('T')[0]}.csv`;
            link.click();
        } catch (error) {
            console.error('Export error:', error);
            alert('Gagal export data');
        }
    };

    const convertToCSV = (data: Unit[]) => {
        const headers = ['Nama Unit', 'Kode', 'Deskripsi', 'Tipe Unit', 'Unit Induk', 'Email Kontak', 'Telepon Kontak', 'SLA (Jam)', 'Status'];
        
        const rows = data.map(unit => [
            unit.name,
            unit.code,
            unit.description || '',
            unit.unit_type?.name || '',
            unit.parent_unit?.name || '',
            unit.contact_email || '',
            unit.contact_phone || '',
            unit.sla_hours.toString(),
            unit.is_active ? 'Aktif' : 'Tidak Aktif'
        ]);

        return [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');
    };

    const renderUnitRow = (unit: Unit) => {
        const isChild = !!unit.parent_unit_id;
        
        return (
            <tr key={unit.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                    {isChild ? (
                        <div className="flex items-center gap-3 pl-4 border-l-2 border-slate-200 dark:border-slate-700 ml-3 relative">
                            <span className="absolute -left-[2px] top-1/2 -translate-y-1/2 w-3 h-[2px] bg-slate-200 dark:bg-slate-700"></span>
                            <span className="ml-2">{unit.name}</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <div className="size-8 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                                <span className="material-symbols-outlined text-[18px]">domain</span>
                            </div>
                            <span>{unit.name}</span>
                        </div>
                    )}
                </td>
                <td className="px-6 py-4 text-slate-500 font-mono text-xs">{unit.code}</td>
                <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                    {getTypeBadge(unit.unit_type)}
                </td>
                <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-medium">
                    {formatSlaTime(unit.sla_hours)}
                </td>
                <td className="px-6 py-4">
                    {getStatusBadge(unit.is_active)}
                </td>
                <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 text-slate-400 hover:text-primary hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors" title="Edit">
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="Hapus">
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                    </div>
                </td>
            </tr>
        );
    };

    return (
        <div className="space-y-6">
            {/* Import Loading Overlay */}
            {importing && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-2xl max-w-sm w-full mx-4">
                        <div className="flex items-center gap-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            <div>
                                <h3 className="font-semibold text-slate-900 dark:text-white">Mengimport Data</h3>
                                <p className="text-sm text-slate-500">Mohon tunggu...</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                        Manajemen Unit Kerja
                    </h2>
                    <p className="text-slate-500 mt-1 text-sm">
                        Kelola struktur organisasi, hierarki, dan detail unit kerja dalam sistem rumah sakit.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleDownloadTemplate}
                        className="inline-flex items-center justify-center gap-2 bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium px-4 py-2 rounded-lg transition-colors text-sm shadow-sm"
                    >
                        <span className="material-symbols-outlined text-[18px]">description</span>
                        Template Data
                    </button>
                    <label className="inline-flex items-center justify-center gap-2 bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium px-4 py-2 rounded-lg transition-colors text-sm shadow-sm cursor-pointer">
                        <span className="material-symbols-outlined text-[18px]">upload_file</span>
                        Import
                        <input 
                            type="file" 
                            accept=".xlsx,.xls,.csv" 
                            onChange={handleImportFile}
                            className="hidden"
                        />
                    </label>
                    <button 
                        onClick={handleExport}
                        className="inline-flex items-center justify-center gap-2 bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium px-4 py-2 rounded-lg transition-colors text-sm shadow-sm"
                    >
                        <span className="material-symbols-outlined text-[18px]">file_download</span>
                        Ekspor
                    </button>
                    <button className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-medium px-4 py-2 rounded-lg transition-colors text-sm shadow-md shadow-blue-500/20">
                        <span className="material-symbols-outlined text-[18px]">add</span>
                        Tambah Unit Baru
                    </button>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="bg-surface-light dark:bg-surface-dark p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-2 items-center">
                <div className="relative w-full md:flex-1 group p-1">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span className="material-symbols-outlined text-slate-400 group-focus-within:text-primary">search</span>
                    </div>
                    <input 
                        className="block w-full pl-11 pr-3 py-2 border-none bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:ring-0 text-sm" 
                        placeholder="Cari nama, kode, atau unit induk..." 
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 hidden md:block"></div>
                <div className="flex items-center gap-2 w-full md:w-auto p-1">
                    <div className="relative w-full md:w-auto">
                        <select 
                            className="form-select block w-full md:w-48 py-2 pl-3 pr-10 text-sm border-none rounded-lg bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 focus:ring-0 cursor-pointer font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                        >
                            <option value="">Semua Tipe</option>
                            {unitTypes.map(type => (
                                <option key={type.id} value={type.code}>{type.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="relative w-full md:w-auto">
                        <select 
                            className="form-select block w-full md:w-40 py-2 pl-3 pr-10 text-sm border-none rounded-lg bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 focus:ring-0 cursor-pointer font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="">Semua Status</option>
                            <option value="active">Aktif</option>
                            <option value="inactive">Tidak Aktif</option>
                            <option value="maintenance">Pemeliharaan</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-surface-light dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs font-semibold text-slate-500 uppercase bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                            <tr>
                                <th className="px-6 py-4" scope="col">Nama Unit (Hierarki)</th>
                                <th className="px-6 py-4" scope="col">Kode</th>
                                <th className="px-6 py-4" scope="col">Tipe</th>
                                <th className="px-6 py-4" scope="col">Target SLA</th>
                                <th className="px-6 py-4" scope="col">Status</th>
                                <th className="px-6 py-4 text-right" scope="col">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                                            Memuat data...
                                        </div>
                                    </td>
                                </tr>
                            ) : units.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                        Tidak ada data unit kerja
                                    </td>
                                </tr>
                            ) : (
                                units.map(unit => renderUnitRow(unit))
                            )}
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination */}
                <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
                    <span className="text-sm text-slate-500">Menampilkan 1 sampai {units.length} dari {units.length} entri</span>
                    <div className="flex items-center gap-2">
                        <button className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-white dark:hover:bg-slate-800 shadow-sm disabled:opacity-50 transition-all" disabled>
                            <span className="material-symbols-outlined text-sm">chevron_left</span>
                        </button>
                        <div className="flex items-center gap-1">
                            <button className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-primary shadow-sm">1</button>
                            <button className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium text-slate-500 hover:bg-white dark:hover:bg-slate-800 transition-colors">2</button>
                            <button className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium text-slate-500 hover:bg-white dark:hover:bg-slate-800 transition-colors">3</button>
                        </div>
                        <button className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-white dark:hover:bg-slate-800 shadow-sm transition-all">
                            <span className="material-symbols-outlined text-sm">chevron_right</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UnitsManagement;
export { UnitsManagement };