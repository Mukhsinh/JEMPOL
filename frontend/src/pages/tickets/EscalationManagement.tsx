import React, { useState, useEffect } from 'react';
import { escalationService, EscalationRule } from '../../services/escalationService';

const EscalationManagement: React.FC = () => {
  const [rules, setRules] = useState<EscalationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEscalationRules();
  }, []);

  const fetchEscalationRules = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await escalationService.getRules();
      // Pastikan actions adalah array untuk setiap rule dengan penanganan error
      const normalizedData = (data || []).map(rule => {
        let actions = [];
        let trigger_conditions = {};
        
        // Parse actions dengan aman
        try {
          if (Array.isArray(rule.actions)) {
            actions = rule.actions;
          } else if (typeof rule.actions === 'string' && rule.actions) {
            actions = JSON.parse(rule.actions);
          } else if (rule.actions && typeof rule.actions === 'object') {
            actions = [rule.actions];
          }
        } catch (e) {
          console.warn('Failed to parse actions for rule:', rule.id, e);
          actions = [];
        }
        
        // Parse trigger_conditions dengan aman
        try {
          if (typeof rule.trigger_conditions === 'string' && rule.trigger_conditions) {
            trigger_conditions = JSON.parse(rule.trigger_conditions);
          } else if (rule.trigger_conditions && typeof rule.trigger_conditions === 'object') {
            trigger_conditions = rule.trigger_conditions;
          }
        } catch (e) {
          console.warn('Failed to parse trigger_conditions for rule:', rule.id, e);
          trigger_conditions = {};
        }
        
        return {
          ...rule,
          actions: Array.isArray(actions) ? actions : [],
          trigger_conditions
        };
      });
      setRules(normalizedData);
    } catch (err: any) {
      console.error('Error fetching escalation rules:', err);
      setError(err.message || 'Gagal memuat aturan eskalasi');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRule = async (id: string, isActive: boolean) => {
    try {
      await escalationService.updateRule(id, { is_active: !isActive });
      await fetchEscalationRules();
    } catch (err: any) {
      console.error('Error updating escalation rule:', err);
      setError(err.message || 'Gagal memperbarui aturan eskalasi');
    }
  };

  // Helper function untuk mendapatkan teks aksi
  const getActionsText = (actions: any): string => {
    try {
      if (!actions) return '-';
      let actionsArray = actions;
      
      if (typeof actions === 'string') {
        try {
          actionsArray = JSON.parse(actions);
        } catch {
          return '-';
        }
      }
      
      if (!Array.isArray(actionsArray) || actionsArray.length === 0) return '-';
      return actionsArray.map((a: any) => a?.type?.replace(/_/g, ' ') || 'unknown').join(', ');
    } catch {
      return '-';
    }
  };

  // Helper function untuk mendapatkan teks kondisi
  const getConditionsText = (conditions: any): string => {
    try {
      if (!conditions) return '-';
      let condObj = conditions;
      
      if (typeof conditions === 'string') {
        try {
          condObj = JSON.parse(conditions);
        } catch {
          return '-';
        }
      }
      
      if (!condObj || typeof condObj !== 'object') return '-';
      
      const parts: string[] = [];
      if (condObj.priority?.length) parts.push(`Prioritas: ${condObj.priority.join(', ')}`);
      if (condObj.status?.length) parts.push(`Status: ${condObj.status.join(', ')}`);
      if (condObj.time_threshold) parts.push(`Waktu: ${condObj.time_threshold}s`);
      if (condObj.sentiment_threshold) parts.push(`Sentimen: ${condObj.sentiment_threshold}`);
      return parts.length > 0 ? parts.join(' | ') : '-';
    } catch {
      return '-';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manajemen Eskalasi</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Kelola aturan eskalasi tiket otomatis</p>
        </div>
        <button
          onClick={() => console.log('Add Rule clicked')}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Tambah Aturan
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {rules.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-8 text-center">
          <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4">rule</span>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Belum Ada Aturan Eskalasi</h3>
          <p className="text-gray-500 dark:text-gray-400">Buat aturan eskalasi pertama untuk mengotomatisasi penanganan tiket.</p>
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
                    Kondisi
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{rule.name}</div>
                      {rule.description && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">{rule.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                      {getConditionsText(rule.trigger_conditions)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {getActionsText(rule.actions)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        rule.is_active 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {rule.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleToggleRule(rule.id, rule.is_active)}
                        className={`mr-2 px-3 py-1 rounded text-xs ${
                          rule.is_active
                            ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-200'
                        }`}
                      >
                        {rule.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default EscalationManagement;