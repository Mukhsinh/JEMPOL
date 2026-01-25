import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).json({ success: true });
  }

  try {
    const path = req.url?.replace('/api/auth', '') || '/';
    
    // Login endpoint
    if (path === '/login' && req.method === 'POST') {
      if (!supabase) {
        return res.status(500).json({
          success: false,
          error: 'Database tidak tersedia'
        });
      }

      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({
          success: false,
          error: 'Username dan password harus diisi'
        });
      }

      // Cari admin berdasarkan username
      const { data: admin, error: adminError } = await supabase
        .from('admins')
        .select('*')
        .eq('username', username)
        .eq('is_active', true)
        .single();

      if (adminError || !admin) {
        return res.status(401).json({
          success: false,
          error: 'Username atau password salah'
        });
      }

      // Verifikasi password
      const isPasswordValid = await bcrypt.compare(password, admin.password_hash);

      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          error: 'Username atau password salah'
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          id: admin.id,
          username: admin.username,
          role: admin.role,
          unit_id: admin.unit_id
        },
        jwtSecret,
        { expiresIn: '24h' }
      );

      // Update last login
      await supabase
        .from('admins')
        .update({ last_login: new Date().toISOString() })
        .eq('id', admin.id);

      return res.status(200).json({
        success: true,
        token,
        user: {
          id: admin.id,
          username: admin.username,
          full_name: admin.full_name,
          email: admin.email,
          role: admin.role,
          unit_id: admin.unit_id
        }
      });
    }

    // Verify token endpoint
    if (path === '/verify' && req.method === 'GET') {
      const authHeader = req.headers.authorization;
      const token = authHeader?.replace('Bearer ', '');

      if (!token) {
        return res.status(401).json({
          success: false,
          error: 'Token tidak ditemukan'
        });
      }

      try {
        const decoded = jwt.verify(token, jwtSecret) as any;
        
        if (!supabase) {
          return res.status(500).json({
            success: false,
            error: 'Database tidak tersedia'
          });
        }

        // Ambil data admin terbaru
        const { data: admin, error } = await supabase
          .from('admins')
          .select('id, username, full_name, email, role, unit_id, is_active')
          .eq('id', decoded.id)
          .eq('is_active', true)
          .single();

        if (error || !admin) {
          return res.status(401).json({
            success: false,
            error: 'Token tidak valid'
          });
        }

        return res.status(200).json({
          success: true,
          user: admin
        });
      } catch (error) {
        return res.status(401).json({
          success: false,
          error: 'Token tidak valid atau sudah kadaluarsa'
        });
      }
    }

    // Logout endpoint
    if (path === '/logout' && req.method === 'POST') {
      return res.status(200).json({
        success: true,
        message: 'Logout berhasil'
      });
    }

    return res.status(404).json({
      success: false,
      error: 'Endpoint tidak ditemukan'
    });

  } catch (error: any) {
    console.error('Error in auth handler:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}
