/**
 * Supabase Direct Service
 * Service untuk komunikasi langsung dengan Supabase tanpa melalui backend API
 * Digunakan untuk deployment Vercel dimana backend tidak tersedia
 */

import { supabase } from '../utils/supabaseClient';

export interface SupabaseTicket {
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
  category_id?: string;
  assigned_to?: string;
  created_by?: string;
}

class SupabaseService {
  // ==================== TICKETS ====================
  
  async getTickets(filters: {
    status?: string;
    priority?: string;
    unit_id?: string;
    category_id?: string;
    search?: string;
    limit?: number;
  } = {}) {
    try {
      let query = supabase
        .from('tickets')
        .select(`
          *,
          units:unit_id (id, name, code),
          service_categories:category_id (id, name),
          users:assigned_to (full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters.priority && filters.priority !== 'all') {
        query = query.eq('priority', filters.priority);
      }
      if (filters.unit_id) {
        query = query.eq('unit_id', filters.unit_id);
      }
      if (filters.category_id) {
        query = query.eq('category_id', filters.category_id);
      }
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,ticket_number.ilike.%${filters.search}%`);
      }
      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) throw error;

      return {
        success: true,
        data: data || [],
        message: 'Tickets berhasil diambil'
      };
    } catch (error: any) {
      console.error('SupabaseService.getTickets error:', error);
      return {
        success: false,
        data: [],
        error: error.message || 'Gagal mengambil data tiket'
      };
    }
  }

  async getTicketById(id: string) {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          *,
          units:unit_id (id, name, code),
          service_categories:category_id (id, name),
          users:assigned_to (full_name, email),
          creator:created_by (full_name, email)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      return {
        success: true,
        data,
        message: 'Ticket berhasil diambil'
      };
    } catch (error: any) {
      console.error('SupabaseService.getTicketById error:', error);
      return {
        success: false,
        data: null,
        error: error.message || 'Gagal mengambil data tiket'
      };
    }
  }

  async createTicket(ticketData: Partial<SupabaseTicket>) {
    try {
      // Generate ticket number
      const ticketNumber = `TKT-${Date.now().toString(36).toUpperCase()}`;
      
      const { data, error } = await supabase
        .from('tickets')
        .insert({
          ...ticketData,
          ticket_number: ticketNumber,
          status: ticketData.status || 'open',
          priority: ticketData.priority || 'medium',
          source: ticketData.source || 'web',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data,
        message: 'Ticket berhasil dibuat'
      };
    } catch (error: any) {
      console.error('SupabaseService.createTicket error:', error);
      return {
        success: false,
        data: null,
        error: error.message || 'Gagal membuat tiket'
      };
    }
  }

  async updateTicket(id: string, updates: Partial<SupabaseTicket>) {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data,
        message: 'Ticket berhasil diupdate'
      };
    } catch (error: any) {
      console.error('SupabaseService.updateTicket error:', error);
      return {
        success: false,
        data: null,
        error: error.message || 'Gagal mengupdate tiket'
      };
    }
  }

  // ==================== UNITS ====================

  async getUnits() {
    try {
      const { data, error } = await supabase
        .from('units')
        .select(`
          *,
          unit_type:unit_type_id (id, name, code, color),
          parent_unit:parent_unit_id (id, name)
        `)
        .order('name');

      if (error) throw error;

      return {
        success: true,
        data: data || [],
        message: 'Units berhasil diambil'
      };
    } catch (error: any) {
      console.error('SupabaseService.getUnits error:', error);
      return {
        success: false,
        data: [],
        error: error.message || 'Gagal mengambil data unit'
      };
    }
  }

  // ==================== TICKET TYPES ====================

  async getTicketTypes() {
    try {
      const { data, error } = await supabase
        .from('ticket_types')
        .select('*')
        .order('name');

      if (error) throw error;

      return {
        success: true,
        data: data || [],
        message: 'Ticket types berhasil diambil'
      };
    } catch (error: any) {
      console.error('SupabaseService.getTicketTypes error:', error);
      return {
        success: false,
        data: [],
        error: error.message || 'Gagal mengambil data tipe tiket'
      };
    }
  }

  // ==================== TICKET STATUSES ====================

  async getTicketStatuses() {
    try {
      const { data, error } = await supabase
        .from('ticket_statuses')
        .select('*')
        .order('display_order');

      if (error) throw error;

      return {
        success: true,
        data: data || [],
        message: 'Ticket statuses berhasil diambil'
      };
    } catch (error: any) {
      console.error('SupabaseService.getTicketStatuses error:', error);
      return {
        success: false,
        data: [],
        error: error.message || 'Gagal mengambil data status tiket'
      };
    }
  }

  // ==================== UNIT TYPES ====================

  async getUnitTypes() {
    try {
      const { data, error } = await supabase
        .from('unit_types')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;

      return {
        success: true,
        data: data || [],
        message: 'Unit types berhasil diambil'
      };
    } catch (error: any) {
      console.error('SupabaseService.getUnitTypes error:', error);
      return {
        success: false,
        data: [],
        error: error.message || 'Gagal mengambil data tipe unit'
      };
    }
  }

  // ==================== CATEGORIES ====================

  async getCategories() {
    try {
      const { data, error } = await supabase
        .from('service_categories')
        .select('*')
        .order('name');

      if (error) throw error;

      return {
        success: true,
        data: data || [],
        message: 'Categories berhasil diambil'
      };
    } catch (error: any) {
      console.error('SupabaseService.getCategories error:', error);
      return {
        success: false,
        data: [],
        error: error.message || 'Gagal mengambil data kategori'
      };
    }
  }

  // ==================== DASHBOARD METRICS ====================

  async getDashboardMetrics() {
    try {
      // Get status counts
      const { data: tickets, error: ticketsError } = await supabase
        .from('tickets')
        .select('status, priority, created_at');

      if (ticketsError) throw ticketsError;

      const statusCounts: Record<string, number> = {};
      const priorityCounts: Record<string, number> = {};
      
      (tickets || []).forEach((ticket: any) => {
        statusCounts[ticket.status] = (statusCounts[ticket.status] || 0) + 1;
        priorityCounts[ticket.priority] = (priorityCounts[ticket.priority] || 0) + 1;
      });

      // Get recent tickets
      const { data: recentTickets, error: recentError } = await supabase
        .from('tickets')
        .select(`
          *,
          units:unit_id (id, name, code),
          service_categories:category_id (id, name)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (recentError) throw recentError;

      return {
        success: true,
        data: {
          statusCounts,
          priorityCounts,
          totalTickets: tickets?.length || 0,
          recentTickets: recentTickets || []
        },
        message: 'Dashboard metrics berhasil diambil'
      };
    } catch (error: any) {
      console.error('SupabaseService.getDashboardMetrics error:', error);
      return {
        success: false,
        data: {
          statusCounts: {},
          priorityCounts: {},
          totalTickets: 0,
          recentTickets: []
        },
        error: error.message || 'Gagal mengambil data dashboard'
      };
    }
  }

  // ==================== USERS ====================

  async getUsers() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('full_name');

      if (error) throw error;

      return {
        success: true,
        data: data || [],
        message: 'Users berhasil diambil'
      };
    } catch (error: any) {
      console.error('SupabaseService.getUsers error:', error);
      return {
        success: false,
        data: [],
        error: error.message || 'Gagal mengambil data user'
      };
    }
  }

  // ==================== ADMINS ====================

  async getAdmins() {
    try {
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .order('full_name');

      if (error) throw error;

      return {
        success: true,
        data: data || [],
        message: 'Admins berhasil diambil'
      };
    } catch (error: any) {
      console.error('SupabaseService.getAdmins error:', error);
      return {
        success: false,
        data: [],
        error: error.message || 'Gagal mengambil data admin'
      };
    }
  }

  // ==================== SLA SETTINGS ====================

  async getSLASettings() {
    try {
      const { data, error } = await supabase
        .from('sla_settings')
        .select(`
          *,
          unit_types:unit_type_id (id, name, code),
          service_categories:service_category_id (id, name, code),
          patient_types:patient_type_id (id, name, code)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        data: data || [],
        message: 'SLA settings berhasil diambil'
      };
    } catch (error: any) {
      console.error('SupabaseService.getSLASettings error:', error);
      return {
        success: false,
        data: [],
        error: error.message || 'Gagal mengambil data SLA'
      };
    }
  }

  // ==================== PATIENT TYPES ====================

  async getPatientTypes() {
    try {
      const { data, error } = await supabase
        .from('patient_types')
        .select('*')
        .order('name');

      if (error) throw error;

      return {
        success: true,
        data: data || [],
        message: 'Patient types berhasil diambil'
      };
    } catch (error: any) {
      console.error('SupabaseService.getPatientTypes error:', error);
      return {
        success: false,
        data: [],
        error: error.message || 'Gagal mengambil data tipe pasien'
      };
    }
  }

  // ==================== SERVICE CATEGORIES ====================

  async getServiceCategories() {
    try {
      const { data, error } = await supabase
        .from('service_categories')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        data: data || [],
        message: 'Service categories berhasil diambil'
      };
    } catch (error: any) {
      console.error('SupabaseService.getServiceCategories error:', error);
      return {
        success: false,
        data: [],
        error: error.message || 'Gagal mengambil data kategori layanan'
      };
    }
  }

  // ==================== SLA SETTINGS (Enhanced) ====================

  async getSLASettingsEnhanced() {
    try {
      const { data, error } = await supabase
        .from('sla_settings')
        .select(`
          *,
          unit_types:unit_type_id (id, name, code),
          service_categories:service_category_id (id, name, code),
          patient_types:patient_type_id (id, name, code)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        data: data || [],
        message: 'SLA settings berhasil diambil'
      };
    } catch (error: any) {
      console.error('SupabaseService.getSLASettingsEnhanced error:', error);
      return {
        success: false,
        data: [],
        error: error.message || 'Gagal mengambil data SLA settings'
      };
    }
  }

  // ==================== TICKET CLASSIFICATIONS ====================

  async getTicketClassifications() {
    try {
      const { data, error } = await supabase
        .from('ticket_classifications')
        .select('*')
        .order('name');

      if (error) throw error;

      return {
        success: true,
        data: data || [],
        message: 'Ticket classifications berhasil diambil'
      };
    } catch (error: any) {
      console.error('SupabaseService.getTicketClassifications error:', error);
      return {
        success: false,
        data: [],
        error: error.message || 'Gagal mengambil data klasifikasi tiket'
      };
    }
  }

  // ==================== ROLES ====================

  async getRoles() {
    try {
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .order('name');

      if (error) throw error;

      return {
        success: true,
        data: data || [],
        message: 'Roles berhasil diambil'
      };
    } catch (error: any) {
      console.error('SupabaseService.getRoles error:', error);
      return {
        success: false,
        data: [],
        error: error.message || 'Gagal mengambil data role'
      };
    }
  }

  // ==================== RESPONSE TEMPLATES ====================

  async getResponseTemplates() {
    try {
      const { data, error } = await supabase
        .from('response_templates')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;

      return {
        success: true,
        data: data || [],
        message: 'Response templates berhasil diambil'
      };
    } catch (error: any) {
      console.error('SupabaseService.getResponseTemplates error:', error);
      return {
        success: false,
        data: [],
        error: error.message || 'Gagal mengambil data template respon'
      };
    }
  }

  // ==================== QR CODES ====================

  async getQRCodes() {
    try {
      const { data, error } = await supabase
        .from('qr_codes')
        .select(`
          *,
          units:unit_id (id, name, code)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        data: data || [],
        message: 'QR codes berhasil diambil'
      };
    } catch (error: any) {
      console.error('SupabaseService.getQRCodes error:', error);
      return {
        success: false,
        data: [],
        error: error.message || 'Gagal mengambil data QR code'
      };
    }
  }

  async getQRCodeById(id: string) {
    try {
      const { data, error } = await supabase
        .from('qr_codes')
        .select(`
          *,
          units:unit_id (id, name, code)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      return {
        success: true,
        data,
        message: 'QR code berhasil diambil'
      };
    } catch (error: any) {
      console.error('SupabaseService.getQRCodeById error:', error);
      return {
        success: false,
        data: null,
        error: error.message || 'Gagal mengambil data QR code'
      };
    }
  }

  async getQRCodeByCode(code: string) {
    try {
      console.log('🔍 Fetching QR code by code:', code);
      
      // Gunakan query tanpa auth untuk akses publik
      const { data, error } = await supabase
        .from('qr_codes')
        .select(`
          id,
          unit_id,
          code,
          name,
          description,
          is_active,
          redirect_type,
          auto_fill_unit,
          show_options,
          units:unit_id (id, name, code)
        `)
        .eq('code', code)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('❌ Supabase query error:', error.message, error.code);
        throw error;
      }

      if (!data) {
        throw new Error('QR code tidak ditemukan');
      }

      console.log('✅ QR code found:', data.name, 'redirect_type:', data.redirect_type);

      // Update usage count (fire and forget, ignore errors for anon users)
      supabase
        .from('qr_codes')
        .update({ usage_count: (data.usage_count || 0) + 1 })
        .eq('id', data.id)
        .then(() => {})
        .catch(() => {});

      return {
        success: true,
        data,
        message: 'QR code berhasil diambil'
      };
    } catch (error: any) {
      console.error('SupabaseService.getQRCodeByCode error:', error.message);
      return {
        success: false,
        data: null,
        error: error.message || 'Gagal mengambil data QR code'
      };
    }
  }

  async createQRCode(qrData: {
    unit_id: string;
    name: string;
    description?: string;
    redirect_type?: string;
    auto_fill_unit?: boolean;
    show_options?: string[];
  }) {
    try {
      // Generate unique code and token
      const code = `QR-${Date.now().toString(36).toUpperCase()}`;
      const token = `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 15)}`;

      const { data, error } = await supabase
        .from('qr_codes')
        .insert({
          ...qrData,
          code,
          token,
          is_active: true,
          usage_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select(`
          *,
          units:unit_id (id, name, code)
        `)
        .single();

      if (error) throw error;

      return {
        success: true,
        data,
        message: 'QR code berhasil dibuat'
      };
    } catch (error: any) {
      console.error('SupabaseService.createQRCode error:', error);
      return {
        success: false,
        data: null,
        error: error.message || 'Gagal membuat QR code'
      };
    }
  }

  async updateQRCode(id: string, updates: {
    name?: string;
    description?: string;
    is_active?: boolean;
    redirect_type?: string;
    auto_fill_unit?: boolean;
    show_options?: string[];
  }) {
    try {
      const { data, error } = await supabase
        .from('qr_codes')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select(`
          *,
          units:unit_id (id, name, code)
        `)
        .single();

      if (error) throw error;

      return {
        success: true,
        data,
        message: 'QR code berhasil diupdate'
      };
    } catch (error: any) {
      console.error('SupabaseService.updateQRCode error:', error);
      return {
        success: false,
        data: null,
        error: error.message || 'Gagal mengupdate QR code'
      };
    }
  }

  async deleteQRCode(id: string) {
    try {
      const { error } = await supabase
        .from('qr_codes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return {
        success: true,
        message: 'QR code berhasil dihapus'
      };
    } catch (error: any) {
      console.error('SupabaseService.deleteQRCode error:', error);
      return {
        success: false,
        error: error.message || 'Gagal menghapus QR code'
      };
    }
  }

  // ==================== TICKET RESPONSES ====================

  async getTicketResponses(ticketId: string) {
    try {
      const { data, error } = await supabase
        .from('ticket_responses')
        .select(`
          *,
          responder:responder_id (full_name, role)
        `)
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return {
        success: true,
        data: data || [],
        message: 'Ticket responses berhasil diambil'
      };
    } catch (error: any) {
      console.error('SupabaseService.getTicketResponses error:', error);
      return {
        success: false,
        data: [],
        error: error.message || 'Gagal mengambil data respon tiket'
      };
    }
  }

  async addTicketResponse(ticketId: string, responseData: {
    message: string;
    is_internal?: boolean;
    response_type?: string;
    responder_id?: string;
  }) {
    try {
      const { data, error } = await supabase
        .from('ticket_responses')
        .insert({
          ticket_id: ticketId,
          ...responseData,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data,
        message: 'Response berhasil ditambahkan'
      };
    } catch (error: any) {
      console.error('SupabaseService.addTicketResponse error:', error);
      return {
        success: false,
        data: null,
        error: error.message || 'Gagal menambahkan respon'
      };
    }
  }

  // ==================== APP SETTINGS ====================

  async getAppSettings() {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      return {
        success: true,
        data: data || {},
        message: 'App settings berhasil diambil'
      };
    } catch (error: any) {
      console.error('SupabaseService.getAppSettings error:', error);
      return {
        success: false,
        data: {},
        error: error.message || 'Gagal mengambil pengaturan aplikasi'
      };
    }
  }

  // ==================== HEALTH CHECK ====================

  async healthCheck() {
    try {
      const { error } = await supabase
        .from('admins')
        .select('count')
        .limit(1);

      if (error) throw error;

      return {
        success: true,
        message: 'Supabase connection OK',
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('SupabaseService.healthCheck error:', error);
      return {
        success: false,
        error: error.message || 'Supabase connection failed'
      };
    }
  }
}

export const supabaseService = new SupabaseService();
export default supabaseService;
