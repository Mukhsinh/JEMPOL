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

export default router;