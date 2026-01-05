import api, { isVercelProduction } from './api';
import { fallbackService } from './fallbackService';
import { supabaseService } from './supabaseService';

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

export interface TicketFilters {
  status?: string;
  priority?: string;
  unit_id?: string;
  category_id?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
  limit?: number;
}

export interface APIResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

class ComplaintService {
  // Cache untuk tickets
  private static ticketsCache: { data: Ticket[], timestamp: number } | null = null;
  private static readonly CACHE_DURATION = 30000; // 30 detik

  // Get all tickets with filters
  async getTickets(filters: TicketFilters = {}): Promise<APIResponse<Ticket[]>> {
    try {
      console.log('🎫 Fetching tickets with filters:', filters);
      
      // Cek cache terlebih dahulu
      const now = Date.now();
      if (ComplaintService.ticketsCache && (now - ComplaintService.ticketsCache.timestamp) < ComplaintService.CACHE_DURATION) {
        console.log('📦 Using cached tickets data');
        return {
          success: true,
          data: ComplaintService.ticketsCache.data,
          message: 'Tickets berhasil diambil dari cache'
        };
      }
      
      // Di Vercel production atau backend tidak tersedia, gunakan Supabase langsung
      if (isVercelProduction()) {
        console.log('🌐 Using Supabase direct');
        const result = await supabaseService.getTickets(filters);
        if (result.success) {
          ComplaintService.ticketsCache = {
            data: result.data || [],
            timestamp: now
          };
        }
        return {
          success: result.success,
          data: result.data || [],
          message: result.message,
          error: result.error
        };
      }
      
      // Coba endpoint utama dengan timeout pendek
      try {
        const response = await api.get('/complaints', { 
          params: filters,
          timeout: 5000 // 5 detik timeout untuk cek backend
        });
        
        const tickets = response.data?.data || [];
        ComplaintService.ticketsCache = { data: tickets, timestamp: now };
        console.log('✅ Tickets fetched from backend:', tickets.length, 'tickets');
        
        return { success: true, data: tickets, message: 'Tickets berhasil diambil' };
      } catch (mainError: any) {
        console.log('⚠️ Backend tidak tersedia, menggunakan Supabase...');
        
        // Fallback ke Supabase langsung
        const result = await supabaseService.getTickets(filters);
        if (result.success) {
          ComplaintService.ticketsCache = { data: result.data || [], timestamp: now };
          console.log('✅ Tickets fetched from Supabase:', result.data?.length || 0, 'tickets');
          return { success: true, data: result.data || [], message: 'Tickets berhasil diambil' };
        }
        
        // Return cached data jika ada
        if (ComplaintService.ticketsCache) {
          return { success: true, data: ComplaintService.ticketsCache.data, message: 'Menggunakan cache' };
        }
        
        throw mainError;
      }
    } catch (error: any) {
      console.error('Error in getTickets:', error);
      return { success: false, data: [], error: error.message || 'Gagal mengambil data tiket' };
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
    // Gunakan Supabase langsung jika backend tidak tersedia
    if (isVercelProduction()) {
      console.log('🔄 Fetching units from Supabase...');
      const result = await supabaseService.getUnits();
      if (result.success) {
        console.log('✅ Units loaded:', result.data?.length || 0);
      }
      return result;
    }
    
    try {
      const response = await api.get('/complaints/units', { timeout: 5000 });
      return response.data;
    } catch (error: any) {
      console.log('⚠️ Backend tidak tersedia, menggunakan Supabase...');
      const result = await supabaseService.getUnits();
      if (result.success) {
        console.log('✅ Units loaded:', result.data?.length || 0);
      }
      return result;
    }
  }

  // Get service categories
  async getCategories() {
    // Gunakan Supabase langsung jika backend tidak tersedia
    if (isVercelProduction()) {
      console.log('🔄 Fetching categories from Supabase...');
      const result = await supabaseService.getCategories();
      if (result.success) {
        console.log('✅ Categories loaded:', result.data?.length || 0);
      }
      return result;
    }
    
    try {
      const response = await api.get('/complaints/categories', { timeout: 5000 });
      return response.data;
    } catch (error: any) {
      console.log('⚠️ Backend tidak tersedia, menggunakan Supabase...');
      const result = await supabaseService.getCategories();
      if (result.success) {
        console.log('✅ Categories loaded:', result.data?.length || 0);
      }
      return result;
    }
  }

  // Get dashboard metrics
  async getDashboardMetrics() {
    // Gunakan Supabase langsung jika backend tidak tersedia
    if (isVercelProduction()) {
      console.log('🔄 Fetching dashboard metrics from Supabase...');
      return await supabaseService.getDashboardMetrics();
    }
    
    try {
      const response = await api.get('/complaints/dashboard/metrics', { timeout: 5000 });
      return response.data;
    } catch (error: any) {
      console.log('⚠️ Backend tidak tersedia, menggunakan Supabase...');
      return await supabaseService.getDashboardMetrics();
    }
  }

  // Get dashboard metrics with filters
  async getDashboardMetricsFiltered(filters?: {
    dateRange?: string;
    unit_id?: string;
    status?: string;
    category_id?: string;
  }) {
    // Gunakan Supabase langsung jika backend tidak tersedia
    if (isVercelProduction()) {
      console.log('📈 Fetching dashboard metrics from Supabase...');
      return await supabaseService.getDashboardMetrics();
    }
    
    try {
      const response = await api.get('/complaints/dashboard/metrics/filtered', { 
        params: filters,
        timeout: 5000 
      });
      return response.data;
    } catch (error: any) {
      console.log('⚠️ Backend tidak tersedia, menggunakan Supabase...');
      return await supabaseService.getDashboardMetrics();
    }
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