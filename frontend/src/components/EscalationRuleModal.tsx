import React, { useState, useEffect } from 'react';
import type { EscalationRule } from '../services/escalationService';

interface EscalationRuleModalProps {
    isOpen: boolean;
    rule?: EscalationRule | null;
    onClose: () => void;
    onSave: (ruleData: Partial<EscalationRule>) => Promise<void>;
}

interface RuleFormData {
    name: string;
    description: string;
    is_active: boolean;
    trigger_conditions: {
        priority: string[];
        status: string[];
        time_threshold?: number;
        sentiment_threshold?: number;
    };
    actions: Array<{
        type: 'notify_manager' | 'notify_assignee' | 'bump_priority' | 'flag_review' | 'escalate_to_role';
        target?: string;
        message?: string;
    }>;
}

const EscalationRuleModal: React.FC<EscalationRuleModalProps> = ({ isOpen, rule, onClose, onSave }) => {
    const [formData, setFormData] = useState<RuleFormData>({
        name: '',
        description: '',
        is_active: true,
        trigger_conditions: {
            priority: [],
            status: [],
        },
        actions: []
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const priorityOptions = ['low', 'medium', 'high', 'critical'];
    const statusOptions = ['open', 'in_progress', 'pending', 'resolved', 'closed'];
    const actionTypes = [
        { value: 'notify_manager', label: 'Beritahu Manajer' },
        { value: 'notify_assignee', label: 'Beritahu Penerima Tugas' },
        { value: 'bump_priority', label: 'Naikkan Prioritas' },
        { value: 'flag_review', label: 'Tandai untuk Ditinjau' },
        { value: 'escalate_to_role', label: 'Eskalasi ke Peran' }
    ];

    useEffect(() => {
        if (rule) {
            setFormData({
                name: rule.name,
                description: rule.description || '',
                is_active: rule.is_active,
                trigger_conditions: {
                    priority: rule.trigger_conditions.priority || [],
                    status: rule.trigger_conditions.status || [],
                    time_threshold: rule.trigger_conditions.time_threshold,
                    sentiment_threshold: rule.trigger_conditions.sentiment_threshold
                },
                actions: rule.actions
            });
        }
    }, [rule]);

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleTriggerConditionChange = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            trigger_conditions: {
                ...prev.trigger_conditions,
                [field]: value
            }
        }));
    };

    const handlePriorityChange = (priority: string, checked: boolean) => {
        const currentPriorities = formData.trigger_conditions.priority || [];
        if (checked) {
            handleTriggerConditionChange('priority', [...currentPriorities, priority]);
        } else {
            handleTriggerConditionChange('priority', currentPriorities.filter(p => p !== priority));
        }
    };

    const handleStatusChange = (status: string, checked: boolean) => {
        const currentStatuses = formData.trigger_conditions.status || [];
        if (checked) {
            handleTriggerConditionChange('status', [...currentStatuses, status]);
        } else {
            handleTriggerConditionChange('status', currentStatuses.filter(s => s !== status));
        }
    };

    const addAction = () => {
        setFormData(prev => ({
            ...prev,
            actions: [...prev.actions, { type: 'notify_manager' }]
        }));
    };

    const removeAction = (index: number) => {
        setFormData(prev => ({
            ...prev,
            actions: prev.actions.filter((_, i) => i !== index)
        }));
    };

    const updateAction = (index: number, field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            actions: prev.actions.map((action, i) => 
                i === index ? { ...action, [field]: value } : action
            )
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await onSave(formData);
        } catch (err: any) {
            setError(err.message || (rule ? 'Gagal mengupdate aturan' : 'Gagal membuat aturan'));
            console.error('Error saving rule:', err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-surface-dark rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                        {rule ? 'Edit Aturan Eskalasi' : 'Buat Aturan Eskalasi Baru'}
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-red-500">error</span>
                                <span className="text-red-700 dark:text-red-400">{error}</span>
                            </div>
                        </div>
                    )}

                    {/* Basic Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Informasi Dasar</h3>
                        
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Nama Aturan *
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-slate-800 dark:text-white"
                                placeholder="Masukkan nama aturan"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Deskripsi
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-slate-800 dark:text-white"
                                placeholder="Deskripsi aturan eskalasi"
                                rows={3}
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="is_active"
                                checked={formData.is_active}
                                onChange={(e) => handleInputChange('is_active', e.target.checked)}
                                className="rounded border-slate-300 text-primary focus:ring-primary"
                            />
                            <label htmlFor="is_active" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                Aktifkan aturan ini
                            </label>
                        </div>
                    </div>

                    {/* Trigger Conditions */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Kondisi Pemicu</h3>
                        
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Prioritas
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {priorityOptions.map(priority => (
                                    <label key={priority} className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={formData.trigger_conditions.priority?.includes(priority) || false}
                                            onChange={(e) => handlePriorityChange(priority, e.target.checked)}
                                            className="rounded border-slate-300 text-primary focus:ring-primary"
                                        />
                                        <span className="text-sm text-slate-700 dark:text-slate-300 capitalize">{priority}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Status
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {statusOptions.map(status => (
                                    <label key={status} className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={formData.trigger_conditions.status?.includes(status) || false}
                                            onChange={(e) => handleStatusChange(status, e.target.checked)}
                                            className="rounded border-slate-300 text-primary focus:ring-primary"
                                        />
                                        <span className="text-sm text-slate-700 dark:text-slate-300 capitalize">{status.replace('_', ' ')}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Batas Waktu (jam)
                            </label>
                            <input
                                type="number"
                                value={formData.trigger_conditions.time_threshold ? Math.floor(formData.trigger_conditions.time_threshold / 3600) : ''}
                                onChange={(e) => handleTriggerConditionChange('time_threshold', e.target.value ? parseInt(e.target.value) * 3600 : undefined)}
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-slate-800 dark:text-white"
                                placeholder="Masukkan batas waktu dalam jam"
                                min="1"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Batas Skor Sentimen (1-10)
                            </label>
                            <input
                                type="number"
                                value={formData.trigger_conditions.sentiment_threshold || ''}
                                onChange={(e) => handleTriggerConditionChange('sentiment_threshold', e.target.value ? parseFloat(e.target.value) : undefined)}
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-slate-800 dark:text-white"
                                placeholder="Masukkan batas skor sentimen"
                                min="1"
                                max="10"
                                step="0.1"
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Aksi</h3>
                            <button
                                type="button"
                                onClick={addAction}
                                className="flex items-center gap-2 text-primary hover:text-blue-600 text-sm font-medium"
                            >
                                <span className="material-symbols-outlined text-[18px]">add</span>
                                Tambah Aksi
                            </button>
                        </div>

                        {formData.actions.map((action, index) => (
                            <div key={index} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Aksi {index + 1}</span>
                                    <button
                                        type="button"
                                        onClick={() => removeAction(index)}
                                        className="text-red-500 hover:text-red-600"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">delete</span>
                                    </button>
                                </div>
                                
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                            Tipe Aksi
                                        </label>
                                        <select
                                            value={action.type}
                                            onChange={(e) => updateAction(index, 'type', e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-slate-800 dark:text-white"
                                        >
                                            {actionTypes.map(type => (
                                                <option key={type.value} value={type.value}>{type.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {(action.type === 'escalate_to_role' || action.type === 'notify_manager') && (
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                                Target
                                            </label>
                                            <input
                                                type="text"
                                                value={action.target || ''}
                                                onChange={(e) => updateAction(index, 'target', e.target.value)}
                                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-slate-800 dark:text-white"
                                                placeholder="Masukkan target (email, role, dll)"
                                            />
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                            Pesan (Opsional)
                                        </label>
                                        <textarea
                                            value={action.message || ''}
                                            onChange={(e) => updateAction(index, 'message', e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-slate-800 dark:text-white"
                                            placeholder="Pesan kustom untuk aksi ini"
                                            rows={2}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}

                        {formData.actions.length === 0 && (
                            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                                <span className="material-symbols-outlined text-4xl mb-2 block">add_task</span>
                                <p>Belum ada aksi yang ditambahkan</p>
                                <p className="text-sm">Klik "Tambah Aksi" untuk menambahkan aksi pertama</p>
                            </div>
                        )}
                    </div>

                    {/* Form Actions */}
                    <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200 dark:border-slate-700">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium"
                            disabled={loading}
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="flex items-center gap-2 bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading}
                        >
                            {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                            {rule ? 'Update Aturan' : 'Buat Aturan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EscalationRuleModal;