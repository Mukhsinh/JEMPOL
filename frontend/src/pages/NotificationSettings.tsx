import React, { useState, useEffect } from 'react';
import notificationSettingsService, { NotificationSetting } from '../services/notificationSettingsService';

const NotificationSettings: React.FC = () => {
  const [settings, setSettings] = useState<NotificationSetting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchNotificationSettings();
  }, []);

  const fetchNotificationSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await notificationSettingsService.getNotificationSettings();
      setSettings(data);
    } catch (err: any) {
      console.error('Error fetching notification settings:', err);
      setError(err.message || 'Gagal memuat pengaturan notifikasi');
      // Set default settings on error
      setSettings({
        id: '',
        email_notif: true,
        wa_notif: false,
        web_push_notif: true,
        tiket_masuk: true,
        eskalasi: true,
        sla_warning: true,
        respon_baru: true,
        tiket_selesai: true
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (field: keyof NotificationSetting, value: boolean) => {
    if (!settings) return;
    setSettings(prev => prev ? { ...prev, [field]: value } : null);
  };

  const handleSave = async () => {
    if (!settings) return;
    
    try {
      setSaving(true);
      setError(null);
      
      const { id, pengguna_id, dibuat_pada, diperbarui_pada, ...updateData } = settings;
      await notificationSettingsService.bulkUpdateNotificationSettings(updateData);
      
      setSuccessMessage('Pengaturan notifikasi berhasil disimpan');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('Error saving notification settings:', err);
      setError(err.message || 'Gagal menyimpan pengaturan notifikasi');
    } finally {
      setSaving(false);
    }
  };

  const handleEnableAll = () => {
    if (!settings) return;
    setSettings({
      ...settings,
      email_notif: true,
      wa_notif: true,
      web_push_notif: true,
      tiket_masuk: true,
      eskalasi: true,
      sla_warning: true,
      respon_baru: true,
      tiket_selesai: true
    });
  };

  const handleDisableAll = () => {
    if (!settings) return;
    setSettings({
      ...settings,
      email_notif: false,
      wa_notif: false,
      web_push_notif: false,
      tiket_masuk: false,
      eskalasi: false,
      sla_warning: false,
      respon_baru: false,
      tiket_selesai: false
    });
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
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pengaturan Notifikasi</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Kelola preferensi notifikasi Anda</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleEnableAll}
              disabled={saving}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 text-sm"
            >
              Aktifkan Semua
            </button>
            <button
              onClick={handleDisableAll}
              disabled={saving}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 text-sm"
            >
              Nonaktifkan Semua
            </button>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
            <div className="text-sm text-green-700">{successMessage}</div>
          </div>
        )}

        {settings && (
          <>
            {/* Kanal Notifikasi */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg mb-6">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Kanal Notifikasi</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Pilih kanal untuk menerima notifikasi</p>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">Email</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Terima notifikasi melalui email</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.email_notif}
                      onChange={(e) => handleSettingChange('email_notif', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">WhatsApp</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Terima notifikasi melalui WhatsApp</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.wa_notif}
                      onChange={(e) => handleSettingChange('wa_notif', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">Push Browser</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Terima notifikasi push di browser</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.web_push_notif}
                      onChange={(e) => handleSettingChange('web_push_notif', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Jenis Notifikasi */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg mb-6">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Jenis Notifikasi</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Pilih jenis notifikasi yang ingin diterima</p>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">Tiket Masuk</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Notifikasi ketika ada tiket baru masuk</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.tiket_masuk}
                      onChange={(e) => handleSettingChange('tiket_masuk', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">Eskalasi</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Notifikasi ketika tiket dieskalasi</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.eskalasi}
                      onChange={(e) => handleSettingChange('eskalasi', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">Peringatan SLA</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Notifikasi peringatan batas waktu SLA</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.sla_warning}
                      onChange={(e) => handleSettingChange('sla_warning', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">Respon Baru</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Notifikasi ketika ada respon baru pada tiket</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.respon_baru}
                      onChange={(e) => handleSettingChange('respon_baru', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">Tiket Selesai</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Notifikasi ketika tiket diselesaikan</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.tiket_selesai}
                      onChange={(e) => handleSettingChange('tiket_selesai', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-sm">save</span>
                    Simpan Pengaturan
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default NotificationSettings;
