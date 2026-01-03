const fs = require('fs');
const path = require('path');

console.log('🔧 Memperbaiki masalah auth 403 pada patient-types endpoint...\n');

// Update auth middleware
const authMiddlewareContent = `import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import supabase, { supabaseAdmin } from '../config/supabase.js';

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
  supabaseUser?: any;
}

export const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log('Auth middleware - Token present:', !!token);
  console.log('Auth middleware - Request path:', req.path);

  if (!token) {
    console.log('Auth middleware - No token provided');
    return res.status(401).json({
      success: false,
      error: 'Token akses diperlukan. Silakan login terlebih dahulu.'
    });
  }

  try {
    console.log('Auth middleware - Verifying token...');
    
    let adminProfile = null;
    let isSupabaseToken = false;
    let supabaseUser = null;
    
    try {
      const { data: { user }, error: supabaseError } = await supabase.auth.getUser(token);
      
      if (!supabaseError && user) {
        console.log('Auth middleware - Supabase token verified for:', user.email);
        isSupabaseToken = true;
        supabaseUser = user;
        
        const { data: profile, error: profileError } = await supabaseAdmin
          .from('admins')
          .select('*')
          .eq('email', user.email)
          .eq('is_active', true)
          .single();

        if (!profileError && profile) {
          adminProfile = profile;
          console.log('Auth middleware - Admin profile found via Supabase token');
        } else {
          console.log('Auth middleware - Admin profile not found for email:', user.email);
        }
      } else {
        console.log('Auth middleware - Supabase token verification failed:', supabaseError?.message);
      }
    } catch (supabaseError) {
      console.log('Auth middleware - Supabase token error:', supabaseError.message);
    }
    
    if (!isSupabaseToken) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log('Auth middleware - JWT token decoded:', { id: decoded.id, username: decoded.username });

        const { data: profile, error: profileError } = await supabaseAdmin
          .from('admins')
          .select('*')
          .eq('id', decoded.id)
          .eq('is_active', true)
          .single();

        if (!profileError && profile) {
          adminProfile = profile;
          console.log('Auth middleware - Admin profile found via JWT token');
        }
      } catch (jwtError) {
        console.log('Auth middleware - JWT verification failed:', jwtError.message);
      }
    }

    if (!adminProfile) {
      console.error('Auth middleware - Admin profile not found for token');
      return res.status(403).json({
        success: false,
        error: 'Token tidak valid. Silakan login ulang.'
      });
    }

    console.log('Auth middleware - Admin authenticated:', adminProfile.username, 'Role:', adminProfile.role);

    req.user = {
      id: adminProfile.id,
      username: adminProfile.username,
      email: adminProfile.email || '',
      role: adminProfile.role || 'admin'
    };

    req.admin = {
      id: adminProfile.id,
      username: adminProfile.username,
      full_name: adminProfile.full_name,
      email: adminProfile.email,
      role: adminProfile.role || 'admin'
    };

    if (isSupabaseToken && supabaseUser) {
      req.supabaseUser = supabaseUser;
    }

    next();
  } catch (error) {
    console.error('Auth middleware - Token verification error:', error);
    
    return res.status(403).json({
      success: false,
      error: 'Token tidak valid. Silakan login ulang.'
    });
  }
};

export const requireRole = (roles) => {
  return (req, res, next) => {
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

export const authenticateAdmin = authenticateToken;
`;

// Write the auth middleware file
try {
  fs.writeFileSync(
    path.join('backend', 'src', 'middleware', 'auth.ts'),
    authMiddlewareContent
  );
  console.log('✅ Updated auth middleware');
  
  console.log('\n🎉 Perbaikan auth middleware selesai!');
  console.log('\n📋 Yang telah diperbaiki:');
  console.log('   ✅ Auth middleware menggunakan supabaseAdmin untuk bypass RLS');
  console.log('   ✅ Better error handling dan logging');
  console.log('   ✅ Support untuk Supabase dan JWT tokens');

  console.log('\n🔧 Langkah selanjutnya:');
  console.log('   1. Restart backend server');
  console.log('   2. Test endpoint patient-types');

} catch (error) {
  console.error('❌ Error writing files:', error);
  process.exit(1);
}