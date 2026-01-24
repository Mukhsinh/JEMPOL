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
    const roleId = pathParts[2];

    // GET /api/roles - List all roles
    if (request.method === 'GET' && !roleId) {
      const { data: roles, error } = await supabase
        .from('roles')
        .select('*')
        .order('name');

      if (error) throw error;
      return response.json(roles || []);
    }

    // GET /api/roles/:id - Get single role
    if (request.method === 'GET' && roleId) {
      const { data: role, error } = await supabase
        .from('roles')
        .select('*')
        .eq('id', roleId)
        .single();

      if (error) throw error;
      return response.json(role);
    }

    // POST /api/roles - Create role
    if (request.method === 'POST') {
      const roleData = request.body;
      const { data: role, error } = await supabase
        .from('roles')
        .insert([{
          ...roleData,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return response.status(201).json(role);
    }

    // PUT /api/roles/:id - Update role
    if (request.method === 'PUT' && roleId) {
      const updateData = request.body;
      const { data: role, error } = await supabase
        .from('roles')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', roleId)
        .select()
        .single();

      if (error) throw error;
      return response.json(role);
    }

    // DELETE /api/roles/:id - Delete role
    if (request.method === 'DELETE' && roleId) {
      const { error } = await supabase
        .from('roles')
        .delete()
        .eq('id', roleId);

      if (error) throw error;
      return response.json({ success: true, message: 'Role deleted' });
    }

    return response.status(404).json({ error: 'Endpoint not found' });

  } catch (error: any) {
    console.error('Roles API error:', error);
    return response.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}
