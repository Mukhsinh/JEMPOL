import api from './api';

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
    try {
      console.log('🔄 Fetching units from main endpoint...');
      const response = await api.get('/units', { params });
      
      // Ensure we return the expected format
      if (Array.isArray(response.data)) {
        console.log('✅ Units fetched successfully from main endpoint');
        return { units: response.data };
      } else if (response.data && Array.isArray(response.data.units)) {
        console.log('✅ Units fetched successfully from main endpoint');
        return response.data;
      } else {
        console.log('✅ Units fetched successfully from main endpoint (transformed)');
        return { units: response.data || [] };
      }
    } catch (error: any) {
      console.warn('⚠️ Main endpoint failed, trying public fallback:', error.message);
      
      // Fallback to public endpoint if main endpoint fails
      try {
        const fallbackResponse = await api.get('/public/units', { params });
        const fallbackData = fallbackResponse.data || [];
        console.log('✅ Units fetched successfully from public fallback');
        return { units: Array.isArray(fallbackData) ? fallbackData : [] };
      } catch (fallbackError: any) {
        console.error('❌ Public fallback also failed:', fallbackError.message);
        
        // Return empty array with warning instead of throwing error
        console.warn('⚠️ Returning empty units array due to API failures');
        return { units: [] };
      }
    }
  }

  async createUnit(unit: Partial<Unit>): Promise<Unit> {
    const response = await api.post('/units', unit);
    return response.data;
  }

  async updateUnit(id: string, unit: Partial<Unit>): Promise<Unit> {
    const response = await api.put(`/units/${id}`, unit);
    return response.data;
  }

  async deleteUnit(id: string): Promise<void> {
    await api.delete(`/units/${id}`);
  }

  // Master data dengan improved fallback
  async getUnitTypes(): Promise<UnitType[]> {
    try {
      const response = await api.get('/units/unit-types');
      return response.data;
    } catch (error: any) {
      console.warn('⚠️ Unit types main endpoint failed, trying public fallback:', error.message);
      try {
        const fallbackResponse = await api.get('/public/unit-types');
        return fallbackResponse.data || [];
      } catch (fallbackError: any) {
        console.error('❌ Unit types public fallback failed, using defaults:', fallbackError.message);
        return [
          {
            id: '1',
            name: 'Administratif',
            code: 'ADM',
            description: 'Unit Administratif',
            icon: 'business',
            color: '#6B7280',
            is_active: true
          },
          {
            id: '2',
            name: 'Layanan Medis',
            code: 'MED',
            description: 'Unit Layanan Medis',
            icon: 'local_hospital',
            color: '#3B82F6',
            is_active: true
          }
        ];
      }
    }
  }

  async getServiceCategories(): Promise<ServiceCategory[]> {
    try {
      const response = await api.get('/units/service-categories');
      return response.data;
    } catch (error: any) {
      console.warn('⚠️ Service categories main endpoint failed, trying public fallback:', error.message);
      try {
        const fallbackResponse = await api.get('/master-data/public/service-categories');
        return fallbackResponse.data || [];
      } catch (fallbackError: any) {
        console.error('❌ Service categories public fallback failed, using defaults:', fallbackError.message);
        return [
          {
            id: '1',
            name: 'Layanan Umum',
            code: 'GEN',
            description: 'Layanan umum rumah sakit',
            default_sla_hours: 24,
            requires_attachment: false,
            is_active: true
          }
        ];
      }
    }
  }

  async getTicketTypes(): Promise<TicketType[]> {
    try {
      const response = await api.get('/units/ticket-types');
      return response.data;
    } catch (error: any) {
      console.warn('⚠️ Ticket types main endpoint failed, trying public fallback:', error.message);
      try {
        const fallbackResponse = await api.get('/master-data/public/ticket-types');
        return fallbackResponse.data || [];
      } catch (fallbackError: any) {
        console.error('❌ Ticket types public fallback failed, using defaults:', fallbackError.message);
        return [
          {
            id: '1',
            name: 'Keluhan',
            code: 'COMPLAINT',
            description: 'Keluhan layanan',
            icon: 'report_problem',
            color: '#EF4444',
            default_priority: 'medium',
            default_sla_hours: 24,
            is_active: true
          }
        ];
      }
    }
  }

  async getTicketStatuses(): Promise<TicketStatus[]> {
    try {
      const response = await api.get('/units/ticket-statuses');
      return response.data;
    } catch (error: any) {
      console.warn('⚠️ Ticket statuses main endpoint failed, trying public fallback:', error.message);
      try {
        const fallbackResponse = await api.get('/master-data/public/ticket-statuses');
        return fallbackResponse.data || [];
      } catch (fallbackError: any) {
        console.error('❌ Ticket statuses public fallback failed, using defaults:', fallbackError.message);
        return [
          {
            id: '1',
            name: 'Terbuka',
            code: 'OPEN',
            description: 'Tiket baru yang belum ditangani',
            status_type: 'open',
            color: '#3B82F6',
            is_final: false,
            display_order: 1,
            is_active: true
          }
        ];
      }
    }
  }

  async getPatientTypes(): Promise<PatientType[]> {
    try {
      const response = await api.get('/units/patient-types');
      return response.data;
    } catch (error: any) {
      console.warn('⚠️ Patient types main endpoint failed, trying public fallback:', error.message);
      try {
        const fallbackResponse = await api.get('/master-data/public/patient-types');
        return fallbackResponse.data || [];
      } catch (fallbackError: any) {
        console.error('❌ Patient types public fallback failed, using defaults:', fallbackError.message);
        return [
          {
            id: '1',
            name: 'Pasien Umum',
            code: 'GENERAL',
            description: 'Pasien umum',
            priority_level: 3,
            default_sla_hours: 24,
            is_active: true
          }
        ];
      }
    }
  }

  async getSlaSettings(): Promise<SlaSettings[]> {
    try {
      const response = await api.get('/units/sla-settings');
      return response.data;
    } catch (error: any) {
      console.warn('⚠️ SLA settings main endpoint failed, trying public fallback:', error.message);
      try {
        const fallbackResponse = await api.get('/master-data/public/sla-settings');
        return fallbackResponse.data || [];
      } catch (fallbackError: any) {
        console.error('❌ SLA settings public fallback failed, using defaults:', fallbackError.message);
        return [
          {
            id: '1',
            name: 'SLA Default',
            response_time_hours: 1,
            resolution_time_hours: 24,
            escalation_time_hours: 48,
            business_hours_only: false,
            is_active: true
          }
        ];
      }
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
}

export default new UnitService();