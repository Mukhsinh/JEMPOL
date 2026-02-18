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
      id, created_at, unit_id, units (name), service_type, visitor_name,
      visitor_phone, is_anonymous, age_range, gender, q1_score, q2_score,
      q3_score, q4_score, q5_score, q6_score, q7_score, q8_score,
      q9_score, q10_score, q11_score, overall_score, comments
    `).order('created_at', { ascending: false });

    if (start_date) query = query.gte('created_at', start_date);
    if (end_date) query = query.lte('created_at', end_date);
    if (unit_id && unit_id !== 'all') query = query.eq('unit_id', unit_id);

    const { data: surveys, error } = await query;

    if (error) {
      console.error('Error fetching survey responses:', error);
      return res.status(500).json({ success: false, error: 'Gagal mengambil data respons survei' });
    }

    const responses = surveys?.map(survey => {
      // Filter hanya score yang tidak NULL dan convert ke Number
      const scores = [
        survey.q1_score, survey.q2_score, survey.q3_score, survey.q4_score,
        survey.q5_score, survey.q6_score, survey.q7_score, survey.q8_score,
        survey.q9_score, survey.q10_score, survey.q11_score
      ].filter(s => s != null && s !== undefined).map(s => Number(s));

      const average_rating = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

      let unitName = '-';
      if (survey.units) {
        if (Array.isArray(survey.units) && survey.units.length > 0) {
          unitName = survey.units[0].name || '-';
        } else if (typeof survey.units === 'object' && 'name' in survey.units) {
          unitName = (survey.units as any).name || '-';
        }
      }

      return {
        id: survey.id,
        date: survey.created_at,
        unit: unitName,
        unit_id: survey.unit_id,
        service_type: survey.service_type || '-',
        visitor_name: survey.visitor_name,
        visitor_phone: survey.visitor_phone,
        is_anonymous: survey.is_anonymous,
        age_range: survey.age_range,
        gender: survey.gender,
        q1_score: survey.q1_score,
        q2_score: survey.q2_score,
        q3_score: survey.q3_score,
        q4_score: survey.q4_score,
        q5_score: survey.q5_score,
        q6_score: survey.q6_score,
        q7_score: survey.q7_score,
        q8_score: survey.q8_score,
        q9_score: survey.q9_score,
        q10_score: survey.q10_score,
        q11_score: survey.q11_score,
        overall_score: survey.overall_score,
        comments: survey.comments,
        average_rating: Math.round(average_rating * 10) / 10
      };
    }) || [];

    return res.status(200).json({ success: true, data: responses });
  } catch (error: any) {
    console.error('Error in responses endpoint:', error);
    return res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan server',
      details: error.message
    });
  }
}
