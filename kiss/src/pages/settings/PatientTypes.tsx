import React, { useState, useEffect } from 'react';
import { masterDataService, PatientType } from '../../services/masterDataService';

const PatientTypes: React.FC = () => {
    const [patientTypes, setPatientTypes] = useState<PatientType[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [editingType, setEditingType] = useState<PatientType | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        description: '',
        priority_level: 3,
        default_sla_hours: 24,
        is_active: true
    });

    useEffect(() => {
        fetchPatientTypes();
    }, []);

    const fetchPatientTypes = async () => {
        try {
            setLoading(true);
            const data = await masterDataService.getPatientTypes();
            setPatientTypes(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching patient types:', error);
            setPatientTypes([]); // Set empty array on error
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingType) {
                console.log('🔄 Updating patient type:', editingType.id, formData);
                await masterDataService.updatePatientType(editingType.id, formData);
                console.log('✅ Update berhasil');
            } else {
                console.log('➕ Creating patient type:', formData);
                await masterDataService.createPatientType(formData);
                console.log('✅ Create berhasil');
            }
            await fetchPatientTypes();
            handleCloseModal();
            alert(editingType ? 'Data berhasil diperbarui!' : 'Data berhasil ditambahkan!');
        } catch (error: any) {
            console.error('❌ Error saving patient type:', error);
            alert(`Gagal menyimpan data: ${error.message || 'Unknown error'}`);
        }
    };

    const handleEdit = (type: PatientType) => {
        console.log('✏️ Editing patient type:', type);
        setEditingType(type);
        setFormData({
            name: type.name,
            code: type.code,
            description: type.description || '',
            priority_level: type.priority_level,
            default_sla_hours: type.default_sla_hours,
            is_active: type.is_active
        });
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus jenis pasien ini?')) {
            try {
                console.log('🗑️ Deleting patient type:', id);
                await masterDataService.deletePatientType(id);
                console.log('✅ Delete berhasil');
                await fetchPatientTypes();
                alert('Data berhasil dihapus!');
            } catch (error: any) {
                console.error('❌ Error deleting patient type:', error);
                
                // Tampilkan pesan error yang lebih informatif
                let errorMessage = 'Gagal menghapus data';
                
                if (error.response?.data?.error) {
                    errorMessage = error.response.data.error;
                } else if (error.message) {
                    errorMessage = error.message;
                }
                
                alert(errorMessage);
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
            priority_level: 3,
            default_sla_hours: 24,
            is_active: true
        });
    };

    // Ensure patientTypes is an array before filtering
    const safePatientTypes = Array.isArray(patientTypes) ? patientTypes : [];
    const filteredTypes = safePatientTypes.filter(type => {
        const matchesSearch = type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            type.code.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' ||
            (statusFilter === 'active' && type.is_active) ||
            (statusFilter === 'inactive' && !type.is_active);
        return matchesSearch && matchesStatus;
    });

    const getPriorityLabel = (level: number) => {
        const labels = {
            1: 'Sangat Rendah',
            2: 'Rendah',
            3: 'Normal',
            4: 'Tinggi',
            5: 'Sangat Tinggi'
        };
        return labels[level as keyof typeof labels] || 'Normal';
    };

    const getPriorityColor = (level: number) => {
        const colors = {
            1: 'bg-gray-100 text-gray-800',
            2: 'bg-blue-100 text-blue-800',
            3: 'bg-green-100 text-green-800',
            4: 'bg-yellow-100 text-yellow-800',
            5: 'bg-red-100 text-red-800'
        };
        return colors[level as keyof typeof colors] || 'bg-green-100 text-green-800';
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
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Cari jenis pasien..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:border-primary focus:ring-1 focus:ring-primary"
                        />
                        <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-sm">search</span>
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary"
                    >
                        <option value="all">Semua Status</option>
                        <option value="active">Aktif</option>
                        <option value="inactive">Tidak Aktif</option>
                    </select>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="inline-flex items-center gap-2 bg-primary hover:bg-blue-600 text-white font-medium px-4 py-2 rounded-lg transition-colors"
                >
                    <span className="material-symbols-outlined text-sm">add</span>
                    Tambah Jenis Pasien
                </button>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 dark:bg-slate-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    Nama
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    Kode
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    Prioritas
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    SLA Default
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                            {filteredTypes.map((type) => (
                                <tr key={type.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm font-medium text-slate-900 dark:text-white">
                                                {type.name}
                                            </div>
                                            {type.description && (
                                                <div className="text-sm text-slate-500 dark:text-slate-400">
                                                    {type.description}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm font-mono text-slate-600 dark:text-slate-300">
                                            {type.code}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(type.priority_level)}`}>
                                            {getPriorityLabel(type.priority_level)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white">
                                        {type.default_sla_hours} jam
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${type.is_active
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                            }`}>
                                            {type.is_active ? 'Aktif' : 'Tidak Aktif'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleEdit(type)}
                                                className="p-1.5 text-slate-400 hover:text-primary hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">edit</span>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(type.id)}
                                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                                title="Hapus"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">
                            {editingType ? 'Edit Jenis Pasien' : 'Tambah Jenis Pasien'}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Nama
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Kode
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Deskripsi
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Level Prioritas
                                </label>
                                <select
                                    value={formData.priority_level}
                                    onChange={(e) => setFormData({ ...formData, priority_level: parseInt(e.target.value) })}
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary"
                                >
                                    <option value={1}>1 - Sangat Rendah</option>
                                    <option value={2}>2 - Rendah</option>
                                    <option value={3}>3 - Normal</option>
                                    <option value={4}>4 - Tinggi</option>
                                    <option value={5}>5 - Sangat Tinggi</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    SLA Default (jam)
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    required
                                    value={formData.default_sla_hours}
                                    onChange={(e) => setFormData({ ...formData, default_sla_hours: parseInt(e.target.value) })}
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary"
                                />
                            </div>
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    className="h-4 w-4 text-primary focus:ring-primary border-slate-300 rounded"
                                />
                                <label htmlFor="is_active" className="ml-2 block text-sm text-slate-700 dark:text-slate-300">
                                    Aktif
                                </label>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-primary hover:bg-blue-600 text-white rounded-lg transition-colors"
                                >
                                    {editingType ? 'Perbarui' : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PatientTypes;