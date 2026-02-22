import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { getUserInfo, applyUnitFilter } from '../middleware/accessControl';
import { logSuccessfulAccess } from '../utils/auditLog';

// Initialize Supabase client
// PERBAIKAN CRITICAL: Gunakan SERVICE_ROLE_KEY untuk bypass RLS saat membuat notifikasi
// Prioritas: SERVICE_ROLE_KEY dulu (untuk bypass RLS), baru ANON_KEY (fallback)
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

console.log('🔧 Environment check (external-tickets handler):');
console.log('   SUPABASE_URL:', process.env.SUPABASE_URL ? 'EXISTS' : 'MISSING');
console.log('   SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'EXISTS (preferred for RLS bypass)' : 'MISSING');
console.log('   SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? `EXISTS (fallback, length: ${process.env.SUPABASE_ANON_KEY.length})` : 'MISSING');
console.log('   Using key type:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SERVICE_ROLE' : 'ANON');
console.log('   Final supabaseUrl:', supabaseUrl ? `SET (${supabaseUrl.substring(0, 40)}...)` : 'NOT SET');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  console.error('   All env vars with SUPABASE:', Object.keys(process.env).filter(k => k.includes('SUPABASE')));
}

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
}) : null;

// Helper function to generate ticket number
async function generateTicketNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const { data: lastTicket } = await supabase
    .from('tickets')
    .select('ticket_number')
    .like('ticket_number', `TKT-${year}-%`)
    .order('created_at', { ascending: false })
    .limit(1);

  let nextNumber = 1;
  if (lastTicket && lastTicket.length > 0) {
    const lastNumber = parseInt(lastTicket[0].ticket_number.split('-')[2]);
    nextNumber = lastNumber + 1;
  }

  return `TKT-${year}-${nextNumber.toString().padStart(4, '0')}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CRITICAL: Set headers PERTAMA
  const setHeaderSafe = (key: string, value: string) => {
    try {
      if (!res.headersSent) {
        res.setHeader(key, value);
      }
    } catch (headerError) {
      console.error('❌ Failed to set headers:', headerError);
    }
  };
  
  setHeaderSafe('Access-Control-Allow-Origin', '*');
  setHeaderSafe('Access-Control-Allow-Methods', 'POST, OPTIONS');
  setHeaderSafe('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization');
  setHeaderSafe('Content-Type', 'application/json; charset=utf-8');
  setHeaderSafe('Cache-Control', 'no-cache, no-store, must-revalidate');
  setHeaderSafe('X-Content-Type-Options', 'nosniff');
  
  try {
    console.log('🎯 Vercel Function: /api/public/external-tickets');
    console.log('📍 Method:', req.method);
    console.log('📍 Headers:', JSON.stringify(req.headers, null, 2));
    console.log('📍 Body type:', typeof req.body);
    console.log('📍 Body:', JSON.stringify(req.body, null, 2));
    
    // Handle OPTIONS request
    if (req.method === 'OPTIONS') {
      return res.status(200).json({ success: true });
    }

    // Handle GET - List external tickets dengan access control
    if (req.method === 'GET') {
      console.log('🎯 GET /api/public/external-tickets');
      
      if (!supabase) {
        return res.status(500).json({
          success: false,
          error: 'Konfigurasi server tidak lengkap'
        });
      }

      // Extract user info untuk access control
      const userInfo = await getUserInfo(req, supabase);
      console.log('👤 User info:', userInfo);

      // Get query parameters for filtering
      const {
        status,
        priority,
        unit_id,
        service_type,
        date_from,
        date_to,
        search,
        limit = '100'
      } = req.query;

      console.log('📥 Query params:', { status, priority, unit_id, service_type, limit });

      // Build query
      let query = supabase
        .from('tickets')
        .select(`
          *,
          units!tickets_unit_id_fkey(id, name, code),
          service_categories!tickets_category_id_fkey(id, name),
          patient_types!tickets_patient_type_id_fkey(id, name)
        `)
        .order('created_at', { ascending: false });

      // Apply unit-based access control FIRST
      query = applyUnitFilter(query, userInfo, 'unit_id');

      // Apply filters
      if (status && status !== 'all') {
        query = query.eq('status', status);
      }

      if (priority && priority !== 'all') {
        query = query.eq('priority', priority);
      }

      // Note: unit_id filter dari query params akan override unit filter dari access control
      // Ini hanya untuk superadmin/direktur yang bisa pilih unit tertentu
      if (unit_id) {
        query = query.eq('unit_id', unit_id);
      }

      if (service_type && service_type !== 'all') {
        query = query.eq('type', service_type);
      }

      if (date_from) {
        query = query.gte('created_at', date_from);
      }

      if (date_to) {
        query = query.lte('created_at', date_to);
      }

      if (search) {
        query = query.or(`ticket_number.ilike.%${search}%,title.ilike.%${search}%,description.ilike.%${search}%`);
      }

      // Apply limit
      const limitNum = parseInt(limit as string) || 100;
      query = query.limit(limitNum);

      const { data: tickets, error } = await query;

      if (error) {
        console.error('❌ Error fetching external tickets:', error);
        return res.status(500).json({
          success: false,
          error: 'Gagal mengambil data tiket eksternal',
          details: error.message
        });
      }

      console.log(`✅ Fetched ${tickets?.length || 0} external tickets`);

      // Log successful access (non-blocking)
      if (userInfo && tickets && tickets.length > 0) {
        (async () => {
          try {
            await logSuccessfulAccess(
              supabase,
              userInfo.id,
              userInfo.role,
              'view',
              'external_ticket',
              'list',
              userInfo.unit_id,
              {
                ip: req.headers['x-forwarded-for'] as string || req.headers['x-real-ip'] as string,
                userAgent: req.headers['user-agent'] as string
              }
            );
          } catch (logError) {
            console.error('Failed to log access (non-critical):', logError);
          }
        })();
      }

      return res.status(200).json({
        success: true,
        data: tickets || [],
        message: 'External tickets berhasil diambil'
      });
    }

    // Only allow POST for creating tickets
    if (req.method !== 'POST') {
      return res.status(405).json({
        success: false,
        error: `Method ${req.method} not allowed. Use GET or POST method.`,
        allowed_methods: ['GET', 'POST', 'OPTIONS']
      });
    }
    
    // Validasi Supabase credentials
    if (!supabaseUrl || !supabaseKey || !supabase) {
      console.error('❌ Supabase credentials missing');
      console.error('   supabaseUrl:', supabaseUrl ? 'SET' : 'NOT SET');
      console.error('   supabaseKey:', supabaseKey ? 'SET' : 'NOT SET');
      console.error('   supabase client:', supabase ? 'INITIALIZED' : 'NOT INITIALIZED');
      console.error('   VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL ? 'SET' : 'NOT SET');
      console.error('   VITE_SUPABASE_ANON_KEY:', process.env.VITE_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET');
      
      return res.status(500).json({
        success: false,
        error: 'Konfigurasi server tidak lengkap. Hubungi administrator.',
        details: 'Supabase credentials not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel environment variables.'
      });
    }
    console.log('🎯 POST /api/public/external-tickets dipanggil');
    
    const {
      reporter_identity_type,
      reporter_name,
      reporter_email,
      reporter_phone,
      reporter_address,
      age_range,
      service_type,
      category,
      service_category_id,
      patient_type_id,
      title,
      description,
      qr_code,
      unit_id,
      source = 'web'
    } = req.body;

    console.log('📥 Received external ticket request:', {
      reporter_identity_type,
      reporter_name,
      unit_id,
      service_type,
      category,
      service_category_id,
      patient_type_id,
      title,
      source,
      body_keys: Object.keys(req.body)
    });

    // Validasi unit_id - HARUS ADA dan tidak boleh kosong
    if (!unit_id || unit_id === '' || unit_id === 'null' || unit_id === 'undefined') {
      console.error('❌ Unit ID tidak valid:', unit_id);
      return res.status(400).json({
        success: false,
        error: 'Unit ID harus diisi dan valid'
      });
    }

    // Validasi format UUID untuk unit_id
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(unit_id)) {
      console.error('❌ Unit ID format tidak valid (bukan UUID):', unit_id);
      return res.status(400).json({
        success: false,
        error: 'Format Unit ID tidak valid. Harus berupa UUID.',
        received_unit_id: unit_id
      });
    }

    // Validasi field wajib
    if (!title || title.trim() === '') {
      console.error('❌ Judul tidak boleh kosong');
      return res.status(400).json({
        success: false,
        error: 'Judul harus diisi'
      });
    }

    if (!description || description.trim() === '') {
      console.error('❌ Deskripsi tidak boleh kosong');
      return res.status(400).json({
        success: false,
        error: 'Deskripsi harus diisi'
      });
    }

    // Validasi service_type
    const validServiceTypes = ['complaint', 'request', 'suggestion', 'survey'];
    if (!service_type || !validServiceTypes.includes(service_type)) {
      console.error('❌ Service type tidak valid:', service_type);
      return res.status(400).json({
        success: false,
        error: 'Jenis layanan harus diisi (complaint, request, suggestion, atau survey)',
        received: service_type,
        valid_types: validServiceTypes
      });
    }

    // Validasi service_category_id - OPSIONAL (bisa kosong atau null)
    let finalServiceCategoryId = null;
    if (service_category_id && service_category_id !== '' && service_category_id !== 'null' && service_category_id !== 'undefined') {
      // Validasi format UUID
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(service_category_id)) {
        // Validasi bahwa category exists di database
        const { data: categoryCheck } = await supabase
          .from('service_categories')
          .select('id')
          .eq('id', service_category_id)
          .eq('is_active', true)
          .single();
        
        if (categoryCheck) {
          finalServiceCategoryId = service_category_id;
          console.log('✅ Using service_category_id:', finalServiceCategoryId);
        } else {
          console.log('⚠️ service_category_id tidak ditemukan di database, akan di-set null');
        }
      } else {
        console.log('⚠️ service_category_id bukan UUID yang valid, akan di-set null');
      }
    } else {
      console.log('⚠️ service_category_id tidak diisi (opsional)');
    }

    // Validasi patient_type_id - OPSIONAL (bisa kosong atau null)
    let finalPatientTypeId = null;
    if (patient_type_id && patient_type_id !== '' && patient_type_id !== 'null' && patient_type_id !== 'undefined') {
      // Validasi format UUID
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(patient_type_id)) {
        // Validasi bahwa patient_type exists di database
        const { data: patientTypeCheck } = await supabase
          .from('patient_types')
          .select('id')
          .eq('id', patient_type_id)
          .eq('is_active', true)
          .single();
        
        if (patientTypeCheck) {
          finalPatientTypeId = patient_type_id;
          console.log('✅ Using patient_type_id:', finalPatientTypeId);
        } else {
          console.log('⚠️ patient_type_id tidak ditemukan di database, akan di-set null');
        }
      } else {
        console.log('⚠️ patient_type_id bukan UUID yang valid, akan di-set null');
      }
    } else {
      console.log('⚠️ patient_type_id tidak diisi (opsional)');
    }

    // Validasi source
    const validSources = ['web', 'qr_code', 'mobile', 'email', 'phone'];
    const finalSource = validSources.includes(source) ? source : 'web';
    console.log('✅ Using source:', finalSource);

    // Verifikasi unit_id exists dan aktif
    console.log('🔍 Verifying unit_id:', unit_id);
    const { data: unitData, error: unitCheckError } = await supabase
      .from('units')
      .select('id, name, is_active')
      .eq('id', unit_id)
      .single();

    if (unitCheckError) {
      console.error('❌ Error checking unit:', unitCheckError);
      return res.status(400).json({
        success: false,
        error: 'Unit tidak ditemukan',
        unit_id: unit_id,
        details: unitCheckError?.message
      });
    }

    if (!unitData) {
      console.error('❌ Unit tidak ditemukan:', unit_id);
      return res.status(400).json({
        success: false,
        error: 'Unit tidak ditemukan',
        unit_id: unit_id
      });
    }

    if (!unitData.is_active) {
      console.error('❌ Unit tidak aktif:', unit_id);
      return res.status(400).json({
        success: false,
        error: 'Unit tidak aktif',
        unit_id: unit_id
      });
    }

    console.log('✅ Unit verified:', unitData.name);

    // Generate ticket number
    const ticketNumber = await generateTicketNumber();
    console.log('✅ Generated ticket number:', ticketNumber);

    // Calculate SLA deadline based on service type
    const slaDeadline = new Date();
    if (service_type === 'complaint') {
      slaDeadline.setHours(slaDeadline.getHours() + 24);
    } else if (service_type === 'request') {
      slaDeadline.setHours(slaDeadline.getHours() + 48);
    } else {
      slaDeadline.setHours(slaDeadline.getHours() + 72);
    }

    const isAnonymous = reporter_identity_type === 'anonymous';

    // Mapping service_type ke type yang valid di database
    const serviceTypeMapping: { [key: string]: string } = {
      'complaint': 'complaint',
      'request': 'information',
      'suggestion': 'suggestion',
      'survey': 'satisfaction'
    };
    
    const mappedType = serviceTypeMapping[service_type] || 'complaint';
    console.log(`✅ Mapped service_type '${service_type}' to type '${mappedType}'`);

    // Determine priority
    let priority = 'medium';
    if (service_type === 'complaint') {
      priority = 'high';
    } else if (service_type === 'request') {
      priority = 'medium';
    } else {
      priority = 'low';
    }

    // Find QR code ID if provided
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

    // Prepare ticket data
    const ticketData: any = {
      ticket_number: ticketNumber,
      type: mappedType,
      title: title,
      description: description,
      unit_id: unit_id,
      priority: priority,
      status: 'open',
      sla_deadline: slaDeadline.toISOString(),
      source: finalSource,
      is_anonymous: isAnonymous,
      submitter_name: isAnonymous ? null : (reporter_name || null),
      submitter_email: isAnonymous ? null : (reporter_email || null),
      submitter_phone: isAnonymous ? null : (reporter_phone || null),
      submitter_address: isAnonymous ? null : (reporter_address || null)
    };

    // Add qr_code_id only if it exists
    if (qr_code_id) {
      ticketData.qr_code_id = qr_code_id;
      console.log('✅ Using qr_code_id:', qr_code_id);
    }

    // Add category_id - OPSIONAL (hanya jika ada dan valid)
    if (finalServiceCategoryId) {
      ticketData.category_id = finalServiceCategoryId;
      console.log('✅ Using category_id:', finalServiceCategoryId);
    } else {
      console.log('⚠️ category_id tidak diisi (opsional)');
    }
    
    // Add patient_type_id - OPSIONAL (hanya jika ada dan valid)
    if (finalPatientTypeId) {
      ticketData.patient_type_id = finalPatientTypeId;
      console.log('✅ Using patient_type_id:', finalPatientTypeId);
    } else {
      console.log('⚠️ patient_type_id tidak diisi (opsional)');
    }

    console.log('📤 Inserting ticket data:', {
      ticket_number: ticketData.ticket_number,
      type: ticketData.type,
      service_type_original: service_type,
      unit_id: ticketData.unit_id,
      priority: ticketData.priority,
      status: ticketData.status,
      source: ticketData.source,
      is_anonymous: ticketData.is_anonymous,
      category_id: ticketData.category_id || 'null',
      patient_type_id: ticketData.patient_type_id || 'null',
      qr_code_id: ticketData.qr_code_id || 'null',
      has_submitter_name: !!ticketData.submitter_name,
      has_submitter_email: !!ticketData.submitter_email
    });

    const { data: ticket, error } = await supabase
      .from('tickets')
      .insert(ticketData)
      .select(`
        *,
        units:unit_id(name, code),
        service_categories:category_id(name),
        patient_types:patient_type_id(name)
      `)
      .single();

    if (error) {
      console.error('❌ Error creating external ticket:', error);
      console.error('❌ Error code:', error.code);
      console.error('❌ Error details:', error.details);
      console.error('❌ Error hint:', error.hint);
      console.error('❌ Error message:', error.message);
      
      let errorMessage = 'Gagal membuat tiket';
      let errorDetails = null;
      
      if (error.code === '23503') {
        // Foreign key violation
        if (error.message.includes('unit_id')) {
          errorMessage = 'Unit tidak valid atau tidak ditemukan';
        } else if (error.message.includes('category_id')) {
          errorMessage = 'Kategori layanan tidak valid';
          errorDetails = 'Silakan pilih kategori layanan yang valid';
        } else if (error.message.includes('patient_type_id')) {
          errorMessage = 'Jenis pasien tidak valid';
          errorDetails = 'Silakan pilih jenis pasien yang valid';
        } else {
          errorMessage = 'Data referensi tidak valid';
          errorDetails = error.details || error.hint;
        }
      } else if (error.code === '23505') {
        errorMessage = 'Nomor tiket sudah ada, silakan coba lagi';
      } else if (error.code === '23514') {
        errorMessage = `Tipe tiket tidak valid. Diterima: ${ticketData.type}. Harus salah satu dari: information, complaint, suggestion, satisfaction`;
      } else if (error.code === '23502') {
        // Not null violation
        errorMessage = 'Field wajib tidak boleh kosong';
        errorDetails = error.message;
      } else if (error.message) {
        errorMessage = error.message;
        errorDetails = error.details || error.hint;
      }
      
      return res.status(500).json({
        success: false,
        error: errorMessage,
        details: errorDetails,
        error_code: error.code,
        debug_info: {
          type: ticketData.type,
          unit_id: ticketData.unit_id,
          category_id: ticketData.category_id || 'not provided',
          patient_type_id: ticketData.patient_type_id || 'not provided'
        }
      });
    }

    console.log('✅ External ticket created successfully:', ticket.ticket_number);

    // Log successful ticket creation (non-blocking)
    const userInfo = await getUserInfo(req, supabase);
    if (userInfo) {
      (async () => {
        try {
          await logSuccessfulAccess(
            supabase,
            userInfo.id,
            userInfo.role,
            'create',
            'external_ticket',
            ticket.id,
            unit_id,
            {
              ip: req.headers['x-forwarded-for'] as string || req.headers['x-real-ip'] as string,
              userAgent: req.headers['user-agent'] as string
            }
          );
        } catch (logError) {
          console.error('Failed to log access (non-critical):', logError);
        }
      })();
    }

    // Update QR code usage count if applicable
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
      ticket_number: ticket.ticket_number,
      data: ticket,
      message: 'Tiket berhasil dibuat. Nomor tiket Anda: ' + ticket.ticket_number
    });
  } catch (error: any) {
    console.error('❌ CRITICAL ERROR in create external ticket handler:', error);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ Error name:', error.name);
    console.error('❌ Error message:', error.message);
    
    // PERBAIKAN: Pastikan header JSON tetap di-set
    try {
      if (!res.headersSent) {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('X-Content-Type-Options', 'nosniff');
      }
    } catch (headerError) {
      console.error('❌ Cannot set header:', headerError);
    }
    
    // Return JSON valid dengan informasi error lengkap
    const errorResponse = {
      success: false,
      error: 'Terjadi kesalahan server: ' + (error.message || 'Unknown error'),
      error_type: error.name || 'UnknownError',
      details: error.stack?.split('\n').slice(0, 3).join('\n') || null,
      timestamp: new Date().toISOString(),
      endpoint: '/api/public/external-tickets'
    };
    
    if (!res.headersSent) {
      res.status(500);
      res.json(errorResponse);
    }
    return;
  }
}
