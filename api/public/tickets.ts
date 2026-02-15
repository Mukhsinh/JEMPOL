import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
}

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  
  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).json({ success: true });
  }

  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: `Method ${req.method} not allowed. Use GET method.`
    });
  }

  try {
    console.log('🎯 GET /api/public/tickets');
    
    if (!supabase) {
      return res.status(500).json({
        success: false,
        error: 'Konfigurasi server tidak lengkap'
      });
    }

    // Get query parameters for filtering
    const {
      status,
      priority,
      unit_id,
      category_id,
      type,
      date_from,
      date_to,
      search,
      limit = '100'
    } = req.query;

    console.log('📥 Query params:', { status, priority, unit_id, type, limit });

    // Build query
    let query = supabase
      .from('tickets')
      .select(`
        *,
        units:unit_id(id, name, code),
        service_categories:category_id(id, name),
        patient_types:patient_type_id(id, name)
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (priority && priority !== 'all') {
      query = query.eq('priority', priority);
    }

    if (unit_id) {
      query = query.eq('unit_id', unit_id);
    }

    if (category_id) {
      query = query.eq('category_id', category_id);
    }

    if (type && type !== 'all') {
      query = query.eq('type', type);
    }

    if (date_from) {
      query = query.gte('created_at', date_from);
    }

    if (date_to) {
      query = query.lte('created_at', date_to);
    }

    if (search) {
      query = query.or(`ticket_number.ilike.%${search}%,title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Apply limit
    const limitNum = parseInt(limit as string) || 100;
    query = query.limit(limitNum);

    const { data: tickets, error } = await query;

    if (error) {
      console.error('❌ Error fetching tickets:', error);
      return res.status(500).json({
        success: false,
        error: 'Gagal mengambil data tiket',
        details: error.message
      });
    }

    console.log(`✅ Fetched ${tickets?.length || 0} tickets`);

    return res.status(200).json({
      success: true,
      data: tickets || [],
      message: 'Tickets berhasil diambil'
    });

  } catch (error: any) {
    console.error('❌ Error in tickets handler:', error);
    return res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan server',
      details: error.message
    });
  }
}
