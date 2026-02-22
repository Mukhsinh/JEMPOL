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
 * Unified QR Codes API Handler
 * Routes:
 * - GET /api/public/qr-codes - Get all QR codes
 * - POST /api/public/qr-codes - Create QR code
 * - GET /api/public/qr-codes?id=xxx - Get by ID
 * - PATCH /api/public/qr-codes?id=xxx - Update by ID
 * - DELETE /api/public/qr-codes?id=xxx - Delete by ID
 * - GET /api/public/qr-codes?scan=xxx - Scan by code
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

  // Route based on query parameters
  const { id, scan } = req.query;

  if (scan) {
    // Handle scan by code
    return handleScan(req, res, scan as string);
  } else if (id) {
    // Handle operations by ID
    if (req.method === 'GET') {
      return handleGetById(req, res, id as string);
    } else if (req.method === 'PATCH') {
      return handlePatchById(req, res, id as string);
    } else if (req.method === 'DELETE') {
      return handleDeleteById(req, res, id as string);
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } else {
    // Handle list and create operations
    if (req.method === 'GET') {
      return handleGet(req, res);
    } else if (req.method === 'POST') {
      return handlePost(req, res);
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
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

/**
 * Handle GET by ID - Get QR code by ID
 */
async function handleGetById(_req: VercelRequest, res: VercelResponse, id: string) {
  try {
    const { data, error } = await supabase
      .from('qr_codes')
      .select(`
        *,
        units:unit_id (
          id,
          name,
          code,
          description
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'QR code not found' });
      }
      console.error('❌ Error fetching QR code:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch QR code',
        details: error.message 
      });
    }

    return res.status(200).json(data);

  } catch (error: any) {
    console.error('❌ Unexpected error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}

/**
 * Handle PATCH by ID - Update QR code
 */
async function handlePatchById(req: VercelRequest, res: VercelResponse, id: string) {
  try {
    const { name, description, is_active, redirect_type, auto_fill_unit, show_options } = req.body;

    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (is_active !== undefined) updateData.is_active = is_active;
    if (redirect_type !== undefined) updateData.redirect_type = redirect_type;
    if (auto_fill_unit !== undefined) updateData.auto_fill_unit = auto_fill_unit;
    if (show_options !== undefined) updateData.show_options = show_options;

    const { data, error } = await supabase
      .from('qr_codes')
      .update(updateData)
      .eq('id', id)
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
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'QR code not found' });
      }
      console.error('❌ Error updating QR code:', error);
      return res.status(500).json({ 
        error: 'Failed to update QR code',
        details: error.message 
      });
    }

    return res.status(200).json(data);

  } catch (error: any) {
    console.error('❌ Unexpected error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}

/**
 * Handle DELETE by ID - Delete QR code
 */
async function handleDeleteById(_req: VercelRequest, res: VercelResponse, id: string) {
  try {
    console.log(`🔄 Deleting QR code ${id}...`);
    
    const { data: existingQR, error: checkError } = await supabase
      .from('qr_codes')
      .select('id, name')
      .eq('id', id)
      .single();

    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return res.status(404).json({ error: 'QR code not found' });
      }
      console.error('❌ Error checking QR code:', checkError);
      return res.status(500).json({ 
        error: 'Failed to check QR code',
        details: checkError.message 
      });
    }

    const { error: deleteError } = await supabase
      .from('qr_codes')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('❌ Error deleting QR code:', deleteError);
      return res.status(500).json({ 
        error: 'Failed to delete QR code',
        details: deleteError.message 
      });
    }

    console.log(`✅ QR code "${existingQR.name}" deleted successfully`);

    return res.status(200).json({ 
      success: true,
      message: `QR code "${existingQR.name}" deleted successfully` 
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
 * Handle scan - Get QR code by code (for scanning)
 */
async function handleScan(_req: VercelRequest, res: VercelResponse, code: string) {
  try {
    if (!code) {
      return res.status(400).json({ error: 'Invalid QR code' });
    }

    const { data, error } = await supabase
      .from('qr_codes')
      .select(`
        *,
        units:unit_id (
          id,
          name,
          code,
          description
        )
      `)
      .eq('code', code)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'QR code not found or inactive' });
      }
      console.error('❌ Error fetching QR code:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch QR code',
        details: error.message 
      });
    }

    // Increment usage count
    await supabase
      .from('qr_codes')
      .update({ 
        usage_count: (data.usage_count || 0) + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', data.id);

    return res.status(200).json(data);

  } catch (error: any) {
    console.error('❌ Unexpected error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}
