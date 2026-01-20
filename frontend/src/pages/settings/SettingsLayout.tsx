import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

interface TabItem {
  id: string;
  name: string;
  icon: string;
  path: string;
  description: string;
}

interface SettingsLayoutProps {
  children?: React.ReactNode;
}

const masterDataTabs: TabItem[] = [
  {
    id: 'units',
    name: 'Unit Kerja',
    icon: 'domain',
    path: '/settings/units',
    description: 'Kelola struktur organisasi dan hierarki unit kerja'
  },
  {
    id: 'unit-types',
    name: 'Tipe Unit Kerja',
    icon: 'corporate_fare',
    path: '/settings/unit-types',
    description: 'Atur kategori dan jenis unit kerja'
  },
  {
    id: 'service-categories',
    name: 'Kategori Layanan',
    icon: 'category',
    path: '/settings/service-categories',
    description: 'Kelola kategori layanan dan klasifikasi'
  },
  {
    id: 'ticket-types',
    name: 'Tipe Tiket',
    icon: 'confirmation_number',
    path: '/settings/ticket-types',
    description: 'Atur jenis-jenis tiket yang tersedia'
  },
  {
    id: 'ticket-statuses',
    name: 'Status Tiket',
    icon: 'flag',
    path: '/settings/ticket-statuses',
    description: 'Atur status dan workflow tiket'
  },
  {
    id: 'patient-types',
    name: 'Jenis Pasien',
    icon: 'accessibility_new',
    path: '/settings/patient-types',
    description: 'Kelola jenis pasien dan prioritas'
  },
  {
    id: 'sla-settings',
    name: 'Pengaturan SLA',
    icon: 'timer',
    path: '/settings/sla-settings',
    description: 'Konfigurasi Service Level Agreement'
  },
  {
    id: 'roles',
    name: 'Peran & Hak Akses',
    icon: 'admin_panel_settings',
    path: '/settings/roles',
    description: 'Kelola peran pengguna dan hak akses'
  },
  {
    id: 'response-templates',
    name: 'Template Respon',
    icon: 'chat',
    path: '/settings/response-templates',
    description: 'Atur template komunikasi dan respon'
  },
  {
    id: 'ai-trust',
    name: 'Pengaturan Kepercayaan AI',
    icon: 'psychology',
    path: '/settings/ai-trust',
    description: 'Konfigurasi ambang batas dan kepercayaan AI'
  }
];

const SettingsLayout: React.FC<SettingsLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [aiConfidence, setAiConfidence] = useState(85);

  const currentTab = masterDataTabs.find(tab => location.pathname.startsWith(tab.path));

  const handleTabClick = (tab: TabItem) => {
    navigate(tab.path);
  };

  return (
    <div className="flex h-screen w-full">
      {/* Sidebar */}
      <aside className="w-72 bg-surface-light dark:bg-surface-dark border-r border-slate-200 dark:border-slate-800 flex flex-col flex-shrink-0 z-20">
        <div className="h-16 flex items-center px-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 text-slate-900 dark:text-white">
            <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">local_hospital</span>
            </div>
            <h1 className="text-lg font-bold tracking-tight">CMS Admin</h1>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-6">
          <div>
            <h3 className="px-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Menu Utama</h3>
            <nav className="flex flex-col gap-1">
              <a className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors" href="/dashboard">
                <span className="material-symbols-outlined">dashboard</span>
                <span className="text-sm font-medium">Dashboard</span>
              </a>
              <a className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors" href="/tickets">
                <span className="material-symbols-outlined">inbox</span>
                <span className="text-sm font-medium">Keluhan</span>
              </a>
              <a className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors" href="/reports">
                <span className="material-symbols-outlined">analytics</span>
                <span className="text-sm font-medium">Analitik</span>
              </a>
            </nav>
          </div>
          
          <div>
            <h3 className="px-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Pengaturan Master Data</h3>
            <nav className="flex flex-col gap-1">
              {masterDataTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group text-left w-full ${
                    currentTab?.id === tab.id
                      ? 'bg-primary/10 text-primary'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className={`material-symbols-outlined text-[20px] ${
                    currentTab?.id === tab.id 
                      ? 'font-variation-settings-\'FILL\'1' 
                      : 'group-hover:text-primary transition-colors'
                  }`}>
                    {tab.icon}
                  </span>
                  <span className={`text-sm ${
                    currentTab?.id === tab.id ? 'font-semibold' : 'font-medium'
                  }`}>
                    {tab.name}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>
        
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-slate-200 bg-cover bg-center" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDhZWFLhjM26KGl8PZ-bgMlD2i-WuJg_0wfxqZ_0Hx4iouJVl_RBYuVGf-SGeZoox_u5G4q8Zo55URHEFZP_vCGvAwV0A_ug5og6CUTQf0tLmQ2Y1zQ1nGGo6I8oDU0c-jUS5GGHr1PMjM2l3eMZ1dKn5CN5zQwa-SYQIrhyudyHO676rMo8bbqIKs0SLoKFTHySO60vLvMx9-xhhGRitkSRlINSzCd-5wcsx59Vxf_IqjJd3sdKKKF0DUVbbiI5CKvnnSyrDuBPuE6')"}}></div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">Admin User</span>
              <span className="text-xs text-slate-500 truncate">System Administrator</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-background-light dark:bg-background-dark overflow-hidden">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 bg-surface-light dark:bg-surface-dark border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>Pengaturan</span>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span>Master Data</span>
            {currentTab && (
              <>
                <span className="material-symbols-outlined text-xs">chevron_right</span>
                <span className="font-medium text-slate-900 dark:text-white">{currentTab.name}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border border-white dark:border-slate-900"></span>
            </button>
            <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
              <span className="material-symbols-outlined">help</span>
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto flex flex-col xl:flex-row gap-6">
            {/* Left Column - Main Content */}
            <div className="flex-1 flex flex-col gap-6 min-w-0">
              {children || <Outlet />}
            </div>

            {/* Right Column - Sidebar Info */}
            <div className="w-full xl:w-80 flex flex-col gap-6 flex-shrink-0">
              {/* AI Settings Card */}
              <div className="bg-surface-light dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-10 pointer-events-none">
                  <span className="material-symbols-outlined text-8xl">smart_toy</span>
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                      <span className="material-symbols-outlined text-[20px]">psychology</span>
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white">Kepercayaan AI</h3>
                  </div>
                  <p className="text-xs text-slate-500 mb-6 leading-relaxed">Sesuaikan ambang batas untuk klasifikasi otomatis AI. Permintaan di bawah skor ini akan memerlukan tinjauan manual.</p>
                  <div className="mb-2 flex justify-between items-end">
                    <span className="text-xs font-semibold text-slate-400 uppercase">Ambang Batas</span>
                    <span className="text-2xl font-bold text-primary">{aiConfidence}%</span>
                  </div>
                  <div className="relative h-6 mb-2">
                    <input 
                      className="absolute w-full z-20 opacity-0 cursor-pointer h-full" 
                      max="100" 
                      min="0" 
                      type="range" 
                      value={aiConfidence}
                      onChange={(e) => setAiConfidence(Number(e.target.value))}
                    />
                    <div className="absolute top-1/2 -translate-y-1/2 w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-400 to-primary rounded-full" style={{width: `${aiConfidence}%`}}></div>
                    </div>
                    <div className="absolute top-1/2 -translate-y-1/2 -ml-3 w-6 h-6 bg-white border-4 border-primary rounded-full shadow-md z-10 pointer-events-none" style={{left: `${aiConfidence}%`}}></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>0% (Longgar)</span>
                    <span>100% (Ketat)</span>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Routing Otomatis Aktif</span>
                    </div>
                    <button className="text-xs text-primary font-medium hover:underline">Konfigurasi</button>
                  </div>
                </div>
              </div>

              {/* Help Card */}
              <div className="rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 p-5 text-white shadow-lg relative overflow-hidden">
                <div className="absolute -right-4 -bottom-4 opacity-20">
                  <span className="material-symbols-outlined text-[100px]">support_agent</span>
                </div>
                <h4 className="font-bold mb-2 relative z-10">Butuh Bantuan?</h4>
                <p className="text-xs text-slate-300 mb-4 relative z-10">Cek panduan admin untuk konfigurasi hierarki data master.</p>
                <button className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-md transition-colors relative z-10">Buka Dokumentasi</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SettingsLayout;