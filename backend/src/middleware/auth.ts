import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase.js';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
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

export const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  console.log('Auth middleware - Token present:', !!token);

  if (!token) {
    console.log('Auth middleware - No token provided');
    return res.status(401).json({
      success: false,
      error: 'Token akses diperlukan. Silakan login terlebih dahulu.'
    });
  }

  try {
    console.log('Auth middleware - Verifying token with Supabase...');
    
    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error) {
      console.error('Auth middleware - Supabase auth error:', error);
      return res.status(403).json({
        success: false,
        error: 'Token tidak valid atau sudah kedaluwarsa. Silakan login ulang.'
      });
    }

    if (!user) {
      console.log('Auth middleware - No user found for token');
      return res.status(403).json({
        success: false,
        error: 'Token tidak valid. Silakan login ulang.'
      });
    }

    console.log('Auth middleware - User found:', user.email);

    // Get admin profile
    const { data: adminProfile, error: profileError } = await supabase
      .from('admins')
      .select('*')
      .eq('email', user.email)
      .eq('is_active', true)
      .single();

    if (profileError) {
      console.error('Auth middleware - Admin profile error:', profileError);
      return res.status(403).json({
        success: false,
        error: 'Profil admin tidak ditemukan. Hubungi administrator.'
      });
    }

    if (!adminProfile) {
      console.log('Auth middleware - Admin profile not found or inactive');
      return res.status(403).json({
        success: false,
        error: 'Admin tidak ditemukan atau tidak aktif. Hubungi administrator.'
      });
    }

    console.log('Auth middleware - Admin authenticated:', adminProfile.username);

    req.user = {
      id: user.id,
      email: user.email || '',
      role: adminProfile.role || 'admin'
    };

    req.admin = {
      id: adminProfile.id,
      username: adminProfile.username,
      full_name: adminProfile.full_name,
      email: adminProfile.email,
      role: adminProfile.role || 'admin'
    };

    next();
  } catch (error: any) {
    console.error('Auth middleware - Exception:', error);
    return res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan saat verifikasi token. Silakan coba lagi.'
    });
  }
};

export const requireRole = (roles: string[]) => {
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

// Alias for backward compatibility
export const authenticateAdmin = authenticateToken;