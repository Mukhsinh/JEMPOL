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
    
    // Initialize Supabase client dengan service role key untuk bypass RLS
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
    // Prioritaskan SERVICE_ROLE_KEY untuk operasi admin
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Missing Supabase credentials');
      console.error('❌ SUPABASE_URL:', supabaseUrl ? 'SET' : 'MISSING');
      console.error('❌ SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? 'SET' : 'MISSING');
      return res.status(500).json({
        success: false,
        error: 'Konfigurasi Supabase tidak lengkap. Pastikan SUPABASE_SERVICE_ROLE_KEY sudah diset.',
        data: []
      });
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
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
      
      console.log('📝 POST /api/public/users - Request body:', JSON.stringify(userData, null, 2));
      
      // Validasi input - required fields
      if (!userData.full_name || !userData.email) {
        console.error('❌ Validation failed: missing full_name or email');
        return res.status(400).json({
          success: false,
          error: 'Nama lengkap dan email wajib diisi'
        });
      }
      
      // Validasi format email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        console.error('❌ Validation failed: invalid email format');
        return res.status(400).json({
          success: false,
          error: 'Format email tidak valid'
        });
      }
      
      // Validasi role jika diberikan
      const validRoles = ['staff', 'supervisor', 'manager', 'director', 'admin'];
      if (userData.role && !validRoles.includes(userData.role)) {
        console.error('❌ Validation failed: invalid role');
        return res.status(400).json({
          success: false,
          error: `Role tidak valid. Gunakan salah satu: ${validRoles.join(', ')}`
        });
      }

      // Cek apakah email sudah ada - gunakan maybeSingle() untuk menghindari error
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('id, email')
        .eq('email', userData.email.toLowerCase())
        .maybeSingle();

      if (checkError) {
        console.error('❌ Error checking existing user:', checkError);
        return res.status(400).json({
          success: false,
          error: 'Gagal memeriksa email: ' + checkError.message
        });
      }

      if (existingUser) {
        console.error('❌ Email already exists:', userData.email);
        return res.status(400).json({
          success: false,
          error: 'Email sudah terdaftar'
        });
      }
      
      const insertData = {
        full_name: userData.full_name.trim(),
        email: userData.email.toLowerCase().trim(),
        employee_id: userData.employee_id || null,
        phone: userData.phone || null,
        unit_id: userData.unit_id || null,
        role: userData.role || 'staff',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log('📝 Inserting user data:', JSON.stringify(insertData, null, 2));
      
      const { data: newUser, error } = await supabase
        .from('users')
        .insert(insertData)
        .select(`
          *,
          units:unit_id (id, name, code)
        `)
        .single();

      if (error) {
        console.error('❌ Error creating user:', error);
        return res.status(400).json({
          success: false,
          error: 'Gagal membuat pengguna: ' + error.message,
          details: error
        });
      }

      console.log('✅ User created successfully:', newUser.id, newUser.full_name);

      return res.status(201).json({
        success: true,
        data: newUser,
        message: 'Pengguna berhasil dibuat'
      });
    }
    
    // PUT - Update user
    if (req.method === 'PUT') {
      // Ambil userId dari query parameter
      const userId = req.query.id as string;
      
      console.log('✏️ PUT /api/public/users - User ID:', userId);
      console.log('✏️ Query params:', req.query);
      
      if (!userId || userId === 'users') {
        console.error('❌ User ID missing or invalid');
        return res.status(400).json({
          success: false,
          error: 'User ID diperlukan'
        });
      }

      const userData = req.body;
      
      console.log('✏️ Update data:', JSON.stringify(userData, null, 2));
      
      const { data: updatedUser, error } = await supabase
        .from('users')
        .update({
          full_name: userData.full_name,
          email: userData.email,
          employee_id: userData.employee_id || null,
          phone: userData.phone || null,
          unit_id: userData.unit_id || null,
          role: userData.role,
          is_active: userData.is_active !== undefined ? userData.is_active : true,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select(`
          *,
          units:unit_id (id, name, code)
        `)
        .single();

      if (error) {
        console.error('❌ Error updating user:', error);
        return res.status(400).json({
          success: false,
          error: 'Gagal memperbarui pengguna: ' + error.message,
          details: error
        });
      }

      console.log('✅ User updated:', userId);

      return res.status(200).json({
        success: true,
        data: updatedUser,
        message: 'Pengguna berhasil diperbarui'
      });
    }
    
    // DELETE - Delete user (hard delete)
    if (req.method === 'DELETE') {
      // Ambil userId dari query parameter
      const userId = req.query.id as string;
      
      console.log('🗑️ DELETE /api/public/users - User ID:', userId);
      console.log('🗑️ Query params:', req.query);
      console.log('🗑️ Full URL:', req.url);
      
      if (!userId || userId === 'users') {
        console.error('❌ User ID missing or invalid');
        return res.status(400).json({
          success: false,
          error: 'User ID diperlukan'
        });
      }

      // Cek apakah user ada
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('id, full_name, email, admin_id')
        .eq('id', userId)
        .maybeSingle();

      if (checkError) {
        console.error('❌ Error checking user:', checkError);
        return res.status(400).json({
          success: false,
          error: 'Gagal memeriksa pengguna: ' + checkError.message
        });
      }

      if (!existingUser) {
        console.error('❌ User not found:', userId);
        return res.status(404).json({
          success: false,
          error: 'Pengguna tidak ditemukan'
        });
      }

      console.log('🗑️ Attempting to delete user:', existingUser.full_name, existingUser.email);

      // Hard delete - hapus permanen dari database menggunakan SERVICE_ROLE_KEY
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) {
        console.error('❌ Error deleting user:', error);
        return res.status(400).json({
          success: false,
          error: 'Gagal menghapus pengguna: ' + error.message
        });
      }

      console.log('✅ User deleted successfully:', userId, existingUser.full_name);

      return res.status(200).json({
        success: true,
        message: 'Pengguna berhasil dihapus',
        deleted_user: {
          id: existingUser.id,
          name: existingUser.full_name,
          email: existingUser.email
        }
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
