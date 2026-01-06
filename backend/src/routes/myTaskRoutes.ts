import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Get my tasks based on user role
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { user_id, role, task_type, status, priority, search } = req.query;

    if (!user_id || !role) {
      return res.status(400).json({ 
        success: false, 
        error: 'user_id dan role diperlukan' 
      });
    }

    const tasks: any[] = [];
    const userRole = role as string;
    const userId = user_id as string;

    // 1. Get tickets escalated TO me (based on role)
    const { data: escalatedToMe, error: escalatedToMeError } = await supabase
      .from('ticket_escalations')
      .select(`
        id,
        ticket_id,
        from_role,
        to_role,
        reason,
        escalated_at,
        tickets (
          id,
          ticket_number,
          title,
          description,
          status,
          priority,
          type,
          created_at,
          updated_at,
          sla_deadline,
          submitter_name,
          submitter_email,
          source,
          unit_id,
          category_id,
          assigned_to
        )
      `)
      .eq('to_role', userRole)
      .order('escalated_at', { ascending: false });

    if (!escalatedToMeError && escalatedToMe) {
      // Get unit and category data
      const ticketIds = escalatedToMe.map((e: any) => e.tickets?.id).filter(Boolean);
      const unitIds = escalatedToMe.map((e: any) => e.tickets?.unit_id).filter(Boolean);
      const categoryIds = escalatedToMe.map((e: any) => e.tickets?.category_id).filter(Boolean);

      const [unitsResult, categoriesResult] = await Promise.all([
        unitIds.length > 0 ? supabase.from('units').select('id, name, code').in('id', unitIds) : { data: [] },
        categoryIds.length > 0 ? supabase.from('service_categories').select('id, name').in('id', categoryIds) : { data: [] }
      ]);

      const unitsMap = new Map((unitsResult.data || []).map((u: any) => [u.id, u]));
      const categoriesMap = new Map((categoriesResult.data || []).map((c: any) => [c.id, c]));

      escalatedToMe.forEach((esc: any) => {
        if (esc.tickets) {
          tasks.push({
            ...esc.tickets,
            task_type: 'escalated_to_me',
            escalated_at: esc.escalated_at,
            escalation_info: {
              from_role: esc.from_role,
              to_role: esc.to_role,
              reason: esc.reason,
              escalated_at: esc.escalated_at
            },
            units: unitsMap.get(esc.tickets.unit_id),
            service_categories: categoriesMap.get(esc.tickets.category_id)
          });
        }
      });
    }

    // 2. Get tickets escalated BY me
    const { data: escalatedByMe, error: escalatedByMeError } = await supabase
      .from('ticket_escalations')
      .select(`
        id,
        ticket_id,
        from_role,
        to_role,
        reason,
        escalated_at,
        tickets (
          id,
          ticket_number,
          title,
          description,
          status,
          priority,
          type,
          created_at,
          updated_at,
          sla_deadline,
          submitter_name,
          submitter_email,
          source,
          unit_id,
          category_id
        )
      `)
      .eq('from_role', userRole)
      .order('escalated_at', { ascending: false });

    if (!escalatedByMeError && escalatedByMe) {
      const unitIds = escalatedByMe.map((e: any) => e.tickets?.unit_id).filter(Boolean);
      const categoryIds = escalatedByMe.map((e: any) => e.tickets?.category_id).filter(Boolean);

      const [unitsResult, categoriesResult] = await Promise.all([
        unitIds.length > 0 ? supabase.from('units').select('id, name, code').in('id', unitIds) : { data: [] },
        categoryIds.length > 0 ? supabase.from('service_categories').select('id, name').in('id', categoryIds) : { data: [] }
      ]);

      const unitsMap = new Map((unitsResult.data || []).map((u: any) => [u.id, u]));
      const categoriesMap = new Map((categoriesResult.data || []).map((c: any) => [c.id, c]));

      escalatedByMe.forEach((esc: any) => {
        if (esc.tickets && !tasks.find(t => t.id === esc.tickets.id && t.task_type === 'escalated_by_me')) {
          tasks.push({
            ...esc.tickets,
            task_type: 'escalated_by_me',
            escalated_at: esc.escalated_at,
            escalation_info: {
              from_role: esc.from_role,
              to_role: esc.to_role,
              reason: esc.reason,
              escalated_at: esc.escalated_at
            },
            units: unitsMap.get(esc.tickets.unit_id),
            service_categories: categoriesMap.get(esc.tickets.category_id)
          });
        }
      });
    }

    // 3. Get tickets I responded to
    const { data: myResponses, error: responsesError } = await supabase
      .from('ticket_responses')
      .select(`
        id,
        ticket_id,
        message,
        response_type,
        created_at,
        tickets (
          id,
          ticket_number,
          title,
          description,
          status,
          priority,
          type,
          created_at,
          updated_at,
          sla_deadline,
          submitter_name,
          submitter_email,
          source,
          unit_id,
          category_id
        )
      `)
      .eq('responder_id', userId)
      .order('created_at', { ascending: false });

    if (!responsesError && myResponses) {
      const respondedTicketIds = new Set<string>();
      const unitIds = myResponses.map((r: any) => r.tickets?.unit_id).filter(Boolean);
      const categoryIds = myResponses.map((r: any) => r.tickets?.category_id).filter(Boolean);

      const [unitsResult, categoriesResult] = await Promise.all([
        unitIds.length > 0 ? supabase.from('units').select('id, name, code').in('id', unitIds) : { data: [] },
        categoryIds.length > 0 ? supabase.from('service_categories').select('id, name').in('id', categoryIds) : { data: [] }
      ]);

      const unitsMap = new Map((unitsResult.data || []).map((u: any) => [u.id, u]));
      const categoriesMap = new Map((categoriesResult.data || []).map((c: any) => [c.id, c]));

      myResponses.forEach((resp: any) => {
        if (resp.tickets && !respondedTicketIds.has(resp.tickets.id)) {
          respondedTicketIds.add(resp.tickets.id);
          if (!tasks.find(t => t.id === resp.tickets.id)) {
            tasks.push({
              ...resp.tickets,
              task_type: 'responded',
              first_response_at: resp.created_at,
              units: unitsMap.get(resp.tickets.unit_id),
              service_categories: categoriesMap.get(resp.tickets.category_id)
            });
          }
        }
      });
    }

    // 4. Get tickets assigned to me
    const { data: assignedTickets, error: assignedError } = await supabase
      .from('tickets')
      .select(`
        id,
        ticket_number,
        title,
        description,
        status,
        priority,
        type,
        created_at,
        updated_at,
        sla_deadline,
        first_response_at,
        resolved_at,
        submitter_name,
        submitter_email,
        source,
        unit_id,
        category_id
      `)
      .eq('assigned_to', userId)
      .order('created_at', { ascending: false });

    if (!assignedError && assignedTickets) {
      const unitIds = assignedTickets.map((t: any) => t.unit_id).filter(Boolean);
      const categoryIds = assignedTickets.map((t: any) => t.category_id).filter(Boolean);

      const [unitsResult, categoriesResult] = await Promise.all([
        unitIds.length > 0 ? supabase.from('units').select('id, name, code').in('id', unitIds) : { data: [] },
        categoryIds.length > 0 ? supabase.from('service_categories').select('id, name').in('id', categoryIds) : { data: [] }
      ]);

      const unitsMap = new Map((unitsResult.data || []).map((u: any) => [u.id, u]));
      const categoriesMap = new Map((categoriesResult.data || []).map((c: any) => [c.id, c]));

      assignedTickets.forEach((ticket: any) => {
        if (!tasks.find(t => t.id === ticket.id)) {
          tasks.push({
            ...ticket,
            task_type: 'assigned',
            units: unitsMap.get(ticket.unit_id),
            service_categories: categoriesMap.get(ticket.category_id)
          });
        }
      });
    }

    // Apply filters
    let filteredTasks = tasks;

    if (task_type) {
      filteredTasks = filteredTasks.filter(t => t.task_type === task_type);
    }

    if (status) {
      filteredTasks = filteredTasks.filter(t => t.status === status);
    }

    if (priority) {
      filteredTasks = filteredTasks.filter(t => t.priority === priority);
    }

    if (search) {
      const searchLower = (search as string).toLowerCase();
      filteredTasks = filteredTasks.filter(t =>
        t.title?.toLowerCase().includes(searchLower) ||
        t.ticket_number?.toLowerCase().includes(searchLower) ||
        t.description?.toLowerCase().includes(searchLower)
      );
    }

    // Calculate stats
    const stats = {
      escalated_to_me: tasks.filter(t => t.task_type === 'escalated_to_me').length,
      escalated_by_me: tasks.filter(t => t.task_type === 'escalated_by_me').length,
      responded: tasks.filter(t => t.task_type === 'responded').length,
      followed_up: tasks.filter(t => t.task_type === 'followed_up').length,
      assigned: tasks.filter(t => t.task_type === 'assigned').length,
      total_open: tasks.filter(t => t.status === 'open').length,
      total_in_progress: tasks.filter(t => t.status === 'in_progress').length,
      total_resolved: tasks.filter(t => t.status === 'resolved').length,
      total_closed: tasks.filter(t => t.status === 'closed').length
    };

    res.json({
      success: true,
      data: filteredTasks,
      stats
    });
  } catch (error: any) {
    console.error('Error fetching my tasks:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
