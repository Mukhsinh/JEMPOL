import api from './api';
import { fallbackService } from './fallbackService';

export interface Ticket {
  id: string;
  ticket_number: string;
  type: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at?: string;
  resolved_at?: string;
  sla_deadline?: string;
  first_response_at?: string;
  submitter_name?: string;
  submitter_email?: string;
  submitter_phone?: string;
  submitter_address?: string;
  is_anonymous: boolean;
  source: string;
  units?: {
    id: string;
    name: string;
    code: string;
  };
  service_categories?: {
    id: string;
    name: string;
  };
  users?: {
    full_name: string;
    email: string;
  };
  creator?: {
    full_name: string;
    email: string;
  };
}

export interface CreateTicketData {
  type: string;
  category_id: string;
  title: string;
  description: string;
  unit_id: string;
  priority?: string;
  submitter_name?: string;
  submitter_email?: string;
  submitter_phone?: string;
  submitter_address?: string;
  is_anonymous?: boolean;
}

export interface TicketResponse {
  id: string;
  ticket_id: string;
  message: string;
  is_internal: boolean;
  response_type: string;
  created_at: string;
  responder?: {
    full_name: string;
    role: string;
  };
}

export interface Unit {
  id: string;
  name: string;
  code: string;
  description?: string;
  contact_email?: string;
  contact_phone?: string;
  is_active: boolean;
}

export interface ServiceCategory {
  id: string;
  name: string;
  code: string;
  description?: string;
  requires_attachment: boolean;
  is_active: boolean;
}

export interface DashboardMetrics {
  statusCounts: Record<string, number>;
  recentTickets: Ticket[];
}

class ComplaintService {
  // Get all tickets with filters
  async getTickets(params?: {
    status?: string;
    unit_id?: string;
    assigned_to?: string;
    page?: number;
    limit?: number;
  }) {
    try {
      const response = await api.get('/complaints/tickets', { params });
      return response.data;
    } catch (error: any) {
      console.error('Error in getTickets:', error);
      
      // Try fallback to public endpoint if authentication fails
      if (error.message?.includes('Token akses diperlukan') || 
          error.message?.includes('401') ||
          error.message?.includes('Unauthorized')) {
        console.log('Trying fallback public tickets...');
        return await fallbackService.getPublicTickets(params);
      }
      
      return {
        success: false,
        error: error.message || 'Gagal mengambil data tiket',
        data: []
      };
    }
  }

  // Get single ticket by ID
  async getTicket(id: string) {
    try {
      const response = await api.get(`/complaints/tickets/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error in getTicket:', error);
      return {
        success: false,
        error: error.message || 'Gagal mengambil data tiket',
        data: null
      };
    }
  }

  // Create new ticket
  async createTicket(data: CreateTicketData) {
    try {
      const response = await api.post('/complaints/tickets', data);
      return response.data;
    } catch (error: any) {
      console.error('Error in createTicket:', error);
      return {
        success: false,
        error: error.message || 'Gagal membuat tiket',
        data: null
      };
    }
  }

  // Update ticket
  async updateTicket(id: string, data: Partial<Ticket>) {
    const response = await api.put(`/complaints/tickets/${id}`, data);
    return response.data;
  }

  // Update complaint (alias untuk updateTicket)
  async updateComplaint(id: string, data: Partial<Ticket>) {
    return this.updateTicket(id, data);
  }

  // Get complaint by ID (alias untuk getTicket)
  async getComplaintById(id: string) {
    return this.getTicket(id);
  }

  // Get complaints by unit
  async getComplaintsByUnit(unitId: string) {
    try {
      const response = await api.get(`/complaints/unit/${unitId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error in getComplaintsByUnit:', error);
      return {
        success: false,
        error: error.message || 'Gagal mengambil data tiket berdasarkan unit',
        data: []
      };
    }
  }

  // Add response to ticket
  async addResponse(ticketId: string, data: {
    message: string;
    is_internal?: boolean;
    response_type?: string;
  }) {
    const response = await api.post(`/complaints/tickets/${ticketId}/responses`, data);
    return response.data;
  }

  // Get units
  async getUnits() {
    try {
      const response = await api.get('/complaints/units');
      return response.data;
    } catch (error: any) {
      console.error('Error in getUnits:', error);
      
      // Try fallback to public endpoint if authentication fails
      if (error.message?.includes('Token akses diperlukan') || 
          error.message?.includes('401') ||
          error.message?.includes('Unauthorized')) {
        console.log('Trying fallback public units...');
        return await fallbackService.getPublicUnits();
      }
      
      return {
        success: false,
        error: error.message || 'Gagal mengambil data unit',
        data: []
      };
    }
  }

  // Get service categories
  async getCategories() {
    try {
      const response = await api.get('/complaints/categories');
      return response.data;
    } catch (error: any) {
      console.error('Error in getCategories:', error);
      
      // Try fallback to public endpoint if authentication fails
      if (error.message?.includes('Token akses diperlukan') || 
          error.message?.includes('401') ||
          error.message?.includes('Unauthorized')) {
        console.log('Trying fallback public categories...');
        return await fallbackService.getPublicCategories();
      }
      
      return {
        success: false,
        error: error.message || 'Gagal mengambil data kategori',
        data: []
      };
    }
  }

  // Get dashboard metrics
  async getDashboardMetrics() {
    try {
      const response = await api.get('/complaints/dashboard/metrics');
      return response.data;
    } catch (error: any) {
      console.error('Error in getDashboardMetrics:', error);
      return {
        success: false,
        error: error.message || 'Gagal mengambil data dashboard',
        data: {
          statusCounts: {},
          recentTickets: [],
          categoryStats: {}
        }
      };
    }
  }

  // Get dashboard metrics with filters
  async getDashboardMetricsFiltered(filters?: {
    dateRange?: string;
    unit_id?: string;
    status?: string;
    category_id?: string;
  }) {
    const response = await api.get('/complaints/dashboard/metrics/filtered', { params: filters });
    return response.data;
  }

  // Public API methods (no auth required)
  async getPublicCategories() {
    const response = await api.get('/public/categories');
    return response.data;
  }

  async getQRCodeInfo(token: string) {
    const response = await api.get(`/public/qr/${token}`);
    return response.data;
  }

  async createPublicTicket(token: string, data: any) {
    const response = await api.post(`/public/qr/${token}/tickets`, data);
    return response.data;
  }

  async getPublicTicket(trackingNumber: string) {
    const response = await api.get(`/public/tickets/${trackingNumber}`);
    return response.data;
  }

  async submitSurvey(ticketId: string, data: {
    overall_score: number;
    response_time_score: number;
    solution_quality_score: number;
    staff_courtesy_score: number;
    comments?: string;
  }) {
    const response = await api.post(`/public/surveys/${ticketId}`, data);
    return response.data;
  }
}

export const complaintService = new ComplaintService();
export default complaintService;