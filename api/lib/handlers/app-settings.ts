import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Default settings untuk fallback
const DEFAULT_SETTINGS = {
  institution_name: 'Rumah Sakit',
  institution_address: '',
  contact_phone: '',
  contact_email: '',
  website: '',
  app_footer: '',
  app_name: 'Sistem Pelacakan Tiket',
  logo_url: ''
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers PERTAMA - SEBELUM SEMUA LOGIC
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  
  try {
    console.log('🎯 app-settings handler called:', req.method, req.url);
    
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

    const { type } = req.query;

    // Route ke units jika type=units
    if (type === 'units') {
      return handleUnits(req, res);
    }

    // Default: return app settings
    return handleAppSettings(req, res);
    
  } catch (error: any) {
    console.error('❌ Unexpected error in app-settings:', error);
    
    return res.status(200).json({
      success: false,
      error: 'Terjadi kesalahan server: ' + (error.message || 'Unknown error'),
      data: [],
      debug: {
        errorType: error.constructor?.name || 'Unknown',
        errorName: error.name || 'Unknown',
        timestamp: new Date().toISOString()
      }
    });
  }
}

// Handler untuk units
async function handleUnits(req: VercelRequest, res: VercelResponse) {
  console.log('🎯 GET /api/public/app-settings?type=units - Vercel Function');
  
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
  
  console.log('🔑 Checking credentials:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseKey,
    urlPrefix: supabaseUrl ? supabaseUrl.substring(0, 30) : 'none'
  });
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials');
    return res.status(200).json({
      success: false,
      error: 'Konfigurasi Supabase tidak lengkap',
      data: [],
      debug: {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseKey,
        envVars: Object.keys(process.env).filter(k => k.includes('SUPABASE'))
      }
    });
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  const { data: units, error } = await supabase
    .from('units')
    .select('id, name, code, description, is_active')
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (error) {
    console.error('❌ Supabase error fetching units:', error);
    return res.status(200).json({
      success: false,
      error: 'Gagal mengambil data unit',
      details: error.message,
      data: []
    });
  }

  console.log(`✅ Successfully fetched ${units?.length || 0} active units`);

  return res.status(200).json({
    success: true,
    data: units || [],
    count: units?.length || 0,
    timestamp: new Date().toISOString()
  });
}

// Handler untuk app settings
async function handleAppSettings(req: VercelRequest, res: VercelResponse) {
  console.log('🎯 GET /api/public/app-settings');
  
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
  
  console.log('🔑 Checking credentials:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseKey,
    urlPrefix: supabaseUrl ? supabaseUrl.substring(0, 30) : 'none'
  });
  
  if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️ Supabase credentials not configured, using default settings');
    return res.status(200).json({
      success: true,
      data: DEFAULT_SETTINGS,
      warning: 'Using default settings',
      debug: {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseKey,
        envVars: Object.keys(process.env).filter(k => k.includes('SUPABASE'))
      }
    });
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
  
  // Query dengan filter is_public untuk public endpoint
  const { data: settings, error } = await supabase
    .from('app_settings')
    .select('setting_key, setting_value')
    .eq('is_public', true)
    .order('setting_key');

  if (error) {
    console.error('❌ Error fetching app settings:', error);
    return res.status(200).json({
      success: true,
      data: DEFAULT_SETTINGS,
      warning: 'Using default settings - database query failed'
    });
  }

  const settingsObject: any = {};
  if (settings && settings.length > 0) {
    settings.forEach((item: any) => {
      settingsObject[item.setting_key] = item.setting_value;
    });
  }

  const finalSettings = {
    ...DEFAULT_SETTINGS,
    ...settingsObject
  };

  return res.status(200).json({
    success: true,
    data: finalSettings
  });
}
