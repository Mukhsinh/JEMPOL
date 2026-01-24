import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.VITE_SUPABASE_ANON_KEY || ''
);

async function verifyToken(req: VercelRequest): Promise<any> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  
  const token = authHeader.substring(7);
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    return error || !user ? null : user;
  } catch (error) {
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = await verifyToken(req);
  if (!user) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  const path = req.url?.replace('/api/complaints', '') || '/';
  const ticketId = path.split('/')[1];

  try {
    // GET /api/complaints - List tickets
    if (req.method === 'GET' && path === '/') {
      const { data: tickets, error } = await supabase
        .from('tickets')
        .select(`
          *,
          units(name, code),
          service_categories(name),
          patient_types(name),
          ticket_statuses(name, color),
          ticket_types(name),
          ticket_classifications(name),
          assigned_to_user:users!tickets_assigned_to_fkey(full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return res.json(tickets || []);
    }

    // POST /api/complaints - Create ticket
    if (req.method === 'POST') {
      const ticketData = req.body;
      const { data: ticket, error } = await supabase
        .from('tickets')
        .insert([{
          ...ticketData,
          created_by: user.id,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return res.status(201).json(ticket);
    }

    // GET /api/complaints/:id
    if (req.method === 'GET' && ticketId) {
      const { data: ticket, error } = await supabase
        .from('tickets')
        .select(`
          *,
          units(name, code),
          service_categories(name),
          patient_types(name),
          ticket_statuses(name, color),
          ticket_types(name),
          ticket_classifications(name),
          assigned_to_user:users!tickets_assigned_to_fkey(full_name, email)
        `)
        .eq('id', ticketId)
        .single();

      if (error) throw error;
      return res.json(ticket);
    }

    // PUT /api/complaints/:id
    if (req.method === 'PUT' && ticketId) {
      const updateData = req.body;
      const { data: ticket, error } = await supabase
        .from('tickets')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', ticketId)
        .select()
        .single();

      if (error) throw error;
      return res.json(ticket);
    }

    return res.status(404).json({ error: 'Endpoint not found' });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}
