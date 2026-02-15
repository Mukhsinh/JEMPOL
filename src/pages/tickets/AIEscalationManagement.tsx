import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppFooter from '../../components/AppFooter';

interface EscalationRule {
  id: string;
  name: string;
  description?: string;
  service_types: string[];
  categories: string[];
  priority_levels: string[];
  urgency_threshold: number;
  confidence_threshold: number;
  sentiment_threshold?: number;
  from_role: string;
  to_role: string;
  skip_levels: boolean;
  escalation_time_hours: number;
  sla_breach_escalation: boolean;
  is_active: boolean;
  execution_count: number;
  success_count: number;
  created_at: string;
  updated_at: string;
}

interface EscalationStats {
  auto_escalated: number;
  ai_confidence: number;
  sla_at_risk: number;
  active_rules: number;
  total_rules: number;
  monthly_trend: number;
  confidence_trend: number;
}

const AIEscalationManagement: React.FC = () => {
  const navigate = useNavigate();
  const [rules, setRules] = useState<EscalationRule[]>([]);
  const [stats, setStats] = useState<EscalationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [aiSettings, setAiSettings] = useState({
    confidence_threshold: 85,
    auto_reminder: true
  });

  useEffect(() => {
    fetchEscalationData();
  }, []);

  const fetchEscalationData = async () => {
    try {
      const [rulesResponse, statsResponse] = await Promise.all([
        fetch('/api/escalation/rules'),
        fetch('/api/escalation/stats')
      ]);

      if (rulesResponse.ok) {
        const rulesData = await rulesResponse.json();
        setRules(rulesData);
      }

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error('Error fetching escalation data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleRuleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/escalation/rules/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_active: !currentStatus
        })
      });

      if (response.ok) {
        fetchEscalationData();
      }
    } catch (error) {
      console.error('Error updating rule status:', error);
    }
  };

  // const createRule = async (ruleData: Partial<EscalationRule>) => {
  //   try {
  //     const response = await fetch('/api/escalation-rules', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify(ruleData)
  //     });

  //     if (response.ok) {
  //       fetchEscalationData();
  //       setShowCreateModal(false);
  //     }
  //   } catch (error) {
  //     console.error('Error creating rule:', error);
  //   }
  // };

  const updateAISettings = async () => {
    try {
      const response = await fetch('/api/ai-trust-settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(aiSettings)
      });

      if (response.ok) {
        alert('Pengaturan AI berhasil diperbarui');
      }
    } catch (error) {
      console.error('Error updating AI settings:', error);
    }
  };

  const filteredRules = rules.filter(rule => {
    const matchesSearch = rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rule.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || 
                       rule.service_types.includes(typeFilter);
    
    return matchesSearch && matchesType;
  });

  const getRuleStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800/50' :
                     'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
  };

  const getRuleStatusDot = (isActive: boolean) => {
    return isActive ? 'bg-green-500' : 'bg-slate-400';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/50';
      case 'high': return 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-orange-100 dark:border-orange-900/50';
      case 'medium': return 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 border-yellow-100 dark:border-yellow-900/50';
      default: return 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Memuat data eskalasi AI...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex flex-col overflow-x-hidden transition-colors duration-200">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-surface-light dark:bg-surface-dark border-b border-slate-200 dark:border-slate-800 px-6 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="size-8 text-primary flex items-center justify-center bg-primary/10 rounded-lg">
              <span className="material-symbols-outlined text-2xl">shield_person</span>
            </div>
            <h2 className="text-lg font-bold leading-tight tracking-tight text-slate-900 dark:text-white">
              CMS AI Admin
            </h2>
          </div>
          <nav className="hidden md:flex items-center gap-1">
            <button 
              onClick={() => navigate('/dashboard')}
              className="text-slate-600 dark:text-slate-400 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Dashboard
            </button>
            <button 
              onClick={() => navigate('/tickets')}
              className="text-slate-600 dark:text-slate-400 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Pengaduan
            </button>
            <button className="text-primary bg-primary/10 px-3 py-2 rounded-lg text-sm font-medium transition-colors">
              Eskalasi AI
            </button>
            <button 
              onClick={() => navigate('/sla-monitor')}
              className="text-slate-600 dark:text-slate-400 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Monitor SLA
            </button>
            <button 
              onClick={() => navigate('/settings')}
              className="text-slate-600 dark:text-slate-400 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Pengaturan
            </button>
          </nav>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-500 hover:text-primary transition-colors">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border border-white dark:border-surface-dark"></span>
            </button>
            <div className="size-9 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden border border-slate-200 dark:border-slate-600 cursor-pointer">
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">person</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-8">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 mb-6 text-sm">
          <button 
            onClick={() => navigate('/dashboard')}
            className="text-slate-500 dark:text-slate-400 hover:text-primary transition-colors"
          >
            Dashboard
          </button>
          <span className="material-symbols-outlined text-slate-400 text-sm">chevron_right</span>
          <span className="text-slate-900 dark:text-white font-medium">Aturan Eskalasi AI</span>
        </div>

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
              Manajemen Eskalasi Berbasis AI
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-base leading-relaxed">
              Konfigurasi aturan routing otomatis dan ambang batas klasifikasi AI. Kelola bagaimana sistem mengeskalasi tiket dari Petugas ke Direktur berdasarkan urgensi dan jenis.
            </p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => console.log('AI Settings clicked')}
              className="flex items-center justify-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-200 px-4 py-2.5 rounded-lg shadow-sm transition-all text-sm font-medium"
            >
              <span className="material-symbols-outlined text-xl">tune</span>
              Pengaturan AI
            </button>
            <button 
              onClick={() => console.log('Create new rule clicked')}
              className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-lg shadow-sm transition-all active:scale-95 font-semibold text-sm whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-xl">add_circle</span>
              Aturan Eskalasi Baru
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-surface-light dark:bg-surface-dark p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
              <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-6xl text-primary">auto_mode</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">
                Auto-Eskalasi
              </p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {stats.auto_escalated.toLocaleString()}
                </h3>
                <span className={`text-xs font-bold flex items-center px-1.5 py-0.5 rounded ${
                  stats.monthly_trend >= 0 ? 'text-green-600 bg-green-100 dark:bg-green-900/30' : 'text-red-600 bg-red-100 dark:bg-red-900/30'
                }`}>
                  {stats.monthly_trend >= 0 ? '+' : ''}{stats.monthly_trend}%
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-2">Tiket diproses AI bulan ini</p>
            </div>

            <div className="bg-surface-light dark:bg-surface-dark p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
              <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-6xl text-purple-500">psychology</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">
                Skor Kepercayaan AI
              </p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {stats.ai_confidence.toFixed(1)}%
                </h3>
                <span className={`text-xs font-bold flex items-center px-1.5 py-0.5 rounded ${
                  stats.confidence_trend >= 0 ? 'text-green-600 bg-green-100 dark:bg-green-900/30' : 'text-red-600 bg-red-100 dark:bg-red-900/30'
                }`}>
                  {stats.confidence_trend >= 0 ? '+' : ''}{stats.confidence_trend.toFixed(1)}%
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-2">Rata-rata akurasi klasifikasi</p>
            </div>

            <div className="bg-surface-light dark:bg-surface-dark p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
              <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-6xl text-orange-500">warning</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">
                SLA Berisiko
              </p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {stats.sla_at_risk}
                </h3>
                <span className="text-red-600 text-xs font-bold flex items-center bg-red-100 dark:bg-red-900/30 px-1.5 py-0.5 rounded">
                  -2%
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-2">Menunggu trigger auto-eskalasi</p>
            </div>

            <div className="bg-surface-light dark:bg-surface-dark p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
              <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-6xl text-blue-500">rule</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">
                Aturan Aktif
              </p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {stats.active_rules}
                </h3>
                <span className="text-slate-500 text-xs font-medium">
                  dari {stats.total_rules} Total
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-2">Berjalan pada pipeline saat ini</p>
            </div>
          </div>
        )}

        {/* Workflow & AI Config */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Standard Escalation Workflow */}
          <div className="lg:col-span-2 bg-surface-light dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Alur Eskalasi Standar
              </h3>
              <button className="text-sm text-primary font-medium hover:underline">
                Lihat Detail SLA
              </button>
            </div>
            <div className="relative py-4">
              <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 dark:bg-slate-700 -translate-y-1/2 rounded z-0 hidden md:block"></div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
                {[
                  { role: 'Petugas', icon: 'support_agent', color: 'blue', time: 'T < 2j', active: true },
                  { role: 'Kepala Unit', icon: 'supervisor_account', color: 'indigo', time: 'T < 24j', active: false },
                  { role: 'Manager', icon: 'admin_panel_settings', color: 'purple', time: 'T < 48j', active: false },
                  { role: 'Direktur', icon: 'local_police', color: 'red', time: 'Segera', active: false }
                ].map((step, index) => (
                  <div key={index} className="flex flex-col items-center text-center group">
                    <div className={`size-12 rounded-full bg-${step.color}-100 dark:bg-${step.color}-900/30 text-${step.color}-600 dark:text-${step.color}-400 border-4 border-surface-light dark:border-surface-dark flex items-center justify-center mb-3 shadow-sm relative`}>
                      <span className="material-symbols-outlined">{step.icon}</span>
                      {step.active && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500"></span>
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">{step.role}</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      {index === 0 ? 'Penanganan Awal' : 
                       index === 1 ? 'Eskalasi Pertama' :
                       index === 2 ? 'Tinjauan Strategis' : 'Keputusan Kritis'}
                    </p>
                    <div className="mt-2 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px] font-mono text-slate-500 border border-slate-200 dark:border-slate-700">
                      {step.time}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Configuration */}
          <div className="lg:col-span-1 bg-surface-light dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              Konfigurasi AI
            </h3>
            <div className="space-y-5">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Ambang Batas Kepercayaan Min.
                  </label>
                  <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                    {aiSettings.confidence_threshold}%
                  </span>
                </div>
                <input 
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary" 
                  max="100" 
                  min="0" 
                  type="range" 
                  value={aiSettings.confidence_threshold}
                  onChange={(e) => setAiSettings(prev => ({ ...prev, confidence_threshold: parseInt(e.target.value) }))}
                />
                <p className="text-xs text-slate-500 mt-1">
                  Tiket di bawah skor ini memerlukan tinjauan manusia.
                </p>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block">
                    Pengingat Otomatis
                  </label>
                  <p className="text-xs text-slate-500">
                    Beritahu petugas 1 jam sebelum pelanggaran SLA
                  </p>
                </div>
                <button 
                  onClick={() => setAiSettings(prev => ({ ...prev, auto_reminder: !prev.auto_reminder }))}
                  className={`w-10 h-6 rounded-full relative transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${
                    aiSettings.auto_reminder ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                >
                  <span className={`block w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${
                    aiSettings.auto_reminder ? 'translate-x-5' : 'translate-x-1'
                  }`}></span>
                </button>
              </div>
              
              <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                <button 
                  onClick={updateAISettings}
                  className="w-full py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Lihat Log Audit
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-surface-light dark:bg-surface-dark p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm mb-6 flex flex-col lg:flex-row gap-4 justify-between items-center">
          <div className="relative w-full lg:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-slate-400">search</span>
            </div>
            <input 
              className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg leading-5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm" 
              placeholder="Cari aturan, klasifikasi, atau kondisi..." 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex w-full lg:w-auto items-center gap-3 overflow-x-auto pb-1 lg:pb-0">
            <div className="flex items-center gap-2 border-r border-slate-200 dark:border-slate-700 pr-3 mr-1">
              <button className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                <span className="material-symbols-outlined text-lg">filter_list</span>
                Filter
              </button>
            </div>
            <div className="flex items-center gap-2">
              <label className="hidden sm:block text-sm font-medium text-slate-500 dark:text-slate-400 mr-1">
                Jenis:
              </label>
              <select 
                className="form-select block w-full pl-3 pr-10 py-2 text-base border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-lg bg-white dark:bg-slate-800 dark:text-white"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">Semua Jenis</option>
                <option value="complaint">Pengaduan</option>
                <option value="request">Permintaan</option>
                <option value="suggestion">Saran</option>
              </select>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-primary hover:bg-blue-50 dark:hover:bg-slate-700/50 transition-colors ml-auto lg:ml-0 whitespace-nowrap">
              <span className="material-symbols-outlined text-lg">download</span>
              <span className="hidden sm:inline">Ekspor Laporan</span>
            </button>
          </div>
        </div>

        {/* Rules Grid Header */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 mb-2">
          <div className="col-span-4">Aturan / Kondisi Klasifikasi</div>
          <div className="col-span-3">Jalur Eskalasi</div>
          <div className="col-span-2">Kepercayaan AI</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-1 text-right">Aksi</div>
        </div>

        {/* Rules List */}
        <div className="space-y-3">
          {filteredRules.map((rule) => (
            <div key={rule.id} className={`group relative bg-surface-light dark:bg-surface-dark rounded-xl border shadow-sm hover:shadow-md transition-all p-4 md:p-0 md:grid md:grid-cols-12 md:gap-4 md:items-center ${
              rule.priority_levels.includes('critical') ? 'border-l-4 border-l-red-500 border-y border-r border-slate-200 dark:border-slate-800 dark:border-r-slate-800' :
              'border border-slate-200 dark:border-slate-800 hover:border-primary/30'
            }`}>
              {/* Mobile Header */}
              <div className="md:hidden flex justify-between items-start mb-4">
                <div className={`text-xs font-bold uppercase tracking-wider ${
                  rule.priority_levels.includes('critical') ? 'text-red-500' : 'text-slate-400'
                }`}>
                  {rule.priority_levels.includes('critical') ? 'Kritis' : 'Standar'}
                </div>
                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRuleStatusColor(rule.is_active)}`}>
                  {rule.is_active ? 'Aktif' : 'Tidak Aktif'}
                </div>
              </div>

              {/* Rule Details */}
              <div className="col-span-4 md:pl-6 md:py-4">
                <div className="flex items-start gap-3">
                  <div className={`hidden sm:flex size-10 rounded-lg items-center justify-center shrink-0 mt-1 ${
                    rule.priority_levels.includes('critical') ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
                    'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  }`}>
                    <span className="material-symbols-outlined">
                      {rule.service_types.includes('complaint') ? 'health_and_safety' : 
                       rule.service_types.includes('request') ? 'plumbing' : 'receipt_long'}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                      {rule.name}
                    </h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {rule.service_types.map((type, index) => (
                        <span key={index} className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                          Jenis: {type === 'complaint' ? 'Pengaduan' : type === 'request' ? 'Permintaan' : 'Saran'}
                        </span>
                      ))}
                      {rule.priority_levels.map((priority, index) => (
                        <span key={index} className={`px-2 py-0.5 rounded text-[10px] font-semibold ${getPriorityColor(priority)}`}>
                          Urgensi: {priority === 'critical' ? 'Kritis' : priority === 'high' ? 'Tinggi' : 'Sedang'}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Escalation Path */}
              <div className="col-span-3 md:py-4">
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <span className="font-bold text-slate-900 dark:text-white">
                    {rule.from_role === 'staff' ? 'Petugas' : rule.from_role}
                  </span>
                  <span className="material-symbols-outlined text-xs text-slate-400">arrow_forward</span>
                  <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${
                    rule.to_role === 'director' ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' :
                    'font-bold text-slate-900 dark:text-white'
                  }`}>
                    {rule.to_role === 'director' ? 'Direktur' : 
                     rule.to_role === 'manager' ? 'Manager' : 'Kepala Unit'}
                  </span>
                  {rule.skip_levels && (
                    <span className="material-symbols-outlined text-base text-amber-500" title="Jalur Dipercepat">
                      bolt
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {rule.skip_levels ? 'Melewati lapisan manajemen menengah' : `SLA standar ${rule.escalation_time_hours}j berlaku`}
                </p>
              </div>

              {/* AI Confidence */}
              <div className="col-span-2 md:py-4 mt-4 md:mt-0">
                <div className="flex flex-col gap-1 w-full max-w-[120px]">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Ambang Batas</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {rule.confidence_threshold}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        rule.confidence_threshold >= 90 ? 'bg-primary' :
                        rule.confidence_threshold >= 80 ? 'bg-blue-500' : 'bg-orange-400'
                      }`}
                      style={{ width: `${rule.confidence_threshold}%` }}
                    ></div>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Auto-eskalasi: {rule.execution_count}
                  </p>
                </div>
              </div>

              {/* Status */}
              <div className="hidden md:flex col-span-2 md:py-4 items-center">
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getRuleStatusColor(rule.is_active)}`}>
                  <span className={`size-1.5 rounded-full ${getRuleStatusDot(rule.is_active)} ${rule.is_active ? '' : 'animate-pulse'}`}></span>
                  {rule.is_active ? 'Aktif' : 'Tidak Aktif'}
                </div>
              </div>

              {/* Actions */}
              <div className="col-span-1 md:pr-6 md:py-4 flex justify-end items-center gap-2 mt-4 md:mt-0 border-t border-slate-100 dark:border-slate-800 md:border-0 pt-3 md:pt-0">
                <button 
                  className="p-2 text-slate-400 hover:text-primary hover:bg-blue-50 dark:hover:bg-slate-700 rounded-lg transition-colors" 
                  title="Edit Aturan"
                >
                  <span className="material-symbols-outlined">edit</span>
                </button>
                <button 
                  onClick={() => toggleRuleStatus(rule.id, rule.is_active)}
                  className="p-2 text-slate-400 hover:text-primary hover:bg-blue-50 dark:hover:bg-slate-700 rounded-lg transition-colors" 
                  title={rule.is_active ? "Nonaktifkan" : "Aktifkan"}
                >
                  <span className="material-symbols-outlined">
                    {rule.is_active ? 'pause' : 'play_arrow'}
                  </span>
                </button>
                <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                  <span className="material-symbols-outlined">more_vert</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 mt-6 pt-4">
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Menampilkan <span className="font-medium text-slate-900 dark:text-white">1</span> sampai{' '}
            <span className="font-medium text-slate-900 dark:text-white">{filteredRules.length}</span> dari{' '}
            <span className="font-medium text-slate-900 dark:text-white">{rules.length}</span> aturan
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 text-sm text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
              Sebelumnya
            </button>
            <button className="px-3 py-1 text-sm text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-50 dark:hover:bg-slate-800">
              Selanjutnya
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <AppFooter variant="default" className="mt-auto" />
    </div>
  );
};

export default AIEscalationManagement;