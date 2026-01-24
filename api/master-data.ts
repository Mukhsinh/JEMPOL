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
    const resource = pathParts[2]; // master-data/<resource>
    const id = pathParts[3]; // master-data/<resource>/<id>

    // Mapping resource ke table
    const tableMap: Record<string, string> = {
      'patient-types': 'patient_types',
      'service-categories': 'service_categories',
      'ticket-classifications': 'ticket_classifications',
      'ticket-statuses': 'ticket_statuses',
      'ticket-types': 'ticket_types',
      'unit-types': 'unit_types',
      'sla-settings': 'sla_settings'
    };

    const tableName = tableMap[resource];
    if (!tableName) {
      return response.status(404).json({ error: 'Resource not found' });
    }

    // GET - List all
    if (request.method === 'GET' && !id) {
      let query = supabase.from(tableName).select('*').order('name');
      
      // Special handling untuk SLA settings
      if (tableName === 'sla_settings') {
        query = supabase.from(tableName).select(`
          *,
          unit_types(name, code),
          service_categories(name, code),
          patient_types(name, code)
        `).order('name');
      }

      const { data, error } = await query;
      if (error) throw error;
      return response.json(data || []);
    }

    // GET - Single item
    if (request.method === 'GET' && id) {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return response.json(data);
    }

    // POST - Create
    if (request.method === 'POST') {
      const itemData = request.body;
      const { data, error } = await supabase
        .from(tableName)
        .insert([{
          ...itemData,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return response.status(201).json(data);
    }

    // PUT - Update
    if (request.method === 'PUT' && id) {
      const updateData = request.body;
      const { data, error } = await supabase
        .from(tableName)
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return response.json(data);
    }

    // DELETE
    if (request.method === 'DELETE' && id) {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);

      if (error) throw error;
      return response.json({ success: true, message: 'Item deleted' });
    }

    return response.status(404).json({ error: 'Endpoint not found' });

  } catch (error: any) {
    console.error('Master data API error:', error);
    return response.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}
