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
    const userId = pathParts[2]; // users/<id>

    // GET /api/users - List all users
    if (request.method === 'GET' && !userId) {
      const { data: users, error } = await supabase
        .from('users')
        .select(`
          *,
          units(name, code),
          roles(name, permissions)
        `)
        .order('full_name');

      if (error) throw error;
      return response.json(users || []);
    }

    // GET /api/users/:id - Get single user
    if (request.method === 'GET' && userId) {
      const { data: userData, error } = await supabase
        .from('users')
        .select(`
          *,
          units(name, code),
          roles(name, permissions)
        `)
        .eq('id', userId)
        .single();

      if (error) throw error;
      return response.json(userData);
    }

    // POST /api/users - Create user
    if (request.method === 'POST') {
      const userData = request.body;
      const { data: newUser, error } = await supabase
        .from('users')
        .insert([{
          ...userData,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return response.status(201).json(newUser);
    }

    // PUT /api/users/:id - Update user
    if (request.method === 'PUT' && userId) {
      const updateData = request.body;
      const { data: updatedUser, error } = await supabase
        .from('users')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return response.json(updatedUser);
    }

    // DELETE /api/users/:id - Delete user
    if (request.method === 'DELETE' && userId) {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) throw error;
      return response.json({ success: true, message: 'User deleted' });
    }

    return response.status(404).json({ error: 'Endpoint not found' });

  } catch (error: any) {
    console.error('Users API error:', error);
    return response.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}
