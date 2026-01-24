import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).json({ success: true });
  }

  try {
    if (!supabase) {
      return res.status(500).json({ success: false, error: 'Database tidak tersedia' });
    }

    const path = req.url?.replace('/api/reports', '') || '/';

    // GET /reports/tickets - Ticket reports
    if (path === '/tickets' && req.method === 'GET') {
      const { start_date, end_date, unit_id } = req.query;
      
      let query = supabase.from('tickets').select('*');
      if (start_date) query = query.gte('created_at', start_date);
      if (end_date) query = query.lte('created_at', end_date);
      if (unit_id) query = query.eq('unit_id', unit_id);

      const { data, error } = await query;

      if (error) {
        return res.status(500).json({ success: false, error: error.message });
      }

      return res.status(200).json({ success: true, data });
    }

    return res.status(404).json({ success: false, error: 'Endpoint tidak ditemukan' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
