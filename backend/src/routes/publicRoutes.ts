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
    const { data: units, error } = await supabase
      .from('units')
      .select('id, name, code, description')
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Error fetching public units:', error);
      return res.status(500).json({
        success: false,
        error: 'Gagal mengambil data unit'
      });
    }

    res.json(units);
  } catch (error) {
    console.error('Error in get public units:', error);
    res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan server'
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
router.post('/external-tickets', async (req: Request, res: Response) => {
  try {
    const {
      reporter_identity_type,
      reporter_name,
      reporter_email,
      reporter_phone,
      reporter_address,
      service_type,
      category,
      title,
      description,
      qr_code,
      unit_id,
      source = 'qr_code'
    } = req.body;

    // Generate ticket number
    const ticketNumber = await generateTicketNumber();

    // Calculate SLA deadline (default 24 hours)
    const slaDeadline = new Date();
    slaDeadline.setHours(slaDeadline.getHours() + 24);

    const isAnonymous = reporter_identity_type === 'anonymous';

    const ticketData: any = {
      ticket_number: ticketNumber,
      type: service_type || 'complaint',
      title,
      description,
      unit_id: unit_id || null,
      priority: 'medium',
      status: 'open',
      sla_deadline: slaDeadline.toISOString(),
      source: source,
      is_anonymous: isAnonymous,
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    };

    // Add submitter info if not anonymous
    if (!isAnonymous) {
      if (reporter_name) ticketData.submitter_name = reporter_name;
      if (reporter_email) ticketData.submitter_email = reporter_email;
      if (reporter_phone) ticketData.submitter_phone = reporter_phone;
      if (reporter_address) ticketData.submitter_address = reporter_address;
    }

    // Find category ID if category name provided
    if (category) {
      const { data: categoryData } = await supabase
        .from('service_categories')
        .select('id')
        .eq('name', category)
        .single();
      
      if (categoryData) {
        ticketData.category_id = categoryData.id;
      }
    }

    const { data: ticket, error } = await supabase
      .from('tickets')
      .insert(ticketData)
      .select(`
        *,
        units:unit_id(name, code)
      `)
      .single();

    if (error) {
      console.error('Error creating external ticket:', error);
      return res.status(500).json({
        success: false,
        error: 'Gagal membuat tiket'
      });
    }

    res.status(201).json({
      success: true,
      ticket_number: ticket.ticket_number,
      data: ticket,
      message: 'Tiket berhasil dibuat. Nomor tiket Anda: ' + ticket.ticket_number
    });
  } catch (error) {
    console.error('Error in create external ticket:', error);
    res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan server'
    });
  }
});

// Submit satisfaction survey
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