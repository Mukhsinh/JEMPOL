import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).json({ success: true });
  }

  try {
    if (!supabase) {
      return res.status(500).json({ success: false, error: 'Database tidak tersedia' });
    }

    const path = req.url?.replace('/api/app-settings', '') || '/';

    // GET /app-settings - Get all settings
    if (path === '/' && req.method === 'GET') {
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .order('setting_key');

      if (error) {
        return res.status(500).json({ success: false, error: error.message });
      }

      // Convert to object format
      const settings: any = {};
      data?.forEach((item: any) => {
        settings[item.setting_key] = item.setting_value;
      });

      return res.status(200).json({ success: true, data: settings });
    }

    // PUT /app-settings - Update settings
    if (path === '/' && req.method === 'PUT') {
      const updates = req.body;
      const promises = [];

      for (const [key, value] of Object.entries(updates)) {
        promises.push(
          supabase
            .from('app_settings')
            .upsert({
              setting_key: key,
              setting_value: value,
              updated_at: new Date().toISOString()
            })
        );
      }

      await Promise.all(promises);

      return res.status(200).json({ success: true, message: 'Settings berhasil diupdate' });
    }

    return res.status(404).json({ success: false, error: 'Endpoint tidak ditemukan' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
