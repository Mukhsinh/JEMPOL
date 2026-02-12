import api from './api';

export interface EscalateTicketData {
  to_unit_id: string;
  cc_unit_ids?: string[];
  reason: string;
  notes?: string;
  priority?: string;
}

export interface RespondTicketData {
  message: string;
  resolution?: string;
  is_internal?: boolean;
  mark_resolved?: boolean;
}

export interface FlagTicketData {
  is_flagged: boolean;
  flag_reason?: string;
}

export interface EscalationUnit {
  id: string;
  ticket_id: string;
  unit_id: string;
  is_primary: boolean;
  is_cc: boolean;
  status: string;
  received_at?: string;
  completed_at?: string;
  notes?: string;
  units?: {
    name: string;
    code: string;
  };
}

export interface TicketEscalation {
  id: string;
  ticket_id: string;
  from_user_id?: string;
  to_unit_id?: string;
  cc_unit_ids?: string[];
  reason: string;
  notes?: string;
  escalation_type: string;
  escalated_at: string;
  from_user?: {
    full_name: string;
    email: string;
  };
  to_unit?: {
    name: string;
    code: string;
  };
  cc_units?: Array<{
    id: string;
    name: string;
    code: string;
  }>;
}

class TicketActionService {
  // Eskalasi tiket ke unit lain dengan tembusan
  async escalateTicket(ticketId: string, data: EscalateTicketData) {
    try {
      const response = await api.post(`/ticket-actions/tickets/${ticketId}/escalate`, data);
      return response.data;
    } catch (error: any) {
      console.error('Error escalating ticket:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Gagal melakukan eskalasi tiket'
      };
    }
  }

  // Respon tiket (bisa langsung selesaikan)
  async respondTicket(ticketId: string, data: RespondTicketData) {
    try {
      const response = await api.post(`/ticket-actions/tickets/${ticketId}/respond`, data);
      return response.data;
    } catch (error: any) {
      console.error('Error responding to ticket:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Gagal menambahkan respon'
      };
    }
  }

  // Flag/unflag tiket
  async flagTicket(ticketId: string, data: FlagTicketData) {
    try {
      const response = await api.post(`/ticket-actions/tickets/${ticketId}/flag`, data);
      return response.data;
    } catch (error: any) {
      console.error('Error flagging ticket:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Gagal mengubah status flag tiket'
      };
    }
  }

  // Get tiket berdasarkan unit
  async getTicketsByUnit(unitId: string, filters?: { status?: string; priority?: string }) {
    try {
      const response = await api.get(`/ticket-actions/tickets/by-unit/${unitId}`, { params: filters });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching tickets by unit:', error);
      return {
        success: false,
        data: [],
        error: error.response?.data?.error || error.message || 'Gagal mengambil data tiket'
      };
    }
  }

  // Get history eskalasi tiket
  async getTicketEscalations(ticketId: string): Promise<{ success: boolean; data: TicketEscalation[]; error?: string }> {
    try {
      const response = await api.get(`/ticket-actions/tickets/${ticketId}/escalations`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching ticket escalations:', error);
      return {
        success: false,
        data: [],
        error: error.response?.data?.error || error.message || 'Gagal mengambil data eskalasi'
      };
    }
  }

  // Get unit eskalasi tiket
  async getTicketEscalationUnits(ticketId: string): Promise<{ success: boolean; data: EscalationUnit[]; error?: string }> {
    try {
      const response = await api.get(`/ticket-actions/tickets/${ticketId}/escalation-units`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching escalation units:', error);
      return {
        success: false,
        data: [],
        error: error.response?.data?.error || error.message || 'Gagal mengambil data unit eskalasi'
      };
    }
  }

  // Update status eskalasi unit
  async updateEscalationUnitStatus(escalationUnitId: string, status: string, notes?: string) {
    try {
      const response = await api.patch(`/ticket-actions/escalation-units/${escalationUnitId}/status`, {
        status,
        notes
      });
      return response.data;
    } catch (error: any) {
      console.error('Error updating escalation unit status:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Gagal mengupdate status eskalasi'
      };
    }
  }
}

export const ticketActionService = new TicketActionService();
export default ticketActionService;
