import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
// Vercel akan inject environment variables dari dashboard
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
// Gunakan ANON KEY untuk public operations (RLS policy sudah allow INSERT untuk semua)
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials.');
  console.error('   SUPABASE_URL:', supabaseUrl ? 'SET' : 'NOT SET');
  console.error('   SUPABASE_KEY:', supabaseKey ? 'SET (length: ' + supabaseKey.length + ')' : 'NOT SET');
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
  console.log('📍 Request headers:', JSON.stringify(req.headers, null, 2));
  console.log('📍 Request body type:', typeof req.body);
  console.log('📍 Request body:', JSON.stringify(req.body, null, 2));
  
  // PERBAIKAN: Wrapper untuk memastikan SELALU return JSON
  try {
    // Only allow POST
    if (req.method !== 'POST') {
      console.log('❌ Method not allowed:', req.method);
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
    
    // Validasi request body
    if (!req.body || typeof req.body !== 'object') {
      console.error('❌ Invalid request body:', req.body);
      return res.status(400).json({
        success: false,
        error: 'Request body tidak valid',
        details: 'Body harus berupa JSON object'
      });
    }
    
    // Log raw body untuk debugging
    console.log('📥 Raw request body keys:', Object.keys(req.body || {}));
    console.log('📥 Body sample:', JSON.stringify(req.body || {}).substring(0, 500));
    
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
      // Skor 11 unsur IKM (sesuai dengan form - frontend mengirim u1_score, u2_score, dst)
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
      source,
      has_scores: !!(u1_score || u2_score || u3_score || u4_score || u5_score || u6_score || u7_score || u8_score || u9_score || u10_score || u11_score)
    });

    // Validasi source
    const validSources = ['web', 'qr_code', 'mobile', 'email', 'phone', 'public_survey'];
    const finalSource = validSources.includes(source) ? source : 'public_survey';
    console.log('✅ Using source:', finalSource);

    // Validasi unit (optional - hanya jika unit_id diberikan dan bukan string kosong)
    let unitData = null;
    let finalUnitId = null;
    
    if (unit_id && unit_id.trim() !== '') {
      try {
        // Cek apakah unit_id adalah UUID yang valid
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(unit_id)) {
          console.warn('⚠️ Unit ID bukan UUID yang valid, akan di-set null:', unit_id);
          finalUnitId = null;
        } else {
          const { data, error: unitCheckError } = await supabase
            .from('units')
            .select('id, name')
            .eq('id', unit_id)
            .eq('is_active', true)
            .single();

          if (unitCheckError || !data) {
            console.warn('⚠️ Unit tidak ditemukan atau tidak aktif, akan di-set null:', unit_id, unitCheckError?.message);
            finalUnitId = null;
          } else {
            unitData = data;
            finalUnitId = unit_id;
            console.log('✅ Unit verified:', unitData.name);
          }
        }
      } catch (unitError: any) {
        console.warn('⚠️ Error validating unit, akan di-set null:', unitError.message);
        finalUnitId = null;
      }
    }

    // Validasi service_category_id (optional - hanya jika diberikan dan bukan string kosong)
    let finalServiceCategoryId = null;
    
    if (service_category_id && service_category_id.trim() !== '') {
      try {
        // Cek apakah service_category_id adalah UUID yang valid
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(service_category_id)) {
          console.warn('⚠️ Service Category ID bukan UUID yang valid, akan di-set null:', service_category_id);
          finalServiceCategoryId = null;
        } else {
          const { data, error: categoryCheckError } = await supabase
            .from('service_categories')
            .select('id, name')
            .eq('id', service_category_id)
            .single();

          if (categoryCheckError || !data) {
            console.warn('⚠️ Service Category tidak ditemukan, akan di-set null:', service_category_id, categoryCheckError?.message);
            finalServiceCategoryId = null;
          } else {
            finalServiceCategoryId = service_category_id;
            console.log('✅ Service Category verified:', data.name);
          }
        }
      } catch (categoryError: any) {
        console.warn('⚠️ Error validating service category, akan di-set null:', categoryError.message);
        finalServiceCategoryId = null;
      }
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
      unit_id: finalUnitId, // Gunakan finalUnitId yang sudah divalidasi
      service_category_id: finalServiceCategoryId, // Gunakan finalServiceCategoryId yang sudah divalidasi
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
      q1_score: u1_score ? (typeof u1_score === 'number' ? u1_score : parseInt(u1_score as string)) : null,
      q2_score: u2_score ? (typeof u2_score === 'number' ? u2_score : parseInt(u2_score as string)) : null,
      q3_score: u3_score ? (typeof u3_score === 'number' ? u3_score : parseInt(u3_score as string)) : null,
      q4_score: u4_score ? (typeof u4_score === 'number' ? u4_score : parseInt(u4_score as string)) : null,
      q5_score: u5_score ? (typeof u5_score === 'number' ? u5_score : parseInt(u5_score as string)) : null,
      q6_score: u6_score ? (typeof u6_score === 'number' ? u6_score : parseInt(u6_score as string)) : null,
      q7_score: u7_score ? (typeof u7_score === 'number' ? u7_score : parseInt(u7_score as string)) : null,
      q8_score: u8_score ? (typeof u8_score === 'number' ? u8_score : parseInt(u8_score as string)) : null,
      q9_score: u9_score ? (typeof u9_score === 'number' ? u9_score : parseInt(u9_score as string)) : null,
      q10_score: u10_score ? (typeof u10_score === 'number' ? u10_score : parseInt(u10_score as string)) : null,
      q11_score: u11_score ? (typeof u11_score === 'number' ? u11_score : parseInt(u11_score as string)) : null,
      // Skor agregat
      overall_score: overall_score ? (typeof overall_score === 'number' ? overall_score : parseInt(overall_score as string)) : null,
      comments: comments || null,
      qr_code: qr_code || null,
      source: finalSource,
      ip_address: null,
      user_agent: null
    };
    
    console.log('📤 Inserting survey data:', {
      unit_id: surveyData.unit_id,
      service_category_id: surveyData.service_category_id,
      visitor_phone: surveyData.visitor_phone,
      is_anonymous: surveyData.is_anonymous,
      has_scores: scores.length > 0,
      source: surveyData.source,
      has_address: !!(surveyData.kabupaten_kota && surveyData.kecamatan),
      has_demographics: !!(surveyData.age_range && surveyData.gender && surveyData.education && surveyData.job)
    });

    const { data: survey, error: surveyError } = await supabase
      .from('public_surveys')
      .insert([surveyData])
      .select()
      .single();

    if (surveyError) {
      console.error('❌ Error inserting survey:', surveyError);
      console.error('❌ Error code:', surveyError.code);
      console.error('❌ Error message:', surveyError.message);
      console.error('❌ Error details:', surveyError.details);
      console.error('❌ Error hint:', surveyError.hint);
      console.error('❌ Survey data yang gagal:', JSON.stringify(surveyData, null, 2));
      
      let errorMessage = 'Gagal menyimpan survei';
      let errorDetails = null;
      
      if (surveyError.code === '23503') {
        // Foreign key violation
        errorMessage = 'Data referensi tidak valid';
        errorDetails = 'Unit atau kategori layanan tidak ditemukan di database';
      } else if (surveyError.code === '23502') {
        // Not null violation
        errorMessage = 'Ada kolom wajib yang belum diisi';
        errorDetails = surveyError.message;
      } else if (surveyError.code === '22P02') {
        // Invalid text representation
        errorMessage = 'Format data tidak valid';
        errorDetails = 'UUID atau tipe data salah';
      } else if (surveyError.code === '42703') {
        // Undefined column
        errorMessage = 'Kolom database tidak ditemukan';
        errorDetails = surveyError.message;
      } else if (surveyError.message) {
        errorMessage = surveyError.message;
        errorDetails = surveyError.details || surveyError.hint;
      }
      
      return res.status(500).json({
        success: false,
        error: errorMessage,
        details: errorDetails,
        error_code: surveyError.code,
        error_message: surveyError.message,
        debug_info: {
          unit_id: surveyData.unit_id,
          service_category_id: surveyData.service_category_id,
          has_phone: !!surveyData.visitor_phone
        }
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
