import express, { Request, Response } from 'express';
import supabase from '../config/supabase.js';

const router = express.Router();

// Get QR code information and unit details
router.get('/qr/:token', async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    const { data: qrCode, error } = await supabase
      .from('qr_codes')
      .select(`
        *,
        units:unit_id(
          id,
          name,
          code,
          description,
          contact_email,
          contact_phone
        )
      `)
      .eq('token', token)
      .eq('is_active', true)
      .single();

    if (error || !qrCode) {
      return res.status(404).json({
        success: false,
        error: 'QR Code tidak valid atau sudah tidak aktif'
      });
    }

    // Update usage count
    await supabase
      .from('qr_codes')
      .update({ usage_count: qrCode.usage_count + 1 })
      .eq('id', qrCode.id);

    res.json({
      success: true,
      data: {
        qr_code: qrCode,
        unit: qrCode.units
      }
    });
  } catch (error) {
    console.error('Error fetching QR code:', error);
    res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan server'
    });
  }
});

// Submit public ticket via QR code
router.post('/qr/:token/tickets', async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const {
      type,
      category_id,
      title,
      description,
      submitter_name,
      submitter_email,
      submitter_phone,
      submitter_address,
      is_anonymous = false
    } = req.body;

    // Validate QR code
    const { data: qrCode, error: qrError } = await supabase
      .from('qr_codes')
      .select('id, unit_id')
      .eq('token', token)
      .eq('is_active', true)
      .single();

    if (qrError || !qrCode) {
      return res.status(404).json({
        success: false,
        error: 'QR Code tidak valid atau sudah tidak aktif'
      });
    }

    // Generate ticket number
    const ticketNumber = await generateTicketNumber();

    // Calculate SLA deadline (default 24 hours)
    const slaDeadline = new Date();
    slaDeadline.setHours(slaDeadline.getHours() + 24);

    const ticketData: any = {
      ticket_number: ticketNumber,
      type,
      category_id,
      title,
      description,
      unit_id: qrCode.unit_id,
      qr_code_id: qrCode.id,
      priority: 'medium',
      status: 'open',
      sla_deadline: slaDeadline.toISOString(),
      source: 'qr_code',
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    };

    // Add submitter info if not anonymous
    if (!is_anonymous) {
      if (submitter_name) ticketData.submitter_name = submitter_name;
      if (submitter_email) ticketData.submitter_email = submitter_email;
      if (submitter_phone) ticketData.submitter_phone = submitter_phone;
      if (submitter_address) ticketData.submitter_address = submitter_address;
    }
    ticketData.is_anonymous = is_anonymous;

    const { data: ticket, error } = await supabase
      .from('tickets')
      .insert(ticketData)
      .select(`
        *,
        units:unit_id(name, code)
      `)
      .single();

    if (error) {
      console.error('Error creating public ticket:', error);
      return res.status(500).json({
        success: false,
        error: 'Gagal membuat tiket'
      });
    }

    res.status(201).json({
      success: true,
      data: ticket,
      message: 'Tiket berhasil dibuat. Nomor tiket Anda: ' + ticket.ticket_number
    });
  } catch (error) {
    console.error('Error in create public ticket:', error);
    res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan server'
    });
  }
});

// Get all public tickets (for dashboard fallback)
router.get('/tickets', async (req: Request, res: Response) => {
  try {
    const { status, unit_id, page = 1, limit = 10 } = req.query;

    let query = supabase
      .from('tickets')
      .select(`
        id,
        ticket_number,
        title,
        status,
        priority,
        created_at,
        units:unit_id(name, code),
        service_categories:category_id(name)
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (status && status !== 'all') query = query.eq('status', status);
    if (unit_id && unit_id !== 'all') query = query.eq('unit_id', unit_id);

    // Apply pagination
    const offset = (Number(page) - 1) * Number(limit);
    query = query.range(offset, offset + Number(limit) - 1);

    const { data: tickets, error, count } = await query;

    if (error) {
      console.error('Error fetching public tickets:', error);
      return res.status(500).json({
        success: false,
        error: 'Gagal mengambil data tiket'
      });
    }

    res.json({
      success: true,
      data: tickets || [],
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count || tickets?.length || 0
      }
    });
  } catch (error) {
    console.error('Error in get public tickets:', error);
    res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan server'
    });
  }
});

// Get public ticket by tracking number
router.get('/tickets/:trackingNumber', async (req: Request, res: Response) => {
  try {
    const { trackingNumber } = req.params;

    // Check if it's a UUID (ticket ID) or ticket number
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trackingNumber);
    
    let query = supabase
      .from('tickets')
      .select(`
        id,
        ticket_number,
        type,
        title,
        description,
        status,
        priority,
        created_at,
        resolved_at,
        units:unit_id(name, code),
        service_categories:category_id(name)
      `);

    if (isUUID) {
      query = query.eq('id', trackingNumber);
    } else {
      query = query.eq('ticket_number', trackingNumber);
    }

    const { data: ticket, error } = await query.single();

    if (error || !ticket) {
      return res.status(404).json({
        success: false,
        error: 'Tiket tidak ditemukan'
      });
    }

    res.json({
      success: true,
      data: ticket
    });
  } catch (error) {
    console.error('Error fetching public ticket:', error);
    res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan server'
    });
  }
});

// Get service categories for public forms
router.get('/categories', async (req: Request, res: Response) => {
  try {
    const { data: categories, error } = await supabase
      .from('service_categories')
      .select('id, name, code, description, requires_attachment')
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Error fetching public categories:', error);
      return res.status(500).json({
        success: false,
        error: 'Gagal mengambil data kategori'
      });
    }

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error in get public categories:', error);
    res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan server'
    });
  }
});

// Get units for public forms
router.get('/units', async (req: Request, res: Response) => {
  try {
    // Set response header untuk memastikan JSON response
    res.setHeader('Content-Type', 'application/json');
    
    console.log('🔄 GET /api/public/units dipanggil');
    
    const { data: units, error } = await supabase
      .from('units')
      .select('id, name, code, description')
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('❌ Error fetching public units:', error);
      return res.status(500).json({
        success: false,
        error: 'Gagal mengambil data unit',
        data: []
      });
    }

    console.log('✅ Fetched units:', units?.length || 0);

    // Return dengan format yang konsisten
    return res.status(200).json({
      success: true,
      data: units || []
    });
  } catch (error: any) {
    console.error('❌ Error in get public units:', error);
    return res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan server: ' + (error.message || 'Unknown error'),
      data: []
    });
  }
});

// Get ticket types for public forms
router.get('/ticket-types', async (req: Request, res: Response) => {
  try {
    const { data: ticketTypes, error } = await supabase
      .from('ticket_types')
      .select('id, name, code, description, default_priority')
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Error fetching public ticket types:', error);
      return res.status(500).json({
        success: false,
        error: 'Gagal mengambil data tipe tiket'
      });
    }

    res.json(ticketTypes);
  } catch (error) {
    console.error('Error in get public ticket types:', error);
    res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan server'
    });
  }
});

// Get service categories (alternative endpoint)
router.get('/service-categories', async (req: Request, res: Response) => {
  try {
    const { data: categories, error } = await supabase
      .from('service_categories')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Error fetching service categories:', error);
      return res.status(500).json({
        success: false,
        error: 'Gagal mengambil data kategori layanan'
      });
    }

    res.json(categories);
  } catch (error) {
    console.error('Error in get service categories:', error);
    res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan server'
    });
  }
});

// Get unit types for public forms
router.get('/unit-types', async (req: Request, res: Response) => {
  try {
    const { data: unitTypes, error } = await supabase
      .from('unit_types')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Error fetching unit types:', error);
      return res.status(500).json({
        success: false,
        error: 'Gagal mengambil data tipe unit'
      });
    }

    res.json(unitTypes);
  } catch (error) {
    console.error('Error in get unit types:', error);
    res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan server'
    });
  }
});

// Get ticket classifications for public forms
router.get('/ticket-classifications', async (req: Request, res: Response) => {
  try {
    const { data: classifications, error } = await supabase
      .from('ticket_classifications')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Error fetching ticket classifications:', error);
      return res.status(500).json({
        success: false,
        error: 'Gagal mengambil data klasifikasi tiket'
      });
    }

    res.json(classifications);
  } catch (error) {
    console.error('Error in get ticket classifications:', error);
    res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan server'
    });
  }
});

// Get ticket statuses for public forms
router.get('/ticket-statuses', async (req: Request, res: Response) => {
  try {
    const { data: statuses, error } = await supabase
      .from('ticket_statuses')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching ticket statuses:', error);
      return res.status(500).json({
        success: false,
        error: 'Gagal mengambil data status tiket'
      });
    }

    res.json(statuses);
  } catch (error) {
    console.error('Error in get ticket statuses:', error);
    res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan server'
    });
  }
});

// Get patient types for public forms
router.get('/patient-types', async (req: Request, res: Response) => {
  try {
    const { data: patientTypes, error } = await supabase
      .from('patient_types')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Error fetching patient types:', error);
      return res.status(500).json({
        success: false,
        error: 'Gagal mengambil data tipe pasien'
      });
    }

    res.json(patientTypes);
  } catch (error) {
    console.error('Error in get patient types:', error);
    res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan server'
    });
  }
});

// Get QR codes for public forms
router.get('/qr-codes', async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, unit_id, is_active, search, include_analytics } = req.query;
    
    let query = supabase
      .from('qr_codes')
      .select(`
        id, code, token, name, description, is_active, usage_count, 
        created_at, updated_at, unit_id,
        units:unit_id(id, name, code, description)
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (unit_id) {
      query = query.eq('unit_id', unit_id);
    }

    if (is_active !== undefined) {
      query = query.eq('is_active', is_active === 'true');
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,code.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Apply pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;
    
    query = query.range(offset, offset + limitNum - 1);

    const { data: qrCodes, error, count } = await query;

    if (error) {
      console.error('Error fetching public QR codes:', error);
      return res.status(500).json({
        success: false,
        error: 'Gagal mengambil data QR codes'
      });
    }

    // Add mock analytics if requested
    const qrCodesWithAnalytics = (qrCodes || []).map((qr: any) => ({
      ...qr,
      analytics: include_analytics === 'true' ? {
        scans_30d: qr.usage_count || 0,
        tickets_30d: Math.floor((qr.usage_count || 0) * 0.7),
        trend: Array.from({ length: 7 }, () => Math.floor(Math.random() * 10))
      } : undefined
    }));

    const totalPages = Math.ceil((count || qrCodes?.length || 0) / limitNum);

    res.json({
      qr_codes: qrCodesWithAnalytics,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count || qrCodes?.length || 0,
        pages: totalPages
      }
    });
  } catch (error) {
    console.error('Error in get public QR codes:', error);
    res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan server'
    });
  }
});

router.get('/roles', async (req: Request, res: Response) => {
  try {
    const { data: roles, error } = await supabase
      .from('roles')
      .select('id, name, code, description')
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Error fetching roles:', error);
      return res.status(500).json({
        success: false,
        error: 'Gagal mengambil data peran'
      });
    }

    res.json(roles);
  } catch (error) {
    console.error('Error in get roles:', error);
    res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan server'
    });
  }
});

// Get SLA settings for public forms
router.get('/sla-settings', async (req: Request, res: Response) => {
  try {
    const { data: slaSettings, error } = await supabase
      .from('sla_settings')
      .select(`
        *,
        unit_types:unit_type_id(name, code),
        service_categories:service_category_id(name, code),
        patient_types:patient_type_id(name, code)
      `)
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Error fetching SLA settings:', error);
      return res.status(500).json({
        success: false,
        error: 'Gagal mengambil data pengaturan SLA'
      });
    }

    res.json(slaSettings);
  } catch (error) {
    console.error('Error in get SLA settings:', error);
    res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan server'
    });
  }
});

// Submit external ticket from public form (QR code scan)
// PERBAIKAN: Menggunakan tabel 'tickets' seperti internal ticket yang berhasil
// Handle OPTIONS request untuk CORS
router.options('/external-tickets', (req: Request, res: Response) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization');
  res.status(200).end();
});

router.post('/external-tickets', async (req: Request, res: Response) => {
  console.log('🎯 POST /api/public/external-tickets dipanggil');
  console.log('📍 Request method:', req.method);
  console.log('📍 Request path:', req.path);
  console.log('📍 Request URL:', req.url);
  
  try {
    // Set response headers untuk memastikan JSON response
    res.setHeader('Content-Type', 'application/json');
    
    const {
      reporter_identity_type,
      reporter_name,
      reporter_email,
      reporter_phone,
      reporter_address,
      age_range,
      service_type,
      category,
      service_category_id, // PERBAIKAN: Terima service_category_id dari form
      patient_type_id,     // PERBAIKAN: Terima patient_type_id dari form
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
      source
    });

    // Validasi unit_id - HARUS ADA
    if (!unit_id) {
      console.error('❌ Unit ID tidak ada');
      return res.status(400).json({
        success: false,
        error: 'Unit ID harus diisi'
      });
    }

    // Validasi field wajib
    if (!title || !description) {
      console.error('❌ Field wajib tidak lengkap');
      return res.status(400).json({
        success: false,
        error: 'Judul dan deskripsi harus diisi'
      });
    }

    // Validasi service_type - harus salah satu dari: complaint, request, suggestion, survey
    const validServiceTypes = ['complaint', 'request', 'suggestion', 'survey'];
    if (!service_type || !validServiceTypes.includes(service_type)) {
      console.error('❌ Service type tidak valid:', service_type);
      console.error('❌ Valid types:', validServiceTypes);
      return res.status(400).json({
        success: false,
        error: 'Jenis layanan harus diisi (complaint, request, suggestion, atau survey)',
        received: service_type,
        valid_types: validServiceTypes
      });
    }

    // Validasi source - harus salah satu dari: web, qr_code, mobile, email, phone
    const validSources = ['web', 'qr_code', 'mobile', 'email', 'phone'];
    const finalSource = validSources.includes(source) ? source : 'web';
    console.log('✅ Using source:', finalSource);

    // Verifikasi unit_id exists dan aktif
    const { data: unitData, error: unitCheckError } = await supabase
      .from('units')
      .select('id, name')
      .eq('id', unit_id)
      .eq('is_active', true)
      .single();

    if (unitCheckError || !unitData) {
      console.error('❌ Unit tidak valid atau tidak aktif:', unit_id);
      console.error('❌ Unit check error:', unitCheckError);
      return res.status(400).json({
        success: false,
        error: 'Unit tidak valid atau tidak aktif',
        unit_id: unit_id,
        details: unitCheckError?.message
      });
    }

    console.log('✅ Unit verified:', unitData.name);

    // Generate ticket number - SAMA SEPERTI INTERNAL TICKET
    const ticketNumber = await generateTicketNumber();
    console.log('✅ Generated ticket number:', ticketNumber);

    // Calculate SLA deadline based on service type
    const slaDeadline = new Date();
    if (service_type === 'complaint') {
      slaDeadline.setHours(slaDeadline.getHours() + 24); // 24 jam untuk complaint
    } else if (service_type === 'request') {
      slaDeadline.setHours(slaDeadline.getHours() + 48); // 48 jam untuk request
    } else {
      slaDeadline.setHours(slaDeadline.getHours() + 72); // 72 jam untuk suggestion/survey
    }

    const isAnonymous = reporter_identity_type === 'anonymous';

    // PERBAIKAN: Mapping service_type dari form ke type yang valid di database
    // Form mengirim: complaint, request, suggestion, survey
    // Database hanya menerima: information, complaint, suggestion, satisfaction
    const serviceTypeMapping: { [key: string]: string } = {
      'complaint': 'complaint',      // Pengaduan -> complaint
      'request': 'information',      // Permintaan -> information
      'suggestion': 'suggestion',    // Saran -> suggestion
      'survey': 'satisfaction'       // Survei -> satisfaction
    };
    
    const mappedType = serviceTypeMapping[service_type] || 'complaint';
    console.log(`✅ Mapped service_type '${service_type}' to type '${mappedType}'`);

    // Determine priority based on service type
    let priority = 'medium';
    if (service_type === 'complaint') {
      priority = 'high';
    } else if (service_type === 'request') {
      priority = 'medium';
    } else {
      priority = 'low';
    }

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

    // PERBAIKAN: Gunakan tabel 'tickets' seperti internal ticket yang berhasil
    // Bukan 'external_tickets' yang mungkin memiliki constraint berbeda
    // PENTING: Gunakan mappedType yang sudah disesuaikan dengan constraint database
    const ticketData: any = {
      ticket_number: ticketNumber,
      type: mappedType, // PERBAIKAN: Gunakan mappedType yang valid (information, complaint, suggestion, satisfaction)
      title: title,
      description: description,
      unit_id: unit_id,
      qr_code_id: qr_code_id,
      priority: priority,
      status: 'open',
      sla_deadline: slaDeadline.toISOString(),
      source: finalSource,
      is_anonymous: isAnonymous,
      submitter_name: isAnonymous ? null : reporter_name,
      submitter_email: isAnonymous ? null : reporter_email,
      submitter_phone: isAnonymous ? null : reporter_phone,
      submitter_address: isAnonymous ? null : reporter_address,
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    };

    // PERBAIKAN: Tambahkan category_id dan patient_type_id jika ada
    // Prioritas: service_category_id > category
    const finalCategoryId = service_category_id || category || null;
    if (finalCategoryId) {
      ticketData.category_id = finalCategoryId;
      console.log('✅ Using category_id:', finalCategoryId);
    }
    
    // Tambahkan patient_type_id jika ada
    if (patient_type_id) {
      ticketData.patient_type_id = patient_type_id;
      console.log('✅ Using patient_type_id:', patient_type_id);
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
      category_id: ticketData.category_id || 'null'
    });

    const { data: ticket, error } = await supabase
      .from('tickets')
      .insert(ticketData)
      .select(`
        *,
        units:unit_id(name, code)
      `)
      .single();

    if (error) {
      console.error('❌ Error creating external ticket:', error);
      console.error('❌ Error code:', error.code);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error details:', error.details);
      console.error('❌ Error hint:', error.hint);
      console.error('❌ Ticket data yang dikirim:', JSON.stringify(ticketData, null, 2));
      
      // Berikan pesan error yang lebih spesifik
      let errorMessage = 'Gagal membuat tiket';
      if (error.code === '23503') {
        errorMessage = 'Data referensi tidak valid (unit_id atau category_id tidak ditemukan)';
      } else if (error.code === '23505') {
        errorMessage = 'Nomor tiket sudah ada, silakan coba lagi';
      } else if (error.code === '23514') {
        errorMessage = `Tipe tiket tidak valid. Diterima: ${ticketData.type}. Harus salah satu dari: information, complaint, suggestion, satisfaction`;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return res.status(500).json({
        success: false,
        error: errorMessage,
        details: error.details || error.hint || null,
        error_code: error.code
      });
    }

    console.log('✅ External ticket created successfully:', ticket.ticket_number);

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
    console.error('❌ Error in create external ticket:', error);
    console.error('❌ Stack trace:', error.stack);
    return res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan server: ' + (error.message || 'Unknown error')
    });
  }
});

// Submit internal ticket from public form (QR code scan - for staff)
router.post('/internal-tickets', async (req: Request, res: Response) => {
  try {
    const {
      reporter_name,
      reporter_email,
      reporter_phone,
      reporter_department,
      reporter_position,
      category,
      category_id,
      priority,
      title,
      description,
      qr_code,
      unit_id,
      source = 'web'
    } = req.body;

    console.log('📥 Received internal ticket request:', {
      reporter_name,
      reporter_email,
      unit_id,
      category,
      category_id,
      priority,
      title,
      source
    });

    // Validasi unit_id - HARUS ADA
    if (!unit_id) {
      console.error('❌ Unit ID tidak ada');
      return res.status(400).json({
        success: false,
        error: 'Unit ID harus diisi'
      });
    }

    // Validasi field wajib lainnya
    if (!reporter_name || !reporter_email || !title || !description) {
      console.error('❌ Field wajib tidak lengkap');
      return res.status(400).json({
        success: false,
        error: 'Nama, email, judul, dan deskripsi harus diisi'
      });
    }

    // Validasi source - harus salah satu dari: web, qr_code, mobile, email, phone
    const validSources = ['web', 'qr_code', 'mobile', 'email', 'phone'];
    const finalSource = validSources.includes(source) ? source : 'web';
    console.log('✅ Using source:', finalSource);

    // Generate ticket number
    const ticketNumber = await generateTicketNumber();
    console.log('✅ Generated ticket number:', ticketNumber);

    // Calculate SLA deadline based on priority
    const slaDeadline = new Date();
    switch (priority) {
      case 'critical':
        slaDeadline.setHours(slaDeadline.getHours() + 4);
        break;
      case 'high':
        slaDeadline.setHours(slaDeadline.getHours() + 8);
        break;
      case 'medium':
        slaDeadline.setHours(slaDeadline.getHours() + 24);
        break;
      case 'low':
        slaDeadline.setHours(slaDeadline.getHours() + 48);
        break;
      default:
        slaDeadline.setHours(slaDeadline.getHours() + 24);
    }

    // Gabungkan info department dan position ke dalam description
    const fullDescription = `${description}\n\n--- Info Pelapor ---\nDepartemen: ${reporter_department || '-'}\nJabatan: ${reporter_position || '-'}`;

    // Handle category - prioritas category_id, fallback ke category
    let finalCategoryId = category_id || null;
    
    // Jika category_id sudah ada dan valid UUID, gunakan langsung
    if (finalCategoryId) {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(finalCategoryId);
      if (isUUID) {
        console.log('✅ Using category_id directly:', finalCategoryId);
      } else {
        // Jika bukan UUID, coba cari berdasarkan nama/code
        try {
          const { data: categoryData } = await supabase
            .from('service_categories')
            .select('id')
            .or(`name.ilike.%${finalCategoryId}%,code.ilike.%${finalCategoryId}%`)
            .eq('is_active', true)
            .limit(1);
          
          if (categoryData && categoryData.length > 0) {
            finalCategoryId = categoryData[0].id;
            console.log('✅ Found category ID from name/code:', finalCategoryId);
          } else {
            console.log('⚠️ Category not found, will use null');
            finalCategoryId = null;
          }
        } catch (error) {
          console.log('⚠️ Error finding category:', error);
          finalCategoryId = null;
        }
      }
    } else if (category) {
      // Fallback ke category jika category_id tidak ada
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(category);
      
      if (isUUID) {
        finalCategoryId = category;
        console.log('✅ Using category as ID:', finalCategoryId);
      } else {
        const categoryMap: { [key: string]: string } = {
          'it_support': 'IT Support',
          'facility': 'Fasilitas',
          'equipment': 'Peralatan',
          'hr': 'SDM',
          'admin': 'Administrasi',
          'other': 'Lainnya'
        };
        
        const categoryName = categoryMap[category] || category;
        console.log('🔍 Looking for category:', categoryName);
        
        try {
          const { data: categoryData } = await supabase
            .from('service_categories')
            .select('id')
            .or(`name.ilike.%${categoryName}%,code.ilike.%${category}%`)
            .eq('is_active', true)
            .limit(1);
          
          if (categoryData && categoryData.length > 0) {
            finalCategoryId = categoryData[0].id;
            console.log('✅ Found category ID:', finalCategoryId);
          } else {
            console.log('⚠️ Category not found, will use null');
          }
        } catch (error) {
          console.log('⚠️ Error finding category:', error);
        }
      }
    }

    // Verifikasi unit_id exists dan aktif
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

    // Verifikasi category_id jika ada
    if (finalCategoryId) {
      const { data: categoryData, error: categoryCheckError } = await supabase
        .from('service_categories')
        .select('id, name')
        .eq('id', finalCategoryId)
        .eq('is_active', true)
        .single();

      if (categoryCheckError || !categoryData) {
        console.error('❌ Category tidak valid atau tidak aktif:', finalCategoryId);
        console.log('⚠️ Will proceed without category');
        finalCategoryId = null;
      } else {
        console.log('✅ Category verified:', categoryData.name);
      }
    }

    const ticketData: any = {
      ticket_number: ticketNumber,
      type: 'complaint',
      title,
      description: fullDescription,
      unit_id: unit_id,
      priority: priority || 'medium',
      status: 'open',
      sla_deadline: slaDeadline.toISOString(),
      source: finalSource,
      is_anonymous: false,
      submitter_name: reporter_name,
      submitter_email: reporter_email,
      submitter_phone: reporter_phone || null,
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    };

    // Tambahkan category_id hanya jika valid
    if (finalCategoryId) {
      ticketData.category_id = finalCategoryId;
    }

    console.log('📤 Inserting ticket data:', {
      ticket_number: ticketData.ticket_number,
      type: ticketData.type,
      unit_id: ticketData.unit_id,
      category_id: ticketData.category_id || 'null',
      priority: ticketData.priority,
      status: ticketData.status,
      source: ticketData.source
    });

    const { data: ticket, error } = await supabase
      .from('tickets')
      .insert(ticketData)
      .select(`
        *,
        units:unit_id(name, code)
      `)
      .single();

    if (error) {
      console.error('❌ Error creating internal ticket:', error);
      console.error('❌ Error code:', error.code);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error details:', error.details);
      console.error('❌ Error hint:', error.hint);
      console.error('❌ Ticket data yang dikirim:', JSON.stringify(ticketData, null, 2));
      
      // Berikan pesan error yang lebih spesifik
      let errorMessage = 'Gagal membuat tiket internal';
      if (error.code === '23503') {
        errorMessage = 'Data referensi tidak valid (unit_id atau category_id tidak ditemukan)';
      } else if (error.code === '23505') {
        errorMessage = 'Nomor tiket sudah ada, silakan coba lagi';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return res.status(500).json({
        success: false,
        error: errorMessage,
        details: error.details || error.hint || null
      });
    }

    console.log('✅ Ticket created successfully:', ticket.ticket_number);

    return res.status(201).json({
      success: true,
      ticket_number: ticket.ticket_number,
      data: ticket,
      message: 'Tiket internal berhasil dibuat. Nomor tiket Anda: ' + ticket.ticket_number
    });
  } catch (error: any) {
    console.error('❌ Error in create internal ticket:', error);
    console.error('❌ Stack trace:', error.stack);
    return res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan server: ' + (error.message || 'Unknown error')
    });
  }
});

// Get survey statistics (must be before :ticketId route)
router.get('/surveys/stats', async (req: Request, res: Response) => {
  try {
    // Get survey statistics from public_surveys table
    const { data: surveys, error } = await supabase
      .from('public_surveys')
      .select('*');

    if (error) {
      console.error('Error fetching survey stats:', error);
      return res.status(500).json({
        success: false,
        error: 'Gagal mengambil statistik survei'
      });
    }

    const totalSurveys = surveys?.length || 0;

    if (totalSurveys === 0) {
      return res.json({
        success: true,
        data: {
          total_surveys: 0,
          total_responses: 0,
          average_overall: 0,
          average_q1: 0,
          average_q2: 0,
          average_q3: 0,
          average_q4: 0,
          average_q5: 0,
          average_q6: 0,
          average_q7: 0,
          average_q8: 0,
          ikm_score: 0,
          nps_score: 0,
          response_rate: 0,
          average_completion_rate: 0,
          active_surveys: 0
        }
      });
    }

    // Calculate averages for each question
    const calcAvg = (field: string) => {
      const values = surveys.filter((s: any) => s[field] != null).map((s: any) => s[field]);
      return values.length > 0 ? (values.reduce((a: number, b: number) => a + b, 0) / values.length).toFixed(2) : 0;
    };

    // Calculate IKM (Indeks Kepuasan Masyarakat)
    const allScores = surveys.flatMap((s: any) => [
      s.q1_score, s.q2_score, s.q3_score, s.q4_score,
      s.q5_score, s.q6_score, s.q7_score, s.q8_score
    ].filter((v: any) => v != null));
    const ikmScore = allScores.length > 0 
      ? ((allScores.reduce((a: number, b: number) => a + b, 0) / allScores.length) / 5 * 100).toFixed(1)
      : 0;

    // Calculate NPS (simplified)
    const overallScores = surveys.filter((s: any) => s.overall_score != null).map((s: any) => s.overall_score);
    const promoters = overallScores.filter((s: number) => s >= 4).length;
    const detractors = overallScores.filter((s: number) => s <= 2).length;
    const npsScore = overallScores.length > 0 
      ? Math.round(((promoters - detractors) / overallScores.length) * 100)
      : 0;

    res.json({
      success: true,
      data: {
        total_surveys: totalSurveys,
        total_responses: totalSurveys,
        average_overall: calcAvg('overall_score'),
        average_q1: calcAvg('q1_score'),
        average_q2: calcAvg('q2_score'),
        average_q3: calcAvg('q3_score'),
        average_q4: calcAvg('q4_score'),
        average_q5: calcAvg('q5_score'),
        average_q6: calcAvg('q6_score'),
        average_q7: calcAvg('q7_score'),
        average_q8: calcAvg('q8_score'),
        ikm_score: parseFloat(ikmScore as string),
        nps_score: npsScore,
        response_rate: 100,
        average_completion_rate: 100,
        active_surveys: 1
      }
    });
  } catch (error) {
    console.error('Error fetching survey stats:', error);
    res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan server'
    });
  }
});

// Get survey responses with filters
router.get('/surveys/responses', async (req: Request, res: Response) => {
  try {
    const { start_date, end_date, unit_id, service_type, limit = 100, offset = 0 } = req.query;

    let query = supabase
      .from('public_surveys')
      .select(`
        *,
        units:unit_id (id, name, code)
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (start_date) {
      query = query.gte('created_at', start_date);
    }
    if (end_date) {
      query = query.lte('created_at', end_date);
    }
    if (unit_id && unit_id !== 'all') {
      query = query.eq('unit_id', unit_id);
    }
    if (service_type && service_type !== 'all') {
      query = query.eq('service_type', service_type);
    }

    // Pagination
    query = query.range(Number(offset), Number(offset) + Number(limit) - 1);

    const { data: surveys, error, count } = await query;

    if (error) {
      console.error('Error fetching survey responses:', error);
      return res.status(500).json({
        success: false,
        error: 'Gagal mengambil data survei'
      });
    }

    // Helper function to calculate average rating
    const calculateAverageRating = (survey: any): number => {
      const scores = [
        survey.q1_score, survey.q2_score, survey.q3_score, survey.q4_score,
        survey.q5_score, survey.q6_score, survey.q7_score, survey.q8_score
      ].filter((s: any) => s != null);
      
      if (scores.length === 0) return 0;
      return Math.round((scores.reduce((a: number, b: number) => a + b, 0) / scores.length) * 10) / 10;
    };

    // Transform data for frontend
    const transformedSurveys = surveys?.map((survey: any) => ({
      id: survey.id,
      date: survey.created_at,
      unit: survey.units?.name || 'Unknown',
      unit_id: survey.unit_id,
      service_type: survey.service_type,
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
      overall_score: survey.overall_score,
      comments: survey.comments,
      average_rating: calculateAverageRating(survey)
    })) || [];

    res.json({
      success: true,
      data: transformedSurveys,
      total: count || transformedSurveys.length
    });
  } catch (error) {
    console.error('Error fetching survey responses:', error);
    res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan server'
    });
  }
});

// Submit public survey (standalone - tidak terkait tiket)
// Handle OPTIONS request untuk CORS
router.options('/surveys', (req: Request, res: Response) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization');
  res.status(200).end();
});

router.post('/surveys', async (req: Request, res: Response) => {
  try {
    // Set response headers untuk memastikan JSON response
    res.setHeader('Content-Type', 'application/json');
    
    console.log('📥 Received public survey submission:', req.body);
    
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
      source: source,
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
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
    return res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan server: ' + error.message
    });
  }
});

// Submit satisfaction survey (terkait tiket yang sudah resolved)
router.post('/surveys/:ticketId', async (req: Request, res: Response) => {
  try {
    const { ticketId } = req.params;
    const {
      overall_score,
      response_time_score,
      solution_quality_score,
      staff_courtesy_score,
      comments
    } = req.body;

    // Verify ticket exists and is resolved
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .select('id, status')
      .eq('id', ticketId)
      .eq('status', 'resolved')
      .single();

    if (ticketError || !ticket) {
      return res.status(404).json({
        success: false,
        error: 'Tiket tidak ditemukan atau belum diselesaikan'
      });
    }

    const surveyData = {
      ticket_id: ticketId,
      overall_score,
      response_time_score,
      solution_quality_score,
      staff_courtesy_score,
      comments
    };

    const { data: survey, error } = await supabase
      .from('satisfaction_surveys')
      .insert(surveyData)
      .select()
      .single();

    if (error) {
      console.error('Error creating survey:', error);
      return res.status(500).json({
        success: false,
        error: 'Gagal menyimpan survei'
      });
    }

    res.status(201).json({
      success: true,
      data: survey,
      message: 'Terima kasih atas feedback Anda'
    });
  } catch (error) {
    console.error('Error in create survey:', error);
    res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan server'
    });
  }
});

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

// Get users for public access (read-only)
router.get('/users', async (req: Request, res: Response) => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select(`
        id, full_name, email, phone, employee_id, role, is_active, created_at, updated_at, unit_id,
        units:unit_id(id, name, code)
      `)
      .order('full_name');

    if (error) {
      console.error('Error fetching public users:', error);
      return res.status(500).json({
        success: false,
        error: 'Gagal mengambil data pengguna'
      });
    }

    res.json({
      success: true,
      data: users || []
    });
  } catch (error) {
    console.error('Error in get public users:', error);
    res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan server'
    });
  }
});

export default router;