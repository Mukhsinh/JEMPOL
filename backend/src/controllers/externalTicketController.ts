import { Request, Response } from 'express';
import supabase from '../config/supabase.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/external-tickets';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Hanya file JPG, PNG, dan PDF yang diizinkan'));
    }
  }
});

// Generate ticket number
const generateTicketNumber = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `EXT-${year}${month}${day}-${random}`;
};

// AI Classification simulation (in real implementation, this would call actual AI service)
const classifyTicket = async (title: string, description: string, category?: string) => {
  // Simulate AI processing
  const keywords = (title + ' ' + description).toLowerCase();
  
  let urgency_level = 3;
  let priority = 'medium';
  let sentiment_score = 0.5;
  let confidence_score = 85;

  // Simple keyword-based classification
  if (keywords.includes('darurat') || keywords.includes('kritis') || keywords.includes('bahaya')) {
    urgency_level = 5;
    priority = 'critical';
    confidence_score = 95;
  } else if (keywords.includes('penting') || keywords.includes('segera') || keywords.includes('mendesak')) {
    urgency_level = 4;
    priority = 'high';
    confidence_score = 90;
  } else if (keywords.includes('lambat') || keywords.includes('lama') || keywords.includes('tidak puas')) {
    sentiment_score = 0.2;
  } else if (keywords.includes('bagus') || keywords.includes('baik') || keywords.includes('puas')) {
    sentiment_score = 0.8;
  }

  return {
    urgency_level,
    priority,
    sentiment_score,
    confidence_score,
    ai_classification: {
      keywords_detected: keywords.split(' ').filter(word => word.length > 3).slice(0, 5),
      category_prediction: category || 'general',
      processing_time_ms: Math.floor(Math.random() * 500) + 100
    }
  };
};

export const createExternalTicket = async (req: Request, res: Response) => {
  try {
    const {
      qr_code_id,
      unit_id,
      reporter_identity_type = 'personal',
      reporter_name,
      reporter_email,
      reporter_phone,
      reporter_address,
      age_range,
      service_type,
      category,
      title,
      description
    } = req.body;

    // Validate required fields
    if (!unit_id || !service_type || !title || !description) {
      return res.status(400).json({
        error: 'Field yang wajib diisi: unit_id, service_type, title, description'
      });
    }

    // Validate identity requirements
    if (reporter_identity_type === 'personal' && !reporter_name) {
      return res.status(400).json({
        error: 'Nama wajib diisi untuk identitas pribadi'
      });
    }

    // Generate ticket number
    const ticket_number = generateTicketNumber();

    // AI Classification
    const aiResult = await classifyTicket(title, description, category);

    // Calculate SLA deadline (default 24 hours, adjust based on priority)
    const sla_hours = aiResult.priority === 'critical' ? 2 : 
                     aiResult.priority === 'high' ? 8 : 24;
    const sla_deadline = new Date();
    sla_deadline.setHours(sla_deadline.getHours() + sla_hours);

    // Get client IP and user agent
    const ip_address = req.ip || req.connection.remoteAddress;
    const user_agent = req.get('User-Agent');

    // Create external ticket
    const { data: ticket, error: ticketError } = await supabase
      .from('external_tickets')
      .insert({
        ticket_number,
        qr_code_id: qr_code_id || null,
        unit_id,
        reporter_identity_type,
        reporter_name: reporter_identity_type === 'personal' ? reporter_name : null,
        reporter_email: reporter_identity_type === 'personal' ? reporter_email : null,
        reporter_phone: reporter_identity_type === 'personal' ? reporter_phone : null,
        reporter_address: reporter_identity_type === 'personal' ? reporter_address : null,
        age_range: reporter_identity_type === 'personal' ? age_range : null,
        service_type,
        category,
        title,
        description,
        ...aiResult,
        sla_deadline: sla_deadline.toISOString(),
        ip_address,
        user_agent,
        source: qr_code_id ? 'qr_code' : 'web'
      })
      .select()
      .single();

    if (ticketError) {
      console.error('Error creating external ticket:', ticketError);
      return res.status(500).json({
        error: 'Gagal membuat tiket eksternal'
      });
    }

    // Handle file attachments if any
    const files = req.files as Express.Multer.File[];
    if (files && files.length > 0) {
      const attachments = files.map(file => ({
        ticket_id: ticket.id,
        file_name: file.originalname,
        file_path: file.path,
        file_size: file.size,
        mime_type: file.mimetype
      }));

      const { error: attachmentError } = await supabase
        .from('ticket_attachments')
        .insert(attachments);

      if (attachmentError) {
        console.error('Error saving attachments:', attachmentError);
        // Don't fail the ticket creation, just log the error
      }
    }

    // Update QR code usage count if applicable
    if (qr_code_id) {
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

      // Update QR analytics
      const today = new Date().toISOString().split('T')[0];
      const { data: currentAnalytics } = await supabase
        .from('qr_code_analytics')
        .select('scan_count, ticket_count')
        .eq('qr_code_id', qr_code_id)
        .eq('scan_date', today)
        .single();

      if (currentAnalytics) {
        await supabase
          .from('qr_code_analytics')
          .update({
            scan_count: (currentAnalytics.scan_count || 0) + 1,
            ticket_count: (currentAnalytics.ticket_count || 0) + 1
          })
          .eq('qr_code_id', qr_code_id)
          .eq('scan_date', today);
      } else {
        await supabase
          .from('qr_code_analytics')
          .insert({
            qr_code_id,
            scan_date: today,
            scan_count: 1,
            ticket_count: 1,
            unique_visitors: 1
          });
      }
    }

    // Check if ticket should be auto-escalated based on AI rules
    if (aiResult.confidence_score >= 90 && aiResult.priority === 'critical') {
      // Trigger escalation (this would be handled by a separate service)
      console.log(`High confidence critical ticket ${ticket_number} may need escalation`);
    }

    res.status(201).json({
      success: true,
      ticket_number: ticket.ticket_number,
      ticket_id: ticket.id,
      message: 'Tiket berhasil dibuat',
      ai_classification: aiResult.ai_classification
    });

  } catch (error) {
    console.error('Error in createExternalTicket:', error);
    res.status(500).json({
      error: 'Terjadi kesalahan internal server'
    });
  }
};

export const getExternalTickets = async (req: Request, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      service_type, 
      priority,
      unit_id,
      search 
    } = req.query;

    let query = supabase
      .from('external_tickets')
      .select(`
        *,
        units:unit_id (
          id,
          name,
          code
        ),
        qr_codes:qr_code_id (
          id,
          name,
          code
        )
      `);

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }
    if (service_type) {
      query = query.eq('service_type', service_type);
    }
    if (priority) {
      query = query.eq('priority', priority);
    }
    if (unit_id) {
      query = query.eq('unit_id', unit_id);
    }
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,ticket_number.ilike.%${search}%`);
    }

    // Pagination
    const offset = (Number(page) - 1) * Number(limit);
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + Number(limit) - 1);

    const { data: tickets, error, count } = await query;

    if (error) {
      console.error('Error fetching external tickets:', error);
      return res.status(500).json({
        error: 'Gagal mengambil data tiket eksternal'
      });
    }

    res.json({
      tickets,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count || 0,
        pages: Math.ceil((count || 0) / Number(limit))
      }
    });

  } catch (error) {
    console.error('Error in getExternalTickets:', error);
    res.status(500).json({
      error: 'Terjadi kesalahan internal server'
    });
  }
};

export const getExternalTicketById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data: ticket, error } = await supabase
      .from('external_tickets')
      .select(`
        *,
        units:unit_id (
          id,
          name,
          code,
          description
        ),
        qr_codes:qr_code_id (
          id,
          name,
          code
        ),
        ticket_attachments (
          id,
          file_name,
          file_path,
          file_size,
          mime_type,
          created_at
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching external ticket:', error);
      return res.status(404).json({
        error: 'Tiket tidak ditemukan'
      });
    }

    res.json(ticket);

  } catch (error) {
    console.error('Error in getExternalTicketById:', error);
    res.status(500).json({
      error: 'Terjadi kesalahan internal server'
    });
  }
};

export const updateExternalTicketStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, response_message, responder_id } = req.body;

    // Validate status
    const validStatuses = ['open', 'in_progress', 'escalated', 'resolved', 'closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: 'Status tidak valid'
      });
    }

    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    };

    // Set timestamps based on status
    if (status === 'resolved') {
      updateData.resolved_at = new Date().toISOString();
    }

    const { data: ticket, error } = await supabase
      .from('external_tickets')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating external ticket:', error);
      return res.status(500).json({
        error: 'Gagal memperbarui status tiket'
      });
    }

    // Add response if provided
    if (response_message && responder_id) {
      await supabase
        .from('ticket_responses')
        .insert({
          ticket_id: id,
          responder_id,
          message: response_message,
          response_type: 'status_update',
          is_internal: false
        });
    }

    res.json({
      success: true,
      ticket,
      message: 'Status tiket berhasil diperbarui'
    });

  } catch (error) {
    console.error('Error in updateExternalTicketStatus:', error);
    res.status(500).json({
      error: 'Terjadi kesalahan internal server'
    });
  }
};

export const getExternalTicketStats = async (req: Request, res: Response) => {
  try {
    const { unit_id, date_from, date_to } = req.query;

    let query = supabase.from('external_tickets').select('*');
    
    if (unit_id) {
      query = query.eq('unit_id', unit_id);
    }
    
    if (date_from) {
      query = query.gte('created_at', date_from);
    }
    
    if (date_to) {
      query = query.lte('created_at', date_to);
    }

    // Get counts by status
    const { data: statusData } = await query.select('status');
    const statusCounts = statusData?.reduce((acc: any, ticket: any) => {
      acc[ticket.status] = (acc[ticket.status] || 0) + 1;
      return acc;
    }, {}) || {};

    // Get counts by service type
    let serviceQuery = supabase.from('external_tickets').select('service_type');
    if (unit_id) serviceQuery = serviceQuery.eq('unit_id', unit_id);
    if (date_from) serviceQuery = serviceQuery.gte('created_at', date_from);
    if (date_to) serviceQuery = serviceQuery.lte('created_at', date_to);
    
    const { data: serviceData } = await serviceQuery;
    const serviceCounts = serviceData?.reduce((acc: any, ticket: any) => {
      acc[ticket.service_type] = (acc[ticket.service_type] || 0) + 1;
      return acc;
    }, {}) || {};

    // Get average response time
    let responseQuery = supabase.from('external_tickets').select('created_at, first_response_at').not('first_response_at', 'is', null);
    if (unit_id) responseQuery = responseQuery.eq('unit_id', unit_id);
    if (date_from) responseQuery = responseQuery.gte('created_at', date_from);
    if (date_to) responseQuery = responseQuery.lte('created_at', date_to);
    
    const { data: responseData } = await responseQuery;
    let avgResponseTime = 0;
    
    if (responseData && responseData.length > 0) {
      const totalTime = responseData.reduce((sum: number, ticket: any) => {
        const created = new Date(ticket.created_at);
        const responded = new Date(ticket.first_response_at);
        return sum + (responded.getTime() - created.getTime());
      }, 0);
      
      const avgMs = totalTime / responseData.length;
      avgResponseTime = Math.round((avgMs / (1000 * 60 * 60)) * 100) / 100;
    }

    res.json({
      status_counts: statusCounts,
      service_type_counts: serviceCounts,
      average_response_time_hours: avgResponseTime,
      total_tickets: Object.values(statusCounts).reduce((sum: number, count: any) => sum + count, 0)
    });

  } catch (error) {
    console.error('Error in getExternalTicketStats:', error);
    res.status(500).json({
      error: 'Terjadi kesalahan internal server'
    });
  }
};

// Middleware for file upload
export const uploadMiddleware = upload.array('attachments', 5);