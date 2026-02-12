import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  
  try {
    if (req.method === 'OPTIONS') {
      return res.status(200).json({ success: true });
    }
    
    const roleId = req.query.id as string;
    
    if (!roleId) {
      return res.status(400).json({
        success: false,
        error: 'Role ID is required'
      });
    }
    
    console.log(`🎯 ${req.method} /api/public/roles/${roleId}/users - Vercel Function`);
    
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
    
    // GET - Fetch users with this role
    if (req.method === 'GET') {
      const { data: users, error } = await supabase
        .from('users')
        .select('id, full_name, email, role')
        .eq('role', roleId)
        .order('full_name', { ascending: true });

      if (error) {
        console.error('❌ Supabase error:', error);
        return res.status(200).json({
          success: false,
          error: 'Gagal mengambil data pengguna',
          details: error.message,
          data: []
        });
      }

      console.log(`✅ Successfully fetched ${users?.length || 0} users with role ${roleId}`);

      return res.status(200).json({
        success: true,
        data: users || [],
        count: users?.length || 0
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
