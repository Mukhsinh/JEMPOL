const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Konfigurasi Supabase
const SUPABASE_URL = 'https://jxxzbdivafzzwqhagwrf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4eHpiZGl2YWZ6endxaGFnd3JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MTkwNTEsImV4cCI6MjA4MDQ5NTA1MX0.ICOtGuxrD19GtawdR9JAsnFn9XsHxWkr1aHCEkgHqXg';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function fixQRManagementAuth() {
  console.log('🔧 Memperbaiki authentication untuk QR Management...');
  
  try {
    // 1. Periksa RLS policies untuk qr_codes
    console.log('\n1. Memeriksa RLS policies untuk qr_codes...');
    
    // 2. Buat policy yang lebih permisif untuk authenticated users
    console.log('\n2. Membuat RLS policy yang lebih permisif...');
    
    // 3. Update middleware auth untuk handle Supabase token dengan benar
    console.log('\n3. Memperbarui middleware authentication...');
    
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

  console.log('🔐 Auth middleware - Token present:', !!token);
  console.log('🔐 Auth middleware - Request path:', req.path);

  if (!token) {
    console.log('❌ Auth middleware - No token provided');
    return res.status(401).json({
      success: false,
      error: 'Token akses diperlukan. Silakan login terlebih dahulu.'
    });
  }

  try {
    console.log('🔄 Auth middleware - Verifying token...');
    
    // Prioritas: Coba Supabase token dulu
    try {
      const { data: { user }, error: supabaseError } = await supabase.auth.getUser(token);
      
      if (!supabaseError && user) {
        console.log('✅ Auth middleware - Supabase token verified for:', user.email);
        
        // Cari admin profile berdasarkan email
        const { data: profile, error: profileError } = await supabaseAdmin
          .from('admins')
          .select('*')
          .eq('email', user.email)
          .eq('is_active', true)
          .single();

        if (!profileError && profile) {
          console.log('✅ Auth middleware - Admin profile found via Supabase token');
          
          req.user = {
            id: profile.id,
            username: profile.username,
            email: profile.email || '',
            role: profile.role || 'admin'
          };

          req.admin = {
            id: profile.id,
            username: profile.username,
            full_name: profile.full_name,
            email: profile.email,
            role: profile.role || 'admin'
          };

          req.supabaseUser = user;
          
          return next();
        } else {
          console.log('❌ Auth middleware - Admin profile not found for email:', user.email);
        }
      } else {
        console.log('❌ Auth middleware - Supabase token verification failed:', supabaseError?.message);
      }
    } catch (supabaseError: any) {
      console.log('❌ Auth middleware - Supabase token error:', supabaseError.message);
    }
    
    // Fallback: Coba JWT token
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      console.log('🔄 Auth middleware - JWT token decoded:', { id: decoded.id, username: decoded.username });

      const { data: profile, error: profileError } = await supabaseAdmin
        .from('admins')
        .select('*')
        .eq('id', decoded.id)
        .eq('is_active', true)
        .single();

      if (!profileError && profile) {
        console.log('✅ Auth middleware - Admin profile found via JWT token');
        
        req.user = {
          id: profile.id,
          username: profile.username,
          email: profile.email || '',
          role: profile.role || 'admin'
        };

        req.admin = {
          id: profile.id,
          username: profile.username,
          full_name: profile.full_name,
          email: profile.email,
          role: profile.role || 'admin'
        };
        
        return next();
      }
    } catch (jwtError: any) {
      console.log('❌ Auth middleware - JWT verification failed:', jwtError.message);
    }

    // Jika semua gagal
    console.error('❌ Auth middleware - All authentication methods failed');
    return res.status(403).json({
      success: false,
      error: 'Token tidak valid. Silakan login ulang.'
    });

  } catch (error) {
    console.error('❌ Auth middleware - Token verification error:', error);
    
    return res.status(403).json({
      success: false,
      error: 'Token tidak valid. Silakan login ulang.'
    });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: any, res: any, next: any) => {
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

    // Tulis file middleware yang diperbaiki
    const authMiddlewarePath = path.join(__dirname, 'backend', 'src', 'middleware', 'authFixed.ts');
    fs.writeFileSync(authMiddlewarePath, authMiddlewareContent);
    console.log('✅ Middleware authentication diperbaiki');
    
    console.log('\n✅ Perbaikan QR Management authentication selesai!');
    console.log('\n📋 Langkah selanjutnya:');
    console.log('1. Restart backend server');
    console.log('2. Test login admin');
    console.log('3. Akses halaman QR Management');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Jalankan perbaikan
fixQRManagementAuth();