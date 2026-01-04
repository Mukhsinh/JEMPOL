import api, { isVercelProduction } from './api';
import { supabaseService } from './supabaseService';
import { supabase } from '../utils/supabaseClient';

export interface UnitType {
  id: string;
  name: string;
  code: string;
  description?: string;
  icon?: string;
  color?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  code: string;
  description?: string;
  default_sla_hours: number;
  requires_attachment: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TicketType {
  id: string;
  name: string;
  code: string;
  description?: string;
  icon?: string;
  color?: string;
  default_priority: 'low' | 'medium' | 'high' | 'critical';
  default_sla_hours: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TicketClassification {
  id: string;
  name: string;
  code: string;
  description?: string;
  parent_classification_id?: string;
  level: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TicketStatus {
  id: string;
  name: string;
  code: string;
  description?: string;
  status_type: string;
  color?: string;
  is_final: boolean;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PatientType {
  id: string;
  name: string;
  code: string;
  description?: string;
  priority_level: number;
  default_sla_hours: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: string;
  name: string;
  code: string;
  description?: string;
  permissions: any;
  is_system_role: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ResponseTemplate {
  id: string;
  name: string;
  category?: string;
  subject?: string;
  content: string;
  variables: any;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface AITrustSetting {
  id: string;
  setting_name: string;
  confidence_threshold: number;
  auto_routing_enabled: boolean;
  auto_classification_enabled: boolean;
  manual_review_required: boolean;
  description?: string;
  is_active: boolean;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

// Helper function untuk fallback ke Supabase langsung
const withSupabaseFallback = async <T>(
  primaryEndpoint: string,
  tableName: string,
  defaultData: T[] = []
): Promise<T[]> => {
  // Di Vercel production, langsung gunakan Supabase
  if (isVercelProduction()) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || defaultData;
    } catch (error: any) {
      console.error(`Supabase direct ${tableName} failed:`, error.message);
      return defaultData;
    }
  }
  
  try {
    console.log(`Trying primary endpoint: ${primaryEndpoint}`);
    const response = await api.get(primaryEndpoint);
    console.log(`Primary endpoint ${primaryEndpoint} success:`, response.data?.length || 0, 'records');
    return response.data || [];
  } catch (error: any) {
    console.warn(`Primary endpoint ${primaryEndpoint} failed, trying Supabase direct...`, error.message);
    try {
      const { data, error: supaError } = await supabase
        .from(tableName)
        .select('*')
        .order('created_at', { ascending: false });
      
      if (supaError) throw supaError;
      console.log(`Supabase direct ${tableName} success:`, data?.length || 0, 'records');
      return data || defaultData;
    } catch (fallbackError: any) {
      console.error(`Supabase direct ${tableName} also failed:`, fallbackError.message);
      console.log(`Using default data for ${primaryEndpoint}:`, defaultData.length, 'records');
      return defaultData;
    }
  }
};

// Unit Types
export const getUnitTypes = async (): Promise<UnitType[]> => {
  return withSupabaseFallback<UnitType>(
    '/master-data/unit-types',
    'unit_types',
    [
      {
        id: '1',
        name: 'Administratif',
        code: 'ADM',
        description: 'Unit Administratif',
        icon: 'business',
        color: '#6B7280',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Layanan Medis',
        code: 'MED',
        description: 'Unit Layanan Medis',
        icon: 'local_hospital',
        color: '#3B82F6',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]
  );
};

export const createUnitType = async (unitType: Omit<UnitType, 'id' | 'created_at' | 'updated_at'>): Promise<UnitType> => {
  const response = await api.post('/master-data/unit-types', unitType);
  return response.data;
};

export const updateUnitType = async (id: string, unitType: Partial<UnitType>): Promise<UnitType> => {
  const response = await api.put(`/master-data/unit-types/${id}`, unitType);
  return response.data;
};

export const deleteUnitType = async (id: string): Promise<void> => {
  await api.delete(`/master-data/unit-types/${id}`);
};

// Service Categories
export const getServiceCategories = async (): Promise<ServiceCategory[]> => {
  return withSupabaseFallback<ServiceCategory>(
    '/master-data/service-categories',
    'service_categories'
  );
};

export const createServiceCategory = async (category: Omit<ServiceCategory, 'id' | 'created_at' | 'updated_at'>): Promise<ServiceCategory> => {
  const response = await api.post('/master-data/service-categories', category);
  return response.data;
};

export const updateServiceCategory = async (id: string, category: Partial<ServiceCategory>): Promise<ServiceCategory> => {
  const response = await api.put(`/master-data/service-categories/${id}`, category);
  return response.data;
};

export const deleteServiceCategory = async (id: string): Promise<void> => {
  await api.delete(`/master-data/service-categories/${id}`);
};

// Ticket Types
export const getTicketTypes = async (): Promise<TicketType[]> => {
  return withSupabaseFallback<TicketType>(
    '/master-data/ticket-types',
    'ticket_types'
  );
};

export const createTicketType = async (ticketType: Omit<TicketType, 'id' | 'created_at' | 'updated_at'>): Promise<TicketType> => {
  const response = await api.post('/master-data/ticket-types', ticketType);
  return response.data;
};

export const updateTicketType = async (id: string, ticketType: Partial<TicketType>): Promise<TicketType> => {
  const response = await api.put(`/master-data/ticket-types/${id}`, ticketType);
  return response.data;
};

export const deleteTicketType = async (id: string): Promise<void> => {
  await api.delete(`/master-data/ticket-types/${id}`);
};

// Ticket Classifications
export const getTicketClassifications = async (): Promise<TicketClassification[]> => {
  return withSupabaseFallback<TicketClassification>(
    '/master-data/ticket-classifications',
    'ticket_classifications'
  );
};

export const createTicketClassification = async (classification: Omit<TicketClassification, 'id' | 'created_at' | 'updated_at'>): Promise<TicketClassification> => {
  const response = await api.post('/master-data/ticket-classifications', classification);
  return response.data;
};

export const updateTicketClassification = async (id: string, classification: Partial<TicketClassification>): Promise<TicketClassification> => {
  const response = await api.put(`/master-data/ticket-classifications/${id}`, classification);
  return response.data;
};

export const deleteTicketClassification = async (id: string): Promise<void> => {
  await api.delete(`/master-data/ticket-classifications/${id}`);
};

// Ticket Statuses
export const getTicketStatuses = async (): Promise<TicketStatus[]> => {
  return withSupabaseFallback<TicketStatus>(
    '/master-data/ticket-statuses',
    'ticket_statuses'
  );
};

export const createTicketStatus = async (status: Omit<TicketStatus, 'id' | 'created_at' | 'updated_at'>): Promise<TicketStatus> => {
  const response = await api.post('/master-data/ticket-statuses', status);
  return response.data;
};

export const updateTicketStatus = async (id: string, status: Partial<TicketStatus>): Promise<TicketStatus> => {
  const response = await api.put(`/master-data/ticket-statuses/${id}`, status);
  return response.data;
};

export const deleteTicketStatus = async (id: string): Promise<void> => {
  await api.delete(`/master-data/ticket-statuses/${id}`);
};

// Patient Types
export const getPatientTypes = async (): Promise<PatientType[]> => {
  // Di Vercel production, langsung gunakan Supabase
  if (isVercelProduction()) {
    const result = await supabaseService.getPatientTypes();
    return result.data || [];
  }
  
  try {
    console.log('🔍 Fetching patient types...');
    const response = await api.get('/master-data/patient-types');
    console.log('✅ Primary endpoint success:', response.data?.length || 0, 'records');
    return Array.isArray(response.data) ? response.data : [];
  } catch (error: any) {
    console.warn('⚠️  Primary endpoint failed:', error.message);
    // Fallback ke Supabase langsung
    const result = await supabaseService.getPatientTypes();
    return result.data || [];
  }
};

export const createPatientType = async (patientType: Omit<PatientType, 'id' | 'created_at' | 'updated_at'>): Promise<PatientType> => {
  const response = await api.post('/master-data/patient-types', patientType);
  return response.data;
};

export const updatePatientType = async (id: string, patientType: Partial<PatientType>): Promise<PatientType> => {
  const response = await api.put(`/master-data/patient-types/${id}`, patientType);
  return response.data;
};

export const deletePatientType = async (id: string): Promise<void> => {
  await api.delete(`/master-data/patient-types/${id}`);
};

// Roles
export const getRoles = async (): Promise<Role[]> => {
  // Di Vercel production, langsung gunakan Supabase
  if (isVercelProduction()) {
    const result = await supabaseService.getRoles();
    return result.data || [];
  }
  
  return withSupabaseFallback<Role>(
    '/master-data/roles',
    'roles'
  );
};

export const createRole = async (role: Omit<Role, 'id' | 'created_at' | 'updated_at'>): Promise<Role> => {
  const response = await api.post('/master-data/roles', role);
  return response.data;
};

export const updateRole = async (id: string, role: Partial<Role>): Promise<Role> => {
  const response = await api.put(`/master-data/roles/${id}`, role);
  return response.data;
};

export const deleteRole = async (id: string): Promise<void> => {
  await api.delete(`/master-data/roles/${id}`);
};

// Response Templates
export const getResponseTemplates = async (): Promise<ResponseTemplate[]> => {
  // Di Vercel production, langsung gunakan Supabase
  if (isVercelProduction()) {
    const result = await supabaseService.getResponseTemplates();
    return result.data || [];
  }
  
  try {
    const response = await api.get('/master-data/response-templates');
    return response.data || [];
  } catch (error) {
    console.warn('Failed to fetch response templates, trying Supabase direct...');
    const result = await supabaseService.getResponseTemplates();
    return result.data || [];
  }
};

export const createResponseTemplate = async (template: Omit<ResponseTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<ResponseTemplate> => {
  const response = await api.post('/master-data/response-templates', template);
  return response.data;
};

export const updateResponseTemplate = async (id: string, template: Partial<ResponseTemplate>): Promise<ResponseTemplate> => {
  const response = await api.put(`/master-data/response-templates/${id}`, template);
  return response.data;
};

export const deleteResponseTemplate = async (id: string): Promise<void> => {
  await api.delete(`/master-data/response-templates/${id}`);
};

// AI Trust Settings
export const getAITrustSettings = async (): Promise<AITrustSetting[]> => {
  try {
    const response = await api.get('/master-data/ai-trust-settings');
    return response.data || [];
  } catch (error) {
    console.warn('Failed to fetch AI trust settings:', error);
    return [];
  }
};

export const updateAITrustSetting = async (id: string, setting: Partial<AITrustSetting>): Promise<AITrustSetting> => {
  const response = await api.put(`/master-data/ai-trust-settings/${id}`, setting);
  return response.data;
};

export const masterDataService = {
  // Unit Types
  getUnitTypes,
  createUnitType,
  updateUnitType,
  deleteUnitType,

  // Service Categories
  getServiceCategories,
  createServiceCategory,
  updateServiceCategory,
  deleteServiceCategory,

  // Ticket Types
  getTicketTypes,
  createTicketType,
  updateTicketType,
  deleteTicketType,

  // Ticket Classifications
  getTicketClassifications,
  createTicketClassification,
  updateTicketClassification,
  deleteTicketClassification,

  // Ticket Statuses
  getTicketStatuses,
  createTicketStatus,
  updateTicketStatus,
  deleteTicketStatus,

  // Patient Types
  getPatientTypes,
  createPatientType,
  updatePatientType,
  deletePatientType,

  // Roles
  getRoles,
  createRole,
  updateRole,
  deleteRole,

  // Response Templates
  getResponseTemplates,
  createResponseTemplate,
  updateResponseTemplate,
  deleteResponseTemplate,

  // AI Trust Settings
  getAITrustSettings,
  updateAITrustSetting
};