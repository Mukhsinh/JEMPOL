import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).json({ success: true });
  }

  try {
    if (!supabase) {
      return res.status(500).json({ success: false, error: 'Database tidak tersedia' });
    }

    const path = req.url?.replace('/api/ticket-actions', '') || '/';

    // POST /ticket-actions/respond - Add response to ticket
    if (path === '/respond' && req.method === 'POST') {
      const { ticket_id, response_text, response_type, created_by } = req.body;

      const { data, error } = await supabase
        .from('ticket_responses')
        .insert({
          ticket_id,
          response_text,
          response_type: response_type || 'response',
          created_by
        })
        .select()
        .single();

      if (error) {
        return res.status(500).json({ success: false, error: error.message });
      }

      return res.status(201).json({ success: true, data });
    }

    // POST /ticket-actions/escalate - Escalate ticket
    if (path === '/escalate' && req.method === 'POST') {
      const { ticket_id, escalated_to, reason } = req.body;

      const { data, error } = await supabase
        .from('ticket_escalations')
        .insert({
          ticket_id,
          escalated_to,
          reason,
          status: 'pending'
        })
        .select()
        .single();

      if (error) {
        return res.status(500).json({ success: false, error: error.message });
      }

      // Update ticket status
      await supabase
        .from('tickets')
        .update({ status: 'escalated' })
        .eq('id', ticket_id);

      return res.status(201).json({ success: true, data });
    }

    return res.status(404).json({ success: false, error: 'Endpoint tidak ditemukan' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
