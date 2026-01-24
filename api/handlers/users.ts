import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).json({ success: true });
  }

  try {
    if (!supabase) {
      return res.status(500).json({ success: false, error: 'Database tidak tersedia' });
    }

    const path = req.url?.replace('/api/users', '') || '/';

    // GET /users - List all users
    if (path === '/' && req.method === 'GET') {
      const { data, error } = await supabase
        .from('admins')
        .select('id, username, full_name, email, role, unit_id, is_active, created_at, last_login')
        .order('created_at', { ascending: false });

      if (error) {
        return res.status(500).json({ success: false, error: error.message });
      }

      return res.status(200).json({ success: true, data });
    }

    // POST /users - Create new user
    if (path === '/' && req.method === 'POST') {
      const { username, password, full_name, email, role, unit_id } = req.body;

      if (!username || !password) {
        return res.status(400).json({ success: false, error: 'Username dan password harus diisi' });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const { data, error } = await supabase
        .from('admins')
        .insert({
          username,
          password_hash: passwordHash,
          full_name,
          email,
          role: role || 'user',
          unit_id,
          is_active: true
        })
        .select()
        .single();

      if (error) {
        return res.status(500).json({ success: false, error: error.message });
      }

      return res.status(201).json({ success: true, data });
    }

    // PUT /users/:id - Update user
    if (path.match(/^\/[a-f0-9-]+$/) && req.method === 'PUT') {
      const id = path.substring(1);
      const updates = req.body;

      if (updates.password) {
        updates.password_hash = await bcrypt.hash(updates.password, 10);
        delete updates.password;
      }

      const { data, error } = await supabase
        .from('admins')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return res.status(500).json({ success: false, error: error.message });
      }

      return res.status(200).json({ success: true, data });
    }

    // DELETE /users/:id - Delete user
    if (path.match(/^\/[a-f0-9-]+$/) && req.method === 'DELETE') {
      const id = path.substring(1);

      const { error } = await supabase
        .from('admins')
        .delete()
        .eq('id', id);

      if (error) {
        return res.status(500).json({ success: false, error: error.message });
      }

      return res.status(200).json({ success: true, message: 'User berhasil dihapus' });
    }

    return res.status(404).json({ success: false, error: 'Endpoint tidak ditemukan' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
