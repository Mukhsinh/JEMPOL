import { Request, Response } from 'express';
import supabase from '../config/supabase.js';

export const getNotificationSettings = async (req: Request, res: Response) => {
    try {
        // Assuming auth middleware populates req.user
        const userId = (req as any).user?.id;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Menggunakan tabel pengaturan_notifikasi (bahasa Indonesia)
        const { data: settings, error } = await supabase
            .from('pengaturan_notifikasi')
            .select('*')
            .eq('pengguna_id', userId);

        if (error) throw error;

        // Jika belum ada pengaturan, buat default
        if (!settings || settings.length === 0) {
            const { data: newSettings, error: insertError } = await supabase
                .from('pengaturan_notifikasi')
                .insert({
                    pengguna_id: userId,
                    email_notif: true,
                    wa_notif: false,
                    web_push_notif: true,
                    tiket_masuk: true,
                    eskalasi: true,
                    sla_warning: true,
                    respon_baru: true,
                    tiket_selesai: true
                })
                .select()
                .single();

            if (insertError) {
                console.error('Error creating default notification settings:', insertError);
                // Return default settings even if insert fails
                return res.json({
                    id: null,
                    pengguna_id: userId,
                    email_notif: true,
                    wa_notif: false,
                    web_push_notif: true,
                    tiket_masuk: true,
                    eskalasi: true,
                    sla_warning: true,
                    respon_baru: true,
                    tiket_selesai: true
                });
            }

            return res.json(newSettings);
        }

        res.json(settings[0]);
    } catch (error: any) {
        console.error('Error fetching notification settings:', error);
        res.status(500).json({ error: error.message });
    }
};

export const updateNotificationSetting = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const { id } = req.params;
        const updates = req.body;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { data: setting, error } = await supabase
            .from('pengaturan_notifikasi')
            .update({
                ...updates,
                diperbarui_pada: new Date().toISOString()
            })
            .eq('id', id)
            .eq('pengguna_id', userId)
            .select()
            .single();

        if (error) throw error;

        res.json(setting);
    } catch (error: any) {
        console.error('Error updating notification setting:', error);
        res.status(500).json({ error: error.message });
    }
};

export const bulkUpdateNotificationSettings = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const updates = req.body; // Object with notification settings

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Check if settings exist for this user
        const { data: existingSettings, error: selectError } = await supabase
            .from('pengaturan_notifikasi')
            .select('id')
            .eq('pengguna_id', userId)
            .single();

        if (selectError && selectError.code !== 'PGRST116') {
            throw selectError;
        }

        let result;
        if (existingSettings) {
            // Update existing settings
            const { data, error } = await supabase
                .from('pengaturan_notifikasi')
                .update({
                    ...updates,
                    diperbarui_pada: new Date().toISOString()
                })
                .eq('pengguna_id', userId)
                .select()
                .single();

            if (error) throw error;
            result = data;
        } else {
            // Insert new settings
            const { data, error } = await supabase
                .from('pengaturan_notifikasi')
                .insert({
                    pengguna_id: userId,
                    ...updates
                })
                .select()
                .single();

            if (error) throw error;
            result = data;
        }

        res.json(result);
    } catch (error: any) {
        console.error('Error bulk updating notification settings:', error);
        res.status(500).json({ error: error.message });
    }
};
