import { supabase } from './supabaseClient';

/**
 * Helper function untuk submit survey langsung ke Supabase
 * Digunakan sebagai fallback ketika backend tidak tersedia (production)
 */
export const submitSurveyDirectly = async (surveyData: any) => {
  try {
    console.log('📝 Submitting survey directly to Supabase:', surveyData);

    // Verifikasi unit exists dan aktif (OPTIONAL - unit_id boleh null)
    let finalUnitId = null;
    if (surveyData.unit_id && surveyData.unit_id.trim() !== '') {
      const { data: unitData, error: unitCheckError } = await supabase
        .from('units')
        .select('id, name')
        .eq('id', surveyData.unit_id)
        .eq('is_active', true)
        .single();

      if (unitCheckError || !unitData) {
        console.warn('⚠️ Unit tidak valid atau tidak aktif, akan di-set null:', surveyData.unit_id);
        finalUnitId = null;
      } else {
        finalUnitId = surveyData.unit_id;
        console.log('✅ Unit verified:', unitData.name);
      }
    }

    // Hitung skor rata-rata dari semua pertanyaan yang tersedia
    // PERBAIKAN: Cek kedua format (q1-q11 dan u1-u11)
    const scores = [
      // Format standar: 11 unsur survei IKM
      surveyData.q1 || surveyData.u1, 
      surveyData.q2 || surveyData.u2, 
      surveyData.q3 || surveyData.u3, 
      surveyData.q4 || surveyData.u4,
      surveyData.q5 || surveyData.u5, 
      surveyData.q6 || surveyData.u6, 
      surveyData.q7 || surveyData.u7, 
      surveyData.q8 || surveyData.u8,
      surveyData.q9 || surveyData.u9, 
      surveyData.q10 || surveyData.u10, 
      surveyData.q11 || surveyData.u11
    ].filter(s => s != null && s !== '').map(s => parseInt(s as string));
    
    const avgScore = scores.length > 0 
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) 
      : null;

    // Find QR code ID if qr_code token provided
    let qr_code_id = null;
    if (surveyData.qr_code) {
      try {
        const { data: qrData } = await supabase
          .from('qr_codes')
          .select('id')
          .eq('token', surveyData.qr_code)
          .eq('is_active', true)
          .single();
        
        if (qrData) {
          qr_code_id = qrData.id;
        }
      } catch (error) {
        console.log('⚠️ Error finding QR code:', error);
      }
    }

    // Prepare data untuk insert
    const insertData: any = {
      unit_id: finalUnitId, // PERBAIKAN: Gunakan finalUnitId yang sudah divalidasi
      service_category_id: surveyData.service_category_id || null,
      visitor_name: surveyData.is_anonymous ? null : (surveyData.visitor_name || surveyData.full_name),
      visitor_email: surveyData.is_anonymous ? null : surveyData.email,
      visitor_phone: surveyData.phone,
      service_type: surveyData.service_type || null,
      age_range: surveyData.age || surveyData.age_range || null,
      gender: surveyData.gender || null,
      education: surveyData.education || null,
      job: surveyData.job || null,
      patient_type: surveyData.patient_type || null,
      is_anonymous: surveyData.is_anonymous || false,
      // Alamat
      provinsi: surveyData.provinsi || null,
      kabupaten_kota: surveyData.kota_kabupaten || surveyData.kabupaten_kota || null,
      kecamatan: surveyData.kecamatan || null,
      kelurahan: surveyData.kelurahan || null,
      alamat_jalan: surveyData.alamat_detail || surveyData.alamat_jalan || null,
      // Skor 11 pertanyaan survei IKM - PERBAIKAN: Cek kedua format
      q1_score: (surveyData.q1 || surveyData.u1) ? parseInt((surveyData.q1 || surveyData.u1) as string) : null,
      q2_score: (surveyData.q2 || surveyData.u2) ? parseInt((surveyData.q2 || surveyData.u2) as string) : null,
      q3_score: (surveyData.q3 || surveyData.u3) ? parseInt((surveyData.q3 || surveyData.u3) as string) : null,
      q4_score: (surveyData.q4 || surveyData.u4) ? parseInt((surveyData.q4 || surveyData.u4) as string) : null,
      q5_score: (surveyData.q5 || surveyData.u5) ? parseInt((surveyData.q5 || surveyData.u5) as string) : null,
      q6_score: (surveyData.q6 || surveyData.u6) ? parseInt((surveyData.q6 || surveyData.u6) as string) : null,
      q7_score: (surveyData.q7 || surveyData.u7) ? parseInt((surveyData.q7 || surveyData.u7) as string) : null,
      q8_score: (surveyData.q8 || surveyData.u8) ? parseInt((surveyData.q8 || surveyData.u8) as string) : null,
      q9_score: (surveyData.q9 || surveyData.u9) ? parseInt((surveyData.q9 || surveyData.u9) as string) : null,
      q10_score: (surveyData.q10 || surveyData.u10) ? parseInt((surveyData.q10 || surveyData.u10) as string) : null,
      q11_score: (surveyData.q11 || surveyData.u11) ? parseInt((surveyData.q11 || surveyData.u11) as string) : null,
      // Skor agregat
      overall_score: surveyData.overall_satisfaction ? parseInt(surveyData.overall_satisfaction as string) : avgScore,
      response_time_score: (surveyData.q3 || surveyData.u3) ? parseInt((surveyData.q3 || surveyData.u3) as string) : null,
      solution_quality_score: (surveyData.q5 || surveyData.u5) ? parseInt((surveyData.q5 || surveyData.u5) as string) : null,
      staff_courtesy_score: (surveyData.q7 || surveyData.u7) ? parseInt((surveyData.q7 || surveyData.u7) as string) : null,
      comments: surveyData.suggestions || surveyData.comments || null,
      qr_code: surveyData.qr_code || null,
      source: surveyData.source || 'public_survey'
    };

    // Insert ke tabel public_surveys
    const { data: survey, error: surveyError } = await supabase
      .from('public_surveys')
      .insert([insertData])
      .select()
      .single();

    if (surveyError) {
      console.error('❌ Error inserting survey:', surveyError);
      throw new Error(`Gagal menyimpan survei: ${surveyError.message}`);
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
      } catch (qrError) {
        console.warn('⚠️ Failed to update QR code usage:', qrError);
      }
    }

    return {
      success: true,
      message: 'Survei berhasil dikirim',
      data: survey
    };

  } catch (error: any) {
    console.error('❌ Error submitting survey directly:', error);
    throw error;
  }
};
