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
  // Units management
  async getUnits(params?: { search?: string; type?: string; status?: string }): Promise<{ units: Unit[] }> {
    try {
      const response = await api.get('/units', { params });
      // Ensure we return the expected format
      if (Array.isArray(response.data)) {
        return { units: response.data };
      } else if (response.data && Array.isArray(response.data.units)) {
        return response.data;
      } else {
        return { units: response.data || [] };
      }
    } catch (error) {
      console.error('Error fetching units from main endpoint, trying public fallback:', error);
      // Fallback to public endpoint if main endpoint fails
      try {
        const fallbackResponse = await api.get('/public/units', { params });
        const fallbackData = fallbackResponse.data || [];
        return { units: Array.isArray(fallbackData) ? fallbackData : [] };
      } catch (fallbackError) {
        console.error('Public fallback also failed:', fallbackError);
        // Return empty array instead of throwing error
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

  // Master data
  async getUnitTypes(): Promise<UnitType[]> {
    try {
      const response = await api.get('/units/unit-types');
      return response.data;
    } catch (error) {
      console.error('Error fetching unit types, trying public fallback:', error);
      // Try public endpoint as fallback
      try {
        const fallbackResponse = await api.get('/public/unit-types');
        return fallbackResponse.data || [];
      } catch (fallbackError) {
        console.error('Public fallback failed, using default unit types:', fallbackError);
        // Return default unit types if API fails
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
          },
          {
            id: '3',
            name: 'Penunjang Medis',
            code: 'SUP',
            description: 'Unit Penunjang Medis',
            icon: 'medical_services',
            color: '#6366F1',
            is_active: true
          },
          {
            id: '4',
            name: 'Teknis',
            code: 'TEC',
            description: 'Unit Teknis',
            icon: 'engineering',
            color: '#6B7280',
            is_active: true
          }
        ];
      }
    }
  }

  async getServiceCategories(): Promise<ServiceCategory[]> {
    const response = await api.get('/units/service-categories');
    return response.data;
  }

  async getTicketTypes(): Promise<TicketType[]> {
    const response = await api.get('/units/ticket-types');
    return response.data;
  }

  async getTicketStatuses(): Promise<TicketStatus[]> {
    const response = await api.get('/units/ticket-statuses');
    return response.data;
  }

  async getPatientTypes(): Promise<PatientType[]> {
    const response = await api.get('/units/patient-types');
    return response.data;
  }

  async getSlaSettings(): Promise<SlaSettings[]> {
    const response = await api.get('/units/sla-settings');
    return response.data;
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