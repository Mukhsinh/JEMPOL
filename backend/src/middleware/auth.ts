import { Request, Response, NextFunction } from 'express';
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
  console.log('Auth middleware - Request method:', req.method);

  if (!token) {
    console.log('Auth middleware - No token provided');
    return res.status(401).json({
      success: false,
      error: 'Token akses diperlukan. Silakan login terlebih dahulu.',
      code: 'ERR_NO_TOKEN'
    });
  }

  try {
    console.log('Auth middleware - Verifying token...');

    let adminProfile = null;
    let isSupabaseToken = false;
    let supabaseUser = null;

    // Try Supabase token first
    try {
      const { data: { user }, error: supabaseError } = await supabase.auth.getUser(token);

      if (!supabaseError && user) {
        console.log('Auth middleware - Supabase token verified for:', user.email);
        isSupabaseToken = true;
        supabaseUser = user;

        // Create a user-scoped client to query as the authenticated user
        // This is necessary because SUPABASE_SERVICE_ROLE_KEY might be invalid/same as anon key
        // and we need to respect RLS policies that allow users to read their own profile
        const { createClient } = await import('@supabase/supabase-js');
        const userClient = createClient(
          process.env.SUPABASE_URL || '',
          process.env.SUPABASE_ANON_KEY || '',
          {
            global: {
              headers: {
                Authorization: `Bearer ${token}`
              }
            },
            auth: {
              persistSession: false,
              autoRefreshToken: false
            }
          }
        );

        const { data: profile, error: profileError } = await userClient
          .from('admins')
          .select('*')
          .eq('email', user.email)
          .eq('is_active', true)
          .single();

        if (!profileError && profile) {
          adminProfile = profile;
          console.log('Auth middleware - Admin profile found via Supabase token (user-scoped)');
        } else {
          console.log('Auth middleware - Admin profile not found for email:', user.email);
          console.log('Auth middleware - Profile error:', profileError);

          // Fallback: Try supabaseAdmin just in case it works (e.g. if key was fixed)
          if (profileError) {
            const { data: adminProfileRetry, error: adminError } = await supabaseAdmin
              .from('admins')
              .select('*')
              .eq('email', user.email)
              .eq('is_active', true)
              .single();

            if (!adminError && adminProfileRetry) {
              adminProfile = adminProfileRetry;
              console.log('Auth middleware - Admin profile found via supabaseAdmin fallback');
            }
          }
        }
      } else {
        console.log('Auth middleware - Supabase token verification failed:', supabaseError?.message);
      }
    } catch (supabaseError: any) {
      console.log('Auth middleware - Supabase token error:', supabaseError.message);
    }

    // Try JWT token if Supabase failed
    if (!isSupabaseToken) {
      try {
        const decoded: any = jwt.verify(token, JWT_SECRET);
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
        } else {
          console.log('Auth middleware - JWT profile error:', profileError);
        }
      } catch (jwtError: any) {
        console.log('Auth middleware - JWT verification failed:', jwtError.message);
      }
    }

    if (!adminProfile) {
      console.error('Auth middleware - Admin profile not found for token');
      return res.status(403).json({
        success: false,
        error: 'Token tidak valid. Silakan login ulang.',
        code: 'ERR_BAD_REQUEST'
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
  } catch (error: any) {
    console.error('Auth middleware - Token verification error:', error);

    return res.status(403).json({
      success: false,
      error: 'Token tidak valid. Silakan login ulang.',
      code: 'ERR_BAD_REQUEST'
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

export const authenticateAdmin = authenticateToken;

// Optional authentication middleware - allows requests with or without token
export const optionalAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log('Optional auth middleware - Token present:', !!token);
  console.log('Optional auth middleware - Request path:', req.path);

  if (!token) {
    console.log('Optional auth middleware - No token provided, continuing without auth');
    return next();
  }

  try {
    console.log('Optional auth middleware - Verifying token...');

    let adminProfile = null;
    let isSupabaseToken = false;
    let supabaseUser = null;

    try {
      const { data: { user }, error: supabaseError } = await supabase.auth.getUser(token);

      if (!supabaseError && user) {
        console.log('Optional auth middleware - Supabase token verified for:', user.email);
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
          console.log('Optional auth middleware - Admin profile found via Supabase token');
        }
      }
    } catch (supabaseError: any) {
      console.log('Optional auth middleware - Supabase token error:', supabaseError.message);
    }

    if (!isSupabaseToken) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        console.log('Optional auth middleware - JWT token decoded:', { id: decoded.id, username: decoded.username });

        const { data: profile, error: profileError } = await supabaseAdmin
          .from('admins')
          .select('*')
          .eq('id', decoded.id)
          .eq('is_active', true)
          .single();

        if (!profileError && profile) {
          adminProfile = profile;
          console.log('Optional auth middleware - Admin profile found via JWT token');
        }
      } catch (jwtError: any) {
        console.log('Optional auth middleware - JWT verification failed:', jwtError.message);
      }
    }

    if (adminProfile) {
      console.log('Optional auth middleware - Admin authenticated:', adminProfile.username, 'Role:', adminProfile.role);

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
    } else {
      console.log('Optional auth middleware - Token invalid but continuing without auth');
    }

    next();
  } catch (error) {
    console.error('Optional auth middleware - Token verification error:', error);
    // Continue without authentication for optional auth
    next();
  }
};
