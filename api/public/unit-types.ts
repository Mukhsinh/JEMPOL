import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    
    if (req.method === 'OPTIONS') {
      return res.status(200).json({ success: true });
    }

    if (req.method !== 'GET') {
      return res.status(405).json({
        success: false,
        error: 'Method not allowed',
        data: []
      });
    }

    console.log('🎯 GET /api/public/unit-types');
    
    if (!supabaseUrl || !supabaseKey) {
      return res.status(200).json({
        success: false,
        error: 'Konfigurasi Supabase tidak lengkap',
        data: []
      });
    }
    
    const { data: unitTypes, error } = await supabase
      .from('unit_types')
      .select('id, name, code, description, icon, color, is_active')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) {
      console.error('❌ Supabase error:', error.message);
      return res.status(200).json({
        success: false,
        error: 'Gagal mengambil data tipe unit',
        data: []
      });
    }


    console.log(`✅ Fetched ${unitTypes?.length || 0} unit types`);

    return res.status(200).json({
      success: true,
      data: unitTypes || [],
      count: unitTypes?.length || 0,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    return res.status(200).json({
      success: false,
      error: 'Terjadi kesalahan server',
      data: []
    });
  }
}
