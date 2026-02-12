import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  
  try {
    if (req.method === 'OPTIONS') {
      return res.status(200).json({ success: true });
    }
    
    console.log(`🎯 ${req.method} /api/master-data/ai-trust-settings - Vercel Function`);
    
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Missing Supabase credentials');
      return res.status(200).json({
        success: false,
        error: 'Konfigurasi Supabase tidak lengkap',
        data: []
      });
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // GET - Fetch AI trust settings
    if (req.method === 'GET') {
      const { data: settings, error } = await supabase
        .from('ai_trust_settings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Supabase error:', error);
        return res.status(500).json({
          success: false,
          error: 'Gagal mengambil data pengaturan AI',
          details: error.message,
          data: []
        });
      }

      console.log(`✅ Successfully fetched ${settings?.length || 0} AI trust settings`);

      return res.status(200).json({
        success: true,
        data: settings || [],
        count: settings?.length || 0,
        timestamp: new Date().toISOString()
      });
    }
    
    // POST - Create new AI trust setting
    if (req.method === 'POST') {
      const settingData = req.body;
      
      const { data: newSetting, error } = await supabase
        .from('ai_trust_settings')
        .insert({
          setting_name: settingData.setting_name || 'default',
          confidence_threshold: settingData.confidence_threshold || 85,
          auto_routing_enabled: settingData.auto_routing_enabled !== undefined ? settingData.auto_routing_enabled : true,
          auto_classification_enabled: settingData.auto_classification_enabled !== undefined ? settingData.auto_classification_enabled : true,
          manual_review_required: settingData.manual_review_required !== undefined ? settingData.manual_review_required : false,
          description: settingData.description || '',
          is_active: settingData.is_active !== undefined ? settingData.is_active : true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating AI trust setting:', error);
        return res.status(400).json({
          success: false,
          error: 'Gagal membuat pengaturan AI',
          details: error.message
        });
      }

      console.log('✅ AI trust setting created:', newSetting.id);

      return res.status(201).json({
        success: true,
        data: newSetting,
        message: 'Pengaturan AI berhasil dibuat'
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
      error: 'Terjadi kesalahan server: ' + (error.message || 'Unknown error'),
      data: []
    });
  }
}
