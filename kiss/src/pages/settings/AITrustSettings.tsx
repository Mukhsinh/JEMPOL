import React, { useState, useEffect } from 'react';

interface AITrustSetting {
  id: string;
  setting_name: string;
  confidence_threshold: number;
  auto_routing_enabled: boolean;
  auto_classification_enabled: boolean;
  manual_review_required: boolean;
  description: string;
  is_active: boolean;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

interface AITrustRule {
  id: string;
  name: string;
  description: string;
  category: string;
  confidenceThreshold: number;
  isActive: boolean;
  autoApprove: boolean;
  requireHumanReview: boolean;
  createdAt: string;
}

interface AIMetrics {
  totalPredictions: number;
  accuracyRate: number;
  falsePositives: number;
  falseNegatives: number;
  averageConfidence: number;
}

export const AITrustSettings: React.FC = () => {
  const [rules, setRules] = useState<AITrustRule[]>([]);
  const [settings, setSettings] = useState<AITrustSetting | null>(null);
  const [metrics, setMetrics] = useState<AIMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [globalThreshold, setGlobalThreshold] = useState(75);

  // Fetch AI trust settings from database
  useEffect(() => {
    const fetchAISettings = async () => {
      try {
        setIsLoading(true);
        
        // Fetch AI trust settings
        const settingsResponse = await fetch('/api/master-data/ai-trust-settings');
        if (settingsResponse.ok) {
          const settingsResult = await settingsResponse.json();
          if (settingsResult.success && settingsResult.data.length > 0) {
            const setting = settingsResult.data[0];
            setSettings(setting);
            setGlobalThreshold(Number(setting.confidence_threshold));
          }
        }
      } catch (err) {
        console.error('Error fetching AI settings:', err);
        
        // Fallback to database structure
        const mockSetting: AITrustSetting = {
          id: 'c54d3993-9f4c-4744-8580-28dfddb57669',
          setting_name: 'default',
          confidence_threshold: 85,
          auto_routing_enabled: true,
          auto_classification_enabled: true,
          manual_review_required: false,
          description: 'Pengaturan default untuk klasifikasi AI',
          is_active: true,
          updated_by: null,
          created_at: '2025-12-30T22:58:12.471073Z',
          updated_at: '2025-12-30T22:58:12.471073Z'
        };
        setSettings(mockSetting);
        setGlobalThreshold(mockSetting.confidence_threshold);
      }
      
      // Mock rules and metrics for demo
      const mockRules: AITrustRule[] = [
        {
          id: '1',
          name: 'Klasifikasi Prioritas Tinggi',
          description: 'Aturan untuk mengklasifikasikan keluhan dengan prioritas tinggi',
          category: 'classification',
          confidenceThreshold: 85,
          isActive: true,
          autoApprove: false,
          requireHumanReview: true,
          createdAt: '2024-01-01'
        },
        {
          id: '2',
          name: 'Deteksi Sentimen Negatif',
          description: 'Mendeteksi keluhan dengan sentimen sangat negatif',
          category: 'sentiment',
          confidenceThreshold: 80,
          isActive: true,
          autoApprove: true,
          requireHumanReview: false,
          createdAt: '2024-01-01'
        },
        {
          id: '3',
          name: 'Kategorisasi Otomatis',
          description: 'Mengkategorikan keluhan berdasarkan konten',
          category: 'categorization',
          confidenceThreshold: 70,
          isActive: true,
          autoApprove: true,
          requireHumanReview: false,
          createdAt: '2024-01-01'
        },
        {
          id: '4',
          name: 'Eskalasi Otomatis',
          description: 'Menentukan keluhan yang perlu dieskalasi',
          category: 'escalation',
          confidenceThreshold: 90,
          isActive: false,
          autoApprove: false,
          requireHumanReview: true,
          createdAt: '2024-01-01'
        }
      ];

      const mockMetrics: AIMetrics = {
        totalPredictions: 1247,
        accuracyRate: 87.5,
        falsePositives: 23,
        falseNegatives: 18,
        averageConfidence: 82.3
      };

      setRules(mockRules);
      setMetrics(mockMetrics);
      setIsLoading(false);
    };

    fetchAISettings();
  }, []);

  const handleDelete = (ruleId: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus aturan ini?')) {
      setRules(rules.filter(rule => rule.id !== ruleId));
    }
  };

  const handleToggleStatus = (ruleId: string) => {
    setRules(rules.map(rule => 
      rule.id === ruleId ? { ...rule, isActive: !rule.isActive } : rule
    ));
  };

  const handleToggleAutoApprove = (ruleId: string) => {
    setRules(rules.map(rule => 
      rule.id === ruleId ? { ...rule, autoApprove: !rule.autoApprove } : rule
    ));
  };

  const handleEdit = (rule: AITrustRule) => {
    console.log('Edit rule:', rule);
    // TODO: Implement edit functionality
  };

  const handleUpdateGlobalThreshold = async (newThreshold: number) => {
    try {
      if (settings) {
        const response = await fetch(`/api/master-data/ai-trust-settings/${settings.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            confidence_threshold: newThreshold
          }),
        });

        if (response.ok) {
          setGlobalThreshold(newThreshold);
          setSettings({
            ...settings,
            confidence_threshold: newThreshold,
            updated_at: new Date().toISOString()
          });
        }
      }
    } catch (err) {
      console.error('Error updating threshold:', err);
    }
  };

  const handleThresholdChange = (ruleId: string, threshold: number) => {
    setRules(rules.map(rule => 
      rule.id === ruleId ? { ...rule, confidenceThreshold: threshold } : rule
    ));
  };

  const getCategoryName = (category: string) => {
    const categories: Record<string, string> = {
      'classification': 'Klasifikasi',
      'sentiment': 'Analisis Sentimen',
      'categorization': 'Kategorisasi',
      'escalation': 'Eskalasi'
    };
    return categories[category] || category;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'classification': 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
      'sentiment': 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
      'categorization': 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300',
      'escalation': 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
    };
    return colors[category] || 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-300';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Pengaturan AI Trust</h1>
          <p className="text-slate-600 dark:text-slate-400">Kelola tingkat kepercayaan dan aturan AI</p>
        </div>
        <button
          onClick={() => {
            console.log('Tambah aturan baru');
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Tambah Aturan
        </button>
      </div>

      {/* Global Settings */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Pengaturan Global</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Threshold Kepercayaan Global
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="100"
                value={globalThreshold}
                onChange={(e) => {
                  const newValue = Number(e.target.value);
                  setGlobalThreshold(newValue);
                }}
                onMouseUp={(e) => {
                  const newValue = Number((e.target as HTMLInputElement).value);
                  handleUpdateGlobalThreshold(newValue);
                }}
                className="flex-1"
              />
              <span className="text-sm font-medium text-slate-900 dark:text-white w-12">
                {globalThreshold}%
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Minimum tingkat kepercayaan untuk semua prediksi AI
            </p>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
            <div>
              <h3 className="text-sm font-medium text-slate-900 dark:text-white">Mode Pembelajaran</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                AI terus belajar dari feedback pengguna
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/30 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </div>

      {/* AI Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">psychology</span>
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Prediksi</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{metrics.totalPredictions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <span className="material-symbols-outlined text-green-600 dark:text-green-400">check_circle</span>
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Akurasi</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{metrics.accuracyRate}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <span className="material-symbols-outlined text-orange-600 dark:text-orange-400">warning</span>
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">False Positive</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{metrics.falsePositives}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <span className="material-symbols-outlined text-red-600 dark:text-red-400">error</span>
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">False Negative</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{metrics.falseNegatives}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <span className="material-symbols-outlined text-purple-600 dark:text-purple-400">trending_up</span>
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Rata-rata Confidence</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{metrics.averageConfidence}%</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Trust Rules */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Aturan Kepercayaan AI</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Aturan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Kategori
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Threshold
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Auto Approve
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {rules.map((rule) => (
                <tr key={rule.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-slate-900 dark:text-white">
                        {rule.name}
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        {rule.description}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(rule.category)}`}>
                      {getCategoryName(rule.category)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={rule.confidenceThreshold}
                        onChange={(e) => handleThresholdChange(rule.id, Number(e.target.value))}
                        className="w-20"
                      />
                      <span className="text-sm font-medium text-slate-900 dark:text-white w-8">
                        {rule.confidenceThreshold}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={rule.autoApprove}
                        onChange={() => handleToggleAutoApprove(rule.id)}
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/30 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-primary"></div>
                    </label>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleStatus(rule.id)}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        rule.isActive
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                      }`}
                    >
                      {rule.isActive ? 'Aktif' : 'Nonaktif'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(rule)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                      >
                        <span className="material-symbols-outlined text-sm">edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(rule.id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
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

      {/* Trust Level Guide */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Panduan Tingkat Kepercayaan</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-sm font-medium text-red-800 dark:text-red-300">0-25%</span>
            </div>
            <p className="text-xs text-red-700 dark:text-red-400">
              Kepercayaan Rendah - Selalu butuh review manual
            </p>
          </div>
          
          <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span className="text-sm font-medium text-orange-800 dark:text-orange-300">26-50%</span>
            </div>
            <p className="text-xs text-orange-700 dark:text-orange-400">
              Kepercayaan Sedang - Perlu verifikasi tambahan
            </p>
          </div>
          
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-sm font-medium text-yellow-800 dark:text-yellow-300">51-75%</span>
            </div>
            <p className="text-xs text-yellow-700 dark:text-yellow-400">
              Kepercayaan Baik - Dapat disetujui otomatis
            </p>
          </div>
          
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-green-800 dark:text-green-300">76-100%</span>
            </div>
            <p className="text-xs text-green-700 dark:text-green-400">
              Kepercayaan Tinggi - Otomatis disetujui dan dijalankan
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};