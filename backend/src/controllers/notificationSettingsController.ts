import { Request, Response } from 'express';
import supabase from '../config/supabase.js';

export const getNotificationSettings = async (req: Request, res: Response) => {
    try {
        // Assuming auth middleware populates req.user
        const userId = (req as any).user?.id;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { data: settings, error } = await supabase
            .from('notification_settings')
            .select('*')
            .eq('user_id', userId);

        if (error) throw error;

        res.json(settings || []);
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
            .from('notification_settings')
            .update(updates)
            .eq('id', id)
            .eq('user_id', userId)
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
        const { updates } = req.body; // Array of { id, ...updates }

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const results = [];
        for (const update of updates) {
            const { id, ...fields } = update;
            const { data, error } = await supabase
                .from('notification_settings')
                .update(fields)
                .eq('id', id)
                .eq('user_id', userId)
                .select()
                .single();

            if (!error && data) {
                results.push(data);
            }
        }

        res.json(results);
    } catch (error: any) {
        console.error('Error bulk updating notification settings:', error);
        res.status(500).json({ error: error.message });
    }
};
