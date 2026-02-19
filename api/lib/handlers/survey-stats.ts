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
    const { type, start_date, end_date, unit_id, group_by = 'kabupaten_kota' } = req.query;

    switch (type) {
      case 'address':
        return await handleAddressStats(req, res, { start_date, end_date, unit_id, group_by });
      case 'ikm-by-unit':
        return await handleIKMByUnit(req, res, { start_date, end_date, unit_id });
      case 'responses':
        return await handleResponses(req, res, { start_date, end_date, unit_id });
      case 'stats':
      default:
        return await handleStats(req, res, { start_date, end_date, unit_id });
    }
  } catch (error: any) {
    console.error('Error in survey-stats endpoint:', error);
    return res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan server',
      details: error.message
    });
  }
}

async function handleAddressStats(req: VercelRequest, res: VercelResponse, params: any) {
  const { start_date, end_date, unit_id, group_by } = params;
  
  const validGroupBy = ['kabupaten_kota', 'kecamatan', 'kelurahan'];
  const groupByField = validGroupBy.includes(group_by as string) ? group_by as string : 'kabupaten_kota';

  let query = supabase.from('public_surveys').select(groupByField);

  if (start_date) query = query.gte('created_at', start_date);
  if (end_date) query = query.lte('created_at', end_date);
  if (unit_id && unit_id !== 'all') query = query.eq('unit_id', unit_id);

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
}

async function handleIKMByUnit(req: VercelRequest, res: VercelResponse, params: any) {
  const { start_date, end_date, unit_id } = params;

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
}

async function handleResponses(req: VercelRequest, res: VercelResponse, params: any) {
  const { start_date, end_date, unit_id } = params;

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
}

async function handleStats(req: VercelRequest, res: VercelResponse, params: any) {
  const { start_date, end_date, unit_id } = params;

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
  // Hanya hitung dari unsur yang memiliki data
  const allScores = [avg_q1, avg_q2, avg_q3, avg_q4, avg_q5, avg_q6, avg_q7, avg_q8, avg_q9, avg_q10, avg_q11];
  const validScores = allScores.filter(s => s > 0);
  const ikm_score = validScores.length > 0 
    ? (validScores.reduce((a, b) => a + b, 0) / validScores.length) * 20
    : 0;

  // Hitung NPS: (% Promoters - % Detractors)
  // Promoters: rating >= 4, Detractors: rating <= 2
  // Gunakan overall_score jika ada, jika tidak hitung dari rata-rata q1-q11
  const promoters = surveys?.filter(s => {
    if (s.overall_score != null && s.overall_score !== undefined) {
      return Number(s.overall_score) >= 4;
    }
    // Fallback: hitung dari rata-rata q1-q11
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
    // Fallback: hitung dari rata-rata q1-q11
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
}
