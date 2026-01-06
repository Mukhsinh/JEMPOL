import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase';

const router = Router();

// Get escalated tickets for current user (Kepala Unit view)
router.get('/my-tickets', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('ticket_escalations')
      .select(`
        *,
        tickets (
          id, ticket_number, title, description, priority, status, 
          created_at, sla_deadline, submitter_name,
          units (id, name, code)
        )
      `)
      .order('escalated_at', { ascending: false });

    if (error) throw error;

    const formattedData = data?.map(esc => ({
      id: esc.tickets?.id,
      ticket_number: esc.tickets?.ticket_number,
      title: esc.tickets?.title,
      description: esc.tickets?.description,
      unit_name: esc.tickets?.units?.name,
      unit_color: '#3B82F6',
      priority: esc.tickets?.priority,
      status: esc.tickets?.status,
      created_at: esc.tickets?.created_at,
      sla_deadline: esc.tickets?.sla_deadline,
      escalated_at: esc.escalated_at,
      escalation_reason: esc.reason,
      submitter_name: esc.tickets?.submitter_name
    })) || [];

    res.json({ success: true, data: formattedData });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get priority tickets for manager view
router.get('/priority-tickets', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('tickets')
      .select(`
        id, ticket_number, title, description, priority, status,
        created_at, sla_deadline, submitter_name,
        units (id, name, code),
        users!tickets_assigned_to_fkey (id, full_name, role)
      `)
      .in('priority', ['high', 'critical'])
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;

    const now = new Date();
    const formattedData = data?.map((ticket: any) => {
      const deadline = new Date(ticket.sla_deadline);
      const remaining = deadline.getTime() - now.getTime();
      const hours = Math.floor(remaining / (1000 * 60 * 60));
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      const unitData = Array.isArray(ticket.units) ? ticket.units[0] : ticket.units;
      const userData = Array.isArray(ticket.users) ? ticket.users[0] : ticket.users;
      
      return {
        id: ticket.id,
        ticket_number: ticket.ticket_number,
        title: ticket.title,
        description: ticket.description,
        unit_name: unitData?.name,
        priority: ticket.priority,
        status: ticket.status,
        created_at: ticket.created_at,
        sla_deadline: ticket.sla_deadline,
        sla_remaining: remaining < 0 ? `${Math.abs(hours)}j ${Math.abs(minutes)}m` : `${hours}j ${minutes}m`,
        sla_status: remaining < 0 ? 'breached' : remaining < 2 * 60 * 60 * 1000 ? 'warning' : 'on_track',
        assignee: userData ? { name: userData.full_name, role: userData.role } : null
      };
    }) || [];

    res.json({ success: true, data: formattedData });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get executive overview data
router.get('/executive-overview', async (req: Request, res: Response) => {
  try {
    // Get escalated tickets
    const { data: escalations, error: escError } = await supabase
      .from('ticket_escalations')
      .select(`
        *,
        tickets (id, ticket_number, title, priority, status, sla_deadline, units (name))
      `)
      .eq('to_role', 'director')
      .order('escalated_at', { ascending: false })
      .limit(10);

    if (escError) throw escError;

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
      const deadline = new Date(esc.tickets?.sla_deadline);
      const remaining = deadline.getTime() - now.getTime();
      const hours = Math.floor(Math.abs(remaining) / (1000 * 60 * 60));
      
      return {
        id: esc.tickets?.id,
        ticket_number: esc.tickets?.ticket_number,
        title: esc.tickets?.title,
        reporter: esc.reason,
        department: esc.tickets?.units?.name,
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
