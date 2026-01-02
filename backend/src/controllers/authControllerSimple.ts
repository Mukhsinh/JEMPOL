import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * Simple admin login using bcrypt and JWT
 * POST /api/auth/login
 */
export const login = async (req: Request, res: Response) => {
  try {
    console.log('Login attempt:', { email: req.body.email, hasPassword: !!req.body.password });
    
    const { email, password, username } = req.body;
    const loginField = email || username;

    if (!loginField || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email/username dan password harus diisi',
      });
    }

    // Get admin from database
    let query = supabase
      .from('admins')
      .select('*')
      .eq('is_active', true);

    // Check if login field is email or username
    if (loginField.includes('@')) {
      query = query.eq('email', loginField);
    } else {
      query = query.eq('username', loginField);
    }

    const { data: adminData, error } = await query.single();

    if (error || !adminData) {
      console.log('Admin not found:', error);
      return res.status(401).json({
        success: false,
        error: 'Email/username atau password salah',
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, adminData.password_hash);
    
    if (!isValidPassword) {
      console.log('Invalid password for:', loginField);
      return res.status(401).json({
        success: false,
        error: 'Email/username atau password salah',
      });
    }

    // Update last login
    await supabase
      .from('admins')
      .update({ last_login: new Date().toISOString() })
      .eq('id', adminData.id);

    // Generate JWT token
    const token = jwt.sign(
      {
        id: adminData.id,
        username: adminData.username,
        email: adminData.email,
        role: adminData.role,
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('Login successful for:', loginField);

    res.json({
      success: true,
      token,
      user: {
        id: adminData.id,
        username: adminData.username,
        full_name: adminData.full_name,
        email: adminData.email,
        role: adminData.role,
      },
      message: 'Login berhasil',
    });
  } catch (error: any) {
    console.error('Error in login:', error);
    res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan saat login',
      details: error.message
    });
  }
};

/**
 * Verify JWT token
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

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    // Get fresh admin data
    const { data: adminData, error } = await supabase
      .from('admins')
      .select('*')
      .eq('id', decoded.id)
      .eq('is_active', true)
      .single();

    if (error || !adminData) {
      return res.status(401).json({
        success: false,
        error: 'Admin tidak ditemukan atau tidak aktif',
      });
    }

    res.json({
      success: true,
      user: {
        id: adminData.id,
        username: adminData.username,
        full_name: adminData.full_name,
        email: adminData.email,
        role: adminData.role,
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
 * Logout (simple - just invalidate on client side)
 * POST /api/auth/logout
 */
export const logout = async (req: Request, res: Response) => {
  try {
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