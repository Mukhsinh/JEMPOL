import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  
  try {
    // Handle OPTIONS request
    if (req.method === 'OPTIONS') {
      return res.status(200).json({ success: true });
    }
    
    const { id } = req.query;
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }
    
    console.log(`🎯 ${req.method} /api/public/users/${id}`);
    
    // Initialize Supabase client
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
    
    // GET - Fetch user by ID
    if (req.method === 'GET') {
      const { data: user, error } = await supabase
        .from('users')
        .select(`
          *,
          units:unit_id (id, name, code),
          admins:admin_id (id, username, full_name, email)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('❌ Error fetching user:', error);
        return res.status(404).json({
          success: false,
          error: 'Pengguna tidak ditemukan',
          details: error.message
        });
      }

      return res.status(200).json({
        success: true,
        data: user
      });
    }
    
    // PUT - Update user
    if (req.method === 'PUT') {
      const userData = req.body;
      
      const updateData: any = {
        updated_at: new Date().toISOString()
      };
      
      if (userData.full_name) updateData.full_name = userData.full_name;
      if (userData.email) updateData.email = userData.email;
      if (userData.employee_id !== undefined) updateData.employee_id = userData.employee_id || null;
      if (userData.phone !== undefined) updateData.phone = userData.phone || null;
      if (userData.unit_id !== undefined) updateData.unit_id = userData.unit_id || null;
      if (userData.role) updateData.role = userData.role;
      if (userData.is_active !== undefined) updateData.is_active = userData.is_active;
      
      const { data: updatedUser, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          units:unit_id (id, name, code)
        `)
        .single();

      if (error) {
        console.error('❌ Error updating user:', error);
        return res.status(400).json({
          success: false,
          error: 'Gagal memperbarui pengguna',
          details: error.message
        });
      }

      console.log('✅ User updated:', id);

      return res.status(200).json({
        success: true,
        data: updatedUser,
        message: 'Pengguna berhasil diperbarui'
      });
    }
    
    // DELETE - Soft delete user (set is_active to false)
    if (req.method === 'DELETE') {
      const { data: deletedUser, error } = await supabase
        .from('users')
        .update({
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error deleting user:', error);
        return res.status(400).json({
          success: false,
          error: 'Gagal menonaktifkan pengguna',
          details: error.message
        });
      }

      console.log('✅ User deactivated:', id);

      return res.status(200).json({
        success: true,
        data: deletedUser,
        message: 'Pengguna berhasil dinonaktifkan'
      });
    }
    
    // Method not allowed
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
