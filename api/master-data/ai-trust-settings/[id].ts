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
    
    const settingId = req.query.id as string;
    
    if (!settingId) {
      return res.status(400).json({
        success: false,
        error: 'Setting ID is required'
      });
    }
    
    console.log(`🎯 ${req.method} /api/master-data/ai-trust-settings/${settingId} - Vercel Function`);
    
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
    
    // GET - Fetch single AI trust setting
    if (req.method === 'GET') {
      const { data: setting, error } = await supabase
        .from('ai_trust_settings')
        .select('*')
        .eq('id', settingId)
        .single();

      if (error) {
        console.error('❌ Supabase error:', error);
        return res.status(404).json({
          success: false,
          error: 'Pengaturan AI tidak ditemukan',
          details: error.message
        });
      }

      return res.status(200).json({
        success: true,
        data: setting
      });
    }
    
    // PUT - Update AI trust setting
    if (req.method === 'PUT') {
      const settingData = req.body;
      
      const updateData: any = {
        updated_at: new Date().toISOString()
      };
      
      if (settingData.setting_name !== undefined) updateData.setting_name = settingData.setting_name;
      if (settingData.confidence_threshold !== undefined) updateData.confidence_threshold = settingData.confidence_threshold;
      if (settingData.auto_routing_enabled !== undefined) updateData.auto_routing_enabled = settingData.auto_routing_enabled;
      if (settingData.auto_classification_enabled !== undefined) updateData.auto_classification_enabled = settingData.auto_classification_enabled;
      if (settingData.manual_review_required !== undefined) updateData.manual_review_required = settingData.manual_review_required;
      if (settingData.description !== undefined) updateData.description = settingData.description;
      if (settingData.is_active !== undefined) updateData.is_active = settingData.is_active;
      
      const { data: updatedSetting, error } = await supabase
        .from('ai_trust_settings')
        .update(updateData)
        .eq('id', settingId)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating AI trust setting:', error);
        return res.status(400).json({
          success: false,
          error: 'Gagal mengupdate pengaturan AI',
          details: error.message
        });
      }

      console.log('✅ AI trust setting updated:', settingId);

      return res.status(200).json({
        success: true,
        data: updatedSetting,
        message: 'Pengaturan AI berhasil diupdate'
      });
    }
    
    // DELETE - Delete AI trust setting
    if (req.method === 'DELETE') {
      const { error } = await supabase
        .from('ai_trust_settings')
        .delete()
        .eq('id', settingId);

      if (error) {
        console.error('❌ Error deleting AI trust setting:', error);
        return res.status(400).json({
          success: false,
          error: 'Gagal menghapus pengaturan AI',
          details: error.message
        });
      }

      console.log('✅ AI trust setting deleted:', settingId);

      return res.status(200).json({
        success: true,
        message: 'Pengaturan AI berhasil dihapus'
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
