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

async function verifyToken(request: VercelRequest): Promise<any> {
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  
  const token = authHeader.substring(7);
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    return error || !user ? null : user;
  } catch (error) {
    return null;
  }
}

export default async function handler(request: VercelRequest, response: VercelResponse) {
  setCorsHeaders(response);
  if (request.method === 'OPTIONS') return response.status(200).end();

  try {
    const user = await verifyToken(request);
    if (!user) {
      return response.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const url = new URL(request.url || '', `https://${request.headers.host}`);
    const pathParts = url.pathname.split('/').filter(Boolean);
    const action = pathParts[pathParts.length - 1];

    // GET /api/complaints - List tickets
    if (request.method === 'GET' && !action) {
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
      return response.json(tickets || []);
    }

    // POST /api/complaints - Create ticket
    if (request.method === 'POST') {
      const ticketData = request.body;
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
      return response.status(201).json(ticket);
    }

    // GET /api/complaints/:id - Get single ticket
    if (request.method === 'GET' && action) {
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
        .eq('id', action)
        .single();

      if (error) throw error;
      return response.json(ticket);
    }

    // PUT /api/complaints/:id - Update ticket
    if (request.method === 'PUT' && action) {
      const updateData = request.body;
      const { data: ticket, error } = await supabase
        .from('tickets')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', action)
        .select()
        .single();

      if (error) throw error;
      return response.json(ticket);
    }

    // DELETE /api/complaints/:id - Delete ticket
    if (request.method === 'DELETE' && action) {
      const { error } = await supabase
        .from('tickets')
        .delete()
        .eq('id', action);

      if (error) throw error;
      return response.json({ success: true, message: 'Ticket deleted' });
    }

    return response.status(404).json({ error: 'Endpoint not found' });

  } catch (error: any) {
    console.error('Complaints API error:', error);
    return response.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}
