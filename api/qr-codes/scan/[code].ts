import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * GET /api/qr-codes/scan/[code] - Get QR code by code (for scanning)
 * This is a public endpoint used when scanning QR codes
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow GET method
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get code from query
    const { code } = req.query;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Invalid QR code' });
    }

    // Get QR code by code
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

    // Return QR code data
    return res.status(200).json(data);

  } catch (error: any) {
    console.error('❌ Unexpected error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}
