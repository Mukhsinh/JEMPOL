import React, { useState, useEffect } from 'react';
import notificationSettingsService, { NotificationSetting } from '../services/notificationSettingsService';

const NotificationSettings: React.FC = () => {
  const [settings, setSettings] = useState<NotificationSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchNotificationSettings();
  }, []);

  const fetchNotificationSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await notificationSettingsService.getNotificationSettings();

      // If no settings exist, create default ones (this logic should ideally be in backend, but keeping for safety)
      const defaultSettings: NotificationSetting[] = [
        {
          id: '1',
          type: 'ticket_created',
          enabled: true,
          email_enabled: true,
          sms_enabled: false,
          push_enabled: true,
          description: 'Notifikasi ketika tiket baru dibuat'
        },
        {
          id: '2',
          type: 'ticket_updated',
          enabled: true,
          email_enabled: true,
          sms_enabled: false,
          push_enabled: true,
          description: 'Notifikasi ketika status tiket diperbarui'
        },
        {
          id: '3',
          type: 'ticket_resolved',
          enabled: true,
          email_enabled: true,
          sms_enabled: true,
          push_enabled: true,
          description: 'Notifikasi ketika tiket diselesaikan'
        },
        {
          id: '4',
          type: 'escalation_triggered',
          enabled: true,
          email_enabled: true,
          sms_enabled: true,
          push_enabled: true,
          description: 'Notifikasi ketika eskalasi dipicu'
        },
        {
          id: '5',
          type: 'survey_reminder',
          enabled: false,
          email_enabled: true,
          sms_enabled: false,
          push_enabled: false,
          description: 'Pengingat untuk mengisi survei'
        }
      ];

      setSettings(data.length > 0 ? data : defaultSettings);
    } catch (err: any) {
      console.error('Error fetching notification settings:', err);
      setError(err.message || 'Failed to fetch notification settings');

      // Set default settings on error
      setSettings([
        {
          id: '1',
          type: 'ticket_created',
          enabled: true,
          email_enabled: true,
          sms_enabled: false,
          push_enabled: true,
          description: 'Notifikasi ketika tiket baru dibuat'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = async (id: string, field: keyof NotificationSetting, value: boolean) => {
    try {
      setSaving(true);

      // Update local state immediately
      setSettings(prev => prev.map(setting =>
        setting.id === id ? { ...setting, [field]: value } : setting
      ));

      // Update on server
      await notificationSettingsService.updateNotificationSetting(id, { [field]: value });

    } catch (err: any) {
      console.error('Error updating notification setting:', err);
      setError(err.message || 'Failed to update notification setting');

      // Revert local state on error
      await fetchNotificationSettings();
    } finally {
      setSaving(false);
    }
  };

  const handleBulkUpdate = async (field: keyof NotificationSetting, value: boolean) => {
    try {
      setSaving(true);

      // Update all settings
      const updates = settings.map(setting => ({
        id: setting.id,
        [field]: value
      }));

      await notificationSettingsService.bulkUpdateNotificationSettings(updates);
      await fetchNotificationSettings();

    } catch (err: any) {
      console.error('Error bulk updating notification settings:', err);
      setError(err.message || 'Failed to bulk update notification settings');
    } finally {
      setSaving(false);
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
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Notification Settings</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => handleBulkUpdate('enabled', true)}
            disabled={saving}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            Enable All
          </button>
          <button
            onClick={() => handleBulkUpdate('enabled', false)}
            disabled={saving}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
          >
            Disable All
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      <div className="bg-white shadow rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notification Type
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Enabled
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SMS
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Push
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {settings.map((setting) => (
                <tr key={setting.id}>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {setting.type.replace(/_/g, ' ').replace(/ w/g, l => l.toUpperCase())}
                      </div>
                      <div className="text-sm text-gray-500">{setting.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <input
                      type="checkbox"
                      checked={setting.enabled}
                      onChange={(e) => handleSettingChange(setting.id, 'enabled', e.target.checked)}
                      disabled={saving}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <input
                      type="checkbox"
                      checked={setting.email_enabled}
                      onChange={(e) => handleSettingChange(setting.id, 'email_enabled', e.target.checked)}
                      disabled={saving || !setting.enabled}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <input
                      type="checkbox"
                      checked={setting.sms_enabled}
                      onChange={(e) => handleSettingChange(setting.id, 'sms_enabled', e.target.checked)}
                      disabled={saving || !setting.enabled}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <input
                      type="checkbox"
                      checked={setting.push_enabled}
                      onChange={(e) => handleSettingChange(setting.id, 'push_enabled', e.target.checked)}
                      disabled={saving || !setting.enabled}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {saving && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span>Saving...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationSettings;