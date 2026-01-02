import { Request, Response } from 'express';
import supabase from '../config/supabase.js';

/**
 * Admin login with Supabase Auth
 * POST /api/auth/login
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email dan password harus diisi',
      });
    }

    // Sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Login error:', error);
      return res.status(401).json({
        success: false,
        error: 'Email atau password salah',
      });
    }

    if (!data.user || !data.session) {
      return res.status(401).json({
        success: false,
        error: 'Login gagal',
      });
    }

    // Get admin profile from admins table
    const { data: adminProfile, error: profileError } = await supabase
      .from('admins')
      .select('*')
      .eq('email', email)
      .eq('is_active', true)
      .single();

    if (profileError || !adminProfile) {
      console.error('Profile error:', profileError);
      return res.status(401).json({
        success: false,
        error: 'Admin tidak ditemukan atau tidak aktif',
      });
    }

    // Update last login
    await supabase
      .from('admins')
      .update({ last_login: new Date().toISOString() })
      .eq('id', adminProfile.id);

    res.json({
      success: true,
      data: {
        session: data.session,
        user: data.user,
        admin: {
          id: adminProfile.id,
          username: adminProfile.username,
          full_name: adminProfile.full_name,
          email: adminProfile.email,
          role: adminProfile.role || 'admin',
        },
      },
      message: 'Login berhasil',
    });
  } catch (error: any) {
    console.error('Error in login:', error);
    res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan saat login',
    });
  }
};

/**
 * Verify token with Supabase Auth
 * GET /api/auth/verify
 */
export const verifyToken = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Token tidak ditemukan',
      });
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: 'Token tidak valid',
      });
    }

    // Get admin profile
    const { data: adminProfile, error: profileError } = await supabase
      .from('admins')
      .select('*')
      .eq('email', user.email)
      .eq('is_active', true)
      .single();

    if (profileError || !adminProfile) {
      return res.status(401).json({
        success: false,
        error: 'Admin tidak ditemukan',
      });
    }

    res.json({
      success: true,
      data: {
        user,
        admin: {
          id: adminProfile.id,
          username: adminProfile.username,
          full_name: adminProfile.full_name,
          email: adminProfile.email,
          role: adminProfile.role || 'admin',
        },
      },
    });
  } catch (error: any) {
    console.error('Error verifying token:', error);
    res.status(401).json({
      success: false,
      error: 'Token tidak valid',
    });
  }
};

/**
 * Logout with Supabase Auth
 * POST /api/auth/logout
 */
export const logout = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      
      // Sign out from Supabase
      await supabase.auth.signOut();
    }

    res.json({
      success: true,
      message: 'Logout berhasil',
    });
  } catch (error: any) {
    console.error('Error in logout:', error);
    res.json({
      success: true,
      message: 'Logout berhasil',
    });
  }
};
