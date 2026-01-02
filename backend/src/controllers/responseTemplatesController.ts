import { Request, Response } from 'express';
import { supabase } from '../config/supabase.js';

export const responseTemplatesController = {
  // Get all response templates
  async getAllTemplates(req: Request, res: Response) {
    try {
      const { data, error } = await supabase
        .from('response_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching response templates:', error);
        return res.status(500).json({ 
          success: false, 
          message: 'Gagal mengambil data template respon',
          error: error.message 
        });
      }

      res.json({
        success: true,
        data: data || []
      });
    } catch (error) {
      console.error('Error in getAllTemplates:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Terjadi kesalahan server',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Get template by ID
  async getTemplateById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const { data, error } = await supabase
        .from('response_templates')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching template:', error);
        return res.status(404).json({ 
          success: false, 
          message: 'Template tidak ditemukan',
          error: error.message 
        });
      }

      res.json({
        success: true,
        data
      });
    } catch (error) {
      console.error('Error in getTemplateById:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Terjadi kesalahan server',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Create new template
  async createTemplate(req: Request, res: Response) {
    try {
      const { name, category, subject, content, variables, is_active } = req.body;
      const userId = (req as any).user?.id;

      const { data, error } = await supabase
        .from('response_templates')
        .insert({
          name,
          category,
          subject,
          content,
          variables: variables || [],
          is_active: is_active !== undefined ? is_active : true,
          created_by: userId
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating template:', error);
        return res.status(400).json({ 
          success: false, 
          message: 'Gagal membuat template',
          error: error.message 
        });
      }

      res.status(201).json({
        success: true,
        message: 'Template berhasil dibuat',
        data
      });
    } catch (error) {
      console.error('Error in createTemplate:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Terjadi kesalahan server',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Update template
  async updateTemplate(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, category, subject, content, variables, is_active } = req.body;

      const { data, error } = await supabase
        .from('response_templates')
        .update({
          name,
          category,
          subject,
          content,
          variables,
          is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating template:', error);
        return res.status(400).json({ 
          success: false, 
          message: 'Gagal memperbarui template',
          error: error.message 
        });
      }

      res.json({
        success: true,
        message: 'Template berhasil diperbarui',
        data
      });
    } catch (error) {
      console.error('Error in updateTemplate:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Terjadi kesalahan server',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Delete template
  async deleteTemplate(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const { error } = await supabase
        .from('response_templates')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting template:', error);
        return res.status(400).json({ 
          success: false, 
          message: 'Gagal menghapus template',
          error: error.message 
        });
      }

      res.json({
        success: true,
        message: 'Template berhasil dihapus'
      });
    } catch (error) {
      console.error('Error in deleteTemplate:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Terjadi kesalahan server',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
};