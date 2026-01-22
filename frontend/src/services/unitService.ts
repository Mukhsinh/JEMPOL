import api, { isVercelProduction } from './api';
import { supabaseService } from './supabaseService';
import { supabase } from '../utils/supabaseClient';

export interface Unit {
  id: string;
  name: string;
  code: string;
  description?: string;
  unit_type_id?: string;
  parent_unit_id?: string;
  contact_email?: string;
  contact_phone?: string;
  sla_hours: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  unit_type?: {
    name: string;
    code: string;
    color: string;
  };
  parent_unit?: {
    name: string;
  };
}

export interface UnitType {
  id: string;
  name: string;
  code: string;
  description?: string;
  icon?: string;
  color: string;
  is_active: boolean;
}

export interface ServiceCategory {
  id: string;
  name: string;
  code: string;
  description?: string;
  default_sla_hours: number;
  requires_attachment: boolean;
  is_active: boolean;
}

export interface TicketType {
  id: string;
  name: string;
  code: string;
  description?: string;
  icon?: string;
  color: string;
  default_priority: string;
  default_sla_hours: number;
  is_active: boolean;
}

export interface TicketStatus {
  id: string;
  name: string;
  code: string;
  description?: string;
  status_type: string;
  color: string;
  is_final: boolean;
  display_order: number;
  is_active: boolean;
}

export interface PatientType {
  id: string;
  name: string;
  code: string;
  description?: string;
  priority_level: number;
  default_sla_hours: number;
  is_active: boolean;
}

export interface SlaSettings {
  id: string;
  name: string;
  priority_level?: string;
  response_time_hours: number;
  resolution_time_hours: number;
  escalation_time_hours?: number;
  business_hours_only: boolean;
  is_active: boolean;
  unit_type?: {
    name: string;
    code: string;
  };
  service_category?: {
    name: string;
    code: string;
  };
  patient_type?: {
    name: string;
    code: string;
  };
}

export interface AiTrustSettings {
  id: string;
  setting_name: string;
  confidence_threshold: number;
  auto_routing_enabled: boolean;
  auto_classification_enabled: boolean;
  manual_review_required: boolean;
  description?: string;
  is_active: boolean;
}

class UnitService {
  // Units management dengan improved error handling
  async getUnits(params?: { search?: string; type?: string; status?: string }): Promise<{ units: Unit[] }> {
    // Di Vercel production, gunakan Supabase langsung dengan relasi
    if (isVercelProduction()) {
      try {
        let query = supabase
          .from('units')
          .select(`
            *,
            unit_type:unit_type_id (id, name, code, color),
            parent_unit:parent_unit_id (id, name)
          `)
          .order('name');
        
        if (params?.status === 'active') {
          query = query.eq('is_active', true);
        } else if (params?.status === 'inactive') {
          query = query.eq('is_active', false);
        }
        
        if (params?.search) {
          query = query.or(`name.ilike.%${params.search}%,code.ilike.%${params.search}%`);
        }
        
        const { data, error } = await query;
        if (error) throw error;
        return { units: data || [] };
      } catch (error: any) {
        console.error('Supabase getUnits error:', error);
        return { units: [] };
      }
    }
    
    try {
      console.log('🔄 Fetching units from main endpoint...');
      const response = await api.get('/units', { params });
      
      // Handle berbagai format response dari backend
      if (Array.isArray(response.data)) {
        return { units: response.data };
      } else if (response.data && Array.isArray(response.data.data)) {
        // Backend mengembalikan { success: true, data: [...] }
        return { units: response.data.data };
      } else if (response.data && Array.isArray(response.data.units)) {
        return response.data;
      } else {
        console.warn('Format response units tidak dikenali:', response.data);
        return { units: [] };
      }
    } catch (error: any) {
      console.warn('⚠️ Main endpoint failed, trying Supabase direct:', error.message);
      const result = await supabaseService.getUnits();
      return { units: result.data || [] };
    }
  }

  async createUnit(unit: Partial<Unit>): Promise<Unit> {
    try {
      const response = await api.post('/units', unit);
      return response.data;
    } catch (error: any) {
      console.error('Error creating unit:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Gagal membuat unit kerja';
      throw new Error(errorMessage);
    }
  }

  async updateUnit(id: string, unit: Partial<Unit>): Promise<Unit> {
    try {
      const response = await api.put(`/units/${id}`, unit);
      return response.data;
    } catch (error: any) {
      console.error('Error updating unit:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Gagal memperbarui unit kerja';
      throw new Error(errorMessage);
    }
  }

  async deleteUnit(id: string): Promise<void> {
    try {
      await api.delete(`/units/${id}`);
    } catch (error: any) {
      console.error('Error deleting unit:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Gagal menghapus unit kerja';
      throw new Error(errorMessage);
    }
  }

  // Master data dengan improved fallback
  async getUnitTypes(): Promise<UnitType[]> {
    if (isVercelProduction()) {
      try {
        const { data, error } = await supabase
          .from('unit_types')
          .select('*')
          .order('name');
        if (error) throw error;
        return data || [];
      } catch (error: any) {
        console.error('Supabase getUnitTypes error:', error);
        return [];
      }
    }
    try {
      const response = await api.get('/units/unit-types');
      return response.data;
    } catch {
      try {
        const { data } = await supabase.from('unit_types').select('*').order('name');
        return data || [];
      } catch { return []; }
    }
  }

  async getServiceCategories(): Promise<ServiceCategory[]> {
    if (isVercelProduction()) {
      const result = await supabaseService.getCategories();
      return result.data || [];
    }
    try {
      const response = await api.get('/units/service-categories');
      return response.data;
    } catch {
      const result = await supabaseService.getCategories();
      return result.data || [];
    }
  }

  async getTicketTypes(): Promise<TicketType[]> {
    if (isVercelProduction()) {
      try {
        const { data, error } = await supabase
          .from('ticket_types')
          .select('*')
          .order('name');
        if (error) throw error;
        return data || [];
      } catch (error: any) {
        console.error('Supabase getTicketTypes error:', error);
        return [];
      }
    }
    try {
      const response = await api.get('/units/ticket-types');
      return response.data;
    } catch {
      try {
        const { data } = await supabase.from('ticket_types').select('*').order('name');
        return data || [];
      } catch { return []; }
    }
  }

  async getTicketStatuses(): Promise<TicketStatus[]> {
    if (isVercelProduction()) {
      try {
        const { data, error } = await supabase
          .from('ticket_statuses')
          .select('*')
          .order('display_order');
        if (error) throw error;
        return data || [];
      } catch (error: any) {
        console.error('Supabase getTicketStatuses error:', error);
        return [];
      }
    }
    try {
      const response = await api.get('/units/ticket-statuses');
      return response.data;
    } catch {
      try {
        const { data } = await supabase.from('ticket_statuses').select('*').order('display_order');
        return data || [];
      } catch { return []; }
    }
  }

  async getPatientTypes(): Promise<PatientType[]> {
    if (isVercelProduction()) {
      const result = await supabaseService.getPatientTypes();
      return result.data || [];
    }
    try {
      const response = await api.get('/units/patient-types');
      return response.data;
    } catch {
      const result = await supabaseService.getPatientTypes();
      return result.data || [];
    }
  }

  async getSlaSettings(): Promise<SlaSettings[]> {
    if (isVercelProduction()) {
      const result = await supabaseService.getSLASettings();
      return result.data || [];
    }
    try {
      const response = await api.get('/units/sla-settings');
      return response.data;
    } catch {
      const result = await supabaseService.getSLASettings();
      return result.data || [];
    }
  }

  // AI trust settings
  async getAiTrustSettings(): Promise<AiTrustSettings[]> {
    const response = await api.get('/units/ai-trust-settings');
    return response.data;
  }

  async updateAiTrustSettings(settings: Partial<AiTrustSettings>): Promise<AiTrustSettings> {
    const response = await api.put('/units/ai-trust-settings', settings);
    return response.data;
  }

  // Import units from file
  async importUnits(file: File): Promise<{ success: boolean; imported: number; message?: string }> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/units/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error: any) {
      console.error('Import units error:', error);
      throw new Error(error.response?.data?.message || 'Gagal import data');
    }
  }
}

export default new UnitService();