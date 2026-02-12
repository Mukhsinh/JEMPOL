import React, { useState, useEffect } from 'react';
import { SLASetting, CreateSLASettingData, UpdateSLASettingData } from '../../services/slaService';
import slaService from '../../services/slaService';
import SLAModal from '../../components/SLAModal';

const SLASettings: React.FC = () => {
    const [slaSettings, setSlaSettings] = useState<SLASetting[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSLA, setSelectedSLA] = useState<SLASetting | null>(null);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        console.log('SLASettings component mounted');
        loadSLASettings();
    }, []);

    const loadSLASettings = async () => {
        try {
            console.log('Loading SLA settings...');
            setLoading(true);
            setError(null);
            const data = await slaService.getSLASettings();
            console.log('SLA settings loaded successfully:', data);
            setSlaSettings(data);
        } catch (err) {
            console.error('Error loading SLA settings:', err);
            setError('Gagal memuat pengaturan SLA');
        } finally {
            setLoading(false);
            console.log('SLA settings loading finished');
        }
    };

    const handleCreate = () => {
        setSelectedSLA(null);
        setModalMode('create');
        setIsModalOpen(true);
    };

    const handleEdit = (sla: SLASetting) => {
        setSelectedSLA(sla);
        setModalMode('edit');
        setIsModalOpen(true);
    };

    const handleSave = async (data: CreateSLASettingData | UpdateSLASettingData) => {
        try {
            if (modalMode === 'create') {
                await slaService.createSLASetting(data as CreateSLASettingData);
            } else if (selectedSLA) {
                await slaService.updateSLASetting(selectedSLA.id, data as UpdateSLASettingData);
            }
            await loadSLASettings();
            setIsModalOpen(false);
        } catch (err) {
            console.error('Error saving SLA setting:', err);
            setError('Gagal menyimpan pengaturan SLA');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Apakah Anda yakin ingin menghapus pengaturan SLA ini?')) {
            return;
        }

        try {
            await slaService.deleteSLASetting(id);
            await loadSLASettings();
        } catch (err) {
            console.error('Error deleting SLA setting:', err);
            setError('Gagal menghapus pengaturan SLA');
        }
    };

    const getPriorityBadge = (priority: string) => {
        const badges = {
            low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
            medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
            high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
            critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
        };

        const labels = {
            low: 'Rendah',
            medium: 'Sedang',
            high: 'Tinggi',
            critical: 'Kritis'
        };

        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${badges[priority as keyof typeof badges] || badges.medium}`}>
                {labels[priority as keyof typeof labels] || priority}
            </span>
        );
    };

    const filteredSLASettings = slaSettings.filter(sla =>
        sla.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sla.unit_types?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sla.service_categories?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sla.patient_types?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <div className="flex">
                        <span className="material-symbols-outlined text-red-400 mr-3">error</span>
                        <div>
                            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
                            <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                            search
                        </span>
                        <input
                            type="text"
                            placeholder="Cari pengaturan SLA..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                        />
                    </div>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <span className="material-symbols-outlined mr-2">add</span>
                    Tambah SLA
                </button>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow">
                {filteredSLASettings.length === 0 ? (
                    <div className="p-8 text-center">
                        <span className="material-symbols-outlined text-slate-400 text-4xl mb-4 block">settings</span>
                        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                            {searchTerm ? 'Tidak ada hasil yang ditemukan' : 'Belum ada pengaturan SLA'}
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 mb-4">
                            {searchTerm 
                                ? 'Coba ubah kata kunci pencarian Anda'
                                : 'Mulai dengan menambahkan pengaturan SLA pertama Anda'
                            }
                        </p>
                        {!searchTerm && (
                            <button
                                onClick={handleCreate}
                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <span className="material-symbols-outlined mr-2">add</span>
                                Tambah SLA
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 dark:bg-slate-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        Nama
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        Prioritas
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        Waktu Respon
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
                                {filteredSLASettings.map((sla) => (
                                    <tr key={sla.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-slate-900 dark:text-white">
                                                {sla.name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getPriorityBadge(sla.priority_level)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-slate-500 dark:text-slate-400">
                                                {sla.response_time_hours}h
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                sla.is_active 
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                                            }`}>
                                                {sla.is_active ? 'Aktif' : 'Nonaktif'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end space-x-1">
                                                <button
                                                    onClick={() => handleEdit(sla)}
                                                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                                                    title="Edit"
                                                >
                                                    <span className="material-symbols-outlined text-xs">edit</span>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(sla.id)}
                                                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                                    title="Hapus"
                                                >
                                                    <span className="material-symbols-outlined text-xs">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <SLAModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                    sla={selectedSLA}
                    mode={modalMode}
                />
            )}
        </div>
    );
};

export default SLASettings;