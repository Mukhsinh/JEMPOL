import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  
  try {
    // Handle OPTIONS request
    if (req.method === 'OPTIONS') {
      return res.status(200).json({ success: true });
    }
    
    console.log(`🎯 ${req.method} /api/public/users - Vercel Function`);
    
    // Initialize Supabase client
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
    
    // GET - Fetch all users with relations
    if (req.method === 'GET') {
      const { data: users, error } = await supabase
        .from('users')
        .select(`
          *,
          units:unit_id (
            id,
            name,
            code,
            is_active
          ),
          admins:admin_id (
            id,
            username,
            full_name,
            email
          )
        `)
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

      console.log(`✅ Successfully fetched ${users?.length || 0} users`);

      return res.status(200).json({
        success: true,
        data: users || [],
        count: users?.length || 0,
        timestamp: new Date().toISOString()
      });
    }
    
    // POST - Create new user
    if (req.method === 'POST') {
      const userData = req.body;
      
      const { data: newUser, error } = await supabase
        .from('users')
        .insert({
          full_name: userData.full_name,
          email: userData.email,
          employee_id: userData.employee_id || null,
          phone: userData.phone || null,
          unit_id: userData.unit_id || null,
          role: userData.role || 'staff',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select(`
          *,
          units:unit_id (id, name, code)
        `)
        .single();

      if (error) {
        console.error('❌ Error creating user:', error);
        return res.status(400).json({
          success: false,
          error: 'Gagal membuat pengguna',
          details: error.message
        });
      }

      console.log('✅ User created:', newUser.id);

      return res.status(201).json({
        success: true,
        data: newUser,
        message: 'Pengguna berhasil dibuat'
      });
    }
    
    // Method not allowed
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
    
  } catch (error: any) {
    console.error('❌ Unexpected error:', error);
    return res.status(200).json({
      success: false,
      error: 'Terjadi kesalahan server: ' + (error.message || 'Unknown error'),
      data: []
    });
  }
}
