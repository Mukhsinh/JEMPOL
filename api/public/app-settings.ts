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
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization');
  
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
    console.log('🎯 GET /api/public/app-settings dipanggil');
    
    // Fetch app settings
    const { data: settings, error } = await supabase
      .from('app_settings')
      .select('*')
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('❌ Error fetching app settings:', error);
      return res.status(500).json({
        success: false,
        error: 'Gagal mengambil pengaturan aplikasi',
        details: error.message
      });
    }

    console.log('✅ App settings fetched successfully');

    return res.status(200).json({
      success: true,
      data: settings || {
        institution_name: 'Rumah Sakit',
        institution_address: '',
        contact_phone: '',
        contact_email: '',
        website: '',
        app_footer: ''
      }
    });
  } catch (error: any) {
    console.error('❌ Error in get app settings:', error);
    return res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan server: ' + (error.message || 'Unknown error')
    });
  }
}
