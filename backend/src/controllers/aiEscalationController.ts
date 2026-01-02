import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

export const createEscalationRule = async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      service_types = [],
      categories = [],
      priority_levels = [],
      urgency_threshold = 3,
      confidence_threshold = 85,
      sentiment_threshold,
      from_role,
      to_role,
      skip_levels = false,
      escalation_time_hours = 24,
      sla_breach_escalation = true,
      is_active = true
    } = req.body;

    // Validate required fields
    if (!name || !from_role || !to_role) {
      return res.status(400).json({
        error: 'name, from_role, dan to_role wajib diisi'
      });
    }

    // Validate roles
    const validRoles = ['staff', 'supervisor', 'manager', 'director'];
    if (!validRoles.includes(from_role) || !validRoles.includes(to_role)) {
      return res.status(400).json({
        error: 'Role tidak valid. Gunakan: staff, supervisor, manager, director'
      });
    }

    // Validate escalation logic
    const roleHierarchy = { staff: 1, supervisor: 2, manager: 3, director: 4 };
    if (roleHierarchy[from_role] >= roleHierarchy[to_role]) {
      return res.status(400).json({
        error: 'Eskalasi harus ke role yang lebih tinggi'
      });
    }

    // Get current user ID (from auth middleware)
    const created_by = req.user?.id;

    const { data: rule, error } = await supabase
      .from('ai_escalation_rules')
      .insert({
        name,
        description,
        service_types,
        categories,
        priority_levels,
        urgency_threshold,
        confidence_threshold,
        sentiment_threshold,
        from_role,
        to_role,
        skip_levels,
        escalation_time_hours,
        sla_breach_escalation,
        is_active,
        created_by,
        execution_count: 0,
        success_count: 0
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating escalation rule:', error);
      return res.status(500).json({
        error: 'Gagal membuat aturan eskalasi'
      });
    }

    res.status(201).json({
      success: true,
      rule,
      message: 'Aturan eskalasi berhasil dibuat'
    });

  } catch (error) {
    console.error('Error in createEscalationRule:', error);
    res.status(500).json({
      error: 'Terjadi kesalahan internal server'
    });
  }
};

export const getEscalationRules = async (req: Request, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      is_active, 
      service_type,
      from_role,
      to_role,
      search 
    } = req.query;

    let query = supabase
      .from('ai_escalation_rules')
      .select(`
        *,
        created_by_user:created_by (
          id,
          full_name,
          email
        )
      `);

    // Apply filters
    if (is_active !== undefined) {
      query = query.eq('is_active', is_active === 'true');
    }
    if (service_type) {
      query = query.contains('service_types', [service_type]);
    }
    if (from_role) {
      query = query.eq('from_role', from_role);
    }
    if (to_role) {
      query = query.eq('to_role', to_role);
    }
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Pagination
    const offset = (Number(page) - 1) * Number(limit);
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + Number(limit) - 1);

    const { data: rules, error, count } = await query;

    if (error) {
      console.error('Error fetching escalation rules:', error);
      return res.status(500).json({
        error: 'Gagal mengambil data aturan eskalasi'
      });
    }

    res.json({
      rules,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count || 0,
        pages: Math.ceil((count || 0) / Number(limit))
      }
    });

  } catch (error) {
    console.error('Error in getEscalationRules:', error);
    res.status(500).json({
      error: 'Terjadi kesalahan internal server'
    });
  }
};

export const getEscalationRuleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data: rule, error } = await supabase
      .from('ai_escalation_rules')
      .select(`
        *,
        created_by_user:created_by (
          id,
          full_name,
          email
        )
      `)
      .eq('id', id)
      .single();

    if (error || !rule) {
      return res.status(404).json({
        error: 'Aturan eskalasi tidak ditemukan'
      });
    }

    // Get execution logs for this rule
    const { data: logs } = await supabase
      .from('ai_escalation_logs')
      .select(`
        *,
        from_user:from_user_id (full_name),
        to_user:to_user_id (full_name)
      `)
      .eq('rule_id', id)
      .order('executed_at', { ascending: false })
      .limit(10);

    res.json({
      rule,
      recent_executions: logs || []
    });

  } catch (error) {
    console.error('Error in getEscalationRuleById:', error);
    res.status(500).json({
      error: 'Terjadi kesalahan internal server'
    });
  }
};

export const updateEscalationRule = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    
    // Remove fields that shouldn't be updated directly
    delete updateData.id;
    delete updateData.created_by;
    delete updateData.created_at;
    delete updateData.execution_count;
    delete updateData.success_count;
    
    updateData.updated_at = new Date().toISOString();

    const { data: rule, error } = await supabase
      .from('ai_escalation_rules')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating escalation rule:', error);
      return res.status(500).json({
        error: 'Gagal memperbarui aturan eskalasi'
      });
    }

    res.json({
      success: true,
      rule,
      message: 'Aturan eskalasi berhasil diperbarui'
    });

  } catch (error) {
    console.error('Error in updateEscalationRule:', error);
    res.status(500).json({
      error: 'Terjadi kesalahan internal server'
    });
  }
};

export const deleteEscalationRule = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if rule has execution logs
    const { data: logs, error: logError } = await supabase
      .from('ai_escalation_logs')
      .select('id')
      .eq('rule_id', id)
      .limit(1);

    if (logError) {
      console.error('Error checking rule usage:', logError);
      return res.status(500).json({
        error: 'Gagal memeriksa penggunaan aturan'
      });
    }

    if (logs && logs.length > 0) {
      // Don't delete, just deactivate
      const { error: deactivateError } = await supabase
        .from('ai_escalation_rules')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (deactivateError) {
        console.error('Error deactivating rule:', deactivateError);
        return res.status(500).json({
          error: 'Gagal menonaktifkan aturan'
        });
      }

      return res.json({
        success: true,
        message: 'Aturan eskalasi dinonaktifkan karena sudah pernah digunakan'
      });
    }

    // Delete rule if no execution history
    const { error } = await supabase
      .from('ai_escalation_rules')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting escalation rule:', error);
      return res.status(500).json({
        error: 'Gagal menghapus aturan eskalasi'
      });
    }

    res.json({
      success: true,
      message: 'Aturan eskalasi berhasil dihapus'
    });

  } catch (error) {
    console.error('Error in deleteEscalationRule:', error);
    res.status(500).json({
      error: 'Terjadi kesalahan internal server'
    });
  }
};

export const executeEscalationRule = async (req: Request, res: Response) => {
  try {
    const { rule_id, ticket_id, ticket_type = 'external', triggered_by = 'manual' } = req.body;

    // Get the rule
    const { data: rule, error: ruleError } = await supabase
      .from('ai_escalation_rules')
      .select('*')
      .eq('id', rule_id)
      .eq('is_active', true)
      .single();

    if (ruleError || !rule) {
      return res.status(404).json({
        error: 'Aturan eskalasi tidak ditemukan atau tidak aktif'
      });
    }

    // Get ticket details
    const ticketTable = ticket_type === 'external' ? 'external_tickets' : 'tickets';
    const { data: ticket, error: ticketError } = await supabase
      .from(ticketTable)
      .select('*')
      .eq('id', ticket_id)
      .single();

    if (ticketError || !ticket) {
      return res.status(404).json({
        error: 'Tiket tidak ditemukan'
      });
    }

    // Find users for escalation
    const { data: fromUsers } = await supabase
      .from('users')
      .select('id, full_name, role')
      .eq('role', rule.from_role)
      .eq('is_active', true)
      .limit(1);

    const { data: toUsers } = await supabase
      .from('users')
      .select('id, full_name, role')
      .eq('role', rule.to_role)
      .eq('is_active', true)
      .limit(1);

    if (!fromUsers?.length || !toUsers?.length) {
      return res.status(400).json({
        error: 'Tidak ditemukan user untuk eskalasi'
      });
    }

    const fromUser = fromUsers[0];
    const toUser = toUsers[0];

    // Execute escalation
    try {
      // Update ticket assignment
      const ticketUpdate: any = {
        assigned_to: toUser.id,
        status: 'escalated',
        updated_at: new Date().toISOString()
      };

      await supabase
        .from(ticketTable)
        .update(ticketUpdate)
        .eq('id', ticket_id);

      // Create escalation record in tickets table if it exists
      if (ticket_type === 'internal') {
        await supabase
          .from('ticket_escalations')
          .insert({
            ticket_id,
            from_user_id: fromUser.id,
            to_user_id: toUser.id,
            from_role: rule.from_role,
            to_role: rule.to_role,
            reason: `Auto-escalation by rule: ${rule.name}`,
            escalation_type: 'automatic'
          });
      }

      // Log the execution
      await supabase
        .from('ai_escalation_logs')
        .insert({
          rule_id,
          ticket_id,
          ticket_type,
          triggered_by,
          confidence_score: ticket.confidence_score,
          execution_status: 'success',
          from_user_id: fromUser.id,
          to_user_id: toUser.id,
          from_role: rule.from_role,
          to_role: rule.to_role
        });

      // Update rule statistics
      await supabase
        .from('ai_escalation_rules')
        .update({
          execution_count: supabase.sql`execution_count + 1`,
          success_count: supabase.sql`success_count + 1`,
          updated_at: new Date().toISOString()
        })
        .eq('id', rule_id);

      res.json({
        success: true,
        message: 'Eskalasi berhasil dijalankan',
        escalation: {
          from: fromUser,
          to: toUser,
          rule: rule.name
        }
      });

    } catch (executionError) {
      // Log failed execution
      await supabase
        .from('ai_escalation_logs')
        .insert({
          rule_id,
          ticket_id,
          ticket_type,
          triggered_by,
          confidence_score: ticket.confidence_score,
          execution_status: 'failed',
          error_message: executionError instanceof Error ? executionError.message : 'Unknown error'
        });

      // Update rule statistics
      await supabase
        .from('ai_escalation_rules')
        .update({
          execution_count: supabase.sql`execution_count + 1`,
          updated_at: new Date().toISOString()
        })
        .eq('id', rule_id);

      throw executionError;
    }

  } catch (error) {
    console.error('Error in executeEscalationRule:', error);
    res.status(500).json({
      error: 'Terjadi kesalahan saat menjalankan eskalasi'
    });
  }
};

export const getEscalationStats = async (req: Request, res: Response) => {
  try {
    const { date_from, date_to } = req.query;

    // Set default date range (last 30 days)
    const defaultDateTo = new Date();
    const defaultDateFrom = new Date();
    defaultDateFrom.setDate(defaultDateFrom.getDate() - 30);

    const dateFrom = date_from ? new Date(date_from as string) : defaultDateFrom;
    const dateTo = date_to ? new Date(date_to as string) : defaultDateTo;

    // Get escalation logs in date range
    const { data: logs } = await supabase
      .from('ai_escalation_logs')
      .select('*')
      .gte('executed_at', dateFrom.toISOString())
      .lte('executed_at', dateTo.toISOString());

    // Calculate stats
    const totalExecutions = logs?.length || 0;
    const successfulExecutions = logs?.filter(log => log.execution_status === 'success').length || 0;
    const avgConfidence = logs?.length ? 
      logs.reduce((sum, log) => sum + (log.confidence_score || 0), 0) / logs.length : 0;

    // Get rule counts
    const { count: totalRules } = await supabase
      .from('ai_escalation_rules')
      .select('*', { count: 'exact', head: true });

    const { count: activeRules } = await supabase
      .from('ai_escalation_rules')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // Get SLA at risk count (tickets approaching deadline)
    const { count: slaAtRisk } = await supabase
      .from('external_tickets')
      .select('*', { count: 'exact', head: true })
      .lt('sla_deadline', new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()) // 2 hours from now
      .in('status', ['open', 'in_progress']);

    // Calculate trends (compare with previous period)
    const previousDateFrom = new Date(dateFrom);
    previousDateFrom.setDate(previousDateFrom.getDate() - (dateTo.getTime() - dateFrom.getTime()) / (1000 * 60 * 60 * 24));
    
    const { data: previousLogs } = await supabase
      .from('ai_escalation_logs')
      .select('*')
      .gte('executed_at', previousDateFrom.toISOString())
      .lt('executed_at', dateFrom.toISOString());

    const previousExecutions = previousLogs?.length || 0;
    const monthlyTrend = previousExecutions > 0 ? 
      Math.round(((totalExecutions - previousExecutions) / previousExecutions) * 100) : 0;

    const previousAvgConfidence = previousLogs?.length ?
      previousLogs.reduce((sum, log) => sum + (log.confidence_score || 0), 0) / previousLogs.length : 0;
    const confidenceTrend = previousAvgConfidence > 0 ?
      Math.round(((avgConfidence - previousAvgConfidence) / previousAvgConfidence) * 100) / 100 : 0;

    res.json({
      auto_escalated: totalExecutions,
      ai_confidence: Math.round(avgConfidence * 10) / 10,
      sla_at_risk: slaAtRisk || 0,
      active_rules: activeRules || 0,
      total_rules: totalRules || 0,
      success_rate: totalExecutions > 0 ? Math.round((successfulExecutions / totalExecutions) * 100) : 0,
      monthly_trend: monthlyTrend,
      confidence_trend: confidenceTrend
    });

  } catch (error) {
    console.error('Error in getEscalationStats:', error);
    res.status(500).json({
      error: 'Terjadi kesalahan internal server'
    });
  }
};

export const getEscalationLogs = async (req: Request, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      rule_id, 
      ticket_id,
      execution_status,
      date_from,
      date_to 
    } = req.query;

    let query = supabase
      .from('ai_escalation_logs')
      .select(`
        *,
        rule:rule_id (
          id,
          name
        ),
        from_user:from_user_id (
          id,
          full_name
        ),
        to_user:to_user_id (
          id,
          full_name
        )
      `);

    // Apply filters
    if (rule_id) {
      query = query.eq('rule_id', rule_id);
    }
    if (ticket_id) {
      query = query.eq('ticket_id', ticket_id);
    }
    if (execution_status) {
      query = query.eq('execution_status', execution_status);
    }
    if (date_from) {
      query = query.gte('executed_at', date_from);
    }
    if (date_to) {
      query = query.lte('executed_at', date_to);
    }

    // Pagination
    const offset = (Number(page) - 1) * Number(limit);
    query = query
      .order('executed_at', { ascending: false })
      .range(offset, offset + Number(limit) - 1);

    const { data: logs, error, count } = await query;

    if (error) {
      console.error('Error fetching escalation logs:', error);
      return res.status(500).json({
        error: 'Gagal mengambil data log eskalasi'
      });
    }

    res.json({
      logs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count || 0,
        pages: Math.ceil((count || 0) / Number(limit))
      }
    });

  } catch (error) {
    console.error('Error in getEscalationLogs:', error);
    res.status(500).json({
      error: 'Terjadi kesalahan internal server'
    });
  }
};

// Auto-escalation checker (would be called by a cron job or scheduler)
export const checkAutoEscalation = async (req: Request, res: Response) => {
  try {
    // Get all active escalation rules
    const { data: rules } = await supabase
      .from('ai_escalation_rules')
      .select('*')
      .eq('is_active', true);

    if (!rules || rules.length === 0) {
      return res.json({
        message: 'Tidak ada aturan eskalasi aktif',
        processed: 0
      });
    }

    let processedCount = 0;

    for (const rule of rules) {
      // Find tickets that match this rule's criteria
      let ticketQuery = supabase
        .from('external_tickets')
        .select('*')
        .in('status', ['open', 'in_progress']);

      // Apply rule filters
      if (rule.service_types && rule.service_types.length > 0) {
        ticketQuery = ticketQuery.in('service_type', rule.service_types);
      }
      if (rule.priority_levels && rule.priority_levels.length > 0) {
        ticketQuery = ticketQuery.in('priority', rule.priority_levels);
      }
      if (rule.urgency_threshold) {
        ticketQuery = ticketQuery.gte('urgency_level', rule.urgency_threshold);
      }
      if (rule.confidence_threshold) {
        ticketQuery = ticketQuery.gte('confidence_score', rule.confidence_threshold);
      }

      // Check SLA breach if enabled
      if (rule.sla_breach_escalation) {
        ticketQuery = ticketQuery.lt('sla_deadline', new Date().toISOString());
      }

      const { data: matchingTickets } = await ticketQuery;

      if (matchingTickets && matchingTickets.length > 0) {
        for (const ticket of matchingTickets) {
          // Check if this ticket was already escalated by this rule
          const { data: existingLog } = await supabase
            .from('ai_escalation_logs')
            .select('id')
            .eq('rule_id', rule.id)
            .eq('ticket_id', ticket.id)
            .eq('execution_status', 'success')
            .single();

          if (!existingLog) {
            // Execute escalation
            try {
              await executeEscalationForTicket(rule, ticket);
              processedCount++;
            } catch (error) {
              console.error(`Failed to escalate ticket ${ticket.id}:`, error);
            }
          }
        }
      }
    }

    res.json({
      message: `Auto-escalation check completed`,
      processed: processedCount,
      rules_checked: rules.length
    });

  } catch (error) {
    console.error('Error in checkAutoEscalation:', error);
    res.status(500).json({
      error: 'Terjadi kesalahan saat memeriksa auto-escalation'
    });
  }
};

// Helper function to execute escalation for a specific ticket
const executeEscalationForTicket = async (rule: any, ticket: any) => {
  // Find users for escalation
  const { data: toUsers } = await supabase
    .from('users')
    .select('id, full_name, role')
    .eq('role', rule.to_role)
    .eq('is_active', true)
    .limit(1);

  if (!toUsers?.length) {
    throw new Error(`No active users found for role: ${rule.to_role}`);
  }

  const toUser = toUsers[0];

  // Update ticket
  await supabase
    .from('external_tickets')
    .update({
      assigned_to: toUser.id,
      status: 'escalated',
      updated_at: new Date().toISOString()
    })
    .eq('id', ticket.id);

  // Log the execution
  await supabase
    .from('ai_escalation_logs')
    .insert({
      rule_id: rule.id,
      ticket_id: ticket.id,
      ticket_type: 'external',
      triggered_by: 'sla_breach',
      confidence_score: ticket.confidence_score,
      execution_status: 'success',
      to_user_id: toUser.id,
      to_role: rule.to_role
    });

  // Update rule statistics
  await supabase
    .from('ai_escalation_rules')
    .update({
      execution_count: supabase.sql`execution_count + 1`,
      success_count: supabase.sql`success_count + 1`,
      updated_at: new Date().toISOString()
    })
    .eq('id', rule.id);
};