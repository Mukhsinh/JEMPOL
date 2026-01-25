import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// Verify JWT token
function verifyToken(req: VercelRequest): any {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    throw new Error('Token tidak ditemukan');
  }

  try {
    return jwt.verify(token, jwtSecret);
  } catch (error) {
    throw new Error('Token tidak valid');
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).json({ success: true });
  }

  try {
    if (!supabase) {
      return res.status(500).json({
        success: false,
        error: 'Database tidak tersedia'
      });
    }

    // Verify authentication untuk semua endpoint kecuali public
    const path = req.url?.replace('/api/complaints', '') || '/';
    if (!path.startsWith('/public/')) {
      try {
        verifyToken(req);
      } catch (error: any) {
        return res.status(401).json({
          success: false,
          error: error.message
        });
      }
    }

    // GET /complaints - List all tickets
    if (path === '/' && req.method === 'GET') {
      const { page = 1, limit = 10, status, priority, type, unit_id, search } = req.query;
      
      let query = supabase
        .from('tickets')
        .select(`
          *,
          units:unit_id(id, name, code),
          service_categories:category_id(id, name)
        `, { count: 'exact' });

      // Filters
      if (status) query = query.eq('status', status);
      if (priority) query = query.eq('priority', priority);
      if (type) query = query.eq('type', type);
      if (unit_id) query = query.eq('unit_id', unit_id);
      if (search) {
        query = query.or(`ticket_number.ilike.%${search}%,title.ilike.%${search}%,description.ilike.%${search}%`);
      }

      // Pagination
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const from = (pageNum - 1) * limitNum;
      const to = from + limitNum - 1;

      query = query
        .order('created_at', { ascending: false })
        .range(from, to);

      const { data, error, count } = await query;

      if (error) {
        return res.status(500).json({
          success: false,
          error: error.message
        });
      }

      return res.status(200).json({
        success: true,
        data,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limitNum)
        }
      });
    }

    // GET /complaints/:id - Get single ticket
    if (path.match(/^\/[a-f0-9-]+$/) && req.method === 'GET') {
      const id = path.substring(1);
      
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          *,
          units:unit_id(id, name, code),
          service_categories:category_id(id, name),
          ticket_responses(
            id,
            response_text,
            response_type,
            created_at,
            created_by,
            admins:created_by(username, full_name)
          )
        `)
        .eq('id', id)
        .single();

      if (error || !data) {
        return res.status(404).json({
          success: false,
          error: 'Tiket tidak ditemukan'
        });
      }

      return res.status(200).json({
        success: true,
        data
      });
    }

    // PATCH /complaints/:id - Update ticket
    if (path.match(/^\/[a-f0-9-]+$/) && req.method === 'PATCH') {
      const id = path.substring(1);
      const updates = req.body;

      const { data, error } = await supabase
        .from('tickets')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return res.status(500).json({
          success: false,
          error: error.message
        });
      }

      return res.status(200).json({
        success: true,
        data
      });
    }

    // DELETE /complaints/:id - Delete ticket
    if (path.match(/^\/[a-f0-9-]+$/) && req.method === 'DELETE') {
      const id = path.substring(1);

      const { error } = await supabase
        .from('tickets')
        .delete()
        .eq('id', id);

      if (error) {
        return res.status(500).json({
          success: false,
          error: error.message
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Tiket berhasil dihapus'
      });
    }

    // GET /complaints/stats - Get statistics
    if (path === '/stats' && req.method === 'GET') {
      const { unit_id, start_date, end_date } = req.query;

      let query = supabase.from('tickets').select('*', { count: 'exact', head: true });
      
      if (unit_id) query = query.eq('unit_id', unit_id);
      if (start_date) query = query.gte('created_at', start_date);
      if (end_date) query = query.lte('created_at', end_date);

      const [
        { count: total },
        { count: open },
        { count: inProgress },
        { count: resolved },
        { count: closed }
      ] = await Promise.all([
        query,
        query.eq('status', 'open'),
        query.eq('status', 'in_progress'),
        query.eq('status', 'resolved'),
        query.eq('status', 'closed')
      ]);

      return res.status(200).json({
        success: true,
        data: {
          total: total || 0,
          open: open || 0,
          in_progress: inProgress || 0,
          resolved: resolved || 0,
          closed: closed || 0
        }
      });
    }

    return res.status(404).json({
      success: false,
      error: 'Endpoint tidak ditemukan'
    });

  } catch (error: any) {
    console.error('Error in complaints handler:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}
