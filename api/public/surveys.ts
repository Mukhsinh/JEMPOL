import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// PERBAIKAN: Disable body parser bawaan Vercel jika perlu
export const config = {
  api: {
    bodyParser: true, // Pastikan body parser aktif
  },
};

// Initialize Supabase client
// Vercel akan inject environment variables dari dashboard
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials. Please set VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY in Vercel environment variables.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers - PERBAIKAN: Set headers PERTAMA
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization');
  res.setHeader('Content-Type', 'application/json'); // PERBAIKAN: Pastikan response JSON
  
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

  try {
    console.log('📥 Received public survey submission');
    console.log('📍 Request body:', JSON.stringify(req.body).substring(0, 200));
    
    // PERBAIKAN: Validasi Supabase credentials
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Supabase credentials tidak tersedia');
      return res.status(500).json({
        success: false,
        error: 'Konfigurasi server tidak lengkap'
      });
    }
    
    // PERBAIKAN: Validasi body request
    if (!req.body || typeof req.body !== 'object') {
      console.error('❌ Request body tidak valid');
      return res.status(400).json({
        success: false,
        error: 'Request body tidak valid'
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

    // Validasi minimal
    if (!visitor_phone) {
      return res.status(400).json({
        success: false,
        error: 'Nomor HP wajib diisi'
      });
    }
    
    // Validasi unit
    if (!unit_id) {
      return res.status(400).json({
        success: false,
        error: 'Unit layanan wajib dipilih'
      });
    }

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
        error: 'Unit tidak valid atau tidak aktif'
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
      qr_code: qr_code || null,
      source: source
    };
    
    console.log('📝 Survey data to insert:', {
      unit_id: surveyData.unit_id,
      visitor_phone: surveyData.visitor_phone,
      is_anonymous: surveyData.is_anonymous,
      has_scores: scores.length > 0
    });

    const { data: survey, error: surveyError } = await supabase
      .from('public_surveys')
      .insert([surveyData])
      .select()
      .single();

    if (surveyError) {
      console.error('❌ Error inserting survey:', surveyError);
      return res.status(500).json({
        success: false,
        error: 'Gagal menyimpan survei: ' + surveyError.message
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
      } catch (qrError) {
        console.warn('⚠️ Failed to update QR code usage:', qrError);
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Survei berhasil dikirim',
      data: survey
    });

  } catch (error: any) {
    console.error('❌ Error submitting public survey:', error);
    console.error('❌ Error stack:', error.stack);
    
    // PERBAIKAN: Pastikan selalu return JSON yang valid
    return res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan server: ' + (error.message || 'Unknown error'),
      details: error.toString()
    });
  }
}
