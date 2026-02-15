import { supabase } from '../utils/supabaseClient';
import api, { isVercelProduction } from './api';

interface SurveyStats {
  total_surveys: number;
  total_responses: number;
  average_completion_rate: number;
  active_surveys: number;
  ikm_score?: number;
  nps_score?: number;
  response_rate?: number;
  average_q1?: number;
  average_q2?: number;
  average_q3?: number;
  average_q4?: number;
  average_q5?: number;
  average_q6?: number;
  average_q7?: number;
  average_q8?: number;
}

interface SurveyResponse {
  id: string;
  date: string;
  unit: string;
  unit_id: string;
  service_type: string;
  visitor_name: string | null;
  visitor_phone: string;
  is_anonymous: boolean;
  age_range: string;
  gender: string;
  q1_score: number | null;
  q2_score: number | null;
  q3_score: number | null;
  q4_score: number | null;
  q5_score: number | null;
  q6_score: number | null;
  q7_score: number | null;
  q8_score: number | null;
  overall_score: number | null;
  comments: string | null;
  average_rating: number;
}

interface UnitIKM {
  unit_id: string;
  unit_name: string;
  total_responses: number;
  average_score: number;
  ikm_score: number;
}

interface AddressStats {
  name: string;
  count: number;
  percentage: number;
}

// Fungsi untuk menghitung IKM dari rata-rata skor
const calculateIKM = (avgScore: number): number => {
  return (avgScore / 5) * 100;
};

// Fungsi untuk menghitung NPS
const calculateNPS = (responses: any[]): number => {
  if (responses.length === 0) return 0;
  
  let promoters = 0;
  let detractors = 0;
  
  responses.forEach(r => {
    // Hitung average dari q1-q8 scores
    const scores = [
      r.q1_score, r.q2_score, r.q3_score, r.q4_score,
      r.q5_score, r.q6_score, r.q7_score, r.q8_score
    ].filter(s => s !== null && s !== undefined);
    
    const avgRating = scores.length > 0 
      ? scores.reduce((a, b) => a + b, 0) / scores.length 
      : 0;
    
    if (avgRating >= 4) promoters++;
    else if (avgRating <= 2) detractors++;
  });
  
  return Math.round(((promoters - detractors) / responses.length) * 100);
};

export const surveyService = {
  // Ambil statistik survey
  async getStats(params: { start_date: string; end_date: string; unit_id?: string }): Promise<SurveyStats> {
    // Jika backend tersedia, gunakan API
    if (!isVercelProduction()) {
      try {
        const res = await api.get('/public/surveys/stats', { params, timeout: 3000 });
        if (res.data?.success) return res.data.data;
        if (res.data) return res.data;
      } catch (err) {
        console.warn('API tidak tersedia, menggunakan Supabase langsung');
      }
    }

    // Fallback ke Supabase langsung
    let query = supabase
      .from('public_surveys')
      .select('*')
      .gte('created_at', params.start_date)
      .lte('created_at', params.end_date + 'T23:59:59');

    if (params.unit_id) {
      query = query.eq('unit_id', params.unit_id);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    
    const responses = data || [];
    const totalResponses = responses.length;
    
    // Hitung rata-rata per pertanyaan
    const avgScores = {
      q1: 0, q2: 0, q3: 0, q4: 0, q5: 0, q6: 0, q7: 0, q8: 0
    };
    
    if (totalResponses > 0) {
      responses.forEach((r: any) => {
        avgScores.q1 += r.q1_score || 0;
        avgScores.q2 += r.q2_score || 0;
        avgScores.q3 += r.q3_score || 0;
        avgScores.q4 += r.q4_score || 0;
        avgScores.q5 += r.q5_score || 0;
        avgScores.q6 += r.q6_score || 0;
        avgScores.q7 += r.q7_score || 0;
        avgScores.q8 += r.q8_score || 0;
      });
      
      Object.keys(avgScores).forEach(key => {
        avgScores[key as keyof typeof avgScores] /= totalResponses;
      });
    }
    
    // Hitung IKM (rata-rata dari semua pertanyaan)
    const overallAvg = Object.values(avgScores).reduce((a, b) => a + b, 0) / 8;
    const ikmScore = calculateIKM(overallAvg);
    
    return {
      total_surveys: 1,
      total_responses: totalResponses,
      average_completion_rate: 100,
      active_surveys: 1,
      ikm_score: ikmScore,
      nps_score: calculateNPS(responses),
      response_rate: 100,
      average_q1: avgScores.q1,
      average_q2: avgScores.q2,
      average_q3: avgScores.q3,
      average_q4: avgScores.q4,
      average_q5: avgScores.q5,
      average_q6: avgScores.q6,
      average_q7: avgScores.q7,
      average_q8: avgScores.q8,
    };
  },

  // Ambil responses
  async getResponses(params: { start_date: string; end_date: string; unit_id?: string }): Promise<SurveyResponse[]> {
    // Jika backend tersedia, gunakan API
    if (!isVercelProduction()) {
      try {
        const res = await api.get('/public/surveys/responses', { params, timeout: 3000 });
        if (res.data?.success) return res.data.data || [];
        if (Array.isArray(res.data)) return res.data;
        if (res.data?.data && Array.isArray(res.data.data)) return res.data.data;
      } catch (err) {
        console.warn('API tidak tersedia, menggunakan Supabase langsung');
      }
    }

    // Fallback ke Supabase langsung
    let query = supabase
      .from('public_surveys')
      .select(`
        *,
        units:unit_id (
          id,
          name
        )
      `)
      .gte('created_at', params.start_date)
      .lte('created_at', params.end_date + 'T23:59:59')
      .order('created_at', { ascending: false });

    if (params.unit_id) {
      query = query.eq('unit_id', params.unit_id);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    
    return (data || []).map((r: any) => {
      // Hitung average_rating dari q1-q8 scores
      const scores = [
        r.q1_score, r.q2_score, r.q3_score, r.q4_score,
        r.q5_score, r.q6_score, r.q7_score, r.q8_score
      ].filter(s => s !== null && s !== undefined);
      
      const average_rating = scores.length > 0 
        ? scores.reduce((a, b) => a + b, 0) / scores.length 
        : 0;
      
      return {
        id: r.id,
        date: r.created_at,
        unit: r.units?.name || '-',
        unit_id: r.unit_id,
        service_type: r.service_type || '-',
        visitor_name: r.visitor_name,
        visitor_phone: r.visitor_phone || '-',
        is_anonymous: r.is_anonymous || false,
        age_range: r.age_range || '-',
        gender: r.gender || '-',
        q1_score: r.q1_score,
        q2_score: r.q2_score,
        q3_score: r.q3_score,
        q4_score: r.q4_score,
        q5_score: r.q5_score,
        q6_score: r.q6_score,
        q7_score: r.q7_score,
        q8_score: r.q8_score,
        overall_score: r.overall_score,
        comments: r.comments,
        average_rating
      };
    });
  },

  // Ambil IKM per unit
  async getIKMByUnit(params: { start_date: string; end_date: string; unit_id?: string }): Promise<UnitIKM[]> {
    // Jika backend tersedia, gunakan API
    if (!isVercelProduction()) {
      try {
        const res = await api.get('/public/surveys/ikm-by-unit', { params, timeout: 3000 });
        if (res.data?.success) return res.data.data || [];
        if (Array.isArray(res.data)) return res.data;
        if (res.data?.data && Array.isArray(res.data.data)) return res.data.data;
      } catch (err) {
        console.warn('API tidak tersedia, menggunakan Supabase langsung');
      }
    }

    // Fallback ke Supabase langsung
    let query = supabase
      .from('public_surveys')
      .select(`
        *,
        units:unit_id (
          id,
          name
        )
      `)
      .gte('created_at', params.start_date)
      .lte('created_at', params.end_date + 'T23:59:59');

    if (params.unit_id) {
      query = query.eq('unit_id', params.unit_id);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    
    // Group by unit
    const unitMap = new Map<string, { responses: any[]; unit_name: string }>();
    
    (data || []).forEach((r: any) => {
      const unitId = r.unit_id;
      const unitName = r.units?.name || 'Unknown';
      
      if (!unitMap.has(unitId)) {
        unitMap.set(unitId, { responses: [], unit_name: unitName });
      }
      
      unitMap.get(unitId)!.responses.push(r);
    });
    
    // Calculate IKM per unit
    const result: UnitIKM[] = [];
    
    unitMap.forEach((value, unitId) => {
      const responses = value.responses;
      const totalResponses = responses.length;
      
      if (totalResponses === 0) return;
      
      // Hitung rata-rata semua pertanyaan
      let totalScore = 0;
      responses.forEach(r => {
        const scores = [
          r.q1_score, r.q2_score, r.q3_score, r.q4_score,
          r.q5_score, r.q6_score, r.q7_score, r.q8_score
        ].filter(s => s !== null);
        
        if (scores.length > 0) {
          totalScore += scores.reduce((a, b) => a + b, 0) / scores.length;
        }
      });
      
      const avgScore = totalScore / totalResponses;
      const ikmScore = calculateIKM(avgScore);
      
      result.push({
        unit_id: unitId,
        unit_name: value.unit_name,
        total_responses: totalResponses,
        average_score: avgScore,
        ikm_score: ikmScore
      });
    });
    
    return result.sort((a, b) => b.ikm_score - a.ikm_score);
  },

  // Ambil statistik alamat
  async getAddressStats(params: { 
    start_date: string; 
    end_date: string; 
    unit_id?: string;
    group_by: 'kabupaten_kota' | 'kecamatan' | 'kelurahan';
  }): Promise<AddressStats[]> {
    // Jika backend tersedia, gunakan API
    if (!isVercelProduction()) {
      try {
        const res = await api.get('/public/surveys/address-stats', { params, timeout: 3000 });
        if (res.data?.success) return res.data.data || [];
      } catch (err) {
        console.warn('API tidak tersedia, menggunakan Supabase langsung');
      }
    }

    // Fallback ke Supabase langsung
    let query = supabase
      .from('public_surveys')
      .select('kabupaten_kota, kecamatan, kelurahan')
      .gte('created_at', params.start_date)
      .lte('created_at', params.end_date + 'T23:59:59');

    if (params.unit_id) {
      query = query.eq('unit_id', params.unit_id);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    
    // Group by field
    const field = params.group_by;
    const countMap = new Map<string, number>();
    
    (data || []).forEach((r: any) => {
      const value = r[field] || 'Tidak Diketahui';
      countMap.set(value, (countMap.get(value) || 0) + 1);
    });
    
    const total = data?.length || 0;
    
    const result: AddressStats[] = [];
    countMap.forEach((count, name) => {
      result.push({
        name,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0
      });
    });
    
    return result.sort((a, b) => b.count - a.count);
  }
};
