import api from './api';

// Interface sesuai dengan tabel pengaturan_notifikasi di database
export interface NotificationSetting {
    id: string;
    pengguna_id?: string;
    email_notif: boolean;
    wa_notif: boolean;
    web_push_notif: boolean;
    tiket_masuk: boolean;
    eskalasi: boolean;
    sla_warning: boolean;
    respon_baru: boolean;
    tiket_selesai: boolean;
    dibuat_pada?: string;
    diperbarui_pada?: string;
}

// Interface lama untuk kompatibilitas
export interface LegacyNotificationSetting {
    id: string;
    user_id?: string;
    type: string;
    enabled: boolean;
    email_enabled: boolean;
    sms_enabled: boolean;
    push_enabled: boolean;
    description: string;
}

export const getNotificationSettings = async (): Promise<NotificationSetting> => {
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

export const bulkUpdateNotificationSettings = async (updates: Partial<NotificationSetting>): Promise<NotificationSetting> => {
    try {
        const response = await api.put('/notification-settings/bulk', updates);
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
