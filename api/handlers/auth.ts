import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.VITE_SUPABASE_ANON_KEY || ''
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const path = req.url?.replace('/api/auth', '') || '/';
  
  try {
    // POST /api/auth/login
    if (req.method === 'POST' && path === '/login') {
      const { email, password } = req.body;

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return res.status(401).json({
          success: false,
          error: 'Email atau password salah'
        });
      }

      const { data: userData } = await supabase
        .from('users')
        .select('*, units(name, code), roles(name, permissions)')
        .eq('email', email)
        .single();

      return res.json({
        success: true,
        user: data.user,
        session: data.session,
        userData: userData || null
      });
    }

    // GET /api/auth/me
    if (req.method === 'GET' && path === '/me') {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const token = authHeader.substring(7);
      const { data: { user }, error } = await supabase.auth.getUser(token);

      if (error || !user) {
        return res.status(401).json({ success: false, error: 'Invalid token' });
      }

      const { data: userData } = await supabase
        .from('users')
        .select('*, units(name, code), roles(name, permissions)')
        .eq('id', user.id)
        .single();

      return res.json({
        success: true,
        user,
        userData: userData || null
      });
    }

    return res.status(404).json({ error: 'Endpoint not found' });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}
