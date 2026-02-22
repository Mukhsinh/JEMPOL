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

export interface Escalation {
  id: string;
  ticket_id: string;
  from_unit_id: string;
  to_unit_id: string;
  reason: string;
  status: string;
  created_at: string;
  resolved_at?: string;
  tickets?: {
    id: string;
    ticket_number: string;
    title: string;
    status: string;
  };
  from_unit?: {
    id: string;
    name: string;
    code: string;
  };
  to_unit?: {
    id: string;
    name: string;
    code: string;
  };
}

export interface GetEscalationsParams {
  status?: string;
  page?: number;
  limit?: number;
}

export interface GetEscalationsResult {
  data: Escalation[];
  total: number;
  page: number;
  limit: number;
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
  /**
   * Get escalations dengan auto-apply unit filter untuk regular user
   * User dapat melihat escalation jika unit mereka adalah from_unit atau to_unit
   */
  async getEscalations(
    params?: GetEscalationsParams,
    userUnitId?: string | null,
    hasGlobalAccess?: boolean
  ): Promise<GetEscalationsResult> {
    try {
      const page = params?.page || 1;
      const limit = params?.limit || 20;
      const offset = (page - 1) * limit;

      // Build query
      let query = supabase
        .from('escalations')
        .select(`
          id,
          ticket_id,
          from_unit_id,
          to_unit_id,
          reason,
          status,
          created_at,
          resolved_at,
          tickets (id, ticket_number, title, status),
          from_unit:units!from_unit_id (id, name, code),
          to_unit:units!to_unit_id (id, name, code)
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      // Apply unit filter untuk regular user
      if (!hasGlobalAccess && userUnitId) {
        console.log('🔒 Applying escalation unit filter for regular user:', userUnitId);
        query = query.or(`from_unit_id.eq.${userUnitId},to_unit_id.eq.${userUnitId}`);
      }

      // Apply status filter
      if (params?.status) {
        query = query.eq('status', params.status);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('❌ Error fetching escalations:', error);
        throw error;
      }

      return {
        data: data || [],
        total: count || 0,
        page,
        limit,
      };
    } catch (error) {
      console.error('❌ Error in getEscalations:', error);
      throw error;
    }
  }

  /**
   * Get escalation by ID dengan access validation
   */
  async getEscalationById(
    escalationId: string,
    userUnitId?: string | null,
    hasGlobalAccess?: boolean
  ): Promise<Escalation | null> {
    try {
      const { data, error } = await supabase
        .from('escalations')
        .select(`
          id,
          ticket_id,
          from_unit_id,
          to_unit_id,
          reason,
          status,
          created_at,
          resolved_at,
          tickets (id, ticket_number, title, status),
          from_unit:units!from_unit_id (id, name, code),
          to_unit:units!to_unit_id (id, name, code)
        `)
        .eq('id', escalationId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Not found
          return null;
        }
        console.error('❌ Error fetching escalation:', error);
        throw error;
      }

      // Validate access untuk regular user
      if (!hasGlobalAccess && userUnitId) {
        const hasAccess = data.from_unit_id === userUnitId || data.to_unit_id === userUnitId;
        if (!hasAccess) {
          console.warn('🚫 Access denied: User unit', userUnitId, 'trying to access escalation between', data.from_unit_id, 'and', data.to_unit_id);
          throw new Error('ACCESS_DENIED');
        }
      }

      return data;
    } catch (error: any) {
      if (error.message === 'ACCESS_DENIED') {
        throw error;
      }
      console.error('❌ Error in getEscalationById:', error);
      throw error;
    }
  }

  async getRules(
    userUnitId?: string | null,
    hasGlobalAccess?: boolean,
    selectedUnit?: string
  ): Promise<EscalationRule[]> {
    try {
      // Build query
      let query = supabase
        .from('escalation_rules')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply unit filter untuk regular user
      // Escalation rules biasanya tidak terikat ke unit tertentu,
      // tapi jika ada kolom unit_id di escalation_rules, uncomment ini:
      // if (!hasGlobalAccess && userUnitId) {
      //   query = query.eq('unit_id', userUnitId);
      // } else if (selectedUnit) {
      //   query = query.eq('unit_id', selectedUnit);
      // }

      const { data, error } = await query;

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

  async getStats(
    userUnitId?: string | null,
    hasGlobalAccess?: boolean,
    selectedUnit?: string
  ): Promise<EscalationStats> {
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

      // Get escalated tickets count dengan unit filter
      let ticketsQuery = supabase
        .from('tickets')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'escalated');

      // Apply unit filter untuk regular user
      if (!hasGlobalAccess && userUnitId) {
        ticketsQuery = ticketsQuery.eq('unit_id', userUnitId);
      } else if (selectedUnit) {
        ticketsQuery = ticketsQuery.eq('unit_id', selectedUnit);
      }

      const { count: escalatedCount, error: ticketsError } = await ticketsQuery;

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

  /**
   * Get units untuk dropdown selector (hanya untuk superadmin/direktur)
   */
  async getUnits(): Promise<{ data: Array<{ id: string; name: string }> | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('units')
        .select('id, name')
        .eq('is_active', true)
        .order('name');

      return { data, error };
    } catch (error) {
      console.error('Error fetching units:', error);
      return { data: null, error };
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