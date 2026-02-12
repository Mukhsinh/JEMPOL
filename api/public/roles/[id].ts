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
    
    const roleId = req.query.id as string;
    
    if (!roleId) {
      return res.status(400).json({
        success: false,
        error: 'Role ID is required'
      });
    }
    
    console.log(`🎯 ${req.method} /api/public/roles/${roleId} - Vercel Function`);
    
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
    
    // GET - Fetch single role
    if (req.method === 'GET') {
      const { data: role, error } = await supabase
        .from('roles')
        .select('*')
        .eq('id', roleId)
        .single();

      if (error) {
        console.error('❌ Supabase error:', error);
        return res.status(404).json({
          success: false,
          error: 'Peran tidak ditemukan',
          details: error.message
        });
      }

      return res.status(200).json({
        success: true,
        data: role
      });
    }
    
    // PUT - Update role
    if (req.method === 'PUT') {
      const roleData = req.body;
      
      const updateData: any = {
        updated_at: new Date().toISOString()
      };
      
      if (roleData.name !== undefined) updateData.name = roleData.name;
      if (roleData.code !== undefined) updateData.code = roleData.code;
      if (roleData.description !== undefined) updateData.description = roleData.description;
      if (roleData.permissions !== undefined) updateData.permissions = roleData.permissions;
      if (roleData.is_active !== undefined) updateData.is_active = roleData.is_active;
      
      const { data: updatedRole, error } = await supabase
        .from('roles')
        .update(updateData)
        .eq('id', roleId)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating role:', error);
        return res.status(400).json({
          success: false,
          error: 'Gagal mengupdate peran',
          details: error.message
        });
      }

      console.log('✅ Role updated:', roleId);

      return res.status(200).json({
        success: true,
        data: updatedRole,
        message: 'Peran berhasil diupdate'
      });
    }
    
    // DELETE - Delete role
    if (req.method === 'DELETE') {
      // Check if role is system role
      const { data: role } = await supabase
        .from('roles')
        .select('is_system_role')
        .eq('id', roleId)
        .single();
      
      if (role?.is_system_role) {
        return res.status(400).json({
          success: false,
          error: 'Peran sistem tidak dapat dihapus'
        });
      }
      
      const { error } = await supabase
        .from('roles')
        .delete()
        .eq('id', roleId);

      if (error) {
        console.error('❌ Error deleting role:', error);
        return res.status(400).json({
          success: false,
          error: 'Gagal menghapus peran',
          details: error.message
        });
      }

      console.log('✅ Role deleted:', roleId);

      return res.status(200).json({
        success: true,
        message: 'Peran berhasil dihapus'
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
