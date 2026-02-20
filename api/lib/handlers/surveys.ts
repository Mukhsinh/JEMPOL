import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseClient, isSupabaseConfigured } from '../config/supabase';
import { setAPIHeaders } from '../utils/headers';
import { buildErrorResponse, buildSuccessResponse, buildConfigErrorResponse, buildValidationErrorResponse } from '../utils/response';
import { logRequest, logError, logSuccess, logWarn, logValidationError, logDatabase } from '../utils/logger';
import { validateSurveyData, validateUUID } from '../validators/request';
import { validateUnit, validateCategory, validateQRCode } from '../validators/database';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const endpoint = '/api/public/surveys';
  
  try {
    // Set headers FIRST - before any logic
    setAPIHeaders(res);
    
    // Handle OPTIONS request (preflight)
    if (req.method === 'OPTIONS') {
      return res.status(200).json({ success: true, message: 'CORS preflight OK' });
    }
    
    // Log request
    logRequest(req.method || 'UNKNOWN', endpoint);
    
    // Only allow POST
    if (req.method !== 'POST') {
      logWarn('Method not allowed', { method: req.method });
      return res.status(405).json(
        buildErrorResponse(
          { message: 'Method not allowed. Only POST is supported.' },
          endpoint
        )
      );
    }

    // Validate Supabase configuration
    if (!isSupabaseConfigured()) {
      logError('Supabase not configured', new Error('Missing credentials'));
      return res.status(500).json(buildConfigErrorResponse(endpoint));
    }
    
    const supabase = getSupabaseClient();
    if (!supabase) {
      logError('Supabase client is null', new Error('Client initialization failed'));
      return res.status(500).json(buildConfigErrorResponse(endpoint));
    }
    
    // Validate request body
    if (!req.body || typeof req.body !== 'object') {
      logValidationError('request_body', 'Body must be JSON object', req.body);
      return res.status(400).json(
        buildErrorResponse(
          { message: 'Request body tidak valid', details: 'Body harus berupa JSON object' },
          endpoint
        )
      );
    }
    
    // Extract data from request
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
      u1_score, u2_score, u3_score, u4_score, u5_score,
      u6_score, u7_score, u8_score, u9_score, u10_score, u11_score,
      overall_score,
      comments,
      qr_code,
      source = 'public_survey'
    } = req.body;

    // Validate survey data
    const validationResult = validateSurveyData(req.body);
    if (!validationResult.valid) {
      logValidationError('survey_data', validationResult.errors.join(', '));
      
      // Log detail data untuk debugging
      console.log('❌ Validation failed for survey data:', {
        visitor_phone: req.body.visitor_phone,
        visitor_email: req.body.visitor_email,
        errors: validationResult.errors
      });
      
      // Kembalikan error yang lebih deskriptif
      return res.status(400).json({
        success: false,
        error: 'Validasi data gagal',
        details: validationResult.errors.join(', '),
        field_errors: validationResult.errors,
        timestamp: new Date().toISOString(),
        endpoint
      });
    }

    // Validate source enum
    const validSources = ['web', 'qr_code', 'mobile', 'email', 'phone', 'public_survey'];
    const finalSource = validSources.includes(source) ? source : 'public_survey';

    // Validate unit_id (optional untuk survey)
    let finalUnitId = null;
    if (unit_id && unit_id.trim() !== '') {
      const uuidValidation = validateUUID(unit_id, 'Unit ID');
      if (uuidValidation.valid) {
        const unitValidation = await validateUnit(supabase, unit_id);
        if (unitValidation.valid) {
          finalUnitId = unit_id;
          logSuccess('Unit validated', { unit_name: unitValidation.data?.name });
        } else {
          logWarn('Unit validation failed, setting to null', { unit_id, error: unitValidation.error });
        }
      } else {
        logWarn('Invalid unit UUID, setting to null', { unit_id });
      }
    }

    // Validate service_category_id (optional)
    let finalServiceCategoryId = null;
    if (service_category_id && service_category_id.trim() !== '') {
      const uuidValidation = validateUUID(service_category_id, 'Service Category ID');
      if (uuidValidation.valid) {
        const categoryValidation = await validateCategory(supabase, service_category_id);
        if (categoryValidation.valid) {
          finalServiceCategoryId = service_category_id;
          logSuccess('Category validated', { category_name: categoryValidation.data?.name });
        } else {
          logWarn('Category validation failed, setting to null', { service_category_id, error: categoryValidation.error });
        }
      } else {
        logWarn('Invalid category UUID, setting to null', { service_category_id });
      }
    }

    // Find QR code ID if provided
    let qr_code_id = null;
    if (qr_code && qr_code.trim() !== '') {
      const qrValidation = await validateQRCode(supabase, qr_code);
      if (qrValidation.valid) {
        qr_code_id = qrValidation.data?.id;
        logSuccess('QR code validated', { qr_id: qr_code_id });
      } else {
        logWarn('QR code validation failed', { qr_code, error: qrValidation.error });
      }
    }

    // Prepare survey data for insert
    const surveyData: any = {
      unit_id: finalUnitId,
      service_category_id: finalServiceCategoryId,
      visitor_name: is_anonymous ? null : visitor_name,
      visitor_email: is_anonymous ? null : visitor_email,
      visitor_phone: visitor_phone || null,
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
      // Map u1_score to q1_score, etc.
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
      overall_score: overall_score ? (typeof overall_score === 'number' ? overall_score : parseInt(overall_score as string)) : null,
      comments: comments || null,
      qr_code: qr_code || null,
      source: finalSource,
      ip_address: null,
      user_agent: null
    };

    // Insert survey into database
    logDatabase('INSERT', 'public_surveys', { has_unit: !!finalUnitId, source: finalSource });
    
    const { data: survey, error: surveyError } = await supabase
      .from('public_surveys')
      .insert([surveyData])
      .select()
      .single();

    if (surveyError) {
      logError('Failed to insert survey', surveyError, { surveyData });
      return res.status(500).json(buildErrorResponse(surveyError, endpoint));
    }

    logSuccess('Survey saved successfully', { survey_id: survey.id });

    // Update QR code usage count (non-blocking)
    if (qr_code_id) {
      (async () => {
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

          logSuccess('QR code usage updated', { qr_id: qr_code_id });
        } catch (error: any) {
          logWarn('Failed to update QR code usage (non-critical)', { qr_id: qr_code_id, error: error.message });
        }
      })();
    }

    // Return success response
    return res.status(201).json(
      buildSuccessResponse(
        {
          id: survey.id,
          created_at: survey.created_at
        },
        'Survei berhasil dikirim'
      )
    );

  } catch (error: any) {
    logError('CRITICAL ERROR in survey handler', error, { endpoint });
    
    // Ensure JSON response even on critical error
    const errorResponse = buildErrorResponse(error, endpoint);
    
    if (!res.headersSent) {
      return res.status(500).json(errorResponse);
    }
  }
}
