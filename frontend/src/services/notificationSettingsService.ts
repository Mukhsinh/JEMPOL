import api from './api';

export interface NotificationSetting {
    id: string;
    user_id?: string;
    type: string;
    enabled: boolean;
    email_enabled: boolean;
    sms_enabled: boolean;
    push_enabled: boolean;
    description: string;
}

export const getNotificationSettings = async (): Promise<NotificationSetting[]> => {
    try {
        const response = await api.get('/notification-settings');
        return response.data;
    } catch (error) {
        console.error('Error fetching notification settings:', error);
        throw error;
    }
};

export const updateNotificationSetting = async (id: string, updates: Partial<NotificationSetting>): Promise<NotificationSetting> => {
    try {
        const response = await api.put(`/notification-settings/${id}`, updates);
        return response.data;
    } catch (error) {
        console.error('Error updating notification setting:', error);
        throw error;
    }
};

export const bulkUpdateNotificationSettings = async (updates: Partial<NotificationSetting>[]): Promise<NotificationSetting[]> => {
    try {
        const response = await api.put('/notification-settings/bulk', { updates });
        return response.data;
    } catch (error) {
        console.error('Error bulk updating notification settings:', error);
        throw error;
    }
};

export const notificationSettingsService = {
    getNotificationSettings,
    updateNotificationSetting,
    bulkUpdateNotificationSettings,
};

export default notificationSettingsService;
