import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
  admin?: {
    id: string;
    username: string;
    full_name: string;
    email: string;
    role: string;
  };
}

export const authenticateJWT = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  console.log('JWT Auth middleware - Token present:', !!token);

  if (!token) {
    console.log('JWT Auth middleware - No token provided');
    return res.status(401).json({
      success: false,
      error: 'Token akses diperlukan. Silakan login terlebih dahulu.'
    });
  }

  try {
    console.log('JWT Auth middleware - Verifying JWT token...');
    
    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    console.log('JWT Auth middleware - Token decoded:', { id: decoded.id, username: decoded.username });

    // Get fresh admin data from database
    const { data: adminData, error } = await supabase
      .from('admins')
      .select('*')
      .eq('id', decoded.id)
      .eq('is_active', true)
      .single();

    if (error || !adminData) {
      console.error('JWT Auth middleware - Admin not found:', error);
      return res.status(403).json({
        success: false,
        error: 'Admin tidak ditemukan atau tidak aktif. Hubungi administrator.'
      });
    }

    console.log('JWT Auth middleware - Admin authenticated:', adminData.username);

    req.user = {
      id: adminData.id,
      username: adminData.username,
      email: adminData.email || '',
      role: adminData.role || 'admin'
    };

    req.admin = {
      id: adminData.id,
      username: adminData.username,
      full_name: adminData.full_name,
      email: adminData.email,
      role: adminData.role || 'admin'
    };

    next();
  } catch (error: any) {
    console.error('JWT Auth middleware - Exception:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({
        success: false,
        error: 'Token tidak valid. Silakan login ulang.'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({
        success: false,
        error: 'Token sudah kedaluwarsa. Silakan login ulang.'
      });
    }
    return res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan saat verifikasi token. Silakan coba lagi.'
    });
  }
};

export const requireJWTRole = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Autentikasi diperlukan'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Akses ditolak: peran tidak memadai'
      });
    }

    next();
  };
};