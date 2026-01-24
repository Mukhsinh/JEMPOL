import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers PERTAMA - SEBELUM SEMUA LOGIC
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
    
    console.log('🎯 GET /api/public/units - Vercel Function');
    
    // Initialize Supabase client dengan validasi - coba berbagai environment variable
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
    
    console.log('📍 Environment check:', {
      hasSupabaseUrl: !!supabaseUrl,
      hasSupabaseKey: !!supabaseKey,
      supabaseUrlPrefix: supabaseUrl?.substring(0, 30) + '...'
    });
    
    // Validasi Supabase credentials
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Missing Supabase credentials in Vercel');
      console.error('   SUPABASE_URL:', process.env.SUPABASE_URL ? 'SET' : 'NOT SET');
      console.error('   VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL ? 'SET' : 'NOT SET');
      console.error('   SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET');
      console.error('   SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? 'SET' : 'NOT SET');
      
      return res.status(200).json({
        success: false,
        error: 'Konfigurasi Supabase tidak lengkap di Vercel. Silakan set environment variables.',
        data: [],
        debug: {
          hasUrl: !!supabaseUrl,
          hasKey: !!supabaseKey,
          env: process.env.NODE_ENV || 'unknown'
        }
      });
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase credentials OK, fetching units...');
    
    // Fetch active units dengan error handling yang lebih baik
    const { data: units, error } = await supabase
      .from('units')
      .select('id, name, code, description, is_active')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) {
      console.error('❌ Supabase error fetching units:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      
      return res.status(200).json({
        success: false,
        error: 'Gagal mengambil data unit dari database',
        details: error.message,
        data: [],
        debug: {
          errorCode: error.code,
          errorHint: error.hint
        }
      });
    }

    console.log(`✅ Successfully fetched ${units?.length || 0} active units`);
    
    // Log sample data untuk debugging
    if (units && units.length > 0) {
      console.log('📦 Sample unit:', {
        id: units[0].id,
        name: units[0].name,
        code: units[0].code
      });
    }

    // Return format yang konsisten
    return res.status(200).json({
      success: true,
      data: units || [],
      count: units?.length || 0,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('❌ Unexpected error in get units:', {
      message: error.message,
      stack: error.stack?.substring(0, 200)
    });
    
    // Return JSON valid meskipun exception
    return res.status(200).json({
      success: false,
      error: 'Terjadi kesalahan server: ' + (error.message || 'Unknown error'),
      data: [],
      debug: {
        errorType: error.constructor.name,
        timestamp: new Date().toISOString()
      }
    });
  }
}
