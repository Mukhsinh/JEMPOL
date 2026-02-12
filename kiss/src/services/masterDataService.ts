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

// Unit Types
export const getUnitTypes = async (): Promise<UnitType[]> => {
  try {
    console.log('🔍 Fetching unit_types from Supabase...');
    const { data, error } = await supabase
      .from('unit_types')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('❌ Supabase error for unit_types:', error.message);
      throw error;
    }
    
    console.log('✅ unit_types fetched:', data?.length || 0, 'records');
    return data || [];
  } catch (error: any) {
    console.error('⚠️ Failed to fetch unit_types:', error.message);
    return [];
  }
};

export const createUnitType = async (unitType: Omit<UnitType, 'id' | 'created_at' | 'updated_at'>): Promise<UnitType> => {
  try {
    console.log('📤 Creating unit type:', unitType);
    const { data, error } = await supabase
      .from('unit_types')
      .insert(unitType)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Supabase create failed:', error);
      throw error;
    }
    console.log('✅ Unit type created:', data);
    return data;
  } catch (error: any) {
    console.error('❌ Error creating unit type:', error);
    throw new Error(error.message || 'Gagal menambahkan tipe unit');
  }
};

export const updateUnitType = async (id: string, unitType: Partial<UnitType>): Promise<UnitType> => {
  try {
    console.log('📤 Updating unit type:', id, unitType);
    const { data, error } = await supabase
      .from('unit_types')
      .update({ ...unitType, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Supabase update failed:', error);
      throw error;
    }
    console.log('✅ Unit type updated:', data);
    return data;
  } catch (error: any) {
    console.error('❌ Error updating unit type:', error);
    throw new Error(error.message || 'Gagal update tipe unit');
  }
};

export const deleteUnitType = async (id: string): Promise<void> => {
  try {
    console.log('🗑️ Deleting unit type:', id);
    const { error } = await supabase
      .from('unit_types')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('❌ Supabase delete failed:', error);
      throw error;
    }
    console.log('✅ Unit type deleted');
  } catch (error: any) {
    console.error('❌ Error deleting unit type:', error);
    throw new Error(error.message || 'Gagal hapus tipe unit');
  }
};

// Service Categories
export const getServiceCategories = async (): Promise<ServiceCategory[]> => {
  try {
    console.log('🔍 Fetching service_categories from Supabase...');
    const { data, error } = await supabase
      .from('service_categories')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('❌ Supabase error for service_categories:', error.message);
      throw error;
    }
    
    console.log('✅ service_categories fetched:', data?.length || 0, 'records');
    return data || [];
  } catch (error: any) {
    console.error('⚠️ Failed to fetch service_categories:', error.message);
    return [];
  }
};

export const createServiceCategory = async (category: Omit<ServiceCategory, 'id' | 'created_at' | 'updated_at'>): Promise<ServiceCategory> => {
  try {
    console.log('📤 Creating service category:', category);
    const { data, error } = await supabase
      .from('service_categories')
      .insert(category)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Supabase create failed:', error);
      throw error;
    }
    console.log('✅ Service category created:', data);
    return data;
  } catch (error: any) {
    console.error('❌ Error creating service category:', error);
    throw new Error(error.message || 'Gagal menambahkan kategori layanan');
  }
};

export const updateServiceCategory = async (id: string, category: Partial<ServiceCategory>): Promise<ServiceCategory> => {
  try {
    console.log('📤 Updating service category:', id, category);
    const { data, error } = await supabase
      .from('service_categories')
      .update({ ...category, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Supabase update failed:', error);
      throw error;
    }
    console.log('✅ Service category updated:', data);
    return data;
  } catch (error: any) {
    console.error('❌ Error updating service category:', error);
    throw new Error(error.message || 'Gagal update kategori layanan');
  }
};

export const deleteServiceCategory = async (id: string): Promise<void> => {
  try {
    console.log('🗑️ Deleting service category:', id);
    const { error } = await supabase
      .from('service_categories')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('❌ Supabase delete failed:', error);
      throw error;
    }
    console.log('✅ Service category deleted');
  } catch (error: any) {
    console.error('❌ Error deleting service category:', error);
    throw new Error(error.message || 'Gagal hapus kategori layanan');
  }
};

// Ticket Types
export const getTicketTypes = async (): Promise<TicketType[]> => {
  try {
    console.log('🔍 Fetching ticket_types from Supabase...');
    const { data, error } = await supabase
      .from('ticket_types')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('❌ Supabase error for ticket_types:', error.message);
      throw error;
    }
    
    console.log('✅ ticket_types fetched:', data?.length || 0, 'records');
    return data || [];
  } catch (error: any) {
    console.error('⚠️ Failed to fetch ticket_types:', error.message);
    return [];
  }
};

export const createTicketType = async (ticketType: Omit<TicketType, 'id' | 'created_at' | 'updated_at'>): Promise<TicketType> => {
  try {
    console.log('📤 Creating ticket type:', ticketType);
    const { data, error } = await supabase
      .from('ticket_types')
      .insert(ticketType)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Supabase create failed:', error);
      throw error;
    }
    console.log('✅ Ticket type created:', data);
    return data;
  } catch (error: any) {
    console.error('❌ Error creating ticket type:', error);
    throw new Error(error.message || 'Gagal menambahkan tipe tiket');
  }
};

export const updateTicketType = async (id: string, ticketType: Partial<TicketType>): Promise<TicketType> => {
  try {
    console.log('📤 Updating ticket type:', id, ticketType);
    const { data, error } = await supabase
      .from('ticket_types')
      .update({ ...ticketType, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Supabase update failed:', error);
      throw error;
    }
    console.log('✅ Ticket type updated:', data);
    return data;
  } catch (error: any) {
    console.error('❌ Error updating ticket type:', error);
    throw new Error(error.message || 'Gagal update tipe tiket');
  }
};

export const deleteTicketType = async (id: string): Promise<void> => {
  try {
    console.log('🗑️ Deleting ticket type:', id);
    const { error } = await supabase
      .from('ticket_types')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('❌ Supabase delete failed:', error);
      throw error;
    }
    console.log('✅ Ticket type deleted');
  } catch (error: any) {
    console.error('❌ Error deleting ticket type:', error);
    throw new Error(error.message || 'Gagal hapus tipe tiket');
  }
};

// Ticket Classifications
export const getTicketClassifications = async (): Promise<TicketClassification[]> => {
  try {
    console.log('🔍 Fetching ticket_classifications from Supabase...');
    const { data, error } = await supabase
      .from('ticket_classifications')
      .select('*')
      .order('level', { ascending: true });
    
    if (error) {
      console.error('❌ Supabase error for ticket_classifications:', error.message);
      throw error;
    }
    console.log('✅ ticket_classifications fetched:', data?.length || 0, 'records');
    return data || [];
  } catch (error: any) {
    console.error('⚠️ Failed to fetch ticket_classifications:', error.message);
    return [];
  }
};

export const createTicketClassification = async (classification: Omit<TicketClassification, 'id' | 'created_at' | 'updated_at'>): Promise<TicketClassification> => {
  try {
    console.log('📤 Creating ticket classification:', classification);
    const { data, error } = await supabase
      .from('ticket_classifications')
      .insert(classification)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Supabase create failed:', error);
      throw error;
    }
    console.log('✅ Ticket classification created:', data);
    return data;
  } catch (error: any) {
    console.error('❌ Error creating ticket classification:', error);
    throw new Error(error.message || 'Gagal menambahkan klasifikasi tiket');
  }
};

export const updateTicketClassification = async (id: string, classification: Partial<TicketClassification>): Promise<TicketClassification> => {
  try {
    console.log('📤 Updating ticket classification:', id, classification);
    const { data, error } = await supabase
      .from('ticket_classifications')
      .update({ ...classification, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Supabase update failed:', error);
      throw error;
    }
    console.log('✅ Ticket classification updated:', data);
    return data;
  } catch (error: any) {
    console.error('❌ Error updating ticket classification:', error);
    throw new Error(error.message || 'Gagal update klasifikasi tiket');
  }
};

export const deleteTicketClassification = async (id: string): Promise<void> => {
  try {
    console.log('🗑️ Deleting ticket classification:', id);
    const { error } = await supabase
      .from('ticket_classifications')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('❌ Supabase delete failed:', error);
      throw error;
    }
    console.log('✅ Ticket classification deleted');
  } catch (error: any) {
    console.error('❌ Error deleting ticket classification:', error);
    throw new Error(error.message || 'Gagal hapus klasifikasi tiket');
  }
};

// Ticket Statuses
export const getTicketStatuses = async (): Promise<TicketStatus[]> => {
  try {
    console.log('🔍 Fetching ticket_statuses from Supabase...');
    const { data, error } = await supabase
      .from('ticket_statuses')
      .select('*')
      .order('display_order');
    
    if (error) {
      console.error('❌ Supabase error for ticket_statuses:', error.message);
      throw error;
    }
    console.log('✅ ticket_statuses fetched:', data?.length || 0, 'records');
    return data || [];
  } catch (error: any) {
    console.error('⚠️ Failed to fetch ticket_statuses:', error.message);
    return [];
  }
};

export const createTicketStatus = async (status: Omit<TicketStatus, 'id' | 'created_at' | 'updated_at'>): Promise<TicketStatus> => {
  try {
    console.log('📤 Creating ticket status:', status);
    const { data, error } = await supabase
      .from('ticket_statuses')
      .insert(status)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Supabase create failed:', error);
      throw error;
    }
    console.log('✅ Ticket status created:', data);
    return data;
  } catch (error: any) {
    console.error('❌ Error creating ticket status:', error);
    throw new Error(error.message || 'Gagal menambahkan status tiket');
  }
};

export const updateTicketStatus = async (id: string, status: Partial<TicketStatus>): Promise<TicketStatus> => {
  try {
    console.log('📤 Updating ticket status:', id, status);
    const { data, error } = await supabase
      .from('ticket_statuses')
      .update({ ...status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Supabase update failed:', error);
      throw error;
    }
    console.log('✅ Ticket status updated:', data);
    return data;
  } catch (error: any) {
    console.error('❌ Error updating ticket status:', error);
    throw new Error(error.message || 'Gagal update status tiket');
  }
};

export const deleteTicketStatus = async (id: string): Promise<void> => {
  try {
    console.log('🗑️ Deleting ticket status:', id);
    const { error } = await supabase
      .from('ticket_statuses')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('❌ Supabase delete failed:', error);
      throw error;
    }
    console.log('✅ Ticket status deleted');
  } catch (error: any) {
    console.error('❌ Error deleting ticket status:', error);
    throw new Error(error.message || 'Gagal hapus status tiket');
  }
};

// Patient Types
export const getPatientTypes = async (): Promise<PatientType[]> => {
  try {
    console.log('🔍 Fetching patient_types from Supabase...');
    const { data, error } = await supabase
      .from('patient_types')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('❌ Supabase error for patient_types:', error.message);
      throw error;
    }
    console.log('✅ patient_types fetched:', data?.length || 0, 'records');
    return data || [];
  } catch (error: any) {
    console.error('⚠️ Failed to fetch patient_types:', error.message);
    return [];
  }
};

export const createPatientType = async (patientType: Omit<PatientType, 'id' | 'created_at' | 'updated_at'>): Promise<PatientType> => {
  try {
    console.log('📤 Creating patient type:', patientType);
    const { data, error } = await supabase
      .from('patient_types')
      .insert(patientType)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Supabase create failed:', error);
      throw error;
    }
    console.log('✅ Patient type created:', data);
    return data;
  } catch (error: any) {
    console.error('❌ Error creating patient type:', error);
    throw new Error(error.message || 'Gagal menambahkan jenis pasien');
  }
};

export const updatePatientType = async (id: string, patientType: Partial<PatientType>): Promise<PatientType> => {
  try {
    console.log('📤 Updating patient type:', id, patientType);
    const { data, error } = await supabase
      .from('patient_types')
      .update({ ...patientType, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Supabase update failed:', error);
      throw error;
    }
    console.log('✅ Patient type updated:', data);
    return data;
  } catch (error: any) {
    console.error('❌ Error updating patient type:', error);
    throw new Error(error.message || 'Gagal update jenis pasien');
  }
};

export const deletePatientType = async (id: string): Promise<void> => {
  try {
    console.log('🗑️ Deleting patient type:', id);
    const { error } = await supabase
      .from('patient_types')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('❌ Supabase delete failed:', error);
      throw error;
    }
    console.log('✅ Patient type deleted');
  } catch (error: any) {
    console.error('❌ Error deleting patient type:', error);
    throw new Error(error.message || 'Gagal hapus jenis pasien');
  }
};

// Roles
export const getRoles = async (): Promise<Role[]> => {
  try {
    console.log('🔍 Fetching roles from Supabase...');
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('❌ Supabase error for roles:', error.message);
      throw error;
    }
    console.log('✅ roles fetched:', data?.length || 0, 'records');
    return data || [];
  } catch (error: any) {
    console.error('⚠️ Failed to fetch roles:', error.message);
    return [];
  }
};

export const createRole = async (role: Omit<Role, 'id' | 'created_at' | 'updated_at'>): Promise<Role> => {
  try {
    console.log('📤 Creating role:', role);
    const { data, error } = await supabase
      .from('roles')
      .insert(role)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Supabase create failed:', error);
      throw error;
    }
    console.log('✅ Role created:', data);
    return data;
  } catch (error: any) {
    console.error('❌ Error creating role:', error);
    throw new Error(error.message || 'Gagal menambahkan role');
  }
};

export const updateRole = async (id: string, role: Partial<Role>): Promise<Role> => {
  try {
    console.log('📤 Updating role:', id, role);
    const { data, error } = await supabase
      .from('roles')
      .update({ ...role, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Supabase update failed:', error);
      throw error;
    }
    console.log('✅ Role updated:', data);
    return data;
  } catch (error: any) {
    console.error('❌ Error updating role:', error);
    throw new Error(error.message || 'Gagal update role');
  }
};

export const deleteRole = async (id: string): Promise<void> => {
  try {
    console.log('🗑️ Deleting role:', id);
    const { error } = await supabase
      .from('roles')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('❌ Supabase delete failed:', error);
      throw error;
    }
    console.log('✅ Role deleted');
  } catch (error: any) {
    console.error('❌ Error deleting role:', error);
    throw new Error(error.message || 'Gagal hapus role');
  }
};

// Response Templates
export const getResponseTemplates = async (): Promise<ResponseTemplate[]> => {
  try {
    console.log('🔍 Fetching response_templates from Supabase...');
    const { data, error } = await supabase
      .from('response_templates')
      .select('*')
      .eq('is_active', true)
      .order('name');
    
    if (error) {
      console.error('❌ Supabase error for response_templates:', error.message);
      throw error;
    }
    console.log('✅ response_templates fetched:', data?.length || 0, 'records');
    return data || [];
  } catch (error: any) {
    console.error('⚠️ Failed to fetch response_templates:', error.message);
    return [];
  }
};

export const createResponseTemplate = async (template: Omit<ResponseTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<ResponseTemplate> => {
  try {
    console.log('📤 Creating response template:', template);
    const { data, error } = await supabase
      .from('response_templates')
      .insert(template)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Supabase create failed:', error);
      throw error;
    }
    console.log('✅ Response template created:', data);
    return data;
  } catch (error: any) {
    console.error('❌ Error creating response template:', error);
    throw new Error(error.message || 'Gagal menambahkan template respon');
  }
};

export const updateResponseTemplate = async (id: string, template: Partial<ResponseTemplate>): Promise<ResponseTemplate> => {
  try {
    console.log('📤 Updating response template:', id, template);
    const { data, error } = await supabase
      .from('response_templates')
      .update({ ...template, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Supabase update failed:', error);
      throw error;
    }
    console.log('✅ Response template updated:', data);
    return data;
  } catch (error: any) {
    console.error('❌ Error updating response template:', error);
    throw new Error(error.message || 'Gagal update template respon');
  }
};

export const deleteResponseTemplate = async (id: string): Promise<void> => {
  try {
    console.log('🗑️ Deleting response template:', id);
    const { error } = await supabase
      .from('response_templates')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('❌ Supabase delete failed:', error);
      throw error;
    }
    console.log('✅ Response template deleted');
  } catch (error: any) {
    console.error('❌ Error deleting response template:', error);
    throw new Error(error.message || 'Gagal hapus template respon');
  }
};

// AI Trust Settings
export const getAITrustSettings = async (): Promise<AITrustSetting[]> => {
  try {
    console.log('🔍 Fetching ai_trust_settings from Supabase...');
    const { data, error } = await supabase
      .from('ai_trust_settings')
      .select('*')
      .order('setting_name');
    
    if (error) {
      console.error('❌ Supabase error for ai_trust_settings:', error.message);
      throw error;
    }
    console.log('✅ ai_trust_settings fetched:', data?.length || 0, 'records');
    return data || [];
  } catch (error: any) {
    console.error('⚠️ Failed to fetch ai_trust_settings:', error.message);
    return [];
  }
};

export const updateAITrustSetting = async (id: string, setting: Partial<AITrustSetting>): Promise<AITrustSetting> => {
  try {
    console.log('📤 Updating AI trust setting:', id, setting);
    const { data, error } = await supabase
      .from('ai_trust_settings')
      .update({ ...setting, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Supabase update failed:', error);
      throw error;
    }
    console.log('✅ AI trust setting updated:', data);
    return data;
  } catch (error: any) {
    console.error('❌ Error updating AI trust setting:', error);
    throw new Error(error.message || 'Gagal update pengaturan AI trust');
  }
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