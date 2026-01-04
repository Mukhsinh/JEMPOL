import { Request, Response } from 'express';
import supabase from '../config/supabase.js';
import bcrypt from 'bcryptjs';

class UserController {
  // Get all users with their units
  async getUsers(req: Request, res: Response) {
    try {
      const { data: users, error } = await supabase
        .from('users')
        .select(`
          *,
          units(id, name, code),
          admins(id, username, full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        return res.status(500).json({ 
          success: false, 
          message: 'Gagal mengambil data pengguna',
          error: error.message 
        });
      }

      res.json({
        success: true,
        data: users || []
      });
    } catch (error) {
      console.error('Error in getUsers:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Terjadi kesalahan server',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get all units for dropdown
  async getUnits(req: Request, res: Response) {
    try {
      const { data: units, error } = await supabase
        .from('units')
        .select('id, name, code, description')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error fetching units:', error);
        return res.status(500).json({ 
          success: false, 
          message: 'Gagal mengambil data unit',
          error: error.message 
        });
      }

      res.json({
        success: true,
        data: units || []
      });
    } catch (error) {
      console.error('Error in getUnits:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Terjadi kesalahan server',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Create new user
  async createUser(req: Request, res: Response) {
    try {
      const { 
        employee_id, 
        full_name, 
        email, 
        phone, 
        unit_id, 
        role,
        password,
        create_admin_account = false
      } = req.body;

      // Validate required fields
      if (!full_name || !email || !role) {
        return res.status(400).json({
          success: false,
          message: 'Nama lengkap, email, dan peran wajib diisi'
        });
      }

      // Check if email already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email sudah terdaftar'
        });
      }

      let admin_id = null;

      // Create admin account if requested and password provided
      if (create_admin_account && password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const { data: adminData, error: adminError } = await supabase
          .from('admins')
          .insert({
            username: email,
            password_hash: hashedPassword,
            full_name,
            email,
            role: role === 'admin' ? 'admin' : 'admin'
          })
          .select()
          .single();

        if (adminError) {
          console.error('Error creating admin:', adminError);
          return res.status(500).json({
            success: false,
            message: 'Gagal membuat akun admin',
            error: adminError.message
          });
        }

        admin_id = adminData.id;
      }

      // Create user record
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert({
          admin_id,
          employee_id,
          full_name,
          email,
          phone,
          unit_id,
          role,
          is_active: true
        })
        .select(`
          *,
          units(id, name, code),
          admins(id, username, full_name, email)
        `)
        .single();

      if (userError) {
        console.error('Error creating user:', userError);
        return res.status(500).json({
          success: false,
          message: 'Gagal membuat pengguna',
          error: userError.message
        });
      }

      res.status(201).json({
        success: true,
        message: 'Pengguna berhasil dibuat',
        data: userData
      });
    } catch (error) {
      console.error('Error in createUser:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Update user
  async updateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { 
        employee_id, 
        full_name, 
        email, 
        phone, 
        unit_id, 
        role,
        is_active,
        password,
        update_admin_password = false
      } = req.body;

      // Validate required fields
      if (!full_name || !email || !role) {
        return res.status(400).json({
          success: false,
          message: 'Nama lengkap, email, dan peran wajib diisi'
        });
      }

      // Check if email already exists for other users
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .neq('id', id)
        .single();

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email sudah digunakan oleh pengguna lain'
        });
      }

      // Get current user data
      const { data: currentUser } = await supabase
        .from('users')
        .select('admin_id')
        .eq('id', id)
        .single();

      // Update admin password if requested
      if (update_admin_password && password && currentUser?.admin_id) {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const { error: adminError } = await supabase
          .from('admins')
          .update({
            password_hash: hashedPassword,
            full_name,
            email,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentUser.admin_id);

        if (adminError) {
          console.error('Error updating admin password:', adminError);
          return res.status(500).json({
            success: false,
            message: 'Gagal mengupdate password admin',
            error: adminError.message
          });
        }
      }

      // Update user record
      const { data: userData, error: userError } = await supabase
        .from('users')
        .update({
          employee_id,
          full_name,
          email,
          phone,
          unit_id,
          role,
          is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select(`
          *,
          units(id, name, code),
          admins(id, username, full_name, email)
        `)
        .single();

      if (userError) {
        console.error('Error updating user:', userError);
        return res.status(500).json({
          success: false,
          message: 'Gagal mengupdate pengguna',
          error: userError.message
        });
      }

      res.json({
        success: true,
        message: 'Pengguna berhasil diupdate',
        data: userData
      });
    } catch (error) {
      console.error('Error in updateUser:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Delete user (soft delete)
  async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const { data: userData, error: userError } = await supabase
        .from('users')
        .update({
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (userError) {
        console.error('Error deleting user:', userError);
        return res.status(500).json({
          success: false,
          message: 'Gagal menonaktifkan pengguna',
          error: userError.message
        });
      }

      res.json({
        success: true,
        message: 'Pengguna berhasil dinonaktifkan',
        data: userData
      });
    } catch (error) {
      console.error('Error in deleteUser:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get user by ID
  async getUserById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const { data: userData, error } = await supabase
        .from('users')
        .select(`
          *,
          units(id, name, code),
          admins(id, username, full_name, email)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching user:', error);
        return res.status(404).json({
          success: false,
          message: 'Pengguna tidak ditemukan',
          error: error.message
        });
      }

      res.json({
        success: true,
        data: userData
      });
    } catch (error) {
      console.error('Error in getUserById:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get all roles for dropdown
  async getRoles(req: Request, res: Response) {
    try {
      const { data: roles, error } = await supabase
        .from('roles')
        .select('id, name, code, description, permissions, is_system_role, is_active')
        .eq('is_active', true)
        .order('name');

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
      console.error('Error in getRoles:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Terjadi kesalahan server',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

export
 default new UserController();
