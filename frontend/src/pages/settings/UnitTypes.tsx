import React, { useState, useEffect } from 'react';
import { masterDataService, UnitType } from '../../services/masterDataService';

const UnitTypes = () => {
    const [unitTypes, setUnitTypes] = useState<UnitType[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [editingType, setEditingType] = useState<UnitType | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        description: '',
        icon: 'corporate_fare',
        color: '#3B82F6',
        is_active: true
    });

    useEffect(() => {
        fetchUnitTypes();
    }, []);

    const fetchUnitTypes = async () => {
        try {
            setLoading(true);
            const data = await masterDataService.getUnitTypes();
            setUnitTypes(data);
        } catch (error) {
            console.error('Error fetching unit types:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingType) {
                await masterDataService.updateUnitType(editingType.id, formData);
            } else {
                await masterDataService.createUnitType(formData);
            }
            await fetchUnitTypes();
            handleCloseModal();
        } catch (error) {
            console.error('Error saving unit type:', error);
        }
    };

    const handleEdit = (type: UnitType) => {
        setEditingType(type);
        setFormData({
            name: type.name,
            code: type.code,
            description: type.description || '',
            icon: type.icon || 'corporate_fare',
            color: type.color || '#3B82F6',
            is_active: type.is_active
        });
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus tipe unit ini?')) {
            try {
                await masterDataService.deleteUnitType(id);
                await fetchUnitTypes();
            } catch (error) {
                console.error('Error deleting unit type:', error);
            }
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingType(null);
        setFormData({
            name: '',
            code: '',
            description: '',
            icon: 'corporate_fare',
            color: '#3B82F6',
            is_active: true
        });
    };

    const filteredTypes = unitTypes.filter(type => {
        const matchesSearch = type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            type.code.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || 
                            (statusFilter === 'active' && type.is_active) ||
                            (statusFilter === 'inactive' && !type.is_active);
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="flex flex-col gap-6 p-6 md:p-8 max-w-[1600px] mx-auto">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <button className="inline-flex items-center justify-center gap-2 bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium px-4 py-2 rounded-lg transition-colors text-sm shadow-sm">
                        <span className="material-symbols-outlined text-[18px]">file_download</span>
                        Ekspor
                    </button>
                    <button 
                        onClick={() => setShowModal(true)}
                        className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-blue-600 text-white font-medium px-4 py-2 rounded-lg transition-colors text-sm shadow-sm shadow-blue-500/20"
                    >
                        <span className="material-symbols-outlined text-[18px]">add</span>
                        Tambah Tipe Baru
                    </button>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-surface-light dark:bg-surface-dark p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="relative w-full md:w-96 group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="material-symbols-outlined text-slate-400 group-focus-within:text-primary">search</span>
                    </div>
                    <input 
                        className="block w-full pl-10 pr-3 py-2.5 border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder-slate-400 focus:border-primary focus:ring-1 focus:ring-primary text-sm transition-shadow" 
                        placeholder="Cari nama atau kode tipe..." 
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto md:ml-auto">
                    <select 
                        className="form-select block w-full md:w-auto py-2.5 pl-3 pr-10 text-sm border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 focus:border-primary focus:ring-primary cursor-pointer"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">Semua Status</option>
                        <option value="active">Aktif</option>
                        <option value="inactive">Tidak Aktif</option>
                    </select>
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-surface-light dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                            <tr>
                                <th className="px-6 py-4 font-semibold" scope="col">Nama Tipe</th>
                                <th className="px-6 py-4 font-semibold" scope="col">Kode</th>
                                <th className="px-6 py-4 font-semibold" scope="col">Deskripsi</th>
                                <th className="px-6 py-4 font-semibold" scope="col">Icon</th>
                                <th className="px-6 py-4 font-semibold" scope="col">Warna</th>
                                <th className="px-6 py-4 font-semibold" scope="col">Status</th>
                                <th className="px-6 py-4 font-semibold text-right" scope="col">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                                        <div className="flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                                            <span className="ml-2">Memuat data...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredTypes.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                                        Tidak ada data tipe unit
                                    </td>
                                </tr>
                            ) : (
                                filteredTypes.map((type) => (
                                    <tr key={type.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{type.name}</td>
                                        <td className="px-6 py-4 text-slate-500 font-mono text-xs">{type.code}</td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{type.description || '-'}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined" style={{color: type.color}}>
                                                    {type.icon}
                                                </span>
                                                <span className="text-xs text-slate-500">{type.icon}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 rounded-full" style={{backgroundColor: type.color}}></div>
                                                <span className="text-xs font-mono text-slate-500">{type.color}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                                                type.is_active
                                                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800'
                                                    : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-100 dark:border-red-800'
                                            }`}>
                                                <span className={`size-1.5 rounded-full ${type.is_active ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                                                {type.is_active ? 'Aktif' : 'Tidak Aktif'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => handleEdit(type)}
                                                    className="p-1.5 text-slate-400 hover:text-primary hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">edit</span>
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(type.id)}
                                                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-sm text-slate-500">
                        Menampilkan {filteredTypes.length} dari {unitTypes.length} entri
                    </span>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-surface-dark rounded-xl shadow-xl w-full max-w-md">
                        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                                {editingType ? 'Edit Tipe Unit' : 'Tambah Tipe Unit'}
                            </h3>
                            <button 
                                onClick={handleCloseModal}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Nama Tipe *
                                </label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Kode *
                                </label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Deskripsi
                                </label>
                                <textarea
                                    rows={3}
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Icon
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary"
                                        value={formData.icon}
                                        onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Warna
                                    </label>
                                    <input
                                        type="color"
                                        className="w-full h-10 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50"
                                        value={formData.color}
                                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                    />
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    className="rounded border-slate-300 text-primary focus:ring-primary"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                />
                                <label htmlFor="is_active" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Status Aktif
                                </label>
                            </div>
                            
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors"
                                >
                                    {editingType ? 'Update' : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UnitTypes;
export { UnitTypes };