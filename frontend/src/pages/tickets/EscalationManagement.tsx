import { useState } from 'react';
import { Link } from 'react-router-dom';
import EscalationRuleModal from '../../components/EscalationRuleModal';

// Types
interface EscalationRule {
    id: string;
    name: string;
    description: string;
    is_active: boolean;
    trigger_conditions: {
        priority?: string[];
        status?: string[];
        time_threshold?: number;
        sentiment_threshold?: number;
    };
    actions: Array<{
        type: string;
        target?: string;
        message?: string;
    }>;
    created_at: string;
    updated_at: string;
}

// Mock data untuk development
const mockRules: EscalationRule[] = [
    {
        id: '1',
        name: 'Pelanggaran SLA Prioritas Tinggi',
        description: 'Eskalasi otomatis untuk tiket prioritas tinggi yang tidak ditangani dalam 1 jam',
        is_active: true,
        trigger_conditions: {
            priority: ['high', 'critical'],
            time_threshold: 3600
        },
        actions: [
            { type: 'notify_manager' },
            { type: 'bump_priority' }
        ],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
    },
    {
        id: '2',
        name: 'Peringatan Tiket Terhenti',
        description: 'Peringatkan penerima tugas jika tiket dalam status Progress lebih dari 48 jam tanpa update',
        is_active: true,
        trigger_conditions: {
            status: ['in_progress'],
            time_threshold: 172800
        },
        actions: [
            { type: 'notify_assignee' }
        ],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
    },
    {
        id: '3',
        name: 'Alert Sentimen Negatif',
        description: 'Tandai tiket dengan analisis sentimen AI di bawah 3/10',
        is_active: false,
        trigger_conditions: {
            sentiment_threshold: 3
        },
        actions: [
            { type: 'flag_review' }
        ],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
    }
];

const EscalationManagement = () => {
    const [rules, setRules] = useState<EscalationRule[]>(mockRules);
    const [loading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingRule, setEditingRule] = useState<EscalationRule | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleCreateRule = () => {
        setEditingRule(null);
        setShowModal(true);
    };

    const handleEditRule = (rule: EscalationRule) => {
        setEditingRule(rule);
        setShowModal(true);
    };

    const handleDeleteRule = async (ruleId: string) => {
        if (!confirm('Apakah Anda yakin ingin menghapus aturan ini?')) {
            return;
        }

        try {
            // Mock delete - remove from local state
            setRules(prev => prev.filter(rule => rule.id !== ruleId));
        } catch (err) {
            setError('Gagal menghapus aturan');
            console.error('Error deleting rule:', err);
        }
    };

    const handleToggleRule = async (ruleId: string, isActive: boolean) => {
        try {
            // Mock toggle - update local state
            setRules(prev => prev.map(rule => 
                rule.id === ruleId 
                    ? { ...rule, is_active: !isActive, updated_at: new Date().toISOString() }
                    : rule
            ));
        } catch (err) {
            setError('Gagal mengubah status aturan');
            console.error('Error toggling rule:', err);
        }
    };

    const handleModalClose = () => {
        setShowModal(false);
        setEditingRule(null);
    };

    const handleModalSave = async (ruleData: Partial<EscalationRule>) => {
        try {
            if (editingRule) {
                // Mock update
                setRules(prev => prev.map(rule => 
                    rule.id === editingRule.id 
                        ? { ...rule, ...ruleData, updated_at: new Date().toISOString() }
                        : rule
                ));
            } else {
                // Mock create
                const newRule: EscalationRule = {
                    ...ruleData as EscalationRule,
                    id: Date.now().toString(),
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                };
                setRules(prev => [newRule, ...prev]);
            }
            handleModalClose();
        } catch (err) {
            setError('Gagal menyimpan aturan');
            console.error('Error saving rule:', err);
        }
    };

    return (
        <>
            {/* Breadcrumbs & Heading */}
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                        <Link to="/tickets" className="hover:text-primary transition-colors">Tiket</Link>
                        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                        <span className="text-slate-900 dark:text-white font-medium">Manajemen Eskalasi</span>
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Aturan Eskalasi</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Konfigurasi kebijakan eskalasi otomatis untuk tiket yang tidak ditangani.</p>
                    </div>
                </div>
                <button 
                    onClick={handleCreateRule}
                    className="flex items-center gap-2 bg-primary hover:bg-blue-600 text-white px-4 py-2.5 rounded-lg shadow-sm shadow-blue-500/20 transition-all active:scale-95 font-medium text-sm w-fit"
                >
                    <span className="material-symbols-outlined text-[20px]">add</span>
                    Buat Aturan Baru
                </button>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-red-500">error</span>
                        <span className="text-red-700 dark:text-red-400">{error}</span>
                    </div>
                </div>
            )}

            {/* Loading State */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <span className="ml-3 text-slate-600 dark:text-slate-400">Memuat aturan eskalasi...</span>
                </div>
            ) : (
                /* Rules List */
                <div className="flex flex-col gap-4">
                    {rules.length === 0 ? (
                        <div className="text-center py-12">
                            <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-600 mb-4 block">rule</span>
                            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Belum ada aturan eskalasi</h3>
                            <p className="text-slate-500 dark:text-slate-400 mb-6">Buat aturan eskalasi pertama Anda untuk mengotomatisasi penanganan tiket.</p>
                            <button 
                                onClick={handleCreateRule}
                                className="inline-flex items-center gap-2 bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                <span className="material-symbols-outlined text-[18px]">add</span>
                                Buat Aturan Baru
                            </button>
                        </div>
                    ) : (
                        rules.map((rule) => (
                            <div key={rule.id} className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                                <div className="p-6 flex flex-col md:flex-row md:items-center gap-6">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="font-bold text-slate-900 dark:text-white text-lg">{rule.name}</h3>
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                                rule.is_active 
                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                                                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                            }`}>
                                                {rule.is_active ? 'Aktif' : 'Nonaktif'}
                                            </span>
                                        </div>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">{rule.description}</p>

                                        <div className="flex flex-wrap gap-4 text-sm">
                                            {rule.trigger_conditions.time_threshold && (
                                                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                                                    <span className="material-symbols-outlined text-[18px] text-slate-400">timer</span>
                                                    <span>Jika tidak ditangani selama <strong>{Math.floor(rule.trigger_conditions.time_threshold / 3600)} jam</strong></span>
                                                </div>
                                            )}
                                            {rule.trigger_conditions.priority && rule.trigger_conditions.priority.length > 0 && (
                                                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                                                    <span className="material-symbols-outlined text-[18px] text-slate-400">priority_high</span>
                                                    <span>Prioritas <strong>{rule.trigger_conditions.priority.join(', ')}</strong></span>
                                                </div>
                                            )}
                                            {rule.trigger_conditions.status && rule.trigger_conditions.status.length > 0 && (
                                                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                                                    <span className="material-symbols-outlined text-[18px] text-slate-400">pending</span>
                                                    <span>Status <strong>{rule.trigger_conditions.status.join(', ')}</strong></span>
                                                </div>
                                            )}
                                            {rule.trigger_conditions.sentiment_threshold && (
                                                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                                                    <span className="material-symbols-outlined text-[18px] text-slate-400">psychology</span>
                                                    <span>Skor Sentimen <strong>&lt; {rule.trigger_conditions.sentiment_threshold}</strong></span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 md:border-l md:border-slate-200 md:dark:border-slate-700 md:pl-6">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Aksi</span>
                                            <div className="flex flex-col gap-2">
                                                {rule.actions.map((action, index) => (
                                                    <div key={index} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                                                        <span className={`material-symbols-outlined text-[18px] ${getActionIcon(action.type).color}`}>
                                                            {getActionIcon(action.type).icon}
                                                        </span>
                                                        {getActionLabel(action.type)}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2 ml-4">
                                            <button 
                                                onClick={() => handleEditRule(rule)}
                                                className="p-2 text-slate-400 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                                title="Edit aturan"
                                            >
                                                <span className="material-symbols-outlined">edit</span>
                                            </button>
                                            <button 
                                                onClick={() => handleToggleRule(rule.id, rule.is_active)}
                                                className={`p-2 rounded-lg transition-colors ${
                                                    rule.is_active 
                                                        ? 'text-slate-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20' 
                                                        : 'text-slate-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20'
                                                }`}
                                                title={rule.is_active ? 'Nonaktifkan aturan' : 'Aktifkan aturan'}
                                            >
                                                <span className="material-symbols-outlined">
                                                    {rule.is_active ? 'pause' : 'play_arrow'}
                                                </span>
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteRule(rule.id)}
                                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                title="Hapus aturan"
                                            >
                                                <span className="material-symbols-outlined">delete</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <EscalationRuleModal
                    rule={editingRule}
                    onClose={handleModalClose}
                    onSave={handleModalSave}
                />
            )}

            <div className="h-10"></div>
        </>
    );
};

// Helper functions
const getActionIcon = (actionType: string) => {
    switch (actionType) {
        case 'notify_manager':
            return { icon: 'notifications', color: 'text-primary' };
        case 'notify_assignee':
            return { icon: 'mail', color: 'text-primary' };
        case 'bump_priority':
            return { icon: 'upgrade', color: 'text-orange-500' };
        case 'flag_review':
            return { icon: 'flag', color: 'text-red-500' };
        case 'escalate_to_role':
            return { icon: 'supervisor_account', color: 'text-purple-500' };
        default:
            return { icon: 'help', color: 'text-slate-400' };
    }
};

const getActionLabel = (actionType: string) => {
    switch (actionType) {
        case 'notify_manager':
            return 'Beritahu Manajer';
        case 'notify_assignee':
            return 'Beritahu Penerima Tugas';
        case 'bump_priority':
            return 'Naikkan Prioritas';
        case 'flag_review':
            return 'Tandai untuk Ditinjau';
        case 'escalate_to_role':
            return 'Eskalasi ke Peran';
        default:
            return 'Aksi Tidak Dikenal';
    }
};

export default EscalationManagement;