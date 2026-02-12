import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  
  try {
    // Handle OPTIONS request
    if (req.method === 'OPTIONS') {
      return res.status(200).json({ success: true });
    }

    // Only allow GET
    if (req.method !== 'GET') {
      return res.status(405).json({
        success: false,
        error: 'Method not allowed. Use GET method.',
        data: []
      });
    }
    
    console.log('🎯 GET /api/units - Fetching units with relations');
    
    // Initialize Supabase client
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Missing Supabase credentials');
      return res.status(200).json({
        success: false,
        error: 'Konfigurasi Supabase tidak lengkap',
        data: []
      });
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get query parameters
    const { search, type, status } = req.query;
    
    // Build query with relations
    let query = supabase
      .from('units')
      .select(`
        *,
        unit_type:unit_type_id (
          id,
          name,
          code,
          color
        ),
        parent_unit:parent_unit_id (
          id,
          name
        )
      `)
      .order('name', { ascending: true });
    
    // Apply filters
    if (status === 'active') {
      query = query.eq('is_active', true);
    } else if (status === 'inactive') {
      query = query.eq('is_active', false);
    }
    
    if (search && typeof search === 'string') {
      query = query.or(`name.ilike.%${search}%,code.ilike.%${search}%`);
    }
    
    if (type && typeof type === 'string') {
      // Filter by unit type code
      const { data: unitTypes } = await supabase
        .from('unit_types')
        .select('id')
        .eq('code', type)
        .single();
      
      if (unitTypes) {
        query = query.eq('unit_type_id', unitTypes.id);
      }
    }

    const { data: units, error } = await query;

    if (error) {
      console.error('❌ Supabase error:', error);
      return res.status(200).json({
        success: false,
        error: 'Gagal mengambil data unit',
        details: error.message,
        data: []
      });
    }

    console.log(`✅ Successfully fetched ${units?.length || 0} units`);

    // Return in format expected by frontend
    return res.status(200).json({
      success: true,
      units: units || [],
      data: units || [],
      count: units?.length || 0,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('❌ Unexpected error:', error);
    return res.status(200).json({
      success: false,
      error: 'Terjadi kesalahan server: ' + (error.message || 'Unknown error'),
      data: [],
      units: []
    });
  }
}
