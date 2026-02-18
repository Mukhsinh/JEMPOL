import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Validasi environment variables
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials:', { 
      hasUrl: !!supabaseUrl, 
      hasKey: !!supabaseKey,
      env: process.env.NODE_ENV
    });
    return res.status(500).json({
      success: false,
      message: 'Server configuration error: Missing Supabase credentials'
    });
  }

  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const roleId = req.query.id as string;
    const action = req.query.action as string;

    // GET users by role ID
    if (req.method === 'GET' && roleId && action === 'users') {
      const { data: users, error } = await supabase
        .from('users')
        .select('id, full_name, email, role')
        .eq('role', roleId)
        .order('full_name', { ascending: true });

      if (error) {
        return res.status(200).json({
          success: false,
          error: 'Gagal mengambil data pengguna',
          details: error.message,
          data: []
        });
      }

      return res.status(200).json({
        success: true,
        data: users || [],
        count: users?.length || 0
      });
    }

    // GET single role by ID
    if (req.method === 'GET' && roleId) {
      const { data: role, error } = await supabase
        .from('roles')
        .select('*')
        .eq('id', roleId)
        .single();

      if (error) {
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

    // GET - Fetch all roles
    if (req.method === 'GET') {
      console.log('Fetching roles from Supabase...');
      
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error fetching roles:', error);
        throw error;
      }

      console.log(`Successfully fetched ${data?.length || 0} roles`);

      return res.status(200).json({
        success: true,
        data: data || []
      });
    }

    // POST - Create new role
    if (req.method === 'POST') {
      const { name, code, description, permissions, is_system_role, is_active } = req.body;

      const { data, error } = await supabase
        .from('roles')
        .insert([{
          name,
          code,
          description,
          permissions,
          is_system_role: is_system_role || false,
          is_active: is_active !== undefined ? is_active : true
        }])
        .select()
        .single();

      if (error) throw error;

      return res.status(201).json({
        success: true,
        message: 'Peran berhasil dibuat',
        data
      });
    }

    // PUT - Update role
    if (req.method === 'PUT' && roleId) {
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
        return res.status(400).json({
          success: false,
          error: 'Gagal mengupdate peran',
          details: error.message
        });
      }

      return res.status(200).json({
        success: true,
        data: updatedRole,
        message: 'Peran berhasil diupdate'
      });
    }

    // DELETE - Delete role
    if (req.method === 'DELETE' && roleId) {
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
        return res.status(400).json({
          success: false,
          error: 'Gagal menghapus peran',
          details: error.message
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Peran berhasil dihapus'
      });
    }

    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });

  } catch (error: any) {
    console.error('Error in roles API:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
}
