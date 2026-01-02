import express, { Request, Response, NextFunction } from 'express';
import supabase from '../config/supabase.js';
import { authenticateToken } from '../middleware/auth.js';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
    role: string;
  };
}

const router = express.Router();

// Test endpoint untuk debugging
router.get('/test', async (req: Request, res: Response) => {
  try {
    const { data: tickets, error } = await supabase
      .from('tickets')
      .select('id, ticket_number, title, status, created_at')
      .limit(5);

    if (error) {
      console.error('Test endpoint error:', error);
      return res.json({
        success: false,
        error: error.message,
        message: 'Test endpoint - Supabase error'
      });
    }

    res.json({
      success: true,
      data: tickets || [],
      message: 'Test endpoint working - Supabase connected',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Test endpoint exception:', error);
    res.json({
      success: false,
      error: error.message,
      message: 'Test endpoint - Exception occurred'
    });
  }
});

// Public endpoint for tickets (no auth required) - for testing
router.get('/public/tickets', async (req: Request, res: Response) => {
  try {
    console.log('GET /public/tickets - Query:', req.query);
    
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
        error: 'Gagal mengambil data tiket: ' + error.message
      });
    }

    console.log('Public tickets fetched successfully:', tickets?.length || 0);

    res.json({
      success: true,
      data: tickets || [],
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count || tickets?.length || 0
      }
    });
  } catch (error: any) {
    console.error('Error in get public tickets:', error);
    res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan server: ' + error.message
    });
  }
});

// Public endpoint for units (no auth required) - for testing
router.get('/public/units', async (req: Request, res: Response) => {
  try {
    const { data: units, error } = await supabase
      .from('units')
      .select('id, name, code, description, is_active')
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Error fetching public units:', error);
      return res.status(500).json({
        success: false,
        error: 'Gagal mengambil data unit'
      });
    }

    res.json({
      success: true,
      data: units || []
    });
  } catch (error) {
    console.error('Error in get public units:', error);
    res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan server'
    });
  }
});

// Public endpoint for categories (no auth required) - for testing
router.get('/public/categories', async (req: Request, res: Response) => {
  try {
    const { data: categories, error } = await supabase
      .from('service_categories')
      .select('id, name, code, description, is_active')
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
      data: categories || []
    });
  } catch (error) {
    console.error('Error in get public categories:', error);
    res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan server'
    });
  }
});

// Get all tickets with filters
router.get('/tickets', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    console.log('GET /tickets - User:', req.user?.id, 'Query:', req.query);
    
    const { status, unit_id, assigned_to, page = 1, limit = 50 } = req.query;
    
    let query = supabase
      .from('tickets')
      .select(`
        *,
        units:unit_id(name, code),
        service_categories:category_id(name),
        users:assigned_to(full_name, email),
        creator:created_by(full_name, email)
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (status && status !== 'all') query = query.eq('status', status);
    if (unit_id && unit_id !== 'all') query = query.eq('unit_id', unit_id);
    if (assigned_to && assigned_to !== 'all') query = query.eq('assigned_to', assigned_to);

    // Apply pagination
    const offset = (Number(page) - 1) * Number(limit);
    query = query.range(offset, offset + Number(limit) - 1);

    const { data: tickets, error, count } = await query;

    if (error) {
      console.error('Error fetching tickets:', error);
      return res.status(500).json({
        success: false,
        error: 'Gagal mengambil data tiket: ' + error.message
      });
    }

    console.log('Tickets fetched successfully:', tickets?.length || 0);

    res.json({
      success: true,
      data: tickets || [],
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count || tickets?.length || 0
      }
    });
  } catch (error: any) {
    console.error('Error in get tickets:', error);
    res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan server: ' + error.message
    });
  }
});

// Get single ticket by ID
router.get('/tickets/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const { data: ticket, error } = await supabase
      .from('tickets')
      .select(`
        *,
        units:unit_id(name, code, contact_email, contact_phone),
        service_categories:category_id(name, description),
        users:assigned_to(full_name, email, role),
        creator:created_by(full_name, email),
        ticket_responses(
          id,
          message,
          is_internal,
          response_type,
          created_at,
          responder:responder_id(full_name, role)
        ),
        ticket_attachments(
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
      console.error('Error fetching ticket:', error);
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
    console.error('Error in get ticket:', error);
    res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan server'
    });
  }
});

// Create new ticket
router.post('/tickets', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      type,
      category_id,
      title,
      description,
      unit_id,
      priority = 'medium',
      submitter_name,
      submitter_email,
      submitter_phone,
      submitter_address,
      is_anonymous = false
    } = req.body;

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
      unit_id,
      priority,
      status: 'open',
      sla_deadline: slaDeadline.toISOString(),
      created_by: req.user!.id,
      source: 'web'
    };

    // Add submitter info if provided
    if (submitter_name) ticketData.submitter_name = submitter_name;
    if (submitter_email) ticketData.submitter_email = submitter_email;
    if (submitter_phone) ticketData.submitter_phone = submitter_phone;
    if (submitter_address) ticketData.submitter_address = submitter_address;
    if (is_anonymous !== undefined) ticketData.is_anonymous = is_anonymous;

    const { data: ticket, error } = await supabase
      .from('tickets')
      .insert(ticketData)
      .select()
      .single();

    if (error) {
      console.error('Error creating ticket:', error);
      return res.status(500).json({
        success: false,
        error: 'Gagal membuat tiket'
      });
    }

    res.status(201).json({
      success: true,
      data: ticket,
      message: 'Tiket berhasil dibuat'
    });
  } catch (error) {
    console.error('Error in create ticket:', error);
    res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan server'
    });
  }
});

// Update ticket
router.put('/tickets/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    updateData.updated_at = new Date().toISOString();

    const { data: ticket, error } = await supabase
      .from('tickets')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating ticket:', error);
      return res.status(500).json({
        success: false,
        error: 'Gagal memperbarui tiket'
      });
    }

    res.json({
      success: true,
      data: ticket,
      message: 'Tiket berhasil diperbarui'
    });
  } catch (error) {
    console.error('Error in update ticket:', error);
    res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan server'
    });
  }
});

// Add response to ticket
router.post('/tickets/:id/responses', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { message, is_internal = false, response_type = 'comment' } = req.body;

    const responseData = {
      ticket_id: id,
      responder_id: req.user!.id,
      message,
      is_internal,
      response_type
    };

    const { data: response, error } = await supabase
      .from('ticket_responses')
      .insert(responseData)
      .select(`
        *,
        responder:responder_id(full_name, role)
      `)
      .single();

    if (error) {
      console.error('Error adding response:', error);
      return res.status(500).json({
        success: false,
        error: 'Gagal menambahkan respon'
      });
    }

    // Update ticket's first_response_at if this is the first response
    if (response_type !== 'comment') {
      await supabase
        .from('tickets')
        .update({ 
          first_response_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .is('first_response_at', null);
    }

    res.status(201).json({
      success: true,
      data: response,
      message: 'Respon berhasil ditambahkan'
    });
  } catch (error) {
    console.error('Error in add response:', error);
    res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan server'
    });
  }
});

// Get units
router.get('/units', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { data: units, error } = await supabase
      .from('units')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Error fetching units:', error);
      return res.status(500).json({
        success: false,
        error: 'Gagal mengambil data unit'
      });
    }

    res.json({
      success: true,
      data: units
    });
  } catch (error) {
    console.error('Error in get units:', error);
    res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan server'
    });
  }
});

// Get service categories
router.get('/categories', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { data: categories, error } = await supabase
      .from('service_categories')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Error fetching categories:', error);
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
    console.error('Error in get categories:', error);
    res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan server'
    });
  }
});

// Dashboard metrics
router.get('/dashboard/metrics', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Get ticket counts by status
    const { data: statusCounts, error: statusError } = await supabase
      .from('tickets')
      .select('status')
      .then(result => {
        if (result.error) return result;
        
        const counts: any = result.data.reduce((acc: any, ticket: any) => {
          acc[ticket.status] = (acc[ticket.status] || 0) + 1;
          return acc;
        }, {});
        
        return { data: counts, error: null };
      });

    if (statusError) {
      console.error('Error fetching status counts:', statusError);
      return res.status(500).json({
        success: false,
        error: 'Gagal mengambil data dashboard'
      });
    }

    // Get recent tickets
    const { data: recentTickets, error: recentError } = await supabase
      .from('tickets')
      .select(`
        id,
        ticket_number,
        title,
        status,
        priority,
        created_at,
        units:unit_id(name)
      `)
      .order('created_at', { ascending: false })
      .limit(5);

    if (recentError) {
      console.error('Error fetching recent tickets:', recentError);
    }

    // Get category statistics
    const { data: categoryStats, error: categoryError } = await supabase
      .from('tickets')
      .select(`
        category_id,
        service_categories:category_id(name)
      `)
      .then(result => {
        if (result.error) return result;
        
        const stats: any = result.data.reduce((acc: any, ticket: any) => {
          const categoryName = ticket.service_categories?.name || 'Uncategorized';
          acc[categoryName] = (acc[categoryName] || 0) + 1;
          return acc;
        }, {});
        
        return { data: stats, error: null };
      });

    if (categoryError) {
      console.error('Error fetching category stats:', categoryError);
    }

    res.json({
      success: true,
      data: {
        statusCounts: statusCounts || {},
        recentTickets: recentTickets || [],
        categoryStats: categoryStats || {}
      }
    });
  } catch (error) {
    console.error('Error in dashboard metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan server'
    });
  }
});

// Enhanced dashboard metrics with filters
router.get('/dashboard/metrics/filtered', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { 
      dateRange = 'last_7_days', 
      unit_id, 
      status, 
      category_id 
    } = req.query;

    // Build query with filters
    let query = supabase
      .from('tickets')
      .select('status, priority, unit_id, category_id, created_at, sla_deadline');

    // Apply date filter
    const now = new Date();
    switch (dateRange) {
      case 'last_7_days':
        const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        query = query.gte('created_at', last7Days.toISOString());
        break;
      case 'last_30_days':
        const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        query = query.gte('created_at', last30Days.toISOString());
        break;
      case 'last_90_days':
        const last90Days = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        query = query.gte('created_at', last90Days.toISOString());
        break;
      case 'this_month':
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        query = query.gte('created_at', thisMonthStart.toISOString());
        break;
      case 'last_month':
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
        query = query.gte('created_at', lastMonthStart.toISOString())
                    .lte('created_at', lastMonthEnd.toISOString());
        break;
    }

    // Apply other filters
    if (unit_id && unit_id !== 'all') {
      query = query.eq('unit_id', unit_id);
    }
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    if (category_id && category_id !== 'all') {
      query = query.eq('category_id', category_id);
    }

    const { data: tickets, error: ticketsError } = await query;

    if (ticketsError) {
      console.error('Error fetching tickets:', ticketsError);
      return res.status(500).json({
        success: false,
        error: 'Gagal mengambil data tiket'
      });
    }

    // Process status counts
    const statusCounts = (tickets || []).reduce((acc: any, ticket: any) => {
      // Check if ticket is over SLA
      const isOverSLA = ticket.sla_deadline && new Date(ticket.sla_deadline) < new Date();
      const effectiveStatus = isOverSLA ? 'over_sla' : ticket.status;
      
      acc[effectiveStatus] = (acc[effectiveStatus] || 0) + 1;
      return acc;
    }, {});

    // Get priority distribution
    const priorityCounts = (tickets || []).reduce((acc: any, ticket: any) => {
      acc[ticket.priority] = (acc[ticket.priority] || 0) + 1;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        statusCounts: statusCounts || {},
        priorityCounts: priorityCounts || {},
        totalTickets: tickets?.length || 0,
        filters: {
          dateRange,
          unit_id,
          status,
          category_id
        }
      }
    });
  } catch (error) {
    console.error('Error in filtered dashboard metrics:', error);
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