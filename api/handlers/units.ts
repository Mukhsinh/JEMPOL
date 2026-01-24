import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

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

    const path = req.url?.replace('/api/units', '') || '/';

    // GET /units - List all units
    if (path === '/' && req.method === 'GET') {
      const { data, error } = await supabase
        .from('units')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        return res.status(500).json({ success: false, error: error.message });
      }

      return res.status(200).json({ success: true, data });
    }

    // POST /units - Create new unit
    if (path === '/' && req.method === 'POST') {
      const { data, error } = await supabase
        .from('units')
        .insert(req.body)
        .select()
        .single();

      if (error) {
        return res.status(500).json({ success: false, error: error.message });
      }

      return res.status(201).json({ success: true, data });
    }

    // PUT /units/:id - Update unit
    if (path.match(/^\/[a-f0-9-]+$/) && req.method === 'PUT') {
      const id = path.substring(1);

      const { data, error } = await supabase
        .from('units')
        .update(req.body)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return res.status(500).json({ success: false, error: error.message });
      }

      return res.status(200).json({ success: true, data });
    }

    // DELETE /units/:id - Delete unit
    if (path.match(/^\/[a-f0-9-]+$/) && req.method === 'DELETE') {
      const id = path.substring(1);

      const { error } = await supabase
        .from('units')
        .delete()
        .eq('id', id);

      if (error) {
        return res.status(500).json({ success: false, error: error.message });
      }

      return res.status(200).json({ success: true, message: 'Unit berhasil dihapus' });
    }

    return res.status(404).json({ success: false, error: 'Endpoint tidak ditemukan' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
