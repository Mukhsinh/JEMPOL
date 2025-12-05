import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { verifyAdmin } from '../models/Admin.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '24h';

// Hardcoded admin for development (fallback if database not set up)
const FALLBACK_ADMIN = {
  id: 'dev-admin-001',
  username: 'admin',
  password: 'admin123', // Plain text for fallback only
};

/**
 * Admin login
 * POST /api/auth/login
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username dan password harus diisi',
      });
    }

    // Try database first
    let admin = await verifyAdmin(username, password);

    // Fallback to hardcoded admin if database not available
    if (!admin && username === FALLBACK_ADMIN.username && password === FALLBACK_ADMIN.password) {
      console.log('⚠️  Using fallback admin (database not configured)');
      admin = {
        id: FALLBACK_ADMIN.id,
        username: FALLBACK_ADMIN.username,
        password_hash: '',
        created_at: new Date().toISOString(),
      };
    }

    if (!admin) {
      return res.status(401).json({
        success: false,
        error: 'Username atau password salah',
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: admin.id, 
        username: admin.username,
        role: admin.role || 'admin'
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      success: true,
      data: {
        token,
        admin: {
          id: admin.id,
          username: admin.username,
          full_name: admin.full_name,
          email: admin.email,
          role: admin.role || 'admin',
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
 * Verify token
 * GET /api/auth/verify
 */
export const verifyToken = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Token tidak ditemukan',
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;

    res.json({
      success: true,
      data: {
        admin: {
          id: decoded.id,
          username: decoded.username,
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
 * Logout (client-side only, just for consistency)
 * POST /api/auth/logout
 */
export const logout = async (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Logout berhasil',
  });
};
