import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { escalationService, EscalationStats } from '../../services/escalationService';
import type { EscalationRule } from '../../services/escalationService';
import EscalationRuleModal from '../../components/EscalationRuleModal';

const EscalationManagement: React.FC = () => {
  const { user, hasGlobalAccess, userUnitId } = useAuth();
  const [rules, setRules] = useState<EscalationRule[]>([]);
  const [stats, setStats] = useState<EscalationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<EscalationRule | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<string | undefined>(undefined);
  const [units, setUnits] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    fetchData();
    if (hasGlobalAccess) {
      fetchUnits();
    }
  }, [selectedUnit, userUnitId, hasGlobalAccess]);

  const fetchUnits = async () => {
    try {
      // Fetch units untuk dropdown (hanya untuk superadmin/direktur)
      const { data, error } = await escalationService.getUnits();
      if (error) throw error;
      setUnits(data || []);
    } catch (err) {
      console.warn('Failed to load units:', err);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Timeout untuk mencegah loading terlalu lama
      const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 5000)
      );

      const [rulesData, statsData] = await Promise.race([
        Promise.all([
          escalationService.getRules(userUnitId, hasGlobalAccess, selectedUnit).catch(err => {
            console.warn('Failed to load rules:', err);
            return [];
          }),
          escalationService.getStats(userUnitId, hasGlobalAccess, selectedUnit).catch(err => {
            console.warn('Failed to load stats:', err);
            return {
              rules: { total: 0, active: 0, inactive: 0 },
              executions: { total: 0, successful: 0, failed: 0, partial: 0, successRate: 0 },
              tickets: { escalated: 0 },
              period: '30 days'
            };
          })
        ]),
        timeout
      ]) as any;
      
      // Normalize data - pastikan rulesData adalah array
      let normalizedRules: EscalationRule[] = [];
      if (Array.isArray(rulesData)) {
        normalizedRules = rulesData.map(rule => normalizeRule(rule));
      } else if (rulesData?.data && Array.isArray(rulesData.data)) {
        normalizedRules = rulesData.data.map((rule: any) => normalizeRule(rule));
      } else if (rulesData?.rules && Array.isArray(rulesData.rules)) {
        normalizedRules = rulesData.rules.map((rule: any) => normalizeRule(rule));
      }
      
      setRules(normalizedRules);
      setStats(statsData);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      if (err.message === 'Request timeout') {
        setError('Koneksi lambat. Silakan refresh halaman atau periksa koneksi internet Anda.');
      } else if (err.message === 'ACCESS_DENIED') {
        setError('Anda tidak memiliki akses ke data eskalasi ini. Data ini melibatkan unit kerja lain.');
      } else {
        setError(err.message || 'Gagal memuat data eskalasi');
      }
      // Set empty data on error
      setRules([]);
      setStats({
        rules: { total: 0, active: 0, inactive: 0 },
        executions: { total: 0, successful: 0, failed: 0, partial: 0, successRate: 0 },
        tickets: { escalated: 0 },
        period: '30 days'
      });
    } finally {
      setLoading(false);
    }
  };

  const normalizeRule = (rule: any): EscalationRule => {
    let actions = [];
    let trigger_conditions = {};
    
    try {
      if (Array.isArray(rule.actions)) {
        actions = rule.actions;
      } else if (typeof rule.actions === 'string' && rule.actions) {
        actions = JSON.parse(rule.actions);
      } else if (rule.actions && typeof rule.actions === 'object') {
        actions = [rule.actions];
      }
    } catch (e) {
      actions = [];
    }
    
    try {
      if (typeof rule.trigger_conditions === 'string' && rule.trigger_conditions) {
        trigger_conditions = JSON.parse(rule.trigger_conditions);
      } else if (rule.trigger_conditions && typeof rule.trigger_conditions === 'object') {
        trigger_conditions = rule.trigger_conditions;
      }
    } catch (e) {
      trigger_conditions = {};
    }
    
    return {
      ...rule,
      actions: Array.isArray(actions) ? actions : [],
      trigger_conditions
    };
  };

  const handleToggleRule = async (id: string, isActive: boolean) => {
    try {
      setActionLoading(id);
      await escalationService.toggleRuleStatus(id, !isActive);
      await fetchData();
    } catch (err: any) {
      console.error('Error toggling rule:', err);
      if (err.message === 'ACCESS_DENIED') {
        setError('Anda tidak memiliki akses untuk mengubah aturan ini.');
      } else {
        setError(err.message || 'Gagal mengubah status aturan');
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteRule = async (id: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus aturan ini?')) return;
    
    try {
      setActionLoading(id);
      await escalationService.deleteRule(id);
      await fetchData();
    } catch (err: any) {
      console.error('Error deleting rule:', err);
      if (err.message === 'ACCESS_DENIED') {
        setError('Anda tidak memiliki akses untuk menghapus aturan ini.');
      } else {
        setError(err.message || 'Gagal menghapus aturan');
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddRule = () => {
    setSelectedRule(null);
    setIsModalOpen(true);
  };

  const handleEditRule = (rule: EscalationRule) => {
    setSelectedRule(rule);
    setIsModalOpen(true);
  };

  const handleSaveRule = async (ruleData: Partial<EscalationRule>) => {
    try {
      if (selectedRule) {
        await escalationService.updateRule(selectedRule.id, ruleData);
      } else {
        await escalationService.createRule(ruleData as any);
      }
      setIsModalOpen(false);
      await fetchData();
    } catch (err: any) {
      console.error('Error saving rule:', err);
      if (err.message === 'ACCESS_DENIED') {
        setError('Anda tidak memiliki akses untuk menyimpan aturan ini.');
      }
      throw err;
    }
  };

  const getActionsText = (actions: any): string => {
    try {
      if (!actions) return '-';
      let actionsArray = Array.isArray(actions) ? actions : [actions];
      if (actionsArray.length === 0) return '-';
      
      const actionLabels: Record<string, string> = {
        'notify_manager': 'Notifikasi Manager',
        'notify_assignee': 'Notifikasi Penerima',
        'bump_priority': 'Naikkan Prioritas',
        'flag_review': 'Tandai Review',
        'escalate_to_role': 'Eskalasi ke Role'
      };
      
      return actionsArray.map((a: any) => {
        const type = a?.type || 'unknown';
        return actionLabels[type] || type.replace(/_/g, ' ');
      }).join(', ');
    } catch {
      return '-';
    }
  };

  const getConditionsText = (conditions: any): string => {
    try {
      if (!conditions || typeof conditions !== 'object') return '-';
      
      const parts: string[] = [];
      if (conditions.priority?.length) parts.push(`Prioritas: ${conditions.priority.join(', ')}`);
      if (conditions.status?.length) parts.push(`Status: ${conditions.status.join(', ')}`);
      if (conditions.time_threshold) {
        const hours = Math.floor(conditions.time_threshold / 3600);
        parts.push(`Waktu: ${hours} jam`);
      }
      if (conditions.sentiment_threshold) parts.push(`Sentimen: < ${conditions.sentiment_threshold}`);
      if (conditions.confidence_threshold) parts.push(`Confidence: ${conditions.confidence_threshold}%`);
      if (conditions.type) parts.push(`Tipe: ${conditions.type}`);
      
      return parts.length > 0 ? parts.join(' | ') : '-';
    } catch {
      return '-';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">Memuat data eskalasi...</span>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manajemen Eskalasi</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Kelola aturan eskalasi tiket otomatis</p>
        </div>
        <button
          onClick={handleAddRule}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2 transition-colors"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Tambah Aturan
        </button>
      </div>

      {/* Unit Context Indicator - untuk regular user */}
      {!hasGlobalAccess && user?.unit_name && (
        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 mr-2">location_on</span>
            <span className="text-sm text-blue-700 dark:text-blue-300">
              Menampilkan eskalasi untuk: <strong>{user.unit_name}</strong>
            </span>
          </div>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 ml-7">
            Anda dapat melihat eskalasi yang melibatkan unit Anda (sebagai pengirim atau penerima)
          </p>
        </div>
      )}

      {/* Unit Selector - hanya untuk superadmin/direktur */}
      {hasGlobalAccess && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Filter Unit
          </label>
          <select
            value={selectedUnit || 'all'}
            onChange={(e) => setSelectedUnit(e.target.value === 'all' ? undefined : e.target.value)}
            className="w-full md:w-64 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Semua Unit</option>
            {units.map(unit => (
              <option key={unit.id} value={unit.id}>{unit.name}</option>
            ))}
          </select>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Pilih unit untuk melihat eskalasi spesifik atau "Semua Unit" untuk melihat semua data
          </p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
              <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">rule</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Aturan</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.rules?.total || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
              <span className="material-symbols-outlined text-green-600 dark:text-green-400">check_circle</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Aturan Aktif</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.rules?.active || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900">
              <span className="material-symbols-outlined text-yellow-600 dark:text-yellow-400">trending_up</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Tiket Dieskalasi</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.tickets?.escalated || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900">
              <span className="material-symbols-outlined text-purple-600 dark:text-purple-400">analytics</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Tingkat Sukses</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.executions?.successRate || 0}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div className="flex items-center">
            <span className="material-symbols-outlined text-red-500 mr-2">error</span>
            <span className="text-sm text-red-700">{error}</span>
            <button 
              onClick={() => setError(null)} 
              className="ml-auto text-red-500 hover:text-red-700"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        </div>
      )}

      {/* Rules Table */}
      {rules.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-8 text-center">
          <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4 block">rule</span>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Belum Ada Aturan Eskalasi</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">Buat aturan eskalasi pertama untuk mengotomatisasi penanganan tiket.</p>
          <button
            onClick={handleAddRule}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Buat Aturan Pertama
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Nama Aturan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Kondisi Pemicu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Aksi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Tindakan
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {rules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{rule.name}</div>
                      {rule.description && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xs truncate">
                          {rule.description}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs">
                      <div className="truncate" title={getConditionsText(rule.trigger_conditions)}>
                        {getConditionsText(rule.trigger_conditions)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {getActionsText(rule.actions)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        rule.is_active 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {rule.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditRule(rule)}
                          className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          title="Edit"
                        >
                          <span className="material-symbols-outlined text-lg">edit</span>
                        </button>
                        <button
                          onClick={() => handleToggleRule(rule.id, rule.is_active)}
                          disabled={actionLoading === rule.id}
                          className={`p-1 ${
                            rule.is_active
                              ? 'text-orange-600 hover:text-orange-800 dark:text-orange-400'
                              : 'text-green-600 hover:text-green-800 dark:text-green-400'
                          }`}
                          title={rule.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                        >
                          {actionLoading === rule.id ? (
                            <span className="material-symbols-outlined text-lg animate-spin">sync</span>
                          ) : (
                            <span className="material-symbols-outlined text-lg">
                              {rule.is_active ? 'toggle_on' : 'toggle_off'}
                            </span>
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteRule(rule.id)}
                          disabled={actionLoading === rule.id}
                          className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          title="Hapus"
                        >
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <EscalationRuleModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveRule}
          rule={selectedRule}
        />
      )}
    </div>
  );
};

export default EscalationManagement;
