import api, { isVercelProduction } from './api';
import { supabaseService } from './supabaseService';

export interface SLASetting {
  id: string;
  name: string;
  unit_type_id?: string;
  service_category_id?: string;
  patient_type_id?: string;
  priority_level: 'low' | 'medium' | 'high' | 'critical';
  response_time_hours: number;
  resolution_time_hours: number;
  escalation_time_hours?: number;
  business_hours_only: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  unit_types?: {
    id: string;
    name: string;
    code: string;
  };
  service_categories?: {
    id: string;
    name: string;
    code: string;
  };
  patient_types?: {
    id: string;
    name: string;
    code: string;
  };
}

export interface CreateSLASettingData {
  name: string;
  unit_type_id?: string;
  service_category_id?: string;
  patient_type_id?: string;
  priority_level: 'low' | 'medium' | 'high' | 'critical';
  response_time_hours: number;
  resolution_time_hours: number;
  escalation_time_hours?: number;
  business_hours_only: boolean;
  is_active: boolean;
}

export interface UpdateSLASettingData extends Partial<CreateSLASettingData> {}

class SLAService {
  async getSLASettings(): Promise<SLASetting[]> {
    console.log('SLAService: Getting SLA settings...');
    
    // Di Vercel production, gunakan Supabase langsung
    if (isVercelProduction()) {
      const result = await supabaseService.getSLASettings();
      return result.data || [];
    }
    
    try {
      const response = await api.get('/master-data/sla-settings');
      console.log('SLAService: SLA settings response:', response.data);
      return response.data || [];
    } catch (error) {
      console.log('Main endpoint failed, trying Supabase direct...');
      const result = await supabaseService.getSLASettings();
      return result.data || [];
    }
  }

  async createSLASetting(data: CreateSLASettingData): Promise<SLASetting> {
    const response = await api.post('/master-data/sla-settings', data);
    return response.data;
  }

  async updateSLASetting(id: string, data: UpdateSLASettingData): Promise<SLASetting> {
    const response = await api.put(`/master-data/sla-settings/${id}`, data);
    return response.data;
  }

  async deleteSLASetting(id: string): Promise<void> {
    await api.delete(`/master-data/sla-settings/${id}`);
  }

  // Helper methods untuk dropdown data
  async getUnitTypes(): Promise<Array<{id: string; name: string; code: string}>> {
    if (isVercelProduction()) {
      const result = await supabaseService.getUnitTypes();
      return result.data || [];
    }
    try {
      const response = await api.get('/master-data/unit-types');
      return response.data;
    } catch {
      const result = await supabaseService.getUnitTypes();
      return result.data || [];
    }
  }

  async getServiceCategories(): Promise<Array<{id: string; name: string; code: string}>> {
    if (isVercelProduction()) {
      const result = await supabaseService.getServiceCategories();
      return result.data || [];
    }
    try {
      const response = await api.get('/master-data/service-categories');
      return response.data;
    } catch {
      const result = await supabaseService.getServiceCategories();
      return result.data || [];
    }
  }

  async getPatientTypes(): Promise<Array<{id: string; name: string; code: string}>> {
    if (isVercelProduction()) {
      const result = await supabaseService.getPatientTypes();
      return result.data || [];
    }
    try {
      const response = await api.get('/master-data/patient-types');
      return response.data;
    } catch {
      const result = await supabaseService.getPatientTypes();
      return result.data || [];
    }
  }
}

export default new SLAService();