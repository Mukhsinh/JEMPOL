import api from './api';

export interface EscalationRule {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  trigger_conditions: {
    priority?: string[];
    status?: string[];
    time_threshold?: number; // dalam detik
    sentiment_threshold?: number;
  };
  actions: Array<{
    type: 'notify_manager' | 'notify_assignee' | 'bump_priority' | 'flag_review' | 'escalate_to_role';
    target?: string;
    message?: string;
  }>;
  created_at: string;
  updated_at: string;
}

export interface EscalationLog {
  id: string;
  rule_id: string;
  ticket_id: string;
  executed_actions: any[];
  execution_status: 'success' | 'failed' | 'partial';
  error_message?: string;
  executed_at: string;
}

export interface EscalationStats {
  rules: {
    total: number;
    active: number;
    inactive: number;
  };
  executions: {
    total: number;
    successful: number;
    failed: number;
    partial: number;
    successRate: number;
  };
  tickets: {
    escalated: number;
  };
  period: string;
}

class EscalationService {
  async getRules(): Promise<EscalationRule[]> {
    try {
      // Coba endpoint dengan auth terlebih dahulu
      const response = await api.get('/escalation/rules');
      return response.data || [];
    } catch (error: any) {
      console.warn('Auth endpoint failed, trying public endpoint:', error.message);
      try {
        // Fallback ke endpoint publik jika auth gagal
        const response = await api.get('/escalation/public/rules');
        return response.data || [];
      } catch (fallbackError) {
        console.error('Error fetching escalation rules:', fallbackError);
        throw fallbackError;
      }
    }
  }

  async getStats(): Promise<EscalationStats> {
    try {
      const response = await api.get('/escalation/stats');
      return response.data;
    } catch (error: any) {
      console.warn('Auth stats endpoint failed, trying public:', error.message);
      try {
        const response = await api.get('/escalation/public/stats');
        return response.data;
      } catch (fallbackError) {
        console.error('Error fetching escalation stats:', fallbackError);
        // Return default stats jika gagal
        return {
          rules: { total: 0, active: 0, inactive: 0 },
          executions: { total: 0, successful: 0, failed: 0, partial: 0, successRate: 0 },
          tickets: { escalated: 0 },
          period: '30 days'
        };
      }
    }
  }

  async getRule(id: string): Promise<EscalationRule> {
    try {
      const response = await api.get(`/escalation/rules/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching escalation rule:', error);
      throw error;
    }
  }

  async createRule(rule: Omit<EscalationRule, 'id' | 'created_at' | 'updated_at'>): Promise<EscalationRule> {
    try {
      const response = await api.post('/escalation/rules', rule);
      return response.data;
    } catch (error) {
      console.error('Error creating escalation rule:', error);
      throw error;
    }
  }

  async updateRule(id: string, rule: Partial<EscalationRule>): Promise<EscalationRule> {
    try {
      const response = await api.put(`/escalation/rules/${id}`, rule);
      return response.data;
    } catch (error) {
      console.error('Error updating escalation rule:', error);
      throw error;
    }
  }

  async deleteRule(id: string): Promise<void> {
    try {
      await api.delete(`/escalation/rules/${id}`);
    } catch (error) {
      console.error('Error deleting escalation rule:', error);
      throw error;
    }
  }

  async toggleRuleStatus(id: string, isActive: boolean): Promise<EscalationRule> {
    try {
      const response = await api.patch(`/escalation/rules/${id}/toggle`, { is_active: isActive });
      return response.data;
    } catch (error) {
      console.error('Error toggling rule status:', error);
      throw error;
    }
  }

  async getLogs(ruleId?: string, ticketId?: string): Promise<EscalationLog[]> {
    try {
      const params = new URLSearchParams();
      if (ruleId) params.append('rule_id', ruleId);
      if (ticketId) params.append('ticket_id', ticketId);
      
      const response = await api.get(`/escalation/logs?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching escalation logs:', error);
      throw error;
    }
  }

  async executeRule(ruleId: string, ticketId: string): Promise<void> {
    try {
      await api.post(`/escalation/rules/${ruleId}/execute`, { ticket_id: ticketId });
    } catch (error) {
      console.error('Error executing escalation rule:', error);
      throw error;
    }
  }
}

export const escalationService = new EscalationService();