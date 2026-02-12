import api from './api';

export interface EscalationRule {
  id: string;
  name: string;
  description?: string;
  service_types: string[];
  categories: string[];
  priority_levels: string[];
  urgency_threshold: number;
  confidence_threshold: number;
  sentiment_threshold?: number;
  from_role: string;
  to_role: string;
  skip_levels: boolean;
  escalation_time_hours: number;
  sla_breach_escalation: boolean;
  is_active: boolean;
  execution_count: number;
  success_count: number;
  created_at: string;
  updated_at: string;
  created_by_user?: {
    id: string;
    full_name: string;
    email: string;
  };
}

export interface CreateEscalationRuleData {
  name: string;
  description?: string;
  service_types?: string[];
  categories?: string[];
  priority_levels?: string[];
  urgency_threshold?: number;
  confidence_threshold?: number;
  sentiment_threshold?: number;
  from_role: string;
  to_role: string;
  skip_levels?: boolean;
  escalation_time_hours?: number;
  sla_breach_escalation?: boolean;
  is_active?: boolean;
}

export interface EscalationLog {
  id: string;
  rule_id?: string;
  ticket_id?: string;
  ticket_type: 'external' | 'internal';
  triggered_by: string;
  confidence_score?: number;
  execution_status: 'success' | 'failed' | 'partial';
  from_user_id?: string;
  to_user_id?: string;
  from_role?: string;
  to_role?: string;
  error_message?: string;
  executed_at: string;
  rule?: {
    id: string;
    name: string;
  };
  from_user?: {
    id: string;
    full_name: string;
  };
  to_user?: {
    id: string;
    full_name: string;
  };
}

export interface EscalationStats {
  auto_escalated: number;
  ai_confidence: number;
  sla_at_risk: number;
  active_rules: number;
  total_rules: number;
  success_rate: number;
  monthly_trend: number;
  confidence_trend: number;
}

export const aiEscalationService = {
  // Create escalation rule
  async createRule(data: CreateEscalationRuleData): Promise<any> {
    const response = await api.post('/ai-escalation/rules', data);
    return response.data;
  },

  // Get escalation rules
  async getRules(params?: {
    page?: number;
    limit?: number;
    is_active?: boolean;
    service_type?: string;
    from_role?: string;
    to_role?: string;
    search?: string;
  }): Promise<{ rules: EscalationRule[]; pagination: any }> {
    const response = await api.get('/ai-escalation/rules', { params });
    return response.data;
  },

  // Get escalation rule by ID
  async getRuleById(id: string): Promise<{
    rule: EscalationRule;
    recent_executions: EscalationLog[];
  }> {
    const response = await api.get(`/ai-escalation/rules/${id}`);
    return response.data;
  },

  // Update escalation rule
  async updateRule(id: string, data: Partial<CreateEscalationRuleData>): Promise<any> {
    const response = await api.patch(`/ai-escalation/rules/${id}`, data);
    return response.data;
  },

  // Delete escalation rule
  async deleteRule(id: string): Promise<any> {
    const response = await api.delete(`/ai-escalation/rules/${id}`);
    return response.data;
  },

  // Execute escalation rule
  async executeRule(data: {
    rule_id: string;
    ticket_id: string;
    ticket_type?: 'external' | 'internal';
    triggered_by?: string;
  }): Promise<any> {
    const response = await api.post('/ai-escalation/execute', data);
    return response.data;
  },

  // Check auto escalation
  async checkAutoEscalation(): Promise<any> {
    const response = await api.post('/ai-escalation/check-auto');
    return response.data;
  },

  // Get escalation statistics
  async getStats(params?: {
    date_from?: string;
    date_to?: string;
  }): Promise<EscalationStats> {
    const response = await api.get('/ai-escalation/stats', { params });
    return response.data;
  },

  // Get escalation logs
  async getLogs(params?: {
    page?: number;
    limit?: number;
    rule_id?: string;
    ticket_id?: string;
    execution_status?: string;
    date_from?: string;
    date_to?: string;
  }): Promise<{ logs: EscalationLog[]; pagination: any }> {
    const response = await api.get('/ai-escalation/logs', { params });
    return response.data;
  },

  // Helper methods
  getRoleDisplayName(role: string): string {
    const roleNames: { [key: string]: string } = {
      staff: 'Petugas',
      supervisor: 'Kepala Unit',
      manager: 'Manager',
      director: 'Direktur'
    };
    return roleNames[role] || role;
  },

  getPriorityDisplayName(priority: string): string {
    const priorityNames: { [key: string]: string } = {
      low: 'Rendah',
      medium: 'Sedang',
      high: 'Tinggi',
      critical: 'Kritis'
    };
    return priorityNames[priority] || priority;
  },

  getServiceTypeDisplayName(serviceType: string): string {
    const serviceTypeNames: { [key: string]: string } = {
      complaint: 'Pengaduan',
      request: 'Permintaan',
      suggestion: 'Saran',
      survey: 'Survei'
    };
    return serviceTypeNames[serviceType] || serviceType;
  },

  getCategoryDisplayName(category: string): string {
    const categoryNames: { [key: string]: string } = {
      service: 'Pelayanan Medis',
      facility: 'Fasilitas & Sarana',
      staff: 'Perilaku Petugas',
      admin: 'Administrasi'
    };
    return categoryNames[category] || category;
  },
};

export default aiEscalationService;