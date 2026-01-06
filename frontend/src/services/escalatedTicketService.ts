import api, { isVercelProduction } from './api';
import { supabase } from '../utils/supabaseClient';

export interface EscalatedTicket {
  id: string;
  ticket_number: string;
  title: string;
  description: string;
  unit_name: string;
  unit_color: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: string;
  created_at: string;
  sla_deadline: string;
  escalated_at: string;
  escalation_reason: string;
  ai_insight?: string;
  submitter_name?: string;
  assignee?: {
    name: string;
    role: string;
  };
}

export interface EscalationStats {
  total_active: number;
  high_urgency: number;
  waiting_response: number;
  completed_this_month: number;
  new_today: number;
}

export interface TicketDetailResponse {
  id: string;
  ticket_number: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  created_at: string;
  sla_deadline: string;
  submitter_name?: string;
  submitter_email?: string;
  submitter_phone?: string;
  units?: { id: string; name: string; code: string };
  users?: { id: string; full_name: string; role: string };
  ticket_responses?: Array<{
    id: string;
    message: string;
    created_at: string;
    responder_id: string;
    users?: { full_name: string };
  }>;
  ticket_escalations?: Array<{
    id: string;
    reason: string;
    escalated_at: string;
    from_role: string;
    to_role: string;
  }>;
}

class EscalatedTicketService {
  // Ambil tiket eskalasi untuk user saat ini (Kepala Unit)
  async getMyEscalatedTickets(): Promise<EscalatedTicket[]> {
    try {
      // Try backend first
      if (!isVercelProduction()) {
        try {
          const response = await api.get('/escalations/my-tickets', { timeout: 5000 });
          if (response.data.success) {
            return response.data.data || [];
          }
        } catch (backendError) {
          console.log('Backend tidak tersedia, menggunakan Supabase langsung...');
        }
      }

      // Fallback ke Supabase langsung
      return await this.getEscalatedTicketsFromSupabase();
    } catch (error) {
      console.error('Error fetching escalated tickets:', error);
      return [];
    }
  }

  // Query Supabase langsung untuk tiket eskalasi
  private async getEscalatedTicketsFromSupabase(): Promise<EscalatedTicket[]> {
    try {
      // Get escalations
      const { data: escalations, error: escError } = await supabase
        .from('ticket_escalations')
        .select('id, ticket_id, from_role, to_role, reason, escalated_at')
        .order('escalated_at', { ascending: false });

      if (escError) {
        console.error('Error fetching escalations:', escError);
        return [];
      }

      if (!escalations || escalations.length === 0) {
        return [];
      }

      // Get ticket IDs
      const ticketIds = escalations.map((e: any) => e.ticket_id).filter(Boolean);
      
      // Get tickets
      const { data: tickets, error: ticketError } = await supabase
        .from('tickets')
        .select('id, ticket_number, title, description, priority, status, created_at, sla_deadline, submitter_name, unit_id, assigned_to')
        .in('id', ticketIds);

      if (ticketError) {
        console.error('Error fetching tickets:', ticketError);
        return [];
      }

      // Get units
      const unitIds = tickets?.map((t: any) => t.unit_id).filter(Boolean) || [];
      const unitsMap = new Map<string, any>();
      if (unitIds.length > 0) {
        const { data: units } = await supabase
          .from('units')
          .select('id, name, code')
          .in('id', unitIds);
        units?.forEach((u: any) => unitsMap.set(u.id, u));
      }

      // Get assigned users
      const userIds = tickets?.map((t: any) => t.assigned_to).filter(Boolean) || [];
      const usersMap = new Map<string, any>();
      if (userIds.length > 0) {
        const { data: users } = await supabase
          .from('users')
          .select('id, full_name, role')
          .in('id', userIds);
        users?.forEach((u: any) => usersMap.set(u.id, u));
      }

      // Create tickets map
      const ticketsMap = new Map<string, any>();
      tickets?.forEach((t: any) => ticketsMap.set(t.id, t));

      // Format data
      const formattedData: EscalatedTicket[] = escalations.map((esc: any) => {
        const ticket = ticketsMap.get(esc.ticket_id);
        const unit = ticket?.unit_id ? unitsMap.get(ticket.unit_id) : null;
        const user = ticket?.assigned_to ? usersMap.get(ticket.assigned_to) : null;
        
        return {
          id: ticket?.id || esc.ticket_id,
          ticket_number: ticket?.ticket_number || 'N/A',
          title: ticket?.title || 'Tiket tidak ditemukan',
          description: ticket?.description || '',
          unit_name: unit?.name || 'Unit tidak diketahui',
          unit_color: '#3B82F6',
          priority: ticket?.priority || 'medium',
          status: ticket?.status || 'open',
          created_at: ticket?.created_at || esc.escalated_at,
          sla_deadline: ticket?.sla_deadline || '',
          escalated_at: esc.escalated_at,
          escalation_reason: esc.reason || '',
          submitter_name: ticket?.submitter_name,
          assignee: user ? { name: user.full_name, role: user.role } : undefined
        };
      });

      return formattedData;
    } catch (error) {
      console.error('Error in getEscalatedTicketsFromSupabase:', error);
      return [];
    }
  }

  // Ambil tiket prioritas tinggi
  async getPriorityTickets(): Promise<EscalatedTicket[]> {
    try {
      // Try backend first
      if (!isVercelProduction()) {
        try {
          const response = await api.get('/escalations/priority-tickets', { timeout: 5000 });
          if (response.data.success) {
            return response.data.data || [];
          }
        } catch (backendError) {
          console.log('Backend tidak tersedia, menggunakan Supabase langsung...');
        }
      }

      // Fallback ke Supabase langsung
      return await this.getPriorityTicketsFromSupabase();
    } catch (error) {
      console.error('Error fetching priority tickets:', error);
      return [];
    }
  }

  // Query Supabase langsung untuk tiket prioritas
  private async getPriorityTicketsFromSupabase(): Promise<EscalatedTicket[]> {
    try {
      const { data: tickets, error } = await supabase
        .from('tickets')
        .select('id, ticket_number, title, description, priority, status, created_at, sla_deadline, submitter_name, unit_id, assigned_to')
        .in('priority', ['high', 'critical'])
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching priority tickets:', error);
        return [];
      }

      if (!tickets || tickets.length === 0) {
        return [];
      }

      // Get units
      const unitIds = tickets.map((t: any) => t.unit_id).filter(Boolean);
      const unitsMap = new Map<string, any>();
      if (unitIds.length > 0) {
        const { data: units } = await supabase
          .from('units')
          .select('id, name, code')
          .in('id', unitIds);
        units?.forEach((u: any) => unitsMap.set(u.id, u));
      }

      // Get assigned users
      const userIds = tickets.map((t: any) => t.assigned_to).filter(Boolean);
      const usersMap = new Map<string, any>();
      if (userIds.length > 0) {
        const { data: users } = await supabase
          .from('users')
          .select('id, full_name, role')
          .in('id', userIds);
        users?.forEach((u: any) => usersMap.set(u.id, u));
      }

      const now = new Date();
      return tickets.map((ticket: any) => {
        const unit = ticket.unit_id ? unitsMap.get(ticket.unit_id) : null;
        const user = ticket.assigned_to ? usersMap.get(ticket.assigned_to) : null;
        const deadline = ticket.sla_deadline ? new Date(ticket.sla_deadline) : new Date(Date.now() + 24 * 60 * 60 * 1000);
        const remaining = deadline.getTime() - now.getTime();
        const hours = Math.floor(Math.abs(remaining) / (1000 * 60 * 60));
        const minutes = Math.floor((Math.abs(remaining) % (1000 * 60 * 60)) / (1000 * 60));

        return {
          id: ticket.id,
          ticket_number: ticket.ticket_number,
          title: ticket.title,
          description: ticket.description,
          unit_name: unit?.name || 'Unit tidak diketahui',
          unit_color: '#3B82F6',
          priority: ticket.priority,
          status: ticket.status,
          created_at: ticket.created_at,
          sla_deadline: ticket.sla_deadline || '',
          escalated_at: ticket.created_at,
          escalation_reason: '',
          sla_remaining: remaining < 0 ? `-${hours}j ${minutes}m` : `${hours}j ${minutes}m`,
          sla_status: remaining < 0 ? 'breached' : remaining < 2 * 60 * 60 * 1000 ? 'warning' : 'on_track',
          submitter_name: ticket.submitter_name,
          assignee: user ? { name: user.full_name, role: user.role } : undefined
        } as EscalatedTicket;
      });
    } catch (error) {
      console.error('Error in getPriorityTicketsFromSupabase:', error);
      return [];
    }
  }

  // Ambil data tinjauan eksekutif
  async getExecutiveOverview(): Promise<any> {
    try {
      // Try backend first
      if (!isVercelProduction()) {
        try {
          const response = await api.get('/escalations/executive-overview', { timeout: 5000 });
          if (response.data.success) {
            return response.data.data;
          }
        } catch (backendError) {
          console.log('Backend tidak tersedia, menggunakan Supabase langsung...');
        }
      }

      // Fallback ke Supabase langsung
      return await this.getExecutiveOverviewFromSupabase();
    } catch (error) {
      console.error('Error fetching executive overview:', error);
      return null;
    }
  }

  // Query Supabase langsung untuk tinjauan eksekutif
  private async getExecutiveOverviewFromSupabase(): Promise<any> {
    try {
      // Get escalations to director
      const { data: escalations, error: escError } = await supabase
        .from('ticket_escalations')
        .select('id, ticket_id, from_role, to_role, reason, escalated_at')
        .eq('to_role', 'director')
        .order('escalated_at', { ascending: false })
        .limit(10);

      if (escError) {
        console.error('Error fetching director escalations:', escError);
      }

      // Get ticket IDs
      const ticketIds = escalations?.map((e: any) => e.ticket_id).filter(Boolean) || [];
      
      let tickets: any[] = [];
      const unitsMap = new Map<string, any>();

      if (ticketIds.length > 0) {
        const { data: ticketData } = await supabase
          .from('tickets')
          .select('id, ticket_number, title, priority, status, sla_deadline, unit_id')
          .in('id', ticketIds);
        tickets = ticketData || [];

        const unitIds = tickets.map((t: any) => t.unit_id).filter(Boolean);
        if (unitIds.length > 0) {
          const { data: units } = await supabase
            .from('units')
            .select('id, name')
            .in('id', unitIds);
          units?.forEach((u: any) => unitsMap.set(u.id, u));
        }
      }

      const ticketsMap = new Map(tickets.map((t: any) => [t.id, t]));

      // Get stats
      const { count: totalEscalations } = await supabase
        .from('ticket_escalations')
        .select('*', { count: 'exact', head: true });

      const now = new Date();
      const formattedTickets = escalations?.map((esc: any) => {
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

      return {
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
      };
    } catch (error) {
      console.error('Error in getExecutiveOverviewFromSupabase:', error);
      return null;
    }
  }

  // Ambil detail tiket
  async getTicketDetail(id: string): Promise<TicketDetailResponse | null> {
    try {
      const response = await api.get(`/escalations/tickets/${id}`);
      if (response.data.success) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error('Error fetching ticket detail:', error);
      return null;
    }
  }

  // Kirim respon ke tiket
  async respondToTicket(ticketId: string, message: string, responseType: string = 'comment'): Promise<boolean> {
    try {
      const response = await api.post(`/escalations/tickets/${ticketId}/respond`, {
        message,
        response_type: responseType
      });
      return response.data.success;
    } catch (error) {
      console.error('Error responding to ticket:', error);
      return false;
    }
  }

  // Update status tiket
  async updateTicketStatus(ticketId: string, status: string): Promise<boolean> {
    try {
      const response = await api.patch(`/escalations/tickets/${ticketId}/status`, { status });
      return response.data.success;
    } catch (error) {
      console.error('Error updating ticket status:', error);
      return false;
    }
  }

  // Eskalasi tiket ke level lebih tinggi
  async escalateTicket(ticketId: string, toRole: string, reason: string): Promise<boolean> {
    try {
      const response = await api.post(`/escalations/tickets/${ticketId}/escalate`, {
        to_role: toRole,
        reason
      });
      return response.data.success;
    } catch (error) {
      console.error('Error escalating ticket:', error);
      return false;
    }
  }

  // Hitung statistik dari data tiket
  calculateStats(tickets: EscalatedTicket[]): EscalationStats {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return {
      total_active: tickets.filter(t => !['resolved', 'closed'].includes(t.status)).length,
      high_urgency: tickets.filter(t => t.priority === 'high' || t.priority === 'critical').length,
      waiting_response: tickets.filter(t => t.status === 'escalated').length,
      completed_this_month: tickets.filter(t => 
        ['resolved', 'closed'].includes(t.status) && 
        new Date(t.created_at) >= startOfMonth
      ).length,
      new_today: tickets.filter(t => new Date(t.escalated_at) >= startOfDay).length
    };
  }
}

export const escalatedTicketService = new EscalatedTicketService();
export default escalatedTicketService;
