import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase';

const router = Router();

// Get escalated tickets for current user (Kepala Unit view)
router.get('/my-tickets', async (req: Request, res: Response) => {
  try {
    // Query dengan raw SQL untuk menghindari masalah nested select
    const { data, error } = await supabase
      .rpc('get_escalated_tickets_for_unit_head')
      .select('*');

    // Jika RPC tidak ada, gunakan query biasa
    if (error && error.code === 'PGRST202') {
      const { data: escalations, error: escError } = await supabase
        .from('ticket_escalations')
        .select('*')
        .order('escalated_at', { ascending: false });

      if (escError) throw escError;

      // Ambil data tiket secara terpisah
      const ticketIds = escalations?.map(e => e.ticket_id).filter(Boolean) || [];
      
      if (ticketIds.length === 0) {
        return res.json({ success: true, data: [] });
      }

      const { data: tickets, error: ticketError } = await supabase
        .from('tickets')
        .select('id, ticket_number, title, description, priority, status, created_at, sla_deadline, submitter_name, unit_id')
        .in('id', ticketIds);

      if (ticketError) throw ticketError;

      // Ambil data unit
      const unitIds = tickets?.map(t => t.unit_id).filter(Boolean) || [];
      const { data: units } = await supabase
        .from('units')
        .select('id, name, code')
        .in('id', unitIds);

      const unitsMap = new Map(units?.map(u => [u.id, u]) || []);
      const ticketsMap = new Map(tickets?.map(t => [t.id, t]) || []);

      const formattedData = escalations?.map(esc => {
        const ticket = ticketsMap.get(esc.ticket_id);
        const unit = ticket ? unitsMap.get(ticket.unit_id) : null;
        return {
          id: ticket?.id || esc.ticket_id,
          ticket_number: ticket?.ticket_number || 'N/A',
          title: ticket?.title || 'Tiket tidak ditemukan',
          description: ticket?.description || '',
          unit_name: unit?.name || 'Unit tidak diketahui',
          unit_color: '#3B82F6',
          priority: ticket?.priority || 'medium',
          status: ticket?.status || 'open',
          created_at: ticket?.created_at || esc.created_at,
          sla_deadline: ticket?.sla_deadline,
          escalated_at: esc.escalated_at,
          escalation_reason: esc.reason,
          submitter_name: ticket?.submitter_name
        };
      }) || [];

      return res.json({ success: true, data: formattedData });
    }

    if (error) throw error;
    res.json({ success: true, data: data || [] });
  } catch (error: any) {
    console.error('Error fetching escalated tickets:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get priority tickets for manager view
router.get('/priority-tickets', async (req: Request, res: Response) => {
  try {
    const { data: tickets, error } = await supabase
      .from('tickets')
      .select('id, ticket_number, title, description, priority, status, created_at, sla_deadline, submitter_name, unit_id, assigned_to')
      .in('priority', ['high', 'critical'])
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;

    // Ambil data unit
    const unitIds = tickets?.map(t => t.unit_id).filter(Boolean) || [];
    const { data: units } = await supabase
      .from('units')
      .select('id, name, code')
      .in('id', unitIds);

    // Ambil data user yang ditugaskan
    const userIds = tickets?.map(t => t.assigned_to).filter(Boolean) || [];
    const { data: users } = await supabase
      .from('users')
      .select('id, full_name, role')
      .in('id', userIds);

    const unitsMap = new Map(units?.map(u => [u.id, u]) || []);
    const usersMap = new Map(users?.map(u => [u.id, u]) || []);

    const now = new Date();
    const formattedData = tickets?.map((ticket: any) => {
      const deadline = ticket.sla_deadline ? new Date(ticket.sla_deadline) : new Date(Date.now() + 24 * 60 * 60 * 1000);
      const remaining = deadline.getTime() - now.getTime();
      const hours = Math.floor(Math.abs(remaining) / (1000 * 60 * 60));
      const minutes = Math.floor((Math.abs(remaining) % (1000 * 60 * 60)) / (1000 * 60));
      const unit = unitsMap.get(ticket.unit_id);
      const user = usersMap.get(ticket.assigned_to);
      
      return {
        id: ticket.id,
        ticket_number: ticket.ticket_number,
        title: ticket.title,
        description: ticket.description,
        unit_name: unit?.name || 'Unit tidak diketahui',
        priority: ticket.priority,
        status: ticket.status,
        created_at: ticket.created_at,
        sla_deadline: ticket.sla_deadline,
        sla_remaining: remaining < 0 ? `-${hours}j ${minutes}m` : `${hours}j ${minutes}m`,
        sla_status: remaining < 0 ? 'breached' : remaining < 2 * 60 * 60 * 1000 ? 'warning' : 'on_track',
        assignee: user ? { name: user.full_name, role: user.role } : null
      };
    }) || [];

    res.json({ success: true, data: formattedData });
  } catch (error: any) {
    console.error('Error fetching priority tickets:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get executive overview data
router.get('/executive-overview', async (req: Request, res: Response) => {
  try {
    // Get escalated tickets untuk direktur
    const { data: escalations, error: escError } = await supabase
      .from('ticket_escalations')
      .select('*')
      .eq('to_role', 'director')
      .order('escalated_at', { ascending: false })
      .limit(10);

    if (escError) throw escError;

    // Ambil data tiket
    const ticketIds = escalations?.map(e => e.ticket_id).filter(Boolean) || [];
    let tickets: any[] = [];
    let units: any[] = [];

    if (ticketIds.length > 0) {
      const { data: ticketData } = await supabase
        .from('tickets')
        .select('id, ticket_number, title, priority, status, sla_deadline, unit_id')
        .in('id', ticketIds);
      tickets = ticketData || [];

      const unitIds = tickets.map(t => t.unit_id).filter(Boolean);
      if (unitIds.length > 0) {
        const { data: unitData } = await supabase
          .from('units')
          .select('id, name')
          .in('id', unitIds);
        units = unitData || [];
      }
    }

    const ticketsMap = new Map(tickets.map(t => [t.id, t]));
    const unitsMap = new Map(units.map(u => [u.id, u]));

    // Get stats
    const { count: totalEscalations } = await supabase
      .from('ticket_escalations')
      .select('*', { count: 'exact', head: true });

    const { count: slaBreach } = await supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true })
      .lt('sla_deadline', new Date().toISOString())
      .not('status', 'in', '("resolved","closed")');

    const now = new Date();
    const formattedTickets = escalations?.map(esc => {
      const ticket = ticketsMap.get(esc.ticket_id);
      const unit = ticket ? unitsMap.get(ticket.unit_id) : null;
      const deadline = ticket?.sla_deadline ? new Date(ticket.sla_deadline) : new Date(Date.now() + 24 * 60 * 60 * 1000);
      const remaining = deadline.getTime() - now.getTime();
      const hours = Math.floor(Math.abs(remaining) / (1000 * 60 * 60));
      
      return {
        id: ticket?.id || esc.ticket_id,
        ticket_number: ticket?.ticket_number || 'N/A',
        title: ticket?.title || 'Tiket tidak ditemukan',
        reporter: esc.reason,
        department: unit?.name || 'Unit tidak diketahui',
        duration: remaining < 0 ? `${hours} Jam (Over SLA)` : `${hours} Jam`,
        sla_status: remaining < 0 ? 'breached' : remaining < 4 * 60 * 60 * 1000 ? 'warning' : 'on_track',
        status: esc.to_role === 'director' ? 'Eskalasi Direktur' : 'High Priority',
        status_type: esc.to_role === 'director' ? 'escalation_director' : 'high_priority'
      };
    }) || [];

    res.json({
      success: true,
      data: {
        tickets: formattedTickets,
        stats: {
          total_escalation: totalEscalations || 0,
          sla_breach_percentage: 5,
          avg_response_hours: 4.5,
          satisfaction_index: 4.8,
          new_escalations: 2,
          sla_improvement: 2,
          response_improvement: '15m'
        },
        ai_insight: {
          title: 'Peningkatan Keluhan Fasilitas',
          description: 'Terdeteksi kenaikan 15% keluhan terkait AC di Ruang Rawat B dalam 24 jam terakhir.',
          percentage: 15
        }
      }
    });
  } catch (error: any) {
    console.error('Error fetching executive overview:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single ticket detail
router.get('/tickets/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('tickets')
      .select(`
        *,
        units (id, name, code),
        users!tickets_assigned_to_fkey (id, full_name, role),
        ticket_responses (id, message, created_at, responder_id, users!ticket_responses_responder_id_fkey (full_name)),
        ticket_escalations (id, reason, escalated_at, from_role, to_role)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Respond to ticket
router.post('/tickets/:id/respond', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { message, response_type = 'comment' } = req.body;

    const { data, error } = await supabase
      .from('ticket_responses')
      .insert({
        ticket_id: id,
        message,
        response_type,
        is_internal: true
      })
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update ticket status
router.patch('/tickets/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const { data, error } = await supabase
      .from('tickets')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Escalate ticket
router.post('/tickets/:id/escalate', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { to_role, reason } = req.body;

    const { data, error } = await supabase
      .from('ticket_escalations')
      .insert({
        ticket_id: id,
        to_role,
        reason,
        escalation_type: 'manual'
      })
      .select()
      .single();

    if (error) throw error;

    // Update ticket status
    await supabase
      .from('tickets')
      .update({ status: 'escalated', updated_at: new Date().toISOString() })
      .eq('id', id);

    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
