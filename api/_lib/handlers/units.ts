import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// PERBAIKAN: Di Vercel, VITE_ prefix tidak tersedia untuk serverless functions
// Prioritas: non-VITE vars dulu (untuk Vercel), baru VITE vars (untuk local dev)
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
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const unitId = req.query.id as string;

    // GET single unit by ID
    if (req.method === 'GET' && unitId) {
      const { data: unit, error } = await supabase
        .from('units')
        .select('*')
        .eq('id', unitId)
        .single();

      if (error) {
        return res.status(404).json({
          success: false,
          error: 'Unit tidak ditemukan',
          details: error.message
        });
      }

      return res.status(200).json({
        success: true,
        data: unit
      });
    }

    // GET - Fetch all units
    if (req.method === 'GET') {
      console.log('Fetching units from Supabase...');
      
      const { data, error } = await supabase
        .from('units')
        .select('id, name, code, description, is_active')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) {
        console.error('Supabase error fetching units:', error);
        throw error;
      }

      console.log(`Successfully fetched ${data?.length || 0} units`);

      return res.status(200).json({
        success: true,
        data: data || []
      });
    }

    // POST - Create new unit
    if (req.method === 'POST') {
      const { name, code, description, is_active } = req.body;

      const { data, error } = await supabase
        .from('units')
        .insert([{
          name,
          code,
          description,
          is_active: is_active !== undefined ? is_active : true
        }])
        .select()
        .single();

      if (error) throw error;

      return res.status(201).json({
        success: true,
        message: 'Unit berhasil dibuat',
        data
      });
    }

    // PUT - Update unit
    if (req.method === 'PUT' && unitId) {
      const unitData = req.body;
      
      const updateData: any = {
        updated_at: new Date().toISOString()
      };
      
      if (unitData.name !== undefined) updateData.name = unitData.name;
      if (unitData.code !== undefined) updateData.code = unitData.code;
      if (unitData.description !== undefined) updateData.description = unitData.description;
      if (unitData.is_active !== undefined) updateData.is_active = unitData.is_active;
      
      const { data: updatedUnit, error } = await supabase
        .from('units')
        .update(updateData)
        .eq('id', unitId)
        .select()
        .single();

      if (error) {
        return res.status(400).json({
          success: false,
          error: 'Gagal mengupdate unit',
          details: error.message
        });
      }

      return res.status(200).json({
        success: true,
        data: updatedUnit,
        message: 'Unit berhasil diupdate'
      });
    }

    // DELETE - Delete unit
    if (req.method === 'DELETE' && unitId) {
      const { error } = await supabase
        .from('units')
        .delete()
        .eq('id', unitId);

      if (error) {
        return res.status(400).json({
          success: false,
          error: 'Gagal menghapus unit',
          details: error.message
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Unit berhasil dihapus'
      });
    }

    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });

  } catch (error: any) {
    console.error('Error in units API:', error);
    return res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan server',
      message: error?.message || 'Internal server error',
      details: error?.details || null,
      timestamp: new Date().toISOString()
    });
  }
}
