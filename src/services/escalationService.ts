import { supabase } from '../utils/supabaseClient';

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
      // Langsung gunakan Supabase untuk development
      const { data, error } = await supabase
        .from('escalation_rules')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching escalation rules:', error);
        return [];
      }

      return data || [];
    } catch (error: any) {
      console.error('Error fetching escalation rules:', error);
      return [];
    }
  }

  async getStats(): Promise<EscalationStats> {
    try {
      // Get rules stats
      const { data: rules, error: rulesError } = await supabase
        .from('escalation_rules')
        .select('id, is_active');

      if (rulesError) throw rulesError;

      const rulesStats = {
        total: rules?.length || 0,
        active: rules?.filter((r: any) => r.is_active).length || 0,
        inactive: rules?.filter((r: any) => !r.is_active).length || 0
      };

      // Get execution stats
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const { data: logs, error: logsError } = await supabase
        .from('escalation_logs')
        .select('execution_status')
        .gte('executed_at', thirtyDaysAgo);

      if (logsError) throw logsError;

      const successful = logs?.filter((l: any) => l.execution_status === 'success').length || 0;
      const failed = logs?.filter((l: any) => l.execution_status === 'failed').length || 0;
      const partial = logs?.filter((l: any) => l.execution_status === 'partial').length || 0;
      const total = logs?.length || 0;

      const executionStats = {
        total,
        successful,
        failed,
        partial,
        successRate: total > 0 ? Math.round((successful / total) * 100) : 0
      };

      // Get escalated tickets count
      const { count: escalatedCount, error: ticketsError } = await supabase
        .from('tickets')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'escalated');

      if (ticketsError) throw ticketsError;

      return {
        rules: rulesStats,
        executions: executionStats,
        tickets: {
          escalated: escalatedCount || 0
        },
        period: '30 days'
      };
    } catch (error: any) {
      console.error('Error fetching escalation stats:', error);
      return {
        rules: { total: 0, active: 0, inactive: 0 },
        executions: { total: 0, successful: 0, failed: 0, partial: 0, successRate: 0 },
        tickets: { escalated: 0 },
        period: '30 days'
      };
    }
  }

  async getRule(id: string): Promise<EscalationRule> {
    try {
      const { data, error } = await supabase
        .from('escalation_rules')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching escalation rule:', error);
      throw error;
    }
  }

  async createRule(rule: Omit<EscalationRule, 'id' | 'created_at' | 'updated_at'>): Promise<EscalationRule> {
    try {
      const { data, error } = await supabase
        .from('escalation_rules')
        .insert([rule])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating escalation rule:', error);
      throw error;
    }
  }

  async updateRule(id: string, rule: Partial<EscalationRule>): Promise<EscalationRule> {
    try {
      const { data, error } = await supabase
        .from('escalation_rules')
        .update({ ...rule, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating escalation rule:', error);
      throw error;
    }
  }

  async deleteRule(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('escalation_rules')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting escalation rule:', error);
      throw error;
    }
  }

  async toggleRuleStatus(id: string, isActive: boolean): Promise<EscalationRule> {
    try {
      const { data, error } = await supabase
        .from('escalation_rules')
        .update({ is_active: isActive, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error toggling rule status:', error);
      throw error;
    }
  }

  async getLogs(ruleId?: string, ticketId?: string): Promise<EscalationLog[]> {
    try {
      let query = supabase
        .from('escalation_logs')
        .select('*')
        .order('executed_at', { ascending: false });

      if (ruleId) query = query.eq('rule_id', ruleId);
      if (ticketId) query = query.eq('ticket_id', ticketId);

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching escalation logs:', error);
      throw error;
    }
  }

  async executeRule(ruleId: string, ticketId: string): Promise<void> {
    try {
      // Get the rule
      const { data: rule, error: ruleError } = await supabase
        .from('escalation_rules')
        .select('*')
        .eq('id', ruleId)
        .single();

      if (ruleError) throw ruleError;

      // Log the execution
      const { error: logError } = await supabase
        .from('escalation_logs')
        .insert([{
          rule_id: ruleId,
          ticket_id: ticketId,
          executed_actions: rule.actions,
          execution_status: 'success',
          executed_at: new Date().toISOString()
        }]);

      if (logError) throw logError;
    } catch (error) {
      console.error('Error executing escalation rule:', error);
      throw error;
    }
  }
}

export const escalationService = new EscalationService();