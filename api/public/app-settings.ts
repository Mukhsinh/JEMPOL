import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Default settings untuk fallback
const DEFAULT_SETTINGS = {
  institution_name: 'Rumah Sakit',
  institution_address: '',
  contact_phone: '',
  contact_email: '',
  website: '',
  app_footer: ''
};

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
        error: 'Method not allowed. Use GET method.'
      });
    }
    
    console.log('🎯 GET /api/public/app-settings dipanggil');
    
    // Initialize Supabase client dengan validasi - coba berbagai environment variable
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
    
    console.log('📍 Environment check:', {
      hasSupabaseUrl: !!supabaseUrl,
      hasSupabaseKey: !!supabaseKey,
      supabaseUrlPrefix: supabaseUrl?.substring(0, 30) + '...'
    });
    
    // PERBAIKAN: Validasi Supabase credentials
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Supabase credentials tidak tersedia');
      console.error('   SUPABASE_URL:', process.env.SUPABASE_URL ? 'SET' : 'NOT SET');
      console.error('   VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL ? 'SET' : 'NOT SET');
      console.error('   SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET');
      console.error('   SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? 'SET' : 'NOT SET');
      
      return res.status(200).json({
        success: true,
        data: DEFAULT_SETTINGS,
        warning: 'Using default settings - Supabase credentials not configured'
      });
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase client initialized');
    
    // Fetch app settings - return as array
    const { data: settings, error } = await supabase
      .from('app_settings')
      .select('setting_key, setting_value')
      .order('setting_key');

    if (error) {
      console.error('❌ Error fetching app settings:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      
      // Return default settings jika error
      return res.status(200).json({
        success: true,
        data: DEFAULT_SETTINGS,
        warning: 'Using default settings - database query failed'
      });
    }

    console.log('✅ App settings fetched successfully:', settings?.length || 0, 'items');

    // Convert array to object format yang diharapkan frontend
    const settingsObject: any = {};
    if (settings && settings.length > 0) {
      settings.forEach((item: any) => {
        settingsObject[item.setting_key] = item.setting_value;
      });
    }

    // Merge dengan default settings
    const finalSettings = {
      ...DEFAULT_SETTINGS,
      ...settingsObject
    };

    return res.status(200).json({
      success: true,
      data: finalSettings
    });
  } catch (error: any) {
    console.error('❌ Unexpected error in get app settings:', {
      message: error.message,
      stack: error.stack?.substring(0, 200)
    });
    
    // PERBAIKAN: Return default settings jika exception dengan JSON valid
    return res.status(200).json({
      success: true,
      data: DEFAULT_SETTINGS,
      error: 'Server error: ' + (error.message || 'Unknown error'),
      debug: {
        errorType: error.constructor.name,
        timestamp: new Date().toISOString()
      }
    });
  }
}
