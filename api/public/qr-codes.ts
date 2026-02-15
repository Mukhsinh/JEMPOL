import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
}

// GUNAKAN SERVICE ROLE KEY untuk bypass RLS
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

/**
 * GET /api/public/qr-codes - Get all QR codes with pagination and filters
 * POST /api/public/qr-codes - Create new QR code
 * Query params:
 * - page: number (default: 1)
 * - limit: number (default: 10)
 * - unit_id: string (optional)
 * - is_active: boolean (optional)
 * - search: string (optional)
 * - include_analytics: boolean (optional, default: false)
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Handle GET and POST methods
  if (req.method === 'GET') {
    return handleGet(req, res);
  } else if (req.method === 'POST') {
    return handlePost(req, res);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

/**
 * Handle GET request - Get all QR codes with pagination and filters
 */
async function handleGet(req: VercelRequest, res: VercelResponse) {

  try {
    // Parse query parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const unit_id = req.query.unit_id as string;
    const is_active = req.query.is_active as string;
    const search = req.query.search as string;
    const include_analytics = req.query.include_analytics === 'true';

    // Calculate pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Build query
    let query = supabase
      .from('qr_codes')
      .select(`
        *,
        units:unit_id (
          id,
          name,
          code,
          description
        )
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    // Apply filters
    if (unit_id) {
      query = query.eq('unit_id', unit_id);
    }

    if (is_active !== undefined && is_active !== 'all') {
      query = query.eq('is_active', is_active === 'true');
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,code.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Execute query
    const { data, error, count } = await query;

    if (error) {
      console.error('❌ Error fetching QR codes:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch QR codes',
        details: error.message 
      });
    }

    // Calculate total pages
    const totalPages = count ? Math.ceil(count / limit) : 0;

    // Add analytics if requested (optional, can be implemented later)
    let qr_codes = data || [];
    if (include_analytics && qr_codes.length > 0) {
      // TODO: Implement analytics fetching from qr_code_analytics table
      // For now, return empty analytics
      qr_codes = qr_codes.map(qr => ({
        ...qr,
        analytics: {
          scans_30d: 0,
          tickets_30d: 0,
          trend: []
        }
      }));
    }

    // Return response
    return res.status(200).json({
      qr_codes,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: totalPages
      }
    });

  } catch (error: any) {
    console.error('❌ Unexpected error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}

/**
 * Handle POST request - Create new QR code
 */
async function handlePost(req: VercelRequest, res: VercelResponse) {
  try {
    const { unit_id, name, description, redirect_type, auto_fill_unit, show_options } = req.body;

    // Validate required fields
    if (!unit_id || !name) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        details: 'unit_id and name are required' 
      });
    }

    // Generate unique code and token dengan format yang lebih baik
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
    const code = `QR${timestamp}${randomStr}`;
    const token = `${timestamp.toString(36)}-${Math.random().toString(36).substring(2, 15)}`;

    console.log('🔄 Creating QR code with code:', code);

    // Insert QR code - SERVICE ROLE KEY akan bypass RLS
    const { data, error } = await supabase
      .from('qr_codes')
      .insert({
        unit_id,
        code,
        token,
        name,
        description: description || null,
        redirect_type: redirect_type || 'selection',
        auto_fill_unit: auto_fill_unit !== false,
        show_options: show_options || ['internal_ticket', 'external_ticket', 'survey'],
        is_active: true,
        usage_count: 0
      })
      .select(`
        *,
        units:unit_id (
          id,
          name,
          code,
          description
        )
      `)
      .single();

    if (error) {
      console.error('❌ Error creating QR code:', error);
      return res.status(500).json({ 
        error: 'Failed to create QR code',
        details: error.message 
      });
    }

    console.log('✅ QR code created successfully:', data);

    return res.status(201).json(data);

  } catch (error: any) {
    console.error('❌ Unexpected error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}
