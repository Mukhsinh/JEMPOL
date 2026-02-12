import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Validasi environment variables
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials:', { 
      hasUrl: !!supabaseUrl, 
      hasKey: !!supabaseKey,
      env: process.env.NODE_ENV
    });
    return res.status(500).json({
      success: false,
      message: 'Server configuration error: Missing Supabase credentials'
    });
  }

  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Validasi environment variables
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials:', { 
      hasUrl: !!supabaseUrl, 
      hasKey: !!supabaseKey,
      env: process.env.NODE_ENV 
    });
    return res.status(500).json({
      success: false,
      message: 'Server configuration error: Missing Supabase credentials'
    });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // GET - Fetch all roles
    if (req.method === 'GET') {
      console.log('Fetching roles from Supabase...');
      
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error fetching roles:', error);
        throw error;
      }

      console.log(`Successfully fetched ${data?.length || 0} roles`);

      return res.status(200).json({
        success: true,
        data: data || []
      });
    }

    // POST - Create new role
    if (req.method === 'POST') {
      const { name, code, description, permissions, is_system_role, is_active } = req.body;

      const { data, error } = await supabase
        .from('roles')
        .insert([{
          name,
          code,
          description,
          permissions,
          is_system_role: is_system_role || false,
          is_active: is_active !== undefined ? is_active : true
        }])
        .select()
        .single();

      if (error) throw error;

      return res.status(201).json({
        success: true,
        message: 'Peran berhasil dibuat',
        data
      });
    }

    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });

  } catch (error: any) {
    console.error('Error in roles API:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
}
