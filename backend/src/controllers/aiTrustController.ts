import { Request, Response } from 'express';
import { supabase } from '../config/supabase.js';

export const aiTrustController = {
  // Get all AI trust settings
  async getAllSettings(req: Request, res: Response) {
    try {
      const { data, error } = await supabase
        .from('ai_trust_settings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching AI trust settings:', error);
        return res.status(500).json({ 
          success: false, 
          message: 'Gagal mengambil pengaturan AI',
          error: error.message 
        });
      }

      res.json({
        success: true,
        data: data || []
      });
    } catch (error) {
      console.error('Error in getAllSettings:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Terjadi kesalahan server',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Get setting by ID
  async getSettingById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const { data, error } = await supabase
        .from('ai_trust_settings')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching AI trust setting:', error);
        return res.status(404).json({ 
          success: false, 
          message: 'Pengaturan tidak ditemukan',
          error: error.message 
        });
      }

      res.json({
        success: true,
        data
      });
    } catch (error) {
      console.error('Error in getSettingById:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Terjadi kesalahan server',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Get default settings
  async getDefaultSettings(req: Request, res: Response) {
    try {
      const { data, error } = await supabase
        .from('ai_trust_settings')
        .select('*')
        .eq('setting_name', 'default')
        .single();

      if (error) {
        console.error('Error fetching default AI trust settings:', error);
        return res.status(404).json({ 
          success: false, 
          message: 'Pengaturan default tidak ditemukan',
          error: error.message 
        });
      }

      res.json({
        success: true,
        data
      });
    } catch (error) {
      console.error('Error in getDefaultSettings:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Terjadi kesalahan server',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Update settings
  async updateSettings(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { 
        setting_name,
        confidence_threshold, 
        auto_routing_enabled, 
        auto_classification_enabled, 
        manual_review_required,
        description,
        is_active 
      } = req.body;
      const userId = (req as any).user?.id;

      const { data, error } = await supabase
        .from('ai_trust_settings')
        .update({
          setting_name,
          confidence_threshold,
          auto_routing_enabled,
          auto_classification_enabled,
          manual_review_required,
          description,
          is_active,
          updated_by: userId,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating AI trust settings:', error);
        return res.status(400).json({ 
          success: false, 
          message: 'Gagal memperbarui pengaturan AI',
          error: error.message 
        });
      }

      res.json({
        success: true,
        message: 'Pengaturan AI berhasil diperbarui',
        data
      });
    } catch (error) {
      console.error('Error in updateSettings:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Terjadi kesalahan server',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Update default settings
  async updateDefaultSettings(req: Request, res: Response) {
    try {
      const { 
        confidence_threshold, 
        auto_routing_enabled, 
        auto_classification_enabled, 
        manual_review_required,
        description 
      } = req.body;
      const userId = (req as any).user?.id;

      const { data, error } = await supabase
        .from('ai_trust_settings')
        .update({
          confidence_threshold,
          auto_routing_enabled,
          auto_classification_enabled,
          manual_review_required,
          description,
          updated_by: userId,
          updated_at: new Date().toISOString()
        })
        .eq('setting_name', 'default')
        .select()
        .single();

      if (error) {
        console.error('Error updating default AI trust settings:', error);
        return res.status(400).json({ 
          success: false, 
          message: 'Gagal memperbarui pengaturan default AI',
          error: error.message 
        });
      }

      res.json({
        success: true,
        message: 'Pengaturan default AI berhasil diperbarui',
        data
      });
    } catch (error) {
      console.error('Error in updateDefaultSettings:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Terjadi kesalahan server',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Create new settings
  async createSettings(req: Request, res: Response) {
    try {
      const { 
        setting_name,
        confidence_threshold, 
        auto_routing_enabled, 
        auto_classification_enabled, 
        manual_review_required,
        description,
        is_active 
      } = req.body;
      const userId = (req as any).user?.id;

      const { data, error } = await supabase
        .from('ai_trust_settings')
        .insert({
          setting_name,
          confidence_threshold,
          auto_routing_enabled,
          auto_classification_enabled,
          manual_review_required,
          description,
          is_active: is_active !== undefined ? is_active : true,
          updated_by: userId
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating AI trust settings:', error);
        return res.status(400).json({ 
          success: false, 
          message: 'Gagal membuat pengaturan AI',
          error: error.message 
        });
      }

      res.status(201).json({
        success: true,
        message: 'Pengaturan AI berhasil dibuat',
        data
      });
    } catch (error) {
      console.error('Error in createSettings:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Terjadi kesalahan server',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
};