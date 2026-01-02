import { useState, useEffect } from 'react';
import unitService, { Unit, UnitType } from '../../services/unitService';
import UnitModal from '../../components/UnitModal';
import { supabase } from '../../utils/supabaseClient';

interface UnitsManagementProps {
    embedded?: boolean;
}

const UnitsManagementEnhanced = ({ embedded = false }: UnitsManagementProps) => {
    const [units, setUnits] = useState<Unit[]>([]);
    const [unitTypes, setUnitTypes] = useState<UnitType[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        fetchUnits();
    }, [searchTerm, typeFilter, statusFilter]);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Try to fetch from API first
            try {
                const [unitsData, unitTypesData] = await Promise.all([
                    unitService.getUnits(),
                    unitService.getUnitTypes()
                ]);
                
                setUnits(unitsData.units || []);
                setUnitTypes(unitTypesData);
                return;
            } catch (apiError) {
                console.warn('API failed, falling back to direct Supabase:', apiError);
                
                // Fallback to direct Supabase query
                const { data: unitsData, error: unitsError } = await supabase
                    .from('units')
                    .select(`
                        *,
                        unit_type:unit_types(name, code, color)
                    `)
                    .order('created_at', { ascending: false });

                const { data: unitTypesData, error: unitTypesError } = await supabase
                    .from('unit_types')
                    .select('*')
                    .eq('is_active', true)
                    .order('name');

                if (unitsError) throw unitsError;
                if (unitTypesError) throw unitTypesError;

                setUnits(unitsData || []);
                setUnitTypes(unitTypesData || []);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Gagal memuat data. Silakan coba lagi.');
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
            
            // Try API first
            try {
                const unitsData = await unitService.getUnits(params);
                setUnits(unitsData.units || []);
                return;
            } catch (apiError) {
                console.warn('API failed, falling back to direct Supabase:', apiError);
                
                // Fallback to direct Supabase query with filters
                let query = supabase
                    .from('units')
                    .select(`
                        *,
                        unit_type:unit_types(name, code, color)
                    `);

                // Apply filters
                if (searchTerm) {
                    query = query.or(`name.ilike.%${searchTerm}%,code.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
                }
                
                if (typeFilter) {
                    query = query.eq('unit_types.code', typeFilter);
                }
                
                if (statusFilter) {
                    if (statusFilter === 'active') {
                        query = query.eq('is_active', true);
                    } else if (statusFilter === 'inactive') {
                        query = query.eq('is_active', false);
                    }
                }

                query = query.order('created_at', { ascending: false });

                const { data: unitsData, error } = await query;
                
                if (error) throw error;
                setUnits(unitsData || []);
            }
        } catch (error) {
            console.error('Error fetching units:', error);
            setError('Gagal memuat data unit kerja.');
        }
    };

    const handleDeleteUnit = async (unitId: string) => {
        if (!confirm('Apakah Anda yakin ingin menghapus unit kerja ini?')) {
            return;
        }

        try {
            // Try API first
            try {
                await unitService.deleteUnit(unitId);
            } catch (apiError) {
                console.warn('API failed, using direct Supabase:', apiError);
                
                // Fallback to direct Supabase
                const { error } = await supabase
                    .from('units')
                    .delete()
                    .eq('id', unitId);
                
                if (error) throw error;
            }
            
            await fetchUnits();
            alert('Unit kerja berhasil dihapus.');
        } catch (error: any) {
            console.error('Error deleting unit:', error);
            const errorMessage = error.message || 'Gagal menghapus unit kerja.';
            alert(errorMessage);
        }
    };

    const handleEditUnit = (unit: Unit) => {
        setSelectedUnit(unit);
        setShowEditModal(true);
    };

    const handleSaveUnit = async (unitData: Partial<Unit>) => {
        try {
            // Try API first
            try {
                if (selectedUnit) {
                    // Update existing unit
                    await unitService.updateUnit(selectedUnit.id, unitData);
                } else {
                    // Create new unit
                    await unitService.createUnit(unitData);
                }
            } catch (apiError) {
                console.warn('API failed, using direct Supabase:', apiError);
                
                // Fallback to direct Supabase
                if (selectedUnit) {
                    // Update existing unit
                    const { error } = await supabase
                        .from('units')
                        .update({
                            ...unitData,
                            updated_at: new Date().toISOString()
                        })
                        .eq('id', selectedUnit.id);
                    
                    if (error) throw error;
                } else {
                    // Create new unit
                    const { error } = await supabase
                        .from('units')
                        .insert([{
                            ...unitData,
                            id: crypto.randomUUID(),
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString()
                        }]);
                    
                    if (error) throw error;
                }
            }
            
            await fetchUnits();
            setShowAddModal(false);
            setShowEditModal(false);
            setSelectedUnit(null);
        } catch (error: any) {
            console.error('Error saving unit:', error);
            const errorMessage = error.message || 'Gagal menyimpan unit kerja.';
            alert(errorMessage);
            throw error; // Re-throw to let modal handle loading state
        }
    };

    const handleCloseModal = () => {
        setShowAddModal(false);
        setShowEditModal(false);
        setSelectedUnit(null);
    };

    const formatSlaTime = (hours: number) => {
        if (hours < 24) {
            return `${hours} Jam`;
        } else {
            const days = Math.floor(hours / 24);
            return `${days} Hari`;
        }
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

    const getTypeBadge = (unitType: { name: string; code: string; color: string } | null | undefined) => {
        if (!unitType) {
            return (
                <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                    Tidak Diketahui
                </span>
            );
        }

        const typeColors: Record<string, string> = {
            'Administratif': 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700',
            'Layanan Medis': 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800/30',
            'Penunjang Medis': 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-800/30',
            'Teknis': 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
        };

        const colorClass = typeColors[unitType.name] || typeColors['Administratif'];

        return (
            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${colorClass}`}>
                {unitType.name}
            </span>
        );
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
                        <button 
                            className="p-1.5 text-slate-400 hover:text-primary hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                            title="Edit"
                            onClick={() => handleEditUnit(unit)}
                        >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button 
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                            title="Hapus"
                            onClick={() => handleDeleteUnit(unit.id)}
                        >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                    </div>
                </td>
            </tr>
        );
    };

    if (error) {
        return (
            <div className="space-y-6">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-red-500">error</span>
                        <div>
                            <h3 className="font-medium text-red-800 dark:text-red-200">Terjadi Kesalahan</h3>
                            <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
                        </div>
                        <button 
                            onClick={fetchData}
                            className="ml-auto px-3 py-1 bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200 rounded text-sm hover:bg-red-200 dark:hover:bg-red-700 transition-colors"
                        >
                            Coba Lagi
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            {!embedded && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                            Manajemen Unit Kerja
                        </h2>
                        <p className="text-slate-500 mt-1">
                            Kelola struktur organisasi, hierarki, dan detail unit kerja dalam sistem rumah sakit.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="inline-flex items-center justify-center gap-2 bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium px-4 py-2 rounded-lg transition-colors text-sm shadow-sm">
                            <span className="material-symbols-outlined text-[18px]">file_download</span>
                            Ekspor
                        </button>
                        <button 
                            onClick={() => setShowAddModal(true)}
                            className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-medium px-4 py-2 rounded-lg transition-colors text-sm shadow-md shadow-blue-500/20"
                        >
                            <span className="material-symbols-outlined text-[18px]">add</span>
                            Tambah Unit Baru
                        </button>
                    </div>
                </div>
            )}

            {/* Embedded Header */}
            {embedded && (
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <button className="inline-flex items-center justify-center gap-2 bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium px-4 py-2 rounded-lg transition-colors text-sm shadow-sm">
                            <span className="material-symbols-outlined text-[18px]">file_download</span>Ekspor
                        </button>
                        <button 
                            onClick={() => setShowAddModal(true)}
                            className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-medium px-4 py-2 rounded-lg transition-colors text-sm shadow-md shadow-blue-500/20"
                        >
                            <span className="material-symbols-outlined text-[18px]">add</span>Tambah Unit Baru
                        </button>
                    </div>
                </div>
            )}

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
                        </div>
                        <button className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-white dark:hover:bg-slate-800 shadow-sm transition-all">
                            <span className="material-symbols-outlined text-sm">chevron_right</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Add Unit Modal */}
            <UnitModal
                isOpen={showAddModal}
                onClose={handleCloseModal}
                onSave={handleSaveUnit}
                units={units}
                unitTypes={unitTypes}
            />

            {/* Edit Unit Modal */}
            <UnitModal
                isOpen={showEditModal}
                onClose={handleCloseModal}
                onSave={handleSaveUnit}
                unit={selectedUnit}
                units={units}
                unitTypes={unitTypes}
            />
        </div>
    );
};

export default UnitsManagementEnhanced;
export { UnitsManagementEnhanced };