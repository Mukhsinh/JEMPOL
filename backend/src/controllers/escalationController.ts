import { Request, Response } from 'express';
import supabase from '../config/supabase.js';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
    role: string;
  };
}

// Helper functions
async function createNotification(ticketId: string, type: string, title: string, message: string) {
  await supabase
    .from('notifications')
    .insert({
      ticket_id: ticketId,
      type,
      title,
      message,
      channels: ['web']
    });
}

function getNextPriority(currentPriority: string): string {
  const priorities = ['low', 'medium', 'high', 'critical'];
  const currentIndex = priorities.indexOf(currentPriority);
  return currentIndex < priorities.length - 1 ? priorities[currentIndex + 1] : currentPriority;
}

// Mendapatkan semua aturan eskalasi
export const getEscalationRules = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { data: rules, error } = await supabase
      .from('escalation_rules')
      .select(`
        *,
        creator:created_by(full_name, email)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(rules);
  } catch (error) {
    console.error('Error fetching escalation rules:', error);
    res.status(500).json({ error: 'Gagal mengambil aturan eskalasi' });
  }
};

// Mendapatkan aturan eskalasi berdasarkan ID
export const getEscalationRule = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const { data: rule, error } = await supabase
      .from('escalation_rules')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!rule) {
      return res.status(404).json({ error: 'Aturan eskalasi tidak ditemukan' });
    }

    res.json(rule);
  } catch (error) {
    console.error('Error fetching escalation rule:', error);
    res.status(500).json({ error: 'Gagal mengambil aturan eskalasi' });
  }
};

// Membuat aturan eskalasi baru
export const createEscalationRule = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, description, is_active, trigger_conditions, actions } = req.body;
    const userId = req.user?.id;

    // Validasi input
    if (!name || !trigger_conditions || !actions) {
      return res.status(400).json({ error: 'Nama, kondisi trigger, dan aksi wajib diisi' });
    }

    const { data: rule, error } = await supabase
      .from('escalation_rules')
      .insert({
        name,
        description,
        is_active: is_active ?? true,
        trigger_conditions,
        actions,
        created_by: userId
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(rule);
  } catch (error) {
    console.error('Error creating escalation rule:', error);
    res.status(500).json({ error: 'Gagal membuat aturan eskalasi' });
  }
};

// Mengupdate aturan eskalasi
export const updateEscalationRule = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, is_active, trigger_conditions, actions } = req.body;

    const { data: rule, error } = await supabase
      .from('escalation_rules')
      .update({
        name,
        description,
        is_active,
        trigger_conditions,
        actions,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (!rule) {
      return res.status(404).json({ error: 'Aturan eskalasi tidak ditemukan' });
    }

    res.json(rule);
  } catch (error) {
    console.error('Error updating escalation rule:', error);
    res.status(500).json({ error: 'Gagal mengupdate aturan eskalasi' });
  }
};

// Toggle status aktif/nonaktif aturan eskalasi
export const toggleEscalationRuleStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    const { data: rule, error } = await supabase
      .from('escalation_rules')
      .update({
        is_active,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (!rule) {
      return res.status(404).json({ error: 'Aturan eskalasi tidak ditemukan' });
    }

    res.json(rule);
  } catch (error) {
    console.error('Error toggling escalation rule:', error);
    res.status(500).json({ error: 'Gagal mengubah status aturan eskalasi' });
  }
};

// Menghapus aturan eskalasi
export const deleteEscalationRule = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('escalation_rules')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting escalation rule:', error);
    res.status(500).json({ error: 'Gagal menghapus aturan eskalasi' });
  }
};

// Mendapatkan log eskalasi
export const getEscalationLogs = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { rule_id, ticket_id } = req.query;

    let query = supabase
      .from('escalation_logs')
      .select(`
        *,
        escalation_rules(name),
        tickets(ticket_number, title)
      `)
      .order('executed_at', { ascending: false });

    if (rule_id) {
      query = query.eq('rule_id', rule_id);
    }

    if (ticket_id) {
      query = query.eq('ticket_id', ticket_id);
    }

    const { data: logs, error } = await query;

    if (error) throw error;

    res.json(logs);
  } catch (error) {
    console.error('Error fetching escalation logs:', error);
    res.status(500).json({ error: 'Gagal mengambil log eskalasi' });
  }
};

// Mendapatkan statistik eskalasi
export const getEscalationStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Ambil statistik aturan eskalasi
    const { data: rulesStats, error: rulesError } = await supabase
      .from('escalation_rules')
      .select('is_active');

    if (rulesError) throw rulesError;

    const totalRules = rulesStats?.length || 0;
    const activeRules = rulesStats?.filter(rule => rule.is_active).length || 0;
    const inactiveRules = totalRules - activeRules;

    // Ambil statistik log eskalasi (30 hari terakhir)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: logsStats, error: logsError } = await supabase
      .from('escalation_logs')
      .select('execution_status, executed_at')
      .gte('executed_at', thirtyDaysAgo.toISOString());

    if (logsError) throw logsError;

    const totalExecutions = logsStats?.length || 0;
    const successfulExecutions = logsStats?.filter(log => log.execution_status === 'success').length || 0;
    const failedExecutions = logsStats?.filter(log => log.execution_status === 'failed').length || 0;
    const partialExecutions = logsStats?.filter(log => log.execution_status === 'partial').length || 0;

    // Ambil statistik tiket yang dieskalasi (30 hari terakhir)
    const { data: ticketsStats, error: ticketsError } = await supabase
      .from('tickets')
      .select('status, created_at')
      .eq('status', 'escalated')
      .gte('created_at', thirtyDaysAgo.toISOString());

    if (ticketsError) throw ticketsError;

    const escalatedTickets = ticketsStats?.length || 0;

    const stats = {
      rules: {
        total: totalRules,
        active: activeRules,
        inactive: inactiveRules
      },
      executions: {
        total: totalExecutions,
        successful: successfulExecutions,
        failed: failedExecutions,
        partial: partialExecutions,
        successRate: totalExecutions > 0 ? Math.round((successfulExecutions / totalExecutions) * 100) : 0
      },
      tickets: {
        escalated: escalatedTickets
      },
      period: '30 days'
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching escalation stats:', error);
    res.status(500).json({ error: 'Gagal mengambil statistik eskalasi' });
  }
};

// Eksekusi manual aturan eskalasi
export const executeEscalationRule = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { ticket_id } = req.body;

    if (!ticket_id) {
      return res.status(400).json({ error: 'ID tiket wajib diisi' });
    }

    // Ambil aturan eskalasi
    const { data: rule, error: ruleError } = await supabase
      .from('escalation_rules')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (ruleError) throw ruleError;

    if (!rule) {
      return res.status(404).json({ error: 'Aturan eskalasi tidak ditemukan atau tidak aktif' });
    }

    // Ambil data tiket
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .select('*')
      .eq('id', ticket_id)
      .single();

    if (ticketError) throw ticketError;

    if (!ticket) {
      return res.status(404).json({ error: 'Tiket tidak ditemukan' });
    }

    // Eksekusi aksi-aksi dalam aturan
    const executedActions = [];
    let executionStatus = 'success';
    let errorMessage = null;

    try {
      for (const action of rule.actions) {
        switch (action.type) {
          case 'notify_manager':
            // Implementasi notifikasi manager
            await createNotification(ticket_id, 'ticket_escalated', 'Tiket Dieskalasi', 
              `Tiket ${ticket.ticket_number} telah dieskalasi berdasarkan aturan: ${rule.name}`);
            executedActions.push({ ...action, status: 'success' });
            break;

          case 'notify_assignee':
            // Implementasi notifikasi assignee
            if (ticket.assigned_to) {
              await createNotification(ticket_id, 'sla_reminder', 'Pengingat SLA', 
                `Tiket ${ticket.ticket_number} memerlukan perhatian segera`);
            }
            executedActions.push({ ...action, status: 'success' });
            break;

          case 'bump_priority':
            // Naikkan prioritas tiket
            const newPriority = getNextPriority(ticket.priority);
            if (newPriority !== ticket.priority) {
              await supabase
                .from('tickets')
                .update({ priority: newPriority, updated_at: new Date().toISOString() })
                .eq('id', ticket_id);
            }
            executedActions.push({ ...action, status: 'success', new_priority: newPriority });
            break;

          case 'flag_review':
            // Flag tiket untuk review
            await supabase
              .from('tickets')
              .update({ 
                status: 'escalated',
                updated_at: new Date().toISOString()
              })
              .eq('id', ticket_id);
            executedActions.push({ ...action, status: 'success' });
            break;

          default:
            executedActions.push({ ...action, status: 'skipped', reason: 'Unknown action type' });
        }
      }
    } catch (actionError: any) {
      executionStatus = 'partial';
      errorMessage = actionError.message;
    }

    // Simpan log eksekusi
    await supabase
      .from('escalation_logs')
      .insert({
        rule_id: id,
        ticket_id,
        executed_actions: executedActions,
        execution_status: executionStatus,
        error_message: errorMessage
      });

    res.json({
      message: 'Aturan eskalasi berhasil dieksekusi',
      executed_actions: executedActions,
      status: executionStatus
    });

  } catch (error) {
    console.error('Error executing escalation rule:', error);
    res.status(500).json({ error: 'Gagal mengeksekusi aturan eskalasi' });
  }
};