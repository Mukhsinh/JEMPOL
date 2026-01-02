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

// Unit Types
export const getUnitTypes = async (): Promise<UnitType[]> => {
  const response = await api.get('/master-data/unit-types');
  return response.data;
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
  const response = await api.get('/master-data/service-categories');
  return response.data;
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
  const response = await api.get('/master-data/ticket-types');
  return response.data;
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
  const response = await api.get('/master-data/ticket-classifications');
  return response.data;
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
  const response = await api.get('/master-data/ticket-statuses');
  return response.data;
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
  const response = await api.get('/master-data/patient-types');
  return response.data;
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
  const response = await api.get('/master-data/roles');
  return response.data;
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
  const response = await api.get('/master-data/response-templates');
  return response.data;
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
  const response = await api.get('/master-data/ai-trust-settings');
  return response.data;
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