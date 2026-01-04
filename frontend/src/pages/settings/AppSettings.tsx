import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';

interface AppSettingsForm {
  app_name: string;
  app_footer: string;
  institution_name: string;
  institution_address: string;
  manager_name: string;
  manager_position: string;
  job_title: string;
  logo_url: string;
  description: string;
  contact_email: string;
  contact_phone: string;
  website: string;
}

const AppSettings: React.FC = () => {
  const [settings, setSettings] = useState<AppSettingsForm>({
    app_name: '',
    app_footer: '',
    institution_name: '',
    institution_address: '',
    manager_name: '',
    manager_position: '',
    job_title: '',
    logo_url: '',
    description: '',
    contact_email: '',
    contact_phone: '',
    website: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('app_settings')
        .select('setting_key, setting_value');

      if (fetchError) throw fetchError;

      if (data) {
        const map: Record<string, string> = {};
        data.forEach((item: { setting_key: string; setting_value: string }) => {
          map[item.setting_key] = item.setting_value || '';
        });

        setSettings({
          app_name: map.app_name || 'Sistem Pengaduan',
          app_footer: map.app_footer || '',
          institution_name: map.institution_name || '',
          institution_address: map.institution_address || map.address || '',
          manager_name: map.manager_name || '',
          manager_position: map.manager_position || '',
          job_title: map.job_title || '',
          logo_url: map.logo_url || map.institution_logo || '',
          description: map.description || '',
          contact_email: map.contact_email || '',
          contact_phone: map.contact_phone || '',
          website: map.website || ''
        });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal memuat pengaturan';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      for (const [key, value] of Object.entries(settings)) {
        await supabase
          .from('app_settings')
          .upsert({ setting_key: key, setting_value: value, updated_at: new Date().toISOString() }, { onConflict: 'setting_key' });
      }
      alert('Pengaturan berhasil disimpan');
    } catch (err) {
      alert('Gagal menyimpan pengaturan');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof AppSettingsForm, value: string) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran file maksimal 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      handleChange('logo_url', ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pengaturan Aplikasi</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Kelola identitas aplikasi dan informasi instansi</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Logo */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Logo Instansi</h2>
          <div className="flex items-start gap-6">
            <div className="w-32 h-32 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
              {settings.logo_url ? (
                <img src={settings.logo_url} alt="Logo" className="w-full h-full object-contain p-2" />
              ) : (
                <span className="text-gray-400 text-center text-sm">Belum ada logo</span>
              )}
            </div>
            <div>
              <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer">
                Unggah Logo
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              </label>
              {settings.logo_url && (
                <button type="button" onClick={() => handleChange('logo_url', '')} className="ml-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg">
                  Hapus
                </button>
              )}
              <p className="text-xs text-gray-500 mt-2">Format: JPG, PNG, SVG. Maks 2MB</p>
            </div>
          </div>
        </div>

        {/* Informasi Aplikasi */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Informasi Aplikasi</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Aplikasi</label>
              <input type="text" value={settings.app_name} onChange={(e) => handleChange('app_name', e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Footer Aplikasi</label>
              <input type="text" value={settings.app_footer} onChange={(e) => handleChange('app_footer', e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deskripsi</label>
              <textarea value={settings.description} onChange={(e) => handleChange('description', e.target.value)} rows={3} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
            </div>
          </div>
        </div>

        {/* Informasi Instansi */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Informasi Instansi</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Instansi</label>
              <input type="text" value={settings.institution_name} onChange={(e) => handleChange('institution_name', e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Alamat Instansi</label>
              <textarea value={settings.institution_address} onChange={(e) => handleChange('institution_address', e.target.value)} rows={2} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Kontak</label>
              <input type="email" value={settings.contact_email} onChange={(e) => handleChange('contact_email', e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Telepon Kontak</label>
              <input type="text" value={settings.contact_phone} onChange={(e) => handleChange('contact_phone', e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Website</label>
              <input type="url" value={settings.website} onChange={(e) => handleChange('website', e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
            </div>
          </div>
        </div>

        {/* Informasi Pengelola */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Informasi Pengelola</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Pengelola</label>
              <input type="text" value={settings.manager_name} onChange={(e) => handleChange('manager_name', e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Jabatan</label>
              <input type="text" value={settings.manager_position} onChange={(e) => handleChange('manager_position', e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Jabatan Tambahan</label>
              <input type="text" value={settings.job_title} onChange={(e) => handleChange('job_title', e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
            </div>
          </div>
        </div>

        {/* Tombol Simpan */}
        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => window.history.back()} className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
            Batal
          </button>
          <button type="submit" disabled={saving} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AppSettings;
