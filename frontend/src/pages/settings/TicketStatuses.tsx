import React, { useState, useEffect } from 'react';
import { masterDataService, TicketStatus } from '../../services/masterDataService';

const TicketStatuses: React.FC = () => {
    const [ticketStatuses, setTicketStatuses] = useState<TicketStatus[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [editingStatus, setEditingStatus] = useState<TicketStatus | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        description: '',
        status_type: 'open' as 'open' | 'in_progress' | 'resolved' | 'closed' | 'cancelled',
        color: '#6B7280',
        is_final: false,
        display_order: 0,
        is_active: true
    });

    useEffect(() => {
        fetchTicketStatuses();
    }, []);

    const fetchTicketStatuses = async () => {
        try {
            setLoading(true);
            const data = await masterDataService.getTicketStatuses();
            setTicketStatuses(data);
        } catch (error) {
            console.error('Error fetching ticket statuses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingStatus) {
                await masterDataService.updateTicketStatus(editingStatus.id, formData);
            } else {
                await masterDataService.createTicketStatus(formData);
            }
            await fetchTicketStatuses();
            handleCloseModal();
        } catch (error) {
            console.error('Error saving ticket status:', error);
        }
    };

    const handleEdit = (status: TicketStatus) => {
        setEditingStatus(status);
        setFormData({
            name: status.name,
            code: status.code,
            description: status.description || '',
            status_type: status.status_type as any,
            color: status.color || '#6B7280',
            is_final: status.is_final,
            display_order: status.display_order,
            is_active: status.is_active
        });
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus status tiket ini?')) {
            try {
                await masterDataService.deleteTicketStatus(id);
                await fetchTicketStatuses();
            } catch (error) {
                console.error('Error deleting ticket status:', error);
            }
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingStatus(null);
        setFormData({
            name: '',
            code: '',
            description: '',
            status_type: 'open',
            color: '#6B7280',
            is_final: false,
            display_order: 0,
            is_active: true
        });
    };

    const filteredStatuses = ticketStatuses.filter(status => {
        const matchesSearch = status.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            status.code.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || 
                            (statusFilter === 'active' && status.is_active) ||
                            (statusFilter === 'inactive' && !status.is_active);
        return matchesSearch && matchesStatus;
    });

    const getStatusTypeLabel = (type: string) => {
        const labels = {
            'open': 'Terbuka',
            'in_progress': 'Dalam Proses',
            'resolved': 'Terselesaikan',
            'closed': 'Ditutup',
            'cancelled': 'Dibatalkan'
        };
        return labels[type as keyof typeof labels] || type;
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
                            placeholder="Cari status tiket..."
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
                    Tambah Status Tiket
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
                                    Tipe
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    Urutan
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
                            {filteredStatuses.map((status) => (
                                <tr key={status.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div 
                                                className="w-3 h-3 rounded-full mr-3"
                                                style={{ backgroundColor: status.color }}
                                            ></div>
                                            <div>
                                                <div className="text-sm font-medium text-slate-900 dark:text-white">
                                                    {status.name}
                                                </div>
                                                {status.description && (
                                                    <div className="text-sm text-slate-500 dark:text-slate-400">
                                                        {status.description}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm font-mono text-slate-600 dark:text-slate-300">
                                            {status.code}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {getStatusTypeLabel(status.status_type)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white">
                                        {status.display_order}
                                        {status.is_final && (
                                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                                Final
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            status.is_active 
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                        }`}>
                                            {status.is_active ? 'Aktif' : 'Tidak Aktif'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleEdit(status)}
                                                className="text-primary hover:text-blue-600 p-1"
                                                title="Edit"
                                            >
                                                <span className="material-symbols-outlined text-sm">edit</span>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(status.id)}
                                                className="text-red-600 hover:text-red-700 p-1"
                                                title="Hapus"
                                            >
                                                <span className="material-symbols-outlined text-sm">delete</span>
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
                            {editingStatus ? 'Edit Status Tiket' : 'Tambah Status Tiket'}
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
                                    Tipe Status
                                </label>
                                <select
                                    value={formData.status_type}
                                    onChange={(e) => setFormData({ ...formData, status_type: e.target.value as any })}
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary"
                                >
                                    <option value="open">Terbuka</option>
                                    <option value="in_progress">Dalam Proses</option>
                                    <option value="resolved">Terselesaikan</option>
                                    <option value="closed">Ditutup</option>
                                    <option value="cancelled">Dibatalkan</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Warna
                                </label>
                                <input
                                    type="color"
                                    value={formData.color}
                                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                    className="w-full h-10 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 focus:border-primary focus:ring-1 focus:ring-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Urutan Tampil
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.display_order}
                                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary"
                                />
                            </div>
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="is_final"
                                    checked={formData.is_final}
                                    onChange={(e) => setFormData({ ...formData, is_final: e.target.checked })}
                                    className="h-4 w-4 text-primary focus:ring-primary border-slate-300 rounded"
                                />
                                <label htmlFor="is_final" className="ml-2 block text-sm text-slate-700 dark:text-slate-300">
                                    Status Final
                                </label>
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
                                    {editingStatus ? 'Perbarui' : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TicketStatuses;