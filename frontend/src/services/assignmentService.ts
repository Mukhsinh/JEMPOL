import api, { isVercelProduction } from './api';
import { supabase } from '../utils/supabaseClient';

// Interface untuk tiket eskalasi
export interface EscalatedTicket {
  id: string;
  ticket_number: string;
  title: string;
  description: string;
  unit_id: string;
  unit_name: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: string;
  created_at: string;
  sla_deadline: string;
  escalated_at: string;
  escalation_reason: string;
  from_role: string;
  to_role: string;
  submitter_name?: string;
  submitter_email?: string;
  submitter_phone?: string;
  assigned_to?: string;
  assignee_name?: string;
  assignee_role?: string;
  sla_remaining?: string;
  sla_status?: 'on_track' | 'warning' | 'breached';
}

// Interface untuk statistik
export interface AssignmentStats {
  total_escalations: number;
  high_priority: number;
  sla_breached: number;
  waiting_response: number;
  resolved_this_month: number;
  new_today: number;
}

  
  // ==================== TICKET DETAIL ====================
  
  async getTicketDetail(ticketId: string): Promise<AssignmentTicket | null> {
    try {
      // Try backend first
      if (!isVercelProduction()) {
        try {
          const response = await api.get(`/escalations/tickets/${ticketId}`, { timeout: 8000 });
          if (response.data.success && response.data.data) {
            return this.formatSingleTicket(response.data.data);
          }
        } catch (backendError) {
          console.log('Backend tidak tersedia, menggunakan Supabase langsung...');
        }
      }
      
      // Fallback to Supabase
      return await this.getTicketDetailFromSupabase(ticketId);
    } catch (error) {
      console.error('Error fetching ticket detail:', error);
      return null;
    }
  }
  
  private async getTicketDetailFromSupabase(ticketId: string): Promise<AssignmentTicket | null> {
    try {
      const { data: ticket, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('id', ticketId)
        .single();
      
      if (error || !ticket) {
        console.error('Error fetching ticket:', error);
        return null;
      }
      
      // Get unit
      let unit = null;
      if (ticket.unit_id) {
        const { data } = await supabase
          .from('units')
          .select('id, name, code')
          .eq('id', ticket.unit_id)
          .single();
        unit = data;
      }
      
      // Get category
      let category = null;
      if (ticket.category_id) {
        const { data } = await supabase
          .from('service_categories')
          .select('id, name')
          .eq('id', ticket.category_id)
          .single();
        category = data;
      }
      
      // Get assignee
      let assignee = null;
      if (ticket.assigned_to) {
        const { data } = await supabase
          .from('users')
          .select('id, full_name, role')
          .eq('id', ticket.assigned_to)
          .single();
        assignee = data;
      }
      
      // Get escalation info
      const { data: escalation } = await supabase
        .from('ticket_escalations')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('escalated_at', { ascending: false })
        .limit(1)
        .single();
      
      const sla = calculateSLAStatus(ticket.sla_deadline, ticket.created_at);
      
      return {
        id: ticket.id,
        ticket_number: ticket.ticket_number,
        title: ticket.title,
        description: ticket.description || '',
        unit_id: ticket.unit_id,
        unit_name: unit?.name || 'Unit tidak diketahui',
        category_id: ticket.category_id,
        category_name: category?.name,
        priority: mapPriority(ticket.priority),
        status: ticket.status || 'open',
        type: ticket.type || 'complaint',
        created_at: ticket.created_at,
        updated_at: ticket.updated_at,
        sla_deadline: ticket.sla_deadline,
        first_response_at: ticket.first_response_at,
        resolved_at: ticket.resolved_at,
        submitter_name: ticket.submitter_name,
        submitter_email: ticket.submitter_email,
        submitter_phone: ticket.submitter_phone,
        assigned_to: ticket.assigned_to,
        assignee_name: assignee?.full_name,
        assignee_role: assignee?.role,
        created_by: ticket.created_by,
        source: ticket.source,
        ai_classification: ticket.ai_classification,
        sentiment_score: ticket.sentiment_score,
        confidence_score: ticket.confidence_score,
        escalated_at: escalation?.escalated_at,
        escalation_reason: escalation?.reason,
        escalation_from_role: escalation?.from_role,
        escalation_to_role: escalation?.to_role,
        sla_remaining: sla.remaining,
        sla_status: sla.status
      };
    } catch (error) {
      console.error('Error in getTicketDetailFromSupabase:', error);
      return null;
    }
  }
  
  // ==================== TICKET RESPONSES ====================
  
  async getTicketResponses(ticketId: string): Promise<TicketResponse[]> {
    try {
      const { data: responses, error } = await supabase
        .from('ticket_responses')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('Error fetching responses:', error);
        return [];
      }
      
      if (!responses || responses.length === 0) {
        return [];
      }
      
      // Get responder names
      const responderIds = [...new Set(responses.map(r => r.responder_id).filter(Boolean))];
      const respondersMap = new Map<string, string>();
      if (responderIds.length > 0) {
        const { data: users } = await supabase
          .from('users')
          .select('id, full_name')
          .in('id', responderIds);
        users?.forEach(u => respondersMap.set(u.id, u.full_name));
      }
      
      return responses.map(r => ({
        id: r.id,
        ticket_id: r.ticket_id,
        responder_id: r.responder_id,
        responder_name: respondersMap.get(r.responder_id) || 'Sistem',
        message: r.message,
        response_type: r.response_type || 'comment',
        is_internal: r.is_internal || false,
        created_at: r.created_at
      }));
    } catch (error) {
      console.error('Error fetching ticket responses:', error);
      return [];
    }
  }
  
  // ==================== TICKET ESCALATIONS ====================
  
  async getTicketEscalations(ticketId: string): Promise<TicketEscalation[]> {
    try {
      const { data: escalations, error } = await supabase
        .from('ticket_escalations')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('escalated_at', { ascending: true });
      
      if (error) {
        console.error('Error fetching escalations:', error);
        return [];
      }
      
      return escalations || [];
    } catch (error) {
      console.error('Error fetching ticket escalations:', error);
      return [];
    }
  }
  
  // ==================== ACTIONS ====================
  
  async respondToTicket(ticketId: string, message: string, responseType: string = 'comment', isInternal: boolean = true): Promise<boolean> {
    try {
      // Try backend first
      if (!isVercelProduction()) {
        try {
          const response = await api.post(`/escalations/tickets/${ticketId}/respond`, {
            message,
            response_type: responseType
          });
          return response.data.success;
        } catch (backendError) {
          console.log('Backend tidak tersedia, menggunakan Supabase langsung...');
        }
      }
      
      // Fallback to Supabase
      const { error } = await supabase
        .from('ticket_responses')
        .insert({
          ticket_id: ticketId,
          message,
          response_type: responseType,
          is_internal: isInternal
        });
      
      return !error;
    } catch (error) {
      console.error('Error responding to ticket:', error);
      return false;
    }
  }
  
  async updateTicketStatus(ticketId: string, status: string): Promise<boolean> {
    try {
      // Try backend first
      if (!isVercelProduction()) {
        try {
          const response = await api.patch(`/escalations/tickets/${ticketId}/status`, { status });
          return response.data.success;
        } catch (backendError) {
          console.log('Backend tidak tersedia, menggunakan Supabase langsung...');
        }
      }
      
      // Fallback to Supabase
      const { error } = await supabase
        .from('tickets')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', ticketId);
      
      return !error;
    } catch (error) {
      console.error('Error updating ticket status:', error);
      return false;
    }
  }
  
  async escalateTicket(ticketId: string, toRole: string, reason: string): Promise<boolean> {
    try {
      // Try backend first
      if (!isVercelProduction()) {
        try {
          const response = await api.post(`/escalations/tickets/${ticketId}/escalate`, {
            to_role: toRole,
            reason
          });
          return response.data.success;
        } catch (backendError) {
          console.log('Backend tidak tersedia, menggunakan Supabase langsung...');
        }
      }
      
      // Fallback to Supabase
      const { error: escError } = await supabase
        .from('ticket_escalations')
        .insert({
          ticket_id: ticketId,
          to_role: toRole,
          reason,
          escalation_type: 'manual'
        });
      
      if (escError) return false;
      
      // Update ticket status
      const { error: ticketError } = await supabase
        .from('tickets')
        .update({ status: 'escalated', updated_at: new Date().toISOString() })
        .eq('id', ticketId);
      
      return !ticketError;
    } catch (error) {
      console.error('Error escalating ticket:', error);
      return false;
    }
  }
  
  async assignTicket(ticketId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('tickets')
        .update({ assigned_to: userId, updated_at: new Date().toISOString() })
        .eq('id', ticketId);
      
      return !error;
    } catch (error) {
      console.error('Error assigning ticket:', error);
      return false;
    }
  }
  
  async closeTicket(ticketId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('tickets')
        .update({ 
          status: 'closed', 
          resolved_at: new Date().toISOString(),
          updated_at: new Date().toISOString() 
        })
        .eq('id', ticketId);
      
      return !error;
    } catch (error) {
      console.error('Error closing ticket:', error);
      return false;
    }
  }
  
  // ==================== STATS ====================
  
  calculateStats(tickets: AssignmentTicket[]): EscalationStats {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return {
      total_active: tickets.filter(t => !['resolved', 'closed'].includes(t.status)).length,
      high_urgency: tickets.filter(t => t.priority === 'high' || t.priority === 'critical').length,
      waiting_response: tickets.filter(t => t.status === 'escalated' || t.status === 'open').length,
      completed_this_month: tickets.filter(t =>
        ['resolved', 'closed'].includes(t.status) &&
        new Date(t.created_at) >= startOfMonth
      ).length,
      new_today: tickets.filter(t => new Date(t.escalated_at || t.created_at) >= startOfDay).length,
      sla_breach: tickets.filter(t => t.sla_status === 'breached').length
    };
  }
  
  // ==================== UNITS ====================
  
  async getUnits(): Promise<{ id: string; name: string; code: string }[]> {
    try {
      const { data, error } = await supabase
        .from('units')
        .select('id, name, code')
        .eq('is_active', true)
        .order('name');
      
      if (error) {
        console.error('Error fetching units:', error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Error fetching units:', error);
      return [];
    }
  }
  
  // ==================== HELPER METHODS ====================
  
  private formatTickets(data: any[]): AssignmentTicket[] {
    if (!Array.isArray(data)) return [];
    
    return data.map(item => {
      const sla = calculateSLAStatus(item.sla_deadline, item.created_at);
      return {
        id: item.id,
        ticket_number: item.ticket_number,
        title: item.title,
        description: item.description || '',
        unit_id: item.unit_id,
        unit_name: item.unit_name || item.units?.name || 'Unit tidak diketahui',
        category_id: item.category_id,
        category_name: item.category_name || item.service_categories?.name,
        priority: mapPriority(item.priority),
        status: item.status || 'open',
        type: item.type || 'complaint',
        created_at: item.created_at,
        updated_at: item.updated_at,
        sla_deadline: item.sla_deadline,
        first_response_at: item.first_response_at,
        resolved_at: item.resolved_at,
        submitter_name: item.submitter_name,
        submitter_email: item.submitter_email,
        submitter_phone: item.submitter_phone,
        assigned_to: item.assigned_to,
        assignee_name: item.assignee_name || item.assignee?.name || item.users?.full_name,
        assignee_role: item.assignee_role || item.assignee?.role || item.users?.role,
        source: item.source,
        ai_classification: item.ai_classification,
        sentiment_score: item.sentiment_score,
        confidence_score: item.confidence_score,
        escalated_at: item.escalated_at,
        escalation_reason: item.escalation_reason,
        escalation_from_role: item.escalation_from_role,
        escalation_to_role: item.escalation_to_role,
        sla_remaining: item.sla_remaining || sla.remaining,
        sla_status: item.sla_status || sla.status
      };
    });
  }
  
  private formatSingleTicket(data: any): AssignmentTicket {
    const sla = calculateSLAStatus(data.sla_deadline, data.created_at);
    return {
      id: data.id,
      ticket_number: data.ticket_number,
      title: data.title,
      description: data.description || '',
      unit_id: data.unit_id,
      unit_name: data.unit_name || data.units?.name || 'Unit tidak diketahui',
      category_id: data.category_id,
      category_name: data.category_name || data.service_categories?.name,
      priority: mapPriority(data.priority),
      status: data.status || 'open',
      type: data.type || 'complaint',
      created_at: data.created_at,
      updated_at: data.updated_at,
      sla_deadline: data.sla_deadline,
      first_response_at: data.first_response_at,
      resolved_at: data.resolved_at,
      submitter_name: data.submitter_name,
      submitter_email: data.submitter_email,
      submitter_phone: data.submitter_phone,
      assigned_to: data.assigned_to,
      assignee_name: data.assignee_name || data.users?.full_name,
      assignee_role: data.assignee_role || data.users?.role,
      created_by: data.created_by,
      source: data.source,
      ai_classification: data.ai_classification,
      sentiment_score: data.sentiment_score,
      confidence_score: data.confidence_score,
      escalated_at: data.ticket_escalations?.[0]?.escalated_at,
      escalation_reason: data.ticket_escalations?.[0]?.reason,
      escalation_from_role: data.ticket_escalations?.[0]?.from_role,
      escalation_to_role: data.ticket_escalations?.[0]?.to_role,
      sla_remaining: sla.remaining,
      sla_status: sla.status
    };
  }
}

export const assignmentService = new AssignmentService();
export default assignmentService;

// Interface untuk detail tiket
export interface TicketDetail extends EscalatedTicket {
  category_id?: string;
  category_name?: string;
  ai_classification?: { category: string; urgency: string; unit: string };
  ai_confidence?: number;
  sentiment_score?: number;
  attachments?: { id: string; file_name: string; file_path: string }[];
  responses?: TicketResponse[];
  escalations?: TicketEscalation[];
}

export interface TicketResponse {
  id: string;
  message: string;
  response_type: string;
  is_internal: boolean;
  created_at: string;
  responder_id: string;
  responder_name?: string;
}

export interface TicketEscalation {
  id: string;
  reason: string;
  from_role: string;
  to_role: string;
  escalated_at: string;
  from_user_name?: string;
  to_user_name?: string;
}

// Interface untuk tinjauan eksekutif
export interface ExecutiveOverview {
  tickets: EscalatedTicket[];
  stats: {
    total_escalation: number;
    sla_breach_percentage: number;
    avg_response_hours: number;
    satisfaction_index: number;
    new_escalations: number;
  };
  ai_insight?: {
    title: string;
    description: string;
    percentage?: number;
  };
}

class AssignmentService {
  // Hitung SLA status
  private calculateSLA(deadline: string | null, createdAt: string) {
    if (!deadline) return { remaining: '-', status: 'on_track' as const, hours: 0, minutes: 0 };
    const now = new Date();
    const slaDate = new Date(deadline);
    const diff = slaDate.getTime() - now.getTime();
    const hours = Math.floor(Math.abs(diff) / (1000 * 60 * 60));
    const minutes = Math.floor((Math.abs(diff) % (1000 * 60 * 60)) / (1000 * 60));
    
    let status: 'on_track' | 'warning' | 'breached' = 'on_track';
    if (diff < 0) status = 'breached';
    else if (diff < 2 * 60 * 60 * 1000) status = 'warning';
    
    const remaining = diff < 0 ? `-${hours}j ${minutes}m` : `${hours}j ${minutes}m`;
    return { remaining, status, hours, minutes };
  }

  // Ambil tiket eskalasi untuk Kepala Unit
  async getEscalatedTickets(): Promise<EscalatedTicket[]> {
    try {
      if (!isVercelProduction()) {
        try {
          const response = await api.get('/escalations/my-tickets', { timeout: 5000 });
          if (response.data.success) return response.data.data || [];
        } catch { console.log('Backend tidak tersedia, fallback ke Supabase...'); }
      }
      return await this.getEscalatedTicketsFromSupabase();
    } catch (error) {
      console.error('Error fetching escalated tickets:', error);
      return [];
    }
  }

  // Query Supabase untuk tiket eskalasi
  private async getEscalatedTicketsFromSupabase(): Promise<EscalatedTicket[]> {
    try {
      const { data: escalations, error: escError } = await supabase
        .from('ticket_escalations')
        .select('id, ticket_id, from_role, to_role, reason, escalated_at, from_user_id, to_user_id')
        .order('escalated_at', { ascending: false });

      if (escError) throw escError;
      if (!escalations?.length) return [];

      const ticketIds = escalations.map(e => e.ticket_id).filter(Boolean);
      if (!ticketIds.length) return [];

      const { data: tickets, error: ticketError } = await supabase
        .from('tickets')
        .select('id, ticket_number, title, description, priority, status, created_at, sla_deadline, submitter_name, submitter_email, submitter_phone, unit_id, assigned_to')
        .in('id', ticketIds);

      if (ticketError) throw ticketError;

      const unitIds = [...new Set(tickets?.map(t => t.unit_id).filter(Boolean) || [])];
      const userIds = [...new Set(tickets?.map(t => t.assigned_to).filter(Boolean) || [])];

      const [unitsRes, usersRes] = await Promise.all([
        unitIds.length ? supabase.from('units').select('id, name, code').in('id', unitIds) : { data: [] },
        userIds.length ? supabase.from('users').select('id, full_name, role').in('id', userIds) : { data: [] }
      ]);

      const unitsMap = new Map((unitsRes.data || []).map(u => [u.id, u]));
      const usersMap = new Map((usersRes.data || []).map(u => [u.id, u]));
      const ticketsMap = new Map((tickets || []).map(t => [t.id, t]));

      return escalations.map(esc => {
        const ticket = ticketsMap.get(esc.ticket_id);
        if (!ticket) return null;
        const unit = unitsMap.get(ticket.unit_id);
        const assignee = usersMap.get(ticket.assigned_to);
        const sla = this.calculateSLA(ticket.sla_deadline, ticket.created_at);

        return {
          id: ticket.id,
          ticket_number: ticket.ticket_number,
          title: ticket.title,
          description: ticket.description,
          unit_id: ticket.unit_id,
          unit_name: unit?.name || 'Unit tidak diketahui',
          priority: ticket.priority || 'medium',
          status: ticket.status || 'open',
          created_at: ticket.created_at,
          sla_deadline: ticket.sla_deadline,
          escalated_at: esc.escalated_at,
          escalation_reason: esc.reason,
          from_role: esc.from_role,
          to_role: esc.to_role,
          submitter_name: ticket.submitter_name,
          submitter_email: ticket.submitter_email,
          submitter_phone: ticket.submitter_phone,
          assigned_to: ticket.assigned_to,
          assignee_name: assignee?.full_name,
          assignee_role: assignee?.role,
          sla_remaining: sla.remaining,
          sla_status: sla.status
        } as EscalatedTicket;
      }).filter(Boolean) as EscalatedTicket[];
    } catch (error) {
      console.error('Error in getEscalatedTicketsFromSupabase:', error);
      return [];
    }
  }

  // Ambil tiket prioritas tinggi untuk Manager
  async getPriorityTickets(): Promise<EscalatedTicket[]> {
    try {
      if (!isVercelProduction()) {
        try {
          const response = await api.get('/escalations/priority-tickets', { timeout: 5000 });
          if (response.data.success) return response.data.data || [];
        } catch { console.log('Backend tidak tersedia, fallback ke Supabase...'); }
      }
      return await this.getPriorityTicketsFromSupabase();
    } catch (error) {
      console.error('Error fetching priority tickets:', error);
      return [];
    }
  }

  private async getPriorityTicketsFromSupabase(): Promise<EscalatedTicket[]> {
    try {
      const { data: tickets, error } = await supabase
        .from('tickets')
        .select('id, ticket_number, title, description, priority, status, created_at, sla_deadline, submitter_name, submitter_email, submitter_phone, unit_id, assigned_to')
        .in('priority', ['high', 'critical'])
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      if (!tickets?.length) return [];

      const unitIds = [...new Set(tickets.map(t => t.unit_id).filter(Boolean))];
      const userIds = [...new Set(tickets.map(t => t.assigned_to).filter(Boolean))];

      const [unitsRes, usersRes] = await Promise.all([
        unitIds.length ? supabase.from('units').select('id, name, code').in('id', unitIds) : { data: [] },
        userIds.length ? supabase.from('users').select('id, full_name, role').in('id', userIds) : { data: [] }
      ]);

      const unitsMap = new Map((unitsRes.data || []).map(u => [u.id, u]));
      const usersMap = new Map((usersRes.data || []).map(u => [u.id, u]));

      return tickets.map(ticket => {
        const unit = unitsMap.get(ticket.unit_id);
        const assignee = usersMap.get(ticket.assigned_to);
        const sla = this.calculateSLA(ticket.sla_deadline, ticket.created_at);

        return {
          id: ticket.id,
          ticket_number: ticket.ticket_number,
          title: ticket.title,
          description: ticket.description,
          unit_id: ticket.unit_id,
          unit_name: unit?.name || 'Unit tidak diketahui',
          priority: ticket.priority || 'medium',
          status: ticket.status || 'open',
          created_at: ticket.created_at,
          sla_deadline: ticket.sla_deadline,
          escalated_at: ticket.created_at,
          escalation_reason: '',
          from_role: '',
          to_role: 'manager',
          submitter_name: ticket.submitter_name,
          submitter_email: ticket.submitter_email,
          submitter_phone: ticket.submitter_phone,
          assigned_to: ticket.assigned_to,
          assignee_name: assignee?.full_name,
          assignee_role: assignee?.role,
          sla_remaining: sla.remaining,
          sla_status: sla.status
        } as EscalatedTicket;
      });
    } catch (error) {
      console.error('Error in getPriorityTicketsFromSupabase:', error);
      return [];
    }
  }

  // Ambil data tinjauan eksekutif untuk Direktur
  async getExecutiveOverview(): Promise<ExecutiveOverview | null> {
    try {
      if (!isVercelProduction()) {
        try {
          const response = await api.get('/escalations/executive-overview', { timeout: 5000 });
          if (response.data.success) return response.data.data;
        } catch { console.log('Backend tidak tersedia, fallback ke Supabase...'); }
      }
      return await this.getExecutiveOverviewFromSupabase();
    } catch (error) {
      console.error('Error fetching executive overview:', error);
      return null;
    }
  }

  private async getExecutiveOverviewFromSupabase(): Promise<ExecutiveOverview> {
    try {
      // Ambil eskalasi ke direktur
      const { data: escalations } = await supabase
        .from('ticket_escalations')
        .select('id, ticket_id, from_role, to_role, reason, escalated_at')
        .eq('to_role', 'director')
        .order('escalated_at', { ascending: false })
        .limit(20);

      const ticketIds = escalations?.map(e => e.ticket_id).filter(Boolean) || [];
      let tickets: any[] = [];
      let units: any[] = [];

      if (ticketIds.length) {
        const { data: ticketData } = await supabase
          .from('tickets')
          .select('id, ticket_number, title, priority, status, sla_deadline, created_at, unit_id, submitter_name')
          .in('id', ticketIds);
        tickets = ticketData || [];

        const unitIds = [...new Set(tickets.map(t => t.unit_id).filter(Boolean))];
        if (unitIds.length) {
          const { data: unitData } = await supabase.from('units').select('id, name').in('id', unitIds);
          units = unitData || [];
        }
      }

      const ticketsMap = new Map(tickets.map(t => [t.id, t]));
      const unitsMap = new Map(units.map(u => [u.id, u]));

      // Hitung statistik
      const { count: totalEscalations } = await supabase
        .from('ticket_escalations')
        .select('*', { count: 'exact', head: true });

      const { count: slaBreach } = await supabase
        .from('tickets')
        .select('*', { count: 'exact', head: true })
        .lt('sla_deadline', new Date().toISOString())
        .not('status', 'in', '("resolved","closed")');

      const formattedTickets = (escalations || []).map(esc => {
        const ticket = ticketsMap.get(esc.ticket_id);
        const unit = ticket ? unitsMap.get(ticket.unit_id) : null;
        const sla = this.calculateSLA(ticket?.sla_deadline, ticket?.created_at || esc.escalated_at);

        return {
          id: ticket?.id || esc.ticket_id,
          ticket_number: ticket?.ticket_number || 'N/A',
          title: ticket?.title || 'Tiket tidak ditemukan',
          description: esc.reason,
          unit_id: ticket?.unit_id || '',
          unit_name: unit?.name || 'Unit tidak diketahui',
          priority: ticket?.priority || 'high',
          status: ticket?.status || 'escalated',
          created_at: ticket?.created_at || esc.escalated_at,
          sla_deadline: ticket?.sla_deadline || '',
          escalated_at: esc.escalated_at,
          escalation_reason: esc.reason,
          from_role: esc.from_role,
          to_role: esc.to_role,
          submitter_name: ticket?.submitter_name,
          sla_remaining: sla.remaining,
          sla_status: sla.status
        } as EscalatedTicket;
      });

      return {
        tickets: formattedTickets,
        stats: {
          total_escalation: totalEscalations || 0,
          sla_breach_percentage: slaBreach ? Math.round((slaBreach / (totalEscalations || 1)) * 100) : 0,
          avg_response_hours: 4.5,
          satisfaction_index: 4.8,
          new_escalations: formattedTickets.filter(t => {
            const escDate = new Date(t.escalated_at);
            const today = new Date();
            return escDate.toDateString() === today.toDateString();
          }).length
        },
        ai_insight: {
          title: 'Analisis Tren Eskalasi',
          description: 'Sistem mendeteksi pola eskalasi yang memerlukan perhatian khusus.',
          percentage: 15
        }
      };
    } catch (error) {
      console.error('Error in getExecutiveOverviewFromSupabase:', error);
      return { tickets: [], stats: { total_escalation: 0, sla_breach_percentage: 0, avg_response_hours: 0, satisfaction_index: 0, new_escalations: 0 } };
    }
  }

  // Ambil detail tiket
  async getTicketDetail(id: string): Promise<TicketDetail | null> {
    try {
      if (!isVercelProduction()) {
        try {
          const response = await api.get(`/escalations/tickets/${id}`, { timeout: 5000 });
          if (response.data.success) {
            const data = response.data.data;
            return this.formatTicketDetail(data);
          }
        } catch { console.log('Backend tidak tersedia, fallback ke Supabase...'); }
      }
      return await this.getTicketDetailFromSupabase(id);
    } catch (error) {
      console.error('Error fetching ticket detail:', error);
      return null;
    }
  }

  private async getTicketDetailFromSupabase(id: string): Promise<TicketDetail | null> {
    try {
      const { data: ticket, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !ticket) return null;

      // Ambil data terkait
      const [unitRes, assigneeRes, responsesRes, escalationsRes, attachmentsRes] = await Promise.all([
        ticket.unit_id ? supabase.from('units').select('id, name, code').eq('id', ticket.unit_id).single() : { data: null },
        ticket.assigned_to ? supabase.from('users').select('id, full_name, role').eq('id', ticket.assigned_to).single() : { data: null },
        supabase.from('ticket_responses').select('id, message, response_type, is_internal, created_at, responder_id').eq('ticket_id', id).order('created_at', { ascending: true }),
        supabase.from('ticket_escalations').select('id, reason, from_role, to_role, escalated_at, from_user_id, to_user_id').eq('ticket_id', id).order('escalated_at', { ascending: true }),
        supabase.from('ticket_attachments').select('id, file_name, file_path').eq('ticket_id', id)
      ]);

      // Ambil nama responder
      const responderIds = [...new Set((responsesRes.data || []).map(r => r.responder_id).filter(Boolean))];
      let respondersMap = new Map();
      if (responderIds.length) {
        const { data: responders } = await supabase.from('users').select('id, full_name').in('id', responderIds);
        respondersMap = new Map((responders || []).map(r => [r.id, r.full_name]));
      }

      const sla = this.calculateSLA(ticket.sla_deadline, ticket.created_at);

      return {
        id: ticket.id,
        ticket_number: ticket.ticket_number,
        title: ticket.title,
        description: ticket.description,
        unit_id: ticket.unit_id,
        unit_name: unitRes.data?.name || 'Unit tidak diketahui',
        priority: ticket.priority || 'medium',
        status: ticket.status || 'open',
        created_at: ticket.created_at,
        sla_deadline: ticket.sla_deadline,
        escalated_at: escalationsRes.data?.[0]?.escalated_at || ticket.created_at,
        escalation_reason: escalationsRes.data?.[0]?.reason || '',
        from_role: escalationsRes.data?.[0]?.from_role || '',
        to_role: escalationsRes.data?.[0]?.to_role || '',
        submitter_name: ticket.submitter_name,
        submitter_email: ticket.submitter_email,
        submitter_phone: ticket.submitter_phone,
        assigned_to: ticket.assigned_to,
        assignee_name: assigneeRes.data?.full_name,
        assignee_role: assigneeRes.data?.role,
        sla_remaining: sla.remaining,
        sla_status: sla.status,
        category_id: ticket.category_id,
        ai_classification: ticket.ai_classification,
        ai_confidence: ticket.confidence_score,
        sentiment_score: ticket.sentiment_score,
        attachments: attachmentsRes.data || [],
        responses: (responsesRes.data || []).map(r => ({
          ...r,
          responder_name: respondersMap.get(r.responder_id) || 'Sistem'
        })),
        escalations: escalationsRes.data || []
      };
    } catch (error) {
      console.error('Error in getTicketDetailFromSupabase:', error);
      return null;
    }
  }

  private formatTicketDetail(data: any): TicketDetail {
    const sla = this.calculateSLA(data.sla_deadline, data.created_at);
    return {
      id: data.id,
      ticket_number: data.ticket_number,
      title: data.title,
      description: data.description,
      unit_id: data.unit_id,
      unit_name: data.units?.name || 'Unit tidak diketahui',
      priority: data.priority || 'medium',
      status: data.status || 'open',
      created_at: data.created_at,
      sla_deadline: data.sla_deadline,
      escalated_at: data.ticket_escalations?.[0]?.escalated_at || data.created_at,
      escalation_reason: data.ticket_escalations?.[0]?.reason || '',
      from_role: data.ticket_escalations?.[0]?.from_role || '',
      to_role: data.ticket_escalations?.[0]?.to_role || '',
      submitter_name: data.submitter_name,
      submitter_email: data.submitter_email,
      submitter_phone: data.submitter_phone,
      assigned_to: data.assigned_to,
      assignee_name: data.users?.full_name,
      assignee_role: data.users?.role,
      sla_remaining: sla.remaining,
      sla_status: sla.status,
      ai_classification: data.ai_classification,
      ai_confidence: data.confidence_score,
      sentiment_score: data.sentiment_score,
      responses: data.ticket_responses?.map((r: any) => ({
        id: r.id,
        message: r.message,
        response_type: r.response_type,
        is_internal: r.is_internal,
        created_at: r.created_at,
        responder_id: r.responder_id,
        responder_name: r.users?.full_name || 'Sistem'
      })) || [],
      escalations: data.ticket_escalations || []
    };
  }

  // Kirim respon ke tiket
  async respondToTicket(ticketId: string, message: string, responseType: string = 'comment', isInternal: boolean = true): Promise<boolean> {
    try {
      if (!isVercelProduction()) {
        try {
          const response = await api.post(`/escalations/tickets/${ticketId}/respond`, { message, response_type: responseType });
          return response.data.success;
        } catch { console.log('Backend tidak tersedia, fallback ke Supabase...'); }
      }

      const { error } = await supabase
        .from('ticket_responses')
        .insert({ ticket_id: ticketId, message, response_type: responseType, is_internal: isInternal });

      return !error;
    } catch (error) {
      console.error('Error responding to ticket:', error);
      return false;
    }
  }

  // Update status tiket
  async updateTicketStatus(ticketId: string, status: string): Promise<boolean> {
    try {
      if (!isVercelProduction()) {
        try {
          const response = await api.patch(`/escalations/tickets/${ticketId}/status`, { status });
          return response.data.success;
        } catch { console.log('Backend tidak tersedia, fallback ke Supabase...'); }
      }

      const { error } = await supabase
        .from('tickets')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', ticketId);

      return !error;
    } catch (error) {
      console.error('Error updating ticket status:', error);
      return false;
    }
  }

  // Eskalasi tiket
  async escalateTicket(ticketId: string, toRole: string, reason: string): Promise<boolean> {
    try {
      if (!isVercelProduction()) {
        try {
          const response = await api.post(`/escalations/tickets/${ticketId}/escalate`, { to_role: toRole, reason });
          return response.data.success;
        } catch { console.log('Backend tidak tersedia, fallback ke Supabase...'); }
      }

      const { error: escError } = await supabase
        .from('ticket_escalations')
        .insert({ ticket_id: ticketId, to_role: toRole, reason, escalation_type: 'manual' });

      if (escError) return false;

      const { error: updateError } = await supabase
        .from('tickets')
        .update({ status: 'escalated', updated_at: new Date().toISOString() })
        .eq('id', ticketId);

      return !updateError;
    } catch (error) {
      console.error('Error escalating ticket:', error);
      return false;
    }
  }

  // Ambil daftar unit
  async getUnits(): Promise<{ id: string; name: string; code: string }[]> {
    try {
      const { data, error } = await supabase
        .from('units')
        .select('id, name, code')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching units:', error);
      return [];
    }
  }

  // Hitung statistik
  calculateStats(tickets: EscalatedTicket[]): AssignmentStats {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return {
      total_escalations: tickets.length,
      high_priority: tickets.filter(t => t.priority === 'high' || t.priority === 'critical').length,
      sla_breached: tickets.filter(t => t.sla_status === 'breached').length,
      waiting_response: tickets.filter(t => t.status === 'escalated' || t.status === 'open').length,
      resolved_this_month: tickets.filter(t => ['resolved', 'closed'].includes(t.status) && new Date(t.created_at) >= startOfMonth).length,
      new_today: tickets.filter(t => new Date(t.escalated_at) >= startOfDay).length
    };
  }
}

export const assignmentService = new AssignmentService();
export default assignmentService;
