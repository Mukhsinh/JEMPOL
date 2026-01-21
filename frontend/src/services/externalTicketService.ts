import api from './api';

export interface ExternalTicket {
  id: string;
  ticket_number: string;
  qr_code_id?: string;
  unit_id: string;
  reporter_identity_type: 'personal' | 'anonymous';
  reporter_name?: string;
  reporter_email?: string;
  reporter_phone?: string;
  reporter_address?: string;
  service_type: 'complaint' | 'request' | 'suggestion' | 'survey';
  category?: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'escalated' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  urgency_level: number;
  ai_classification?: any;
  sentiment_score?: number;
  confidence_score?: number;
  sla_deadline?: string;
  first_response_at?: string;
  resolved_at?: string;
  source: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  updated_at: string;
  units?: {
    id: string;
    name: string;
    code: string;
  };
  qr_codes?: {
    id: string;
    name: string;
    code: string;
  };
}

export interface CreateExternalTicketData {
  qr_code_id?: string;
  unit_id: string;
  reporter_identity_type: 'personal' | 'anonymous';
  reporter_name?: string;
  reporter_email?: string;
  reporter_phone?: string;
  reporter_address?: string;
  service_type: string;
  category?: string;
  title: string;
  description: string;
  attachments?: File[];
}

export const externalTicketService = {
  // Create external ticket (public endpoint)
  async createTicket(data: CreateExternalTicketData): Promise<any> {
    try {
      console.log('📤 Creating external ticket:', data);
      
      // Gunakan endpoint public yang benar
      const response = await api.post('/public/external-tickets', {
        reporter_identity_type: data.reporter_identity_type,
        reporter_name: data.reporter_name,
        reporter_email: data.reporter_email,
        reporter_phone: data.reporter_phone,
        reporter_address: data.reporter_address,
        service_type: data.service_type,
        category: data.category,
        title: data.title,
        description: data.description,
        qr_code: data.qr_code_id,
        unit_id: data.unit_id,
        source: 'web'
      });
      
      console.log('✅ External ticket created:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error creating external ticket:', error);
      console.error('❌ Error response:', error.response?.data);
      throw error;
    }
  },

  // Get external tickets (admin only)
  async getTickets(params?: {
    page?: number;
    limit?: number;
    status?: string;
    service_type?: string;
    priority?: string;
    unit_id?: string;
    search?: string;
  }): Promise<{ tickets: ExternalTicket[]; pagination: any }> {
    const response = await api.get('/external-tickets', { params });
    return response.data;
  },

  // Get external ticket by ID (admin only)
  async getTicketById(id: string): Promise<ExternalTicket> {
    const response = await api.get(`/external-tickets/${id}`);
    return response.data;
  },

  // Update external ticket status (admin only)
  async updateTicketStatus(
    id: string, 
    data: {
      status: string;
      response_message?: string;
      responder_id?: string;
    }
  ): Promise<any> {
    const response = await api.patch(`/external-tickets/${id}/status`, data);
    return response.data;
  },

  // Get external ticket statistics (admin only)
  async getStats(params?: {
    unit_id?: string;
    date_from?: string;
    date_to?: string;
  }): Promise<any> {
    const response = await api.get('/external-tickets/stats', { params });
    return response.data;
  },
};

export default externalTicketService;