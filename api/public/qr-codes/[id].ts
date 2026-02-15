import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * GET /api/qr-codes/[id] - Get QR code by ID
 * PATCH /api/qr-codes/[id] - Update QR code
 * DELETE /api/qr-codes/[id] - Delete QR code
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

  // Get ID from query
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid QR code ID' });
  }

  // Route to appropriate handler
  if (req.method === 'GET') {
    return handleGet(req, res, id);
  } else if (req.method === 'PATCH') {
    return handlePatch(req, res, id);
  } else if (req.method === 'DELETE') {
    return handleDelete(req, res, id);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

/**
 * Handle GET request - Get QR code by ID
 */
async function handleGet(req: VercelRequest, res: VercelResponse, id: string) {
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
 * Handle PATCH request - Update QR code
 */
async function handlePatch(req: VercelRequest, res: VercelResponse, id: string) {
  try {
    const { name, description, is_active, redirect_type, auto_fill_unit, show_options } = req.body;

    // Build update object (only include provided fields)
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (is_active !== undefined) updateData.is_active = is_active;
    if (redirect_type !== undefined) updateData.redirect_type = redirect_type;
    if (auto_fill_unit !== undefined) updateData.auto_fill_unit = auto_fill_unit;
    if (show_options !== undefined) updateData.show_options = show_options;

    // Update QR code
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
 * Handle DELETE request - Delete QR code
 */
async function handleDelete(req: VercelRequest, res: VercelResponse, id: string) {
  try {
    console.log(`🔄 Deleting QR code ${id}...`);
    
    // Check if QR code exists
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

    // Delete QR code
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
