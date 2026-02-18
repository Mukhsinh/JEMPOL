import api, { isVercelProduction } from './api';
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
  unit_id?: string;
  escalated_to_unit_id?: string;
  is_flagged?: boolean;
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
      console.log('🔍 isVercelProduction:', isVercelProduction());
      
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
        console.log('📊 Supabase result:', result);
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
        const response = await api.get('/public/tickets', { 
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
      // Gunakan endpoint public yang benar
      const response = await api.get(`/public/tickets/${id}`);
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
      // Cek apakah ada token autentikasi
      const token = localStorage.getItem('token');
      
      // Jika tidak ada token, gunakan endpoint public untuk tiket internal
      if (!token) {
        console.log('📝 No auth token, using public endpoint for internal ticket');
        const response = await api.post('/public/internal-tickets', {
          reporter_name: data.submitter_name || 'Anonymous',
          reporter_email: data.submitter_email || '',
          reporter_phone: data.submitter_phone || '',
          reporter_department: '',
          reporter_position: '',
          category: data.category_id,
          priority: data.priority || 'medium',
          title: data.title,
          description: data.description,
          unit_id: data.unit_id,
          source: 'web'
        });
        return response.data;
      }
      
      // Jika ada token, gunakan endpoint authenticated (gunakan endpoint public)
      const response = await api.post('/public/external-tickets', data);
      return response.data;
    } catch (error: any) {
      console.error('Error in createTicket:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Gagal membuat tiket',
        data: null
      };
    }
  }

  // Create internal ticket (untuk staff)
  async createInternalTicket(data: {
    reporter_name: string;
    reporter_email: string;
    reporter_phone?: string;
    reporter_department?: string;
    reporter_position?: string;
    category?: string;
    category_id?: string;
    priority: string;
    title: string;
    description: string;
    unit_id: string;
    source?: string;
  }) {
    try {
      console.log('📤 Sending internal ticket to /public/internal-tickets:', data);
      
      const response = await api.post('/public/internal-tickets', data, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 30000 // 30 detik timeout
      });
      
      console.log('✅ Internal ticket response:', response.data);
      
      // Pastikan response memiliki struktur yang benar
      if (!response.data) {
        throw new Error('Response kosong dari server');
      }
      
      // Cek apakah response adalah JSON yang valid
      if (typeof response.data === 'string') {
        console.error('❌ Response bukan JSON, melainkan string:', response.data.substring(0, 200));
        throw new Error('Server mengembalikan response yang tidak valid (bukan JSON)');
      }
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Error in createInternalTicket:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      console.error('❌ Error message:', error.message);
      
      // Handle berbagai jenis error
      let errorMessage = 'Gagal membuat tiket internal';
      
      if (error.message === 'Response kosong dari server') {
        errorMessage = 'Server mengembalikan response kosong';
      } else if (error.message.includes('bukan JSON')) {
        errorMessage = 'Server mengembalikan response yang tidak valid';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.status === 500) {
        errorMessage = 'Terjadi kesalahan server. Silakan coba lagi.';
      } else if (error.response?.status === 400) {
        errorMessage = 'Data yang dikirim tidak valid. Periksa kembali formulir.';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Request timeout. Silakan coba lagi.';
      } else if (error.message.includes('Network Error')) {
        errorMessage = 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
      } else if (error.message.includes('JSON')) {
        errorMessage = 'Terjadi kesalahan saat memproses response dari server';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return {
        success: false,
        error: errorMessage,
        details: error.response?.data?.details || null,
        data: null
      };
    }
  }

  // Update ticket
  async updateTicket(id: string, data: Partial<Ticket>) {
    try {
      // Gunakan Supabase langsung untuk update
      console.log('📝 Updating ticket via Supabase:', id);
      const result = await supabaseService.updateTicket(id, data);
      return result;
    } catch (error: any) {
      console.error('Error in updateTicket:', error);
      return {
        success: false,
        error: error.message || 'Gagal mengupdate tiket',
        data: null
      };
    }
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
      // Gunakan getTickets dengan filter unit_id
      return await this.getTickets({ unit_id: unitId });
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
    try {
      // Gunakan Supabase langsung untuk add response
      console.log('💬 Adding response via Supabase:', ticketId);
      const result = await supabaseService.addTicketResponse(ticketId, data);
      return result;
    } catch (error: any) {
      console.error('Error in addResponse:', error);
      return {
        success: false,
        error: error.message || 'Gagal menambahkan respon',
        data: null
      };
    }
  }

  // Get units
  async getUnits() {
    // Langsung gunakan Supabase untuk performa lebih baik
    console.log('🔄 Fetching units from Supabase...');
    const result = await supabaseService.getUnits();
    if (result.success) {
      console.log('✅ Units loaded:', result.data?.length || 0);
    }
    return result;
  }

  // Get service categories
  async getCategories() {
    // Langsung gunakan Supabase untuk performa lebih baik
    console.log('🔄 Fetching categories from Supabase...');
    const result = await supabaseService.getCategories();
    if (result.success) {
      console.log('✅ Categories loaded:', result.data?.length || 0);
    }
    return result;
  }

  // Get dashboard metrics
  async getDashboardMetrics() {
    // Langsung gunakan Supabase untuk performa lebih baik
    console.log('🔄 Fetching dashboard metrics from Supabase...');
    return await supabaseService.getDashboardMetrics();
  }

  // Get dashboard metrics with filters
  async getDashboardMetricsFiltered(filters?: {
    dateRange?: string;
    unit_id?: string;
    status?: string;
    category_id?: string;
  }) {
    // Langsung gunakan Supabase untuk performa lebih baik
    console.log('📈 Fetching dashboard metrics from Supabase with filters:', filters);
    return await supabaseService.getDashboardMetrics(filters);
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
    try {
      // Try backend first
      const response = await api.get(`/public/tickets/${trackingNumber}`, { timeout: 5000 });
      return response.data;
    } catch (error: any) {
      console.log('Backend not available, using Supabase direct...');
      
      // Fallback to Supabase direct
      try {
        const { supabase } = await import('../utils/supabaseClient');
        const { data, error: supabaseError } = await supabase
          .from('tickets')
          .select(`
            id,
            ticket_number,
            type,
            title,
            description,
            status,
            priority,
            created_at,
            resolved_at,
            units:unit_id(name, code),
            service_categories:category_id(name),
            ticket_responses:ticket_responses(id, message, response_type, created_at)
          `)
          .eq('ticket_number', trackingNumber)
          .single();

        if (supabaseError || !data) {
          return {
            success: false,
            error: 'Tiket tidak ditemukan',
            data: null
          };
        }

        return {
          success: true,
          data: data,
          message: 'Tiket ditemukan'
        };
      } catch (supabaseErr: any) {
        console.error('Supabase error:', supabaseErr);
        return {
          success: false,
          error: supabaseErr.message || 'Gagal mengambil data tiket',
          data: null
        };
      }
    }
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