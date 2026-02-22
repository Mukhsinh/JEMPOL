import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed. Only GET is supported.'
    });
  }

  try {
    const { start_date, end_date, unit_id, user_unit_id, has_global_access, group_by = 'kabupaten_kota' } = req.query;
    
    const validGroupBy = ['kabupaten_kota', 'kecamatan', 'kelurahan'];
    const groupByField = validGroupBy.includes(group_by as string) ? group_by as string : 'kabupaten_kota';

    let query = supabase.from('public_surveys').select(groupByField);

    if (start_date) query = query.gte('created_at', start_date);
    if (end_date) query = query.lte('created_at', end_date);
    
    // PENTING: Filter berdasarkan unit untuk user non-global
    const hasGlobalAccess = has_global_access === 'true';
    if (!hasGlobalAccess && user_unit_id && user_unit_id !== 'all') {
      console.log('🔒 Applying unit filter for address stats:', user_unit_id);
      query = query.eq('unit_id', user_unit_id);
    } else if (unit_id && unit_id !== 'all') {
      // Untuk admin/superadmin yang memilih unit tertentu
      query = query.eq('unit_id', unit_id);
    }

    const { data: surveys, error } = await query;

    if (error) {
      console.error('Error fetching address stats:', error);
      return res.status(500).json({ success: false, error: 'Gagal mengambil statistik alamat' });
    }

    const addressCount = new Map<string, number>();
    let totalCount = 0;

    surveys?.forEach(survey => {
      const address = survey[groupByField as keyof typeof survey];
      if (address && typeof address === 'string' && address.trim() !== '') {
        const normalizedAddress = address.trim();
        addressCount.set(normalizedAddress, (addressCount.get(normalizedAddress) || 0) + 1);
        totalCount++;
      }
    });

    const addressStats = Array.from(addressCount.entries())
      .map(([name, count]) => ({
        name,
        count,
        percentage: totalCount > 0 ? Math.round((count / totalCount) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count);

    return res.status(200).json({ success: true, data: addressStats });
  } catch (error: any) {
    console.error('Error in address-stats endpoint:', error);
    return res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan server',
      details: error.message
    });
  }
}
