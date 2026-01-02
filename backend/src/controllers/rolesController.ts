import { Request, Response } from 'express';
import { supabase } from '../config/supabase.js';

export const rolesController = {
  // Get all roles
  async getAllRoles(req: Request, res: Response) {
    try {
      const { data: roles, error } = await supabase
        .from('roles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching roles:', error);
        return res.status(500).json({ 
          success: false, 
          message: 'Gagal mengambil data peran',
          error: error.message 
        });
      }

      res.json({
        success: true,
        data: roles || []
      });
    } catch (error) {
      console.error('Error in getAllRoles:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Terjadi kesalahan server',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Get role by ID
  async getRoleById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const { data: role, error } = await supabase
        .from('roles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching role:', error);
        return res.status(404).json({ 
          success: false, 
          message: 'Peran tidak ditemukan',
          error: error.message 
        });
      }

      res.json({
        success: true,
        data: role
      });
    } catch (error) {
      console.error('Error in getRoleById:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Terjadi kesalahan server',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Create new role
  async createRole(req: Request, res: Response) {
    try {
      const { name, code, description, permissions } = req.body;

      // Validate required fields
      if (!name || !code) {
        return res.status(400).json({
          success: false,
          message: 'Nama dan kode peran wajib diisi'
        });
      }

      // Check if code already exists
      const { data: existingRole } = await supabase
        .from('roles')
        .select('id')
        .eq('code', code.toUpperCase())
        .single();

      if (existingRole) {
        return res.status(400).json({
          success: false,
          message: 'Kode peran sudah digunakan'
        });
      }

      const { data: role, error } = await supabase
        .from('roles')
        .insert([{
          name,
          code: code.toUpperCase(),
          description,
          permissions: permissions || {},
          is_system_role: false,
          is_active: true
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating role:', error);
        return res.status(400).json({ 
          success: false, 
          message: 'Gagal membuat peran baru',
          error: error.message 
        });
      }

      res.status(201).json({
        success: true,
        message: 'Peran berhasil dibuat',
        data: role
      });
    } catch (error) {
      console.error('Error in createRole:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Terjadi kesalahan server',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Update role
  async updateRole(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, code, description, permissions, is_active } = req.body;

      // Check if role exists and is not a system role
      const { data: existingRole, error: fetchError } = await supabase
        .from('roles')
        .select('is_system_role, name')
        .eq('id', id)
        .single();

      if (fetchError) {
        return res.status(404).json({
          success: false,
          message: 'Peran tidak ditemukan'
        });
      }

      if (existingRole.is_system_role && (name || code || description || permissions)) {
        return res.status(403).json({
          success: false,
          message: 'Peran sistem tidak dapat diubah'
        });
      }

      // Check if new code already exists (if code is being updated)
      if (code) {
        const { data: codeExists } = await supabase
          .from('roles')
          .select('id')
          .eq('code', code.toUpperCase())
          .neq('id', id)
          .single();

        if (codeExists) {
          return res.status(400).json({
            success: false,
            message: 'Kode peran sudah digunakan'
          });
        }
      }

      const updateData: any = { updated_at: new Date().toISOString() };
      
      if (name !== undefined) updateData.name = name;
      if (code !== undefined) updateData.code = code.toUpperCase();
      if (description !== undefined) updateData.description = description;
      if (permissions !== undefined) updateData.permissions = permissions;
      if (is_active !== undefined) updateData.is_active = is_active;

      const { data: role, error } = await supabase
        .from('roles')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating role:', error);
        return res.status(400).json({ 
          success: false, 
          message: 'Gagal mengupdate peran',
          error: error.message 
        });
      }

      res.json({
        success: true,
        message: 'Peran berhasil diupdate',
        data: role
      });
    } catch (error) {
      console.error('Error in updateRole:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Terjadi kesalahan server',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Delete role
  async deleteRole(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // Check if role exists and is not a system role
      const { data: existingRole, error: fetchError } = await supabase
        .from('roles')
        .select('is_system_role, name')
        .eq('id', id)
        .single();

      if (fetchError) {
        return res.status(404).json({
          success: false,
          message: 'Peran tidak ditemukan'
        });
      }

      if (existingRole.is_system_role) {
        return res.status(403).json({
          success: false,
          message: 'Peran sistem tidak dapat dihapus'
        });
      }

      // Check if role is being used by any users
      const { data: usersWithRole } = await supabase
        .from('users')
        .select('id')
        .eq('role_id', id)
        .limit(1);

      if (usersWithRole && usersWithRole.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Peran tidak dapat dihapus karena masih digunakan oleh pengguna'
        });
      }

      const { error } = await supabase
        .from('roles')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting role:', error);
        return res.status(400).json({ 
          success: false, 
          message: 'Gagal menghapus peran',
          error: error.message 
        });
      }

      res.json({
        success: true,
        message: `Peran "${existingRole.name}" berhasil dihapus`
      });
    } catch (error) {
      console.error('Error in deleteRole:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Terjadi kesalahan server',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Get users by role ID
  async getUsersByRole(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // Check if role exists
      const { data: role, error: roleError } = await supabase
        .from('roles')
        .select('name')
        .eq('id', id)
        .single();

      if (roleError) {
        return res.status(404).json({
          success: false,
          message: 'Peran tidak ditemukan'
        });
      }

      // Get users with this role
      const { data: users, error } = await supabase
        .from('users')
        .select('id, full_name, email, employee_id, is_active')
        .eq('role_id', id)
        .order('full_name', { ascending: true });

      if (error) {
        console.error('Error fetching users by role:', error);
        return res.status(500).json({ 
          success: false, 
          message: 'Gagal mengambil data pengguna',
          error: error.message 
        });
      }

      res.json({
        success: true,
        data: users || [],
        message: `Ditemukan ${users?.length || 0} pengguna dengan peran "${role.name}"`
      });
    } catch (error) {
      console.error('Error in getUsersByRole:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Terjadi kesalahan server',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
};