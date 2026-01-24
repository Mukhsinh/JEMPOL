import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.VITE_SUPABASE_ANON_KEY || ''
);

const setCorsHeaders = (res: VercelResponse) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
};

export default async function handler(request: VercelRequest, response: VercelResponse) {
  setCorsHeaders(response);
  if (request.method === 'OPTIONS') return response.status(200).end();

  try {
    const url = new URL(request.url || '', `https://${request.headers.host}`);
    const pathParts = url.pathname.split('/').filter(Boolean);
    const action = pathParts[2]; // auth/<action>

    // POST /api/auth/login
    if (request.method === 'POST' && action === 'login') {
      const { email, password } = request.body;

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return response.status(401).json({
          success: false,
          error: 'Email atau password salah'
        });
      }

      // Get user details from users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select(`
          *,
          units(name, code),
          roles(name, permissions)
        `)
        .eq('email', email)
        .single();

      if (userError) {
        console.error('Error fetching user data:', userError);
      }

      return response.json({
        success: true,
        user: data.user,
        session: data.session,
        userData: userData || null
      });
    }

    // POST /api/auth/register
    if (request.method === 'POST' && action === 'register') {
      const { email, password, full_name, unit_id, role_id } = request.body;

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password
      });

      if (authError) {
        return response.status(400).json({
          success: false,
          error: authError.message
        });
      }

      // Create user record
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert([{
          id: authData.user?.id,
          email,
          full_name,
          unit_id,
          role_id,
          is_active: true,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (userError) {
        return response.status(400).json({
          success: false,
          error: userError.message
        });
      }

      return response.status(201).json({
        success: true,
        user: authData.user,
        userData
      });
    }

    // POST /api/auth/logout
    if (request.method === 'POST' && action === 'logout') {
      const { error } = await supabase.auth.signOut();

      if (error) {
        return response.status(400).json({
          success: false,
          error: error.message
        });
      }

      return response.json({
        success: true,
        message: 'Logged out successfully'
      });
    }

    // GET /api/auth/me
    if (request.method === 'GET' && action === 'me') {
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return response.status(401).json({
          success: false,
          error: 'Unauthorized'
        });
      }

      const token = authHeader.substring(7);
      const { data: { user }, error } = await supabase.auth.getUser(token);

      if (error || !user) {
        return response.status(401).json({
          success: false,
          error: 'Invalid token'
        });
      }

      // Get user details
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select(`
          *,
          units(name, code),
          roles(name, permissions)
        `)
        .eq('id', user.id)
        .single();

      return response.json({
        success: true,
        user,
        userData: userData || null
      });
    }

    return response.status(404).json({ error: 'Endpoint not found' });

  } catch (error: any) {
    console.error('Auth API error:', error);
    return response.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}
