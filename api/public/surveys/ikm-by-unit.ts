import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

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
    const { start_date, end_date, unit_id } = req.query;

    let query = supabase.from('public_surveys').select(`
      unit_id, units (name), q1_score, q2_score, q3_score, q4_score,
      q5_score, q6_score, q7_score, q8_score, q9_score, q10_score, q11_score
    `);

    if (start_date) query = query.gte('created_at', start_date);
    if (end_date) query = query.lte('created_at', end_date);
    if (unit_id && unit_id !== 'all') query = query.eq('unit_id', unit_id);

    const { data: surveys, error } = await query;

    if (error) {
      console.error('Error fetching IKM by unit:', error);
      return res.status(500).json({ success: false, error: 'Gagal mengambil data IKM per unit' });
    }

    const unitMap = new Map();

    surveys?.forEach(survey => {
      if (!survey.unit_id) return;

      // Filter hanya score yang tidak NULL dan convert ke Number
      const scores = [
        survey.q1_score, survey.q2_score, survey.q3_score, survey.q4_score,
        survey.q5_score, survey.q6_score, survey.q7_score, survey.q8_score,
        survey.q9_score, survey.q10_score, survey.q11_score
      ].filter(s => s != null && s !== undefined).map(s => Number(s));

      if (scores.length === 0) return;

      const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;

      if (!unitMap.has(survey.unit_id)) {
        let unitName = 'Unknown';
        if (survey.units) {
          if (Array.isArray(survey.units) && survey.units.length > 0) {
            unitName = survey.units[0].name || 'Unknown';
          } else if (typeof survey.units === 'object' && 'name' in survey.units) {
            unitName = (survey.units as any).name || 'Unknown';
          }
        }
        
        unitMap.set(survey.unit_id, {
          unit_id: survey.unit_id,
          unit_name: unitName,
          total_responses: 0,
          total_score: 0
        });
      }

      const unitData = unitMap.get(survey.unit_id);
      unitData.total_responses += 1;
      unitData.total_score += avgScore;
    });

    const unitIKM = Array.from(unitMap.values()).map(unit => {
      const average_score = unit.total_score / unit.total_responses;
      const ikm_score = average_score * 20;

      return {
        unit_id: unit.unit_id,
        unit_name: unit.unit_name,
        total_responses: unit.total_responses,
        average_score: Math.round(average_score * 10) / 10,
        ikm_score: Math.round(ikm_score * 10) / 10
      };
    });

    unitIKM.sort((a, b) => b.ikm_score - a.ikm_score);

    return res.status(200).json({ success: true, data: unitIKM });
  } catch (error: any) {
    console.error('Error in ikm-by-unit endpoint:', error);
    return res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan server',
      details: error.message
    });
  }
}
