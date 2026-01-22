import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers - PERBAIKAN: Tambahkan Content-Type
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization');
  res.setHeader('Content-Type', 'application/json'); // PERBAIKAN: Pastikan response JSON
  
  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    console.log('🎯 GET /api/public/units dipanggil');
    
    // PERBAIKAN: Validasi Supabase credentials
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Supabase credentials tidak tersedia');
      return res.status(500).json({
        success: false,
        error: 'Konfigurasi server tidak lengkap',
        data: []
      });
    }
    
    // Fetch active units
    const { data: units, error } = await supabase
      .from('units')
      .select('id, name, code, description')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) {
      console.error('❌ Error fetching units:', error);
      // PERBAIKAN: Tetap return JSON valid meskipun error
      return res.status(200).json({
        success: false,
        error: 'Gagal mengambil data unit',
        details: error.message,
        data: [] // PERBAIKAN: Selalu sertakan data array kosong
      });
    }

    console.log(`✅ Found ${units?.length || 0} active units`);

    // PERBAIKAN: Pastikan selalu return format yang konsisten
    return res.status(200).json({
      success: true,
      data: units || [],
      count: units?.length || 0
    });
  } catch (error: any) {
    console.error('❌ Error in get units:', error);
    // PERBAIKAN: Return JSON valid meskipun exception
    return res.status(200).json({
      success: false,
      error: 'Terjadi kesalahan server: ' + (error.message || 'Unknown error'),
      data: [] // PERBAIKAN: Selalu sertakan data array kosong
    });
  }
}
