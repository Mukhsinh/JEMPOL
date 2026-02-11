import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client - gunakan variable yang benar (tanpa VITE_ prefix untuk backend)
// Vercel akan inject environment variables dari dashboard
// PERBAIKAN: Prioritaskan VITE_ prefix karena itu yang ada di .env.production
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel environment variables.');
  console.error('   SUPABASE_URL:', supabaseUrl ? 'SET' : 'NOT SET');
  console.error('   SUPABASE_KEY:', supabaseKey ? 'SET' : 'NOT SET');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers PERTAMA KALI
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization');
  
  // Handle OPTIONS request (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Set Content-Type untuk response JSON
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  
  console.log('🎯 POST /api/public/surveys dipanggil');
  console.log('📍 Request method:', req.method);
  console.log('📍 Request URL:', req.url);
  
  // PERBAIKAN: Wrapper untuk memastikan SELALU return JSON
  try {
    // Only allow POST
    if (req.method !== 'POST') {
      return res.status(405).json({
        success: false,
        error: 'Method not allowed. Only POST is supported.'
      });
    }

    // Validasi Supabase credentials
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Supabase credentials missing');
      return res.status(500).json({
        success: false,
        error: 'Konfigurasi server tidak lengkap. Hubungi administrator.',
        details: 'Supabase credentials not configured'
      });
    }
    
    const {
      unit_id,
      service_type,
      service_category_id,
      visitor_name,
      visitor_email,
      visitor_phone,
      is_anonymous,
      age_range,
      gender,
      education,
      job,
      patient_type,
      regency,
      district,
      address_detail,
      // Skor 11 unsur IKM (sesuai dengan form)
      u1_score, u2_score, u3_score, u4_score, u5_score,
      u6_score, u7_score, u8_score, u9_score, u10_score, u11_score,
      overall_score,
      comments,
      qr_code,
      source = 'public_survey'
    } = req.body;

    console.log('📥 Received survey request:', {
      unit_id,
      visitor_phone,
      is_anonymous,
      service_type,
      source
    });

    // Validasi source
    const validSources = ['web', 'qr_code', 'mobile', 'email', 'phone', 'public_survey'];
    const finalSource = validSources.includes(source) ? source : 'public_survey';
    console.log('✅ Using source:', finalSource);

    // Validasi unit (optional - hanya jika unit_id diberikan)
    let unitData = null;
    if (unit_id) {
      const { data, error: unitCheckError } = await supabase
        .from('units')
        .select('id, name')
        .eq('id', unit_id)
        .eq('is_active', true)
        .single();

      if (unitCheckError || !data) {
        console.error('❌ Unit tidak valid atau tidak aktif:', unit_id);
        return res.status(400).json({
          success: false,
          error: 'Unit tidak valid atau tidak aktif',
          unit_id: unit_id,
          details: unitCheckError?.message
        });
      }
      unitData = data;
      console.log('✅ Unit verified:', unitData.name);
    }

    // Hitung skor rata-rata dari 11 unsur jika ada
    const scores = [
      u1_score, u2_score, u3_score, u4_score, u5_score,
      u6_score, u7_score, u8_score, u9_score, u10_score, u11_score
    ].filter(s => s != null && s !== '').map(s => parseInt(s as string));
    
    const avgScore = scores.length > 0 
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) 
      : null;

    // Find QR code ID if qr_code token provided
    let qr_code_id = null;
    if (qr_code) {
      try {
        const { data: qrData } = await supabase
          .from('qr_codes')
          .select('id')
          .eq('token', qr_code)
          .eq('is_active', true)
          .single();
        
        if (qrData) {
          qr_code_id = qrData.id;
          console.log('✅ Found QR code ID:', qr_code_id);
        }
      } catch (error) {
        console.log('⚠️ Error finding QR code:', error);
      }
    }

    // Simpan ke tabel public_surveys
    const surveyData: any = {
      unit_id: unit_id,
      service_category_id: service_category_id || null,
      visitor_name: is_anonymous ? null : visitor_name,
      visitor_email: is_anonymous ? null : visitor_email,
      visitor_phone: visitor_phone,
      service_type: service_type || null,
      age_range: age_range || null,
      gender: gender || null,
      education: education || null,
      job: job || null,
      patient_type: patient_type || null,
      kabupaten_kota: regency || null,
      kecamatan: district || null,
      alamat_jalan: address_detail || null,
      is_anonymous: is_anonymous || false,
      // Skor 11 unsur IKM (mapping ke kolom q1_score - q11_score di database)
      q1_score: u1_score ? parseInt(u1_score as string) : null,
      q2_score: u2_score ? parseInt(u2_score as string) : null,
      q3_score: u3_score ? parseInt(u3_score as string) : null,
      q4_score: u4_score ? parseInt(u4_score as string) : null,
      q5_score: u5_score ? parseInt(u5_score as string) : null,
      q6_score: u6_score ? parseInt(u6_score as string) : null,
      q7_score: u7_score ? parseInt(u7_score as string) : null,
      q8_score: u8_score ? parseInt(u8_score as string) : null,
      q9_score: u9_score ? parseInt(u9_score as string) : null,
      q10_score: u10_score ? parseInt(u10_score as string) : null,
      q11_score: u11_score ? parseInt(u11_score as string) : null,
      // Skor agregat
      overall_score: overall_score ? parseInt(overall_score as string) : null,
      comments: comments || null,
      qr_code: qr_code || null,
      source: finalSource,
      ip_address: null,
      user_agent: null
    };
    
    console.log('📤 Inserting survey data:', {
      unit_id: surveyData.unit_id,
      visitor_phone: surveyData.visitor_phone,
      is_anonymous: surveyData.is_anonymous,
      has_scores: scores.length > 0,
      source: surveyData.source
    });

    const { data: survey, error: surveyError } = await supabase
      .from('public_surveys')
      .insert([surveyData])
      .select()
      .single();

    if (surveyError) {
      console.error('❌ Error inserting survey:', surveyError);
      
      let errorMessage = 'Gagal menyimpan survei';
      if (surveyError.code === '23503') {
        errorMessage = 'Data referensi tidak valid (unit_id tidak ditemukan)';
      } else if (surveyError.message) {
        errorMessage = surveyError.message;
      }
      
      return res.status(500).json({
        success: false,
        error: errorMessage,
        details: surveyError.details || surveyError.hint || null,
        error_code: surveyError.code
      });
    }

    console.log('✅ Survey saved successfully:', survey.id);

    // Update QR code usage if applicable
    if (qr_code_id) {
      try {
        const { data: currentQR } = await supabase
          .from('qr_codes')
          .select('usage_count')
          .eq('id', qr_code_id)
          .single();

        await supabase
          .from('qr_codes')
          .update({
            usage_count: (currentQR?.usage_count || 0) + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', qr_code_id);

        console.log('✅ Updated QR code usage count');
      } catch (error) {
        console.log('⚠️ Error updating QR code usage:', error);
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Survei berhasil dikirim',
      data: survey
    });

  } catch (error: any) {
    console.error('❌ CRITICAL ERROR submitting public survey:', error);
    console.error('❌ Error stack:', error.stack);
    
    // PERBAIKAN: Pastikan header JSON di-set ulang
    try {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
    } catch (headerError) {
      console.error('❌ Cannot set header:', headerError);
    }
    
    return res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan server: ' + (error.message || 'Unknown error'),
      error_type: error.name || 'UnknownError',
      details: error.stack?.split('\n').slice(0, 3).join('\n') || null,
      timestamp: new Date().toISOString()
    });
  }
}
