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
    const searchParams = url.searchParams;
    
    // GET /api/reports - Generate report
    if (request.method === 'GET') {
      const startDate = searchParams.get('startDate');
      const endDate = searchParams.get('endDate');
      const unitId = searchParams.get('unitId');
      const status = searchParams.get('status');

      let query = supabase
        .from('tickets')
        .select(`
          *,
          units(name, code),
          service_categories(name),
          patient_types(name),
          ticket_statuses(name, color),
          ticket_types(name),
          ticket_classifications(name)
        `);

      // Apply filters
      if (startDate) {
        query = query.gte('created_at', startDate);
      }
      if (endDate) {
        query = query.lte('created_at', endDate);
      }
      if (unitId && unitId !== 'all') {
        query = query.eq('unit_id', unitId);
      }
      if (status && status !== 'all') {
        query = query.eq('status', status);
      }

      query = query.order('created_at', { ascending: false });

      const { data: tickets, error } = await query;

      if (error) throw error;

      // Calculate statistics
      const stats = {
        total: tickets?.length || 0,
        byStatus: {} as Record<string, number>,
        byUnit: {} as Record<string, number>,
        byCategory: {} as Record<string, number>,
        avgResolutionTime: 0
      };

      tickets?.forEach((ticket: any) => {
        // By status
        const statusName = ticket.ticket_statuses?.name || 'Unknown';
        stats.byStatus[statusName] = (stats.byStatus[statusName] || 0) + 1;

        // By unit
        const unitName = ticket.units?.name || 'Unknown';
        stats.byUnit[unitName] = (stats.byUnit[unitName] || 0) + 1;

        // By category
        const categoryName = ticket.service_categories?.name || 'Unknown';
        stats.byCategory[categoryName] = (stats.byCategory[categoryName] || 0) + 1;
      });

      return response.json({
        tickets: tickets || [],
        statistics: stats
      });
    }

    return response.status(404).json({ error: 'Endpoint not found' });

  } catch (error: any) {
    console.error('Reports API error:', error);
    return response.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}
