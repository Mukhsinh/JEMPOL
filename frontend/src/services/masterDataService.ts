import api from './api';

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

// Helper function untuk fallback ke public endpoint
const withPublicFallback = async <T>(
  primaryEndpoint: string,
  publicEndpoint: string,
  defaultData: T[] = []
): Promise<T[]> => {
  try {
    console.log(`Trying primary endpoint: ${primaryEndpoint}`);
    const response = await api.get(primaryEndpoint);
    console.log(`Primary endpoint ${primaryEndpoint} success:`, response.data?.length || 0, 'records');
    return response.data || [];
  } catch (error: any) {
    console.warn(`Primary endpoint ${primaryEndpoint} failed, trying public fallback...`, error.message);
    try {
      console.log(`Trying public fallback: ${publicEndpoint}`);
      const fallbackResponse = await api.get(publicEndpoint);
      console.log(`Public fallback ${publicEndpoint} success:`, fallbackResponse.data?.length || 0, 'records');
      return fallbackResponse.data || [];
    } catch (fallbackError: any) {
      console.error(`Public fallback ${publicEndpoint} also failed:`, fallbackError.message);
      console.log(`Using default data for ${primaryEndpoint}:`, defaultData.length, 'records');
      return defaultData;
    }
  }
};

// Unit Types
export const getUnitTypes = async (): Promise<UnitType[]> => {
  return withPublicFallback<UnitType>(
    '/master-data/unit-types',
    '/master-data/public/unit-types',
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
  return withPublicFallback<ServiceCategory>(
    '/master-data/service-categories',
    '/master-data/public/service-categories'
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
  return withPublicFallback<TicketType>(
    '/master-data/ticket-types',
    '/master-data/public/ticket-types'
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
  return withPublicFallback<TicketClassification>(
    '/master-data/ticket-classifications',
    '/master-data/public/ticket-classifications'
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
  return withPublicFallback<TicketStatus>(
    '/master-data/ticket-statuses',
    '/master-data/public/ticket-statuses'
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
  try {
    console.log('🔍 Fetching patient types...');

    // Try primary endpoint first
    const response = await api.get('/master-data/patient-types');
    console.log('✅ Primary endpoint success:', response.data?.length || 0, 'records');
    return Array.isArray(response.data) ? response.data : [];

  } catch (error: any) {
    console.warn('⚠️  Primary endpoint failed:', error.message);

    // If 403 or 401, try public endpoint
    if (error.message.includes('403') || error.message.includes('401') || error.message.includes('Token tidak valid')) {
      try {
        console.log('🔄 Trying public fallback endpoint...');
        const fallbackResponse = await api.get('/master-data/public/patient-types');
        console.log('✅ Public fallback success:', fallbackResponse.data?.length || 0, 'records');
        return Array.isArray(fallbackResponse.data) ? fallbackResponse.data : [];
      } catch (fallbackError: any) {
        console.error('❌ Public fallback also failed:', fallbackError.message);
      }
    }

    // Return default data if all else fails
    console.log('🔄 Using default patient types data');
    return [
      {
        id: '1',
        name: 'Pasien Umum',
        code: 'UMUM',
        description: 'Pasien dengan layanan umum',
        priority_level: 3,
        default_sla_hours: 24,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Pasien VIP',
        code: 'VIP',
        description: 'Pasien dengan layanan VIP',
        priority_level: 2,
        default_sla_hours: 4,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '3',
        name: 'Pasien Darurat',
        code: 'DARURAT',
        description: 'Pasien dengan kondisi darurat',
        priority_level: 1,
        default_sla_hours: 1,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
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
  return withPublicFallback<Role>(
    '/master-data/roles',
    '/master-data/public/roles'
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
  try {
    const response = await api.get('/master-data/response-templates');
    return response.data || [];
  } catch (error) {
    console.warn('Failed to fetch response templates:', error);
    return [];
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