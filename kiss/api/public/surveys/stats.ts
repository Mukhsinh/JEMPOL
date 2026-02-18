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

    let query = supabase.from('public_surveys').select('*', { count: 'exact' });

    if (start_date) query = query.gte('created_at', start_date);
    if (end_date) query = query.lte('created_at', end_date);
    if (unit_id && unit_id !== 'all') query = query.eq('unit_id', unit_id);

    const { data: surveys, error, count } = await query;

    if (error) {
      console.error('Error fetching survey stats:', error);
      return res.status(500).json({ success: false, error: 'Gagal mengambil statistik survei' });
    }

    const total_responses = count || 0;
    
    // Hitung rata-rata per pertanyaan, hanya dari nilai yang tidak NULL
    const calculateAverage = (field: string) => {
      const values = surveys?.filter(s => s[field] != null && s[field] !== undefined).map(s => Number(s[field])) || [];
      return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
    };

    const avg_q1 = calculateAverage('q1_score');
    const avg_q2 = calculateAverage('q2_score');
    const avg_q3 = calculateAverage('q3_score');
    const avg_q4 = calculateAverage('q4_score');
    const avg_q5 = calculateAverage('q5_score');
    const avg_q6 = calculateAverage('q6_score');
    const avg_q7 = calculateAverage('q7_score');
    const avg_q8 = calculateAverage('q8_score');
    const avg_q9 = calculateAverage('q9_score');
    const avg_q10 = calculateAverage('q10_score');
    const avg_q11 = calculateAverage('q11_score');

    // Hitung IKM: rata-rata dari 11 unsur × 20
    const allScores = [avg_q1, avg_q2, avg_q3, avg_q4, avg_q5, avg_q6, avg_q7, avg_q8, avg_q9, avg_q10, avg_q11];
    const validScores = allScores.filter(s => s > 0);
    const ikm_score = validScores.length > 0 
      ? (validScores.reduce((a, b) => a + b, 0) / validScores.length) * 20
      : 0;

    // Hitung NPS
    const promoters = surveys?.filter(s => {
      if (s.overall_score != null && s.overall_score !== undefined) {
        return Number(s.overall_score) >= 4;
      }
      const scores = [s.q1_score, s.q2_score, s.q3_score, s.q4_score, s.q5_score, 
                      s.q6_score, s.q7_score, s.q8_score, s.q9_score, s.q10_score, s.q11_score]
                      .filter(sc => sc != null && sc !== undefined).map(sc => Number(sc));
      const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
      return avg >= 4;
    }).length || 0;
    
    const detractors = surveys?.filter(s => {
      if (s.overall_score != null && s.overall_score !== undefined) {
        return Number(s.overall_score) <= 2;
      }
      const scores = [s.q1_score, s.q2_score, s.q3_score, s.q4_score, s.q5_score, 
                      s.q6_score, s.q7_score, s.q8_score, s.q9_score, s.q10_score, s.q11_score]
                      .filter(sc => sc != null && sc !== undefined).map(sc => Number(sc));
      const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
      return avg <= 2;
    }).length || 0;
    
    const nps_score = total_responses > 0 
      ? Math.round(((promoters - detractors) / total_responses) * 100)
      : 0;

    const stats = {
      total_surveys: total_responses,
      total_responses,
      average_completion_rate: 100,
      active_surveys: total_responses,
      ikm_score: Math.round(ikm_score * 10) / 10,
      nps_score,
      response_rate: 100,
      average_q1: Math.round(avg_q1 * 10) / 10,
      average_q2: Math.round(avg_q2 * 10) / 10,
      average_q3: Math.round(avg_q3 * 10) / 10,
      average_q4: Math.round(avg_q4 * 10) / 10,
      average_q5: Math.round(avg_q5 * 10) / 10,
      average_q6: Math.round(avg_q6 * 10) / 10,
      average_q7: Math.round(avg_q7 * 10) / 10,
      average_q8: Math.round(avg_q8 * 10) / 10,
      average_q9: Math.round(avg_q9 * 10) / 10,
      average_q10: Math.round(avg_q10 * 10) / 10,
      average_q11: Math.round(avg_q11 * 10) / 10
    };

    return res.status(200).json({ success: true, data: stats });
  } catch (error: any) {
    console.error('Error in stats endpoint:', error);
    return res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan server',
      details: error.message
    });
  }
}
