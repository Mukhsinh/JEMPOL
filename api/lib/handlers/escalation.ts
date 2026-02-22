import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { getUserInfo, applyEscalationUnitFilter } from '../middleware/accessControl';
import { logSuccessfulAccess } from '../utils/auditLog';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { method, url } = req;
  const path = url?.split('?')[0] || '';

  try {
    // GET /escalation/tickets - Get ticket escalations dengan access control
    if (method === 'GET' && path.endsWith('/tickets')) {
      console.log('🎯 GET /api/public/escalation/tickets');
      
      // Extract user info untuk access control
      const userInfo = await getUserInfo(req, supabase);
      console.log('👤 User info:', userInfo);

      // Get query parameters for filtering
      const {
        status,
        ticket_id,
        from_unit_id,
        to_unit_id,
        date_from,
        date_to,
        limit = '100'
      } = req.query;

      console.log('📥 Query params:', { status, ticket_id, from_unit_id, to_unit_id, limit });

      // Build query
      let query = supabase
        .from('ticket_escalations')
        .select(`
          *,
          tickets!ticket_escalations_ticket_id_fkey(id, ticket_number, title, status),
          from_units:from_unit_id(id, name, code),
          to_units:to_unit_id(id, name, code),
          escalated_by_user:escalated_by(id, full_name, email)
        `)
        .order('escalated_at', { ascending: false });

      // Apply unit-based access control FIRST
      query = applyEscalationUnitFilter(query, userInfo);

      // Apply filters
      if (status && status !== 'all') {
        query = query.eq('status', status);
      }

      if (ticket_id) {
        query = query.eq('ticket_id', ticket_id);
      }

      if (from_unit_id) {
        query = query.eq('from_unit_id', from_unit_id);
      }

      if (to_unit_id) {
        query = query.eq('to_unit_id', to_unit_id);
      }

      if (date_from) {
        query = query.gte('escalated_at', date_from);
      }

      if (date_to) {
        query = query.lte('escalated_at', date_to);
      }

      // Apply limit
      const limitNum = parseInt(limit as string) || 100;
      query = query.limit(limitNum);

      const { data: escalations, error } = await query;

      if (error) {
        console.error('❌ Error fetching ticket escalations:', error);
        return res.status(500).json({
          success: false,
          error: 'Gagal mengambil data eskalasi tiket',
          details: error.message
        });
      }

      console.log(`✅ Fetched ${escalations?.length || 0} ticket escalations`);

      // Log successful access (non-blocking)
      if (userInfo && escalations && escalations.length > 0) {
        (async () => {
          try {
            await logSuccessfulAccess(
              supabase,
              userInfo.id,
              userInfo.role,
              'view',
              'escalation',
              'list',
              userInfo.unit_id,
              {
                ip: req.headers['x-forwarded-for'] as string || req.headers['x-real-ip'] as string,
                userAgent: req.headers['user-agent'] as string
              }
            );
          } catch (logError) {
            console.error('Failed to log access (non-critical):', logError);
          }
        })();
      }

      return res.status(200).json({
        success: true,
        data: escalations || [],
        message: 'Ticket escalations berhasil diambil'
      });
    }

    // GET /escalation/rules - Get all escalation rules
    if (method === 'GET' && path.endsWith('/rules')) {
      const { data, error } = await supabase
        .from('escalation_rules')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return res.status(200).json(data || []);
    }

    // GET /escalation/stats - Get escalation statistics
    if (method === 'GET' && path.endsWith('/stats')) {
      // Get rules stats
      const { data: rules, error: rulesError } = await supabase
        .from('escalation_rules')
        .select('id, is_active');

      if (rulesError) throw rulesError;

      const rulesStats = {
        total: rules?.length || 0,
        active: rules?.filter(r => r.is_active).length || 0,
        inactive: rules?.filter(r => !r.is_active).length || 0
      };

      // Get execution stats
      const { data: logs, error: logsError } = await supabase
        .from('escalation_logs')
        .select('execution_status')
        .gte('executed_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (logsError) throw logsError;

      const successful = logs?.filter(l => l.execution_status === 'success').length || 0;
      const failed = logs?.filter(l => l.execution_status === 'failed').length || 0;
      const partial = logs?.filter(l => l.execution_status === 'partial').length || 0;
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

      const stats = {
        rules: rulesStats,
        executions: executionStats,
        tickets: {
          escalated: escalatedCount || 0
        },
        period: '30 days'
      };

      return res.status(200).json(stats);
    }

    // GET /escalation/rules/:id - Get specific rule
    if (method === 'GET' && path.match(/\/rules\/[^/]+$/)) {
      const id = path.split('/').pop();
      
      const { data, error } = await supabase
        .from('escalation_rules')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return res.status(200).json(data);
    }

    // POST /escalation/rules - Create new rule
    if (method === 'POST' && path.endsWith('/rules')) {
      const { data, error } = await supabase
        .from('escalation_rules')
        .insert([req.body])
        .select()
        .single();

      if (error) throw error;

      return res.status(201).json(data);
    }

    // PUT /escalation/rules/:id - Update rule
    if (method === 'PUT' && path.match(/\/rules\/[^/]+$/)) {
      const id = path.split('/').pop();
      
      const { data, error } = await supabase
        .from('escalation_rules')
        .update(req.body)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return res.status(200).json(data);
    }

    // PATCH /escalation/rules/:id/toggle - Toggle rule status
    if (method === 'PATCH' && path.match(/\/rules\/[^/]+\/toggle$/)) {
      const id = path.split('/')[path.split('/').length - 2];
      const { is_active } = req.body;
      
      const { data, error } = await supabase
        .from('escalation_rules')
        .update({ is_active, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return res.status(200).json(data);
    }

    // DELETE /escalation/rules/:id - Delete rule
    if (method === 'DELETE' && path.match(/\/rules\/[^/]+$/)) {
      const id = path.split('/').pop();
      
      const { error } = await supabase
        .from('escalation_rules')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return res.status(204).end();
    }

    // GET /escalation/logs - Get escalation logs
    if (method === 'GET' && path.endsWith('/logs')) {
      const { rule_id, ticket_id } = req.query;
      
      let query = supabase
        .from('escalation_logs')
        .select('*')
        .order('executed_at', { ascending: false });

      if (rule_id) query = query.eq('rule_id', rule_id);
      if (ticket_id) query = query.eq('ticket_id', ticket_id);

      const { data, error } = await query;

      if (error) throw error;

      return res.status(200).json(data || []);
    }

    // POST /escalation/rules/:id/execute - Execute rule
    if (method === 'POST' && path.match(/\/rules\/[^/]+\/execute$/)) {
      const id = path.split('/')[path.split('/').length - 2];
      const { ticket_id } = req.body;

      // Get the rule
      const { data: rule, error: ruleError } = await supabase
        .from('escalation_rules')
        .select('*')
        .eq('id', id)
        .single();

      if (ruleError) throw ruleError;

      // Log the execution
      const { error: logError } = await supabase
        .from('escalation_logs')
        .insert([{
          rule_id: id,
          ticket_id,
          executed_actions: rule.actions,
          execution_status: 'success',
          executed_at: new Date().toISOString()
        }]);

      if (logError) throw logError;

      return res.status(200).json({ success: true });
    }

    return res.status(404).json({ error: 'Endpoint not found' });

  } catch (error: any) {
    console.error('Escalation API Error:', error);
    return res.status(500).json({ 
      error: error.message || 'Internal server error',
      details: error
    });
  }
}
