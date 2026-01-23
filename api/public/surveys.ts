import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
// Vercel akan inject environment variables dari dashboard
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials. Please set VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY in Vercel environment variables.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // PERBAIKAN: Wrapper untuk memastikan SELALU return JSON
  try {
    // Set CORS dan Content-Type headers PERTAMA KALI
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    
    // Handle OPTIONS request
    if (req.method === 'OPTIONS') {
      return res.status(200).json({ success: true });
    }

    // Only allow POST
    if (req.method !== 'POST') {
      return res.status(405).json({
        success: false,
        error: 'Method not allowed'
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
    console.log('🎯 POST /api/public/surveys dipanggil');
    
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
      // Skor pertanyaan (q1-q8)
      q1_score, q2_score, q3_score, q4_score,
      q5_score, q6_score, q7_score, q8_score,
      // Skor indikator (9 unsur x 3 indikator)
      u1_ind1_score, u1_ind2_score, u1_ind3_score,
      u2_ind1_score, u2_ind2_score, u2_ind3_score,
      u3_ind1_score, u3_ind2_score, u3_ind3_score,
      u4_ind1_score, u4_ind2_score, u4_ind3_score,
      u5_ind1_score, u5_ind2_score, u5_ind3_score,
      u6_ind1_score, u6_ind2_score, u6_ind3_score,
      u7_ind1_score, u7_ind2_score, u7_ind3_score,
      u8_ind1_score, u8_ind2_score, u8_ind3_score,
      u9_ind1_score, u9_ind2_score, u9_ind3_score,
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

    // Validasi minimal - hanya visitor_phone yang wajib
    if (!visitor_phone) {
      console.error('❌ Nomor HP tidak ada');
      return res.status(400).json({
        success: false,
        error: 'Nomor HP wajib diisi'
      });
    }
    
    // Validasi unit
    if (!unit_id) {
      console.error('❌ Unit ID tidak ada');
      return res.status(400).json({
        success: false,
        error: 'Unit layanan wajib dipilih'
      });
    }

    // Validasi source
    const validSources = ['web', 'qr_code', 'mobile', 'email', 'phone', 'public_survey'];
    const finalSource = validSources.includes(source) ? source : 'public_survey';
    console.log('✅ Using source:', finalSource);

    // Verifikasi unit exists dan aktif
    const { data: unitData, error: unitCheckError } = await supabase
      .from('units')
      .select('id, name')
      .eq('id', unit_id)
      .eq('is_active', true)
      .single();

    if (unitCheckError || !unitData) {
      console.error('❌ Unit tidak valid atau tidak aktif:', unit_id);
      return res.status(400).json({
        success: false,
        error: 'Unit tidak valid atau tidak aktif',
        unit_id: unit_id,
        details: unitCheckError?.message
      });
    }

    console.log('✅ Unit verified:', unitData.name);

    // Hitung skor rata-rata dari q1-q8 jika ada
    const scores = [
      q1_score, q2_score, q3_score, q4_score,
      q5_score, q6_score, q7_score, q8_score
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

    // Simpan ke tabel public_surveys - ADOPSI DARI EXTERNAL TICKETS
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
      is_anonymous: is_anonymous || false,
      // Skor 8 pertanyaan
      q1_score: q1_score ? parseInt(q1_score as string) : null,
      q2_score: q2_score ? parseInt(q2_score as string) : null,
      q3_score: q3_score ? parseInt(q3_score as string) : null,
      q4_score: q4_score ? parseInt(q4_score as string) : null,
      q5_score: q5_score ? parseInt(q5_score as string) : null,
      q6_score: q6_score ? parseInt(q6_score as string) : null,
      q7_score: q7_score ? parseInt(q7_score as string) : null,
      q8_score: q8_score ? parseInt(q8_score as string) : null,
      // Skor indikator (9 unsur x 3 indikator)
      u1_ind1_score: u1_ind1_score ? parseInt(u1_ind1_score as string) : null,
      u1_ind2_score: u1_ind2_score ? parseInt(u1_ind2_score as string) : null,
      u1_ind3_score: u1_ind3_score ? parseInt(u1_ind3_score as string) : null,
      u2_ind1_score: u2_ind1_score ? parseInt(u2_ind1_score as string) : null,
      u2_ind2_score: u2_ind2_score ? parseInt(u2_ind2_score as string) : null,
      u2_ind3_score: u2_ind3_score ? parseInt(u2_ind3_score as string) : null,
      u3_ind1_score: u3_ind1_score ? parseInt(u3_ind1_score as string) : null,
      u3_ind2_score: u3_ind2_score ? parseInt(u3_ind2_score as string) : null,
      u3_ind3_score: u3_ind3_score ? parseInt(u3_ind3_score as string) : null,
      u4_ind1_score: u4_ind1_score ? parseInt(u4_ind1_score as string) : null,
      u4_ind2_score: u4_ind2_score ? parseInt(u4_ind2_score as string) : null,
      u4_ind3_score: u4_ind3_score ? parseInt(u4_ind3_score as string) : null,
      u5_ind1_score: u5_ind1_score ? parseInt(u5_ind1_score as string) : null,
      u5_ind2_score: u5_ind2_score ? parseInt(u5_ind2_score as string) : null,
      u5_ind3_score: u5_ind3_score ? parseInt(u5_ind3_score as string) : null,
      u6_ind1_score: u6_ind1_score ? parseInt(u6_ind1_score as string) : null,
      u6_ind2_score: u6_ind2_score ? parseInt(u6_ind2_score as string) : null,
      u6_ind3_score: u6_ind3_score ? parseInt(u6_ind3_score as string) : null,
      u7_ind1_score: u7_ind1_score ? parseInt(u7_ind1_score as string) : null,
      u7_ind2_score: u7_ind2_score ? parseInt(u7_ind2_score as string) : null,
      u7_ind3_score: u7_ind3_score ? parseInt(u7_ind3_score as string) : null,
      u8_ind1_score: u8_ind1_score ? parseInt(u8_ind1_score as string) : null,
      u8_ind2_score: u8_ind2_score ? parseInt(u8_ind2_score as string) : null,
      u8_ind3_score: u8_ind3_score ? parseInt(u8_ind3_score as string) : null,
      u9_ind1_score: u9_ind1_score ? parseInt(u9_ind1_score as string) : null,
      u9_ind2_score: u9_ind2_score ? parseInt(u9_ind2_score as string) : null,
      u9_ind3_score: u9_ind3_score ? parseInt(u9_ind3_score as string) : null,
      // Skor agregat
      overall_score: overall_score ? parseInt(overall_score as string) : avgScore,
      response_time_score: q3_score ? parseInt(q3_score as string) : null,
      solution_quality_score: q5_score ? parseInt(q5_score as string) : null,
      staff_courtesy_score: q7_score ? parseInt(q7_score as string) : null,
      comments: comments || null,
      qr_code: qr_code || null, // PERBAIKAN: Gunakan qr_code seperti external tickets
      source: finalSource,
      ip_address: null, // PERBAIKAN: Tambahkan field seperti external tickets
      user_agent: null // PERBAIKAN: Tambahkan field seperti external tickets
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
    console.error('❌ Error submitting public survey:', error);
    
    // PERBAIKAN: Pastikan header JSON di-set ulang
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    
    return res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan server: ' + (error.message || 'Unknown error'),
      details: error.stack?.split('\n')[0] || null
    });
  } catch (outerError: any) {
    // PERBAIKAN: Catch tambahan untuk error yang tidak tertangkap
    console.error('❌ CRITICAL ERROR:', outerError);
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan kritis pada server'
    });
  }
}
