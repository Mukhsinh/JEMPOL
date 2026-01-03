import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Missing required Supabase environment variables: SUPABASE_URL and SUPABASE_ANON_KEY');
}

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

/**
 * Supabase Authentication Middleware
 * 
 * This middleware verifies Supabase access tokens and fetches the admin profile.
 * It uses a user-scoped Supabase client to respect RLS policies.
 * 
 * Flow:
 * 1. Extract Bearer token from Authorization header
 * 2. Verify token with Supabase Auth (supabase.auth.getUser)
 * 3. Create user-scoped client with the token
 * 4. Query admins table (respects RLS - user can read own profile)
 * 5. Inject req.user and req.admin for downstream use
 * 
 * Returns:
 * - 401: No token provided
 * - 403: Invalid token or admin profile not found/inactive
 * - Calls next() on success
 */
export const authenticateSupabase = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    console.log('🔐 [Auth] Token present:', !!token, '| Path:', req.path, '| Method:', req.method);

    // No token provided
    if (!token) {
        console.log('❌ [Auth] No token provided');
        return res.status(401).json({
            success: false,
            error: 'Token akses diperlukan. Silakan login terlebih dahulu.',
            code: 'ERR_NO_TOKEN'
        });
    }

    try {
        // Step 1: Verify token with Supabase Auth
        console.log('🔄 [Auth] Verifying Supabase token...');

        // Create anon client for token verification
        const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            auth: {
                persistSession: false,
                autoRefreshToken: false
            }
        });

        const { data: { user }, error: supabaseError } = await supabase.auth.getUser(token);

        if (supabaseError || !user) {
            console.error('❌ [Auth] Supabase token verification failed:', supabaseError?.message);
            return res.status(403).json({
                success: false,
                error: 'Token tidak valid. Silakan login ulang.',
                code: 'ERR_INVALID_TOKEN'
            });
        }

        console.log('✅ [Auth] Token verified for user:', user.email);

        // Step 2: Create user-scoped client to query admins table
        // This client uses the user's token, so RLS policies apply
        const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            global: {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            },
            auth: {
                persistSession: false,
                autoRefreshToken: false
            }
        });

        // Step 3: Query admins table (RLS policy allows users to read their own profile)
        console.log('🔍 [Auth] Fetching admin profile for:', user.email);

        const { data: profile, error: profileError } = await userClient
            .from('admins')
            .select('id, username, full_name, email, role, is_active')
            .eq('email', user.email)
            .eq('is_active', true)
            .single();

        if (profileError || !profile) {
            console.error('❌ [Auth] Admin profile not found or inactive:', profileError?.message);
            return res.status(403).json({
                success: false,
                error: 'Admin tidak ditemukan atau tidak aktif. Hubungi administrator.',
                code: 'ERR_ADMIN_NOT_FOUND'
            });
        }

        console.log('✅ [Auth] Admin authenticated:', profile.username, '| Role:', profile.role);

        // Step 4: Inject user data into request
        req.user = {
            id: profile.id,
            username: profile.username,
            email: profile.email || '',
            role: profile.role || 'admin'
        };

        req.admin = {
            id: profile.id,
            username: profile.username,
            full_name: profile.full_name || profile.username,
            email: profile.email,
            role: profile.role || 'admin'
        };

        req.supabaseUser = user;

        // Success - continue to route handler
        next();

    } catch (error: any) {
        console.error('❌ [Auth] Unexpected error:', error.message);
        return res.status(500).json({
            success: false,
            error: 'Terjadi kesalahan saat verifikasi token. Silakan coba lagi.',
            code: 'ERR_SERVER_ERROR'
        });
    }
};

/**
 * Optional Supabase Authentication Middleware
 * 
 * Similar to authenticateSupabase but allows requests without tokens.
 * If token is provided and valid, populates req.user and req.admin.
 * If token is missing or invalid, continues without authentication.
 * 
 * Use cases:
 * - Public endpoints that behave differently for authenticated users
 * - Analytics endpoints that track both anonymous and authenticated usage
 */
export const optionalSupabaseAuth = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    console.log('🔓 [OptionalAuth] Token present:', !!token, '| Path:', req.path);

    // No token - continue without authentication
    if (!token) {
        console.log('🔓 [OptionalAuth] No token, continuing without auth');
        return next();
    }

    try {
        // Create anon client for token verification
        const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            auth: {
                persistSession: false,
                autoRefreshToken: false
            }
        });

        const { data: { user }, error: supabaseError } = await supabase.auth.getUser(token);

        if (supabaseError || !user) {
            console.log('🔓 [OptionalAuth] Token invalid, continuing without auth');
            return next();
        }

        // Create user-scoped client
        const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            global: {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            },
            auth: {
                persistSession: false,
                autoRefreshToken: false
            }
        });

        // Query admins table
        const { data: profile, error: profileError } = await userClient
            .from('admins')
            .select('id, username, full_name, email, role, is_active')
            .eq('email', user.email)
            .eq('is_active', true)
            .single();

        if (!profileError && profile) {
            console.log('✅ [OptionalAuth] Admin authenticated:', profile.username);

            req.user = {
                id: profile.id,
                username: profile.username,
                email: profile.email || '',
                role: profile.role || 'admin'
            };

            req.admin = {
                id: profile.id,
                username: profile.username,
                full_name: profile.full_name || profile.username,
                email: profile.email,
                role: profile.role || 'admin'
            };

            req.supabaseUser = user;
        } else {
            console.log('🔓 [OptionalAuth] Profile not found, continuing without auth');
        }

        next();

    } catch (error: any) {
        console.log('🔓 [OptionalAuth] Error during auth, continuing without auth:', error.message);
        next();
    }
};

/**
 * Role-based Authorization Middleware
 * 
 * Use after authenticateSupabase to restrict access to specific roles.
 * 
 * @param roles - Array of allowed roles (e.g., ['admin', 'superadmin'])
 * 
 * Example:
 *   router.delete('/users/:id', authenticateSupabase, requireRole(['superadmin']), deleteUser);
 */
export const requireRole = (roles: string[]) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Autentikasi diperlukan untuk mengakses resource ini.',
                code: 'ERR_NO_AUTH'
            });
        }

        if (!roles.includes(req.user.role)) {
            console.warn('⚠️ [Auth] Access denied for role:', req.user.role, '| Required:', roles);
            return res.status(403).json({
                success: false,
                error: 'Akses ditolak. Anda tidak memiliki izin untuk mengakses resource ini.',
                code: 'ERR_INSUFFICIENT_PERMISSIONS'
            });
        }

        next();
    };
};

// Backward compatibility exports
export const authenticateToken = authenticateSupabase;
export const authenticateAdmin = authenticateSupabase;

export default {
    authenticateSupabase,
    optionalSupabaseAuth,
    requireRole,
    authenticateToken,
    authenticateAdmin
};
