import React, { useState, useEffect } from 'react';

interface AppSetting {
  id: string;
  setting_key: string;
  setting_value: string;
  setting_type: string;
  description: string;
  is_public: boolean;
}

interface AppSettingsForm {
  app_name: string;
  app_logo: string;
  app_footer: string;
  institution_name: string;
  institution_address: string;
  institution_logo: string;
  manager_name: string;
  manager_position: string;
  job_title: string;
  logo_url: string;
  description: string;
  address: string;
  contact_email: string;
  contact_phone: string;
  website: string;
}

const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  const toast = document.createElement('div');
  toast.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => document.body.removeChild(toast), 3000);
};

const AppSettings: React.FC = () => {
  const [settings, setSettings] = useState<AppSettingsForm>({
    app_name: '', app_logo: '', app_footer: '', institution_name: '', institution_address: '',
    institution_logo: '', manager_name: '', manager_position: '', job_title: '', logo_url: '',
    description: '', address: '', contact_email: '', contact_phone: '', website: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/app-settings', {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        const data = await response.json();
        const settingsMap: { [key: string]: string } = {};
        data.forEach((setting: AppSetting) => { settingsMap[setting.setting_key] = setting.setting_value; });
        setSettings({
          app_name: settingsMap.app_name || 'Sistem Pengaduan Masyarakat Terpadu',
          app_logo: settingsMap.app_logo || '',
          app_footer: settingsMap.app_footer || 'Copyright © 2025 Sistem Pengaduan Masyarakat Terpadu. Semua hak dilindungi.',
          institution_name: settingsMap.institution_name || 'RSUD Sehat Sentosa',
          institution_address: settingsMap.institution_address || settingsMap.address || '',
          institution_logo: settingsMap.institution_logo || settingsMap.logo_url || '',
          manager_name: settingsMap.manager_name || '',
          manager_position: settingsMap.manager_position || '',
          job_title: settingsMap.job_title || '',
          logo_url: settingsMap.logo_url || settingsMap.institution_logo || '',
          description: settingsMap.description || '',
          address: settingsMap.address || '',
          contact_email: settingsMap.contact_email || '',
          contact_phone: settingsMap.contact_phone || '',
          website: settingsMap.website || ''
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      showToast('Gagal memuat pengaturan aplikasi', 'error');
    } finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/app-settings', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (response.ok) {
        showToast('Pengaturan aplikasi berhasil disimpan');
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      showToast('Gagal menyimpan pengaturan aplikasi', 'error');
    } finally { setSaving(false); }
  };

  const handleInputChange = (field: keyof AppSettingsForm, value: string) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { showToast('Ukuran file maksimal 2MB', 'error'); return; }
    if (!['image/jpeg', 'image/png', 'image/svg+xml'].includes(file.type)) { showToast('Format file harus JPG, PNG, atau SVG', 'error'); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      handleInputChange('logo_url', result);
      showToast('Logo instansi berhasil diunggah');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    handleInputChange('logo_url', '');
    showToast('Logo instansi berhasil dihapus');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f6f7f8] dark:bg-[#101922]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#137fec]"></div>
      </div>
    );
  }

  return (
    <div className="bg-[#f6f7f8] dark:bg-[#101922] text-slate-900 dark:text-white font-['Public_Sans',sans-serif] transition-colors duration-200 min-h-screen">
      <div className="flex-1 overflow-y-auto w-full">
        <div className="max-w-[1000px] mx-auto w-full px-6 py-8 md:px-10 md:py-10 pb-12">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex mb-6">
            <ol className="flex items-center gap-2">
              <li><a className="text-slate-500 hover:text-[#137fec] dark:text-slate-400 dark:hover:text-[#137fec] transition-colors text-sm font-medium" href="/dashboard">Dashboard</a></li>
              <li className="text-slate-400 dark:text-slate-600">/</li>
              <li><span className="text-slate-500 dark:text-slate-400 text-sm font-medium">Pengaturan</span></li>
              <li className="text-slate-400 dark:text-slate-600">/</li>
              <li aria-current="page" className="text-slate-900 dark:text-white text-sm font-semibold">Aplikasi</li>
            </ol>
          </nav>

          {/* Page Header */}
          <div className="flex flex-col gap-2 mb-8">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">Pengaturan Aplikasi</h1>
            <p className="text-slate-500 dark:text-slate-400 text-base max-w-2xl">Kelola identitas aplikasi utama dan detail organisasi. Informasi ini akan digunakan oleh sistem AI untuk header laporan dan respons otomatis.</p>
          </div>

          <form onSubmit={handleSubmit} id="settings_form" className="flex flex-col gap-6">
            {/* Logo Instansi Section */}
            <div className="bg-white dark:bg-[#1e2936] rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="p-6">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Logo Instansi</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Logo ini akan ditampilkan pada halaman login dan kop surat laporan.</p>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  <div className="relative group shrink-0">
                    <div className="w-32 h-32 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 flex items-center justify-center overflow-hidden relative">
                      {settings.logo_url ? (
                        <img src={settings.logo_url} alt="Logo Instansi" className="w-full h-full object-contain p-2" />
                      ) : (
                        <div className="text-slate-400 text-center">
                          <span className="material-symbols-outlined text-4xl mb-2 block">image</span>
                          <span className="text-xs">Belum ada logo</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="flex gap-3">
                      <label className="inline-flex items-center justify-center px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#137fec] transition-colors cursor-pointer">
                        <span className="material-symbols-outlined text-[20px] mr-2">upload</span>
                        Unggah Logo Baru
                        <input type="file" accept="image/jpeg,image/png,image/svg+xml" onChange={handleLogoUpload} className="hidden" />
                      </label>
                      {settings.logo_url && (
                        <button type="button" onClick={handleRemoveLogo} className="inline-flex items-center justify-center px-4 py-2 bg-transparent border border-transparent rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none transition-colors">Hapus</button>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Format file yang didukung: JPG, PNG, atau SVG. Ukuran maksimal 2MB. Dimensi yang disarankan 512x512px.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Informasi Umum Section */}
            <div className="bg-white dark:bg-[#1e2936] rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="p-6 border-b border-slate-100 dark:border-slate-700/50">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Informasi Umum</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Detail ini digunakan untuk identifikasi sistem.</p>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nama Aplikasi */}
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="app_name">Nama Aplikasi</label>
                  <input className="block w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-[#137fec] focus:ring-[#137fec] sm:text-sm py-2.5 px-3" id="app_name" name="app_name" type="text" value={settings.app_name} onChange={(e) => handleInputChange('app_name', e.target.value)} />
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Nama yang muncul di tab browser dan judul dashboard.</p>
                </div>

                {/* Nama Instansi */}
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="inst_name">Nama Instansi</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="material-symbols-outlined text-slate-400 text-[20px]">apartment</span>
                    </div>
                    <input className="block w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-[#137fec] focus:ring-[#137fec] sm:text-sm pl-10 py-2.5 px-3" id="inst_name" name="inst_name" type="text" value={settings.institution_name} onChange={(e) => handleInputChange('institution_name', e.target.value)} />
                  </div>
                  <div className="mt-2 flex gap-2 items-start p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs text-blue-700 dark:text-blue-300">
                    <span className="material-symbols-outlined text-[16px] shrink-0 mt-0.5">info</span>
                    <span>Penting: Nama instansi digunakan oleh AI untuk men-generate surat tanggapan resmi secara otomatis.</span>
                  </div>
                </div>

                {/* Nama Pengelola Utama */}
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="manager_name">Nama Pengelola Utama</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="material-symbols-outlined text-slate-400 text-[20px]">person</span>
                    </div>
                    <input className="block w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-[#137fec] focus:ring-[#137fec] sm:text-sm pl-10 py-2.5 px-3" id="manager_name" name="manager_name" placeholder="Contoh: Dr. Budi Santoso" type="text" value={settings.manager_name} onChange={(e) => handleInputChange('manager_name', e.target.value)} />
                  </div>
                </div>

                {/* Jabatan */}
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="job_title">Jabatan</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="material-symbols-outlined text-slate-400 text-[20px]">badge</span>
                    </div>
                    <input className="block w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-[#137fec] focus:ring-[#137fec] sm:text-sm pl-10 py-2.5 px-3" id="job_title" name="job_title" placeholder="Contoh: Kepala Bagian Humas" type="text" value={settings.job_title} onChange={(e) => handleInputChange('job_title', e.target.value)} />
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="w-full bg-white dark:bg-[#1e2936] border-t border-slate-200 dark:border-slate-700 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20 shrink-0 sticky bottom-0">
        <div className="max-w-[1000px] mx-auto w-full px-6 py-4 md:px-10 flex items-center justify-end gap-3">
          <button className="px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-transparent border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors" type="button" onClick={() => window.history.back()}>Batal</button>
          <button className="px-5 py-2.5 text-sm font-bold text-white bg-[#137fec] rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#137fec] shadow-sm hover:shadow transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed" form="settings_form" type="submit" disabled={saving}>
            {saving ? (
              <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>Menyimpan...</>
            ) : (
              <><span className="material-symbols-outlined text-[18px]">save</span>Simpan Perubahan</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppSettings;
