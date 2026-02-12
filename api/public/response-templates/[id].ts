import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  
  try {
    if (req.method === 'OPTIONS') {
      return res.status(200).json({ success: true });
    }
    
    const templateId = req.query.id as string;
    
    if (!templateId) {
      return res.status(400).json({
        success: false,
        error: 'Template ID is required'
      });
    }
    
    console.log(`🎯 ${req.method} /api/public/response-templates/${templateId} - Vercel Function`);
    
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Missing Supabase credentials');
      return res.status(200).json({
        success: false,
        error: 'Konfigurasi Supabase tidak lengkap'
      });
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // GET - Fetch single template
    if (req.method === 'GET') {
      const { data: template, error } = await supabase
        .from('response_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (error) {
        console.error('❌ Supabase error:', error);
        return res.status(404).json({
          success: false,
          error: 'Template tidak ditemukan',
          details: error.message
        });
      }

      return res.status(200).json({
        success: true,
        data: template
      });
    }
    
    // PUT - Update template
    if (req.method === 'PUT') {
      const templateData = req.body;
      
      const updateData: any = {
        updated_at: new Date().toISOString()
      };
      
      if (templateData.name !== undefined) updateData.name = templateData.name;
      if (templateData.subject !== undefined) updateData.subject = templateData.subject;
      if (templateData.content !== undefined) updateData.content = templateData.content;
      if (templateData.category !== undefined) updateData.category = templateData.category;
      if (templateData.variables !== undefined) updateData.variables = templateData.variables;
      if (templateData.is_active !== undefined) updateData.is_active = templateData.is_active;
      
      const { data: updatedTemplate, error } = await supabase
        .from('response_templates')
        .update(updateData)
        .eq('id', templateId)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating template:', error);
        return res.status(400).json({
          success: false,
          error: 'Gagal mengupdate template',
          details: error.message
        });
      }

      console.log('✅ Template updated:', templateId);

      return res.status(200).json({
        success: true,
        data: updatedTemplate,
        message: 'Template berhasil diupdate'
      });
    }
    
    // DELETE - Delete template
    if (req.method === 'DELETE') {
      const { error } = await supabase
        .from('response_templates')
        .delete()
        .eq('id', templateId);

      if (error) {
        console.error('❌ Error deleting template:', error);
        return res.status(400).json({
          success: false,
          error: 'Gagal menghapus template',
          details: error.message
        });
      }

      console.log('✅ Template deleted:', templateId);

      return res.status(200).json({
        success: true,
        message: 'Template berhasil dihapus'
      });
    }
    
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
    
  } catch (error: any) {
    console.error('❌ Unexpected error:', error);
    return res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan server: ' + (error.message || 'Unknown error')
    });
  }
}
