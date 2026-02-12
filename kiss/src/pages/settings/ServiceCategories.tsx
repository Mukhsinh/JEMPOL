import React, { useState, useEffect } from 'react';
import { masterDataService } from '../../services/masterDataService';

interface ServiceCategory {
    id: string;
    name: string;
    code: string;
    description?: string;
    default_sla_hours: number;
    requires_attachment: boolean;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export const ServiceCategories: React.FC = () => {
    const [categories, setCategories] = useState<ServiceCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        description: '',
        default_sla_hours: 24,
        requires_attachment: false,
        is_active: true
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const data = await masterDataService.getServiceCategories();
            setCategories(data);
        } catch (error) {
            console.error('Error fetching service categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingCategory) {
                await masterDataService.updateServiceCategory(editingCategory.id, formData);
            } else {
                await masterDataService.createServiceCategory(formData);
            }
            await fetchCategories();
            handleCloseModal();
        } catch (error) {
            console.error('Error saving service category:', error);
        }
    };

    const handleEdit = (category: ServiceCategory) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            code: category.code,
            description: category.description || '',
            default_sla_hours: category.default_sla_hours,
            requires_attachment: category.requires_attachment,
            is_active: category.is_active
        });
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus kategori layanan ini?')) {
            try {
                await masterDataService.deleteServiceCategory(id);
                await fetchCategories();
            } catch (error) {
                console.error('Error deleting service category:', error);
            }
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingCategory(null);
        setFormData({
            name: '',
            code: '',
            description: '',
            default_sla_hours: 24,
            requires_attachment: false,
            is_active: true
        });
    };

    const filteredCategories = categories.filter(category => {
        const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            category.code.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || 
                            (statusFilter === 'active' && category.is_active) ||
                            (statusFilter === 'inactive' && !category.is_active);
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6">
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
                        Tambah Kategori Baru
                    </button>
                </div>
            </div>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Kategori Layanan</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">Kelola kategori layanan untuk sistem keluhan</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                    <span className="material-symbols-outlined text-sm">add</span>
                    Tambah Kategori
                </button>
            </div>

            {/* Search and Filters */}
                <div className="bg-surface-light dark:bg-surface-dark p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-4 items-center mb-6">
                    <div className="relative w-full md:w-96 group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="material-symbols-outlined text-slate-400 group-focus-within:text-primary">search</span>
                        </div>
                        <input 
                            className="block w-full pl-10 pr-3 py-2.5 border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder-slate-400 focus:border-primary focus:ring-1 focus:ring-primary text-sm transition-shadow" 
                            placeholder="Cari nama atau kode kategori..." 
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
                                    <th className="px-6 py-4 font-semibold" scope="col">Nama Kategori</th>
                                    <th className="px-6 py-4 font-semibold" scope="col">Kode</th>
                                    <th className="px-6 py-4 font-semibold" scope="col">SLA Default</th>
                                    <th className="px-6 py-4 font-semibold" scope="col">Lampiran</th>
                                    <th className="px-6 py-4 font-semibold" scope="col">Status</th>
                                    <th className="px-6 py-4 font-semibold text-right" scope="col">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                            <div className="flex items-center justify-center">
                                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                                                <span className="ml-2">Memuat data...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredCategories.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                            Tidak ada data kategori layanan
                                        </td>
                                    </tr>
                                ) : (
                                    filteredCategories.map((category) => (
                                        <tr key={category.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                            <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                                                <div className="flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-slate-400 text-lg">category</span>
                                                    <div>
                                                        <div>{category.name}</div>
                                                        {category.description && (
                                                            <div className="text-xs text-slate-500 mt-1">{category.description}</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 font-mono text-xs">{category.code}</td>
                                            <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{category.default_sla_hours} Jam</td>
                                            <td className="px-6 py-4">
                                                {category.requires_attachment ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-100 dark:border-blue-800">
                                                        <span className="material-symbols-outlined text-xs">attach_file</span>
                                                        Wajib
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-50 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400 border border-slate-100 dark:border-slate-800">
                                                        Opsional
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                                                    category.is_active
                                                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800'
                                                        : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-100 dark:border-red-800'
                                                }`}>
                                                    <span className={`size-1.5 rounded-full ${category.is_active ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                                                    {category.is_active ? 'Aktif' : 'Tidak Aktif'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button 
                                                        onClick={() => handleEdit(category)}
                                                        className="p-1.5 text-primary hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                                        title="Edit"
                                                    >
                                                        <span className="material-symbols-outlined text-[18px]">edit</span>
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(category.id)}
                                                        className="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                                        title="Hapus"
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
                            Menampilkan {filteredCategories.length} dari {categories.length} entri
                        </span>
                    </div>
                </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-surface-dark rounded-xl shadow-xl w-full max-w-md">
                        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                                {editingCategory ? 'Edit Kategori Layanan' : 'Tambah Kategori Layanan'}
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
                                    Nama Kategori *
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
                            
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    SLA Default (Jam) *
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary"
                                    value={formData.default_sla_hours}
                                    onChange={(e) => setFormData({ ...formData, default_sla_hours: parseInt(e.target.value) })}
                                />
                            </div>
                            
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="requires_attachment"
                                    className="rounded border-slate-300 text-primary focus:ring-primary"
                                    checked={formData.requires_attachment}
                                    onChange={(e) => setFormData({ ...formData, requires_attachment: e.target.checked })}
                                />
                                <label htmlFor="requires_attachment" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Wajib Lampiran
                                </label>
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
                                    {editingCategory ? 'Update' : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};