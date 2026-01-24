import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.VITE_SUPABASE_ANON_KEY || ''
);

const setCorsHeaders = (res: VercelResponse) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
};

async function verifyToken(request: VercelRequest): Promise<any> {
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  
  const token = authHeader.substring(7);
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    return error || !user ? null : user;
  } catch (error) {
    return null;
  }
}

export default async function handler(request: VercelRequest, response: VercelResponse) {
  setCorsHeaders(response);
  if (request.method === 'OPTIONS') return response.status(200).end();

  try {
    const user = await verifyToken(request);
    if (!user) {
      return response.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const url = new URL(request.url || '', `https://${request.headers.host}`);
    const pathParts = url.pathname.split('/').filter(Boolean);
    const action = pathParts[2]; // escalation/<action>
    const id = pathParts[3]; // escalation/<action>/<id>

    // GET /api/escalation/rules - List escalation rules
    if (request.method === 'GET' && action === 'rules' && !id) {
      const { data: rules, error } = await supabase
        .from('escalation_rules')
        .select(`
          *,
          creator:created_by(full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return response.json(rules || []);
    }

    // GET /api/escalation/stats - Get escalation statistics
    if (request.method === 'GET' && action === 'stats') {
      const { data: rulesStats, error: rulesError } = await supabase
        .from('escalation_rules')
        .select('is_active');

      if (rulesError) throw rulesError;

      const totalRules = rulesStats?.length || 0;
      const activeRules = rulesStats?.filter(rule => rule.is_active).length || 0;

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: logsStats, error: logsError } = await supabase
        .from('escalation_logs')
        .select('execution_status')
        .gte('executed_at', thirtyDaysAgo.toISOString());

      if (logsError) throw logsError;

      const totalExecutions = logsStats?.length || 0;
      const successfulExecutions = logsStats?.filter(log => log.execution_status === 'success').length || 0;

      return response.json({
        rules: {
          total: totalRules,
          active: activeRules,
          inactive: totalRules - activeRules
        },
        executions: {
          total: totalExecutions,
          successful: successfulExecutions,
          failed: totalExecutions - successfulExecutions,
          successRate: totalExecutions > 0 ? Math.round((successfulExecutions / totalExecutions) * 100) : 0
        }
      });
    }

    // POST /api/escalation/rules - Create escalation rule
    if (request.method === 'POST' && action === 'rules') {
      const ruleData = request.body;
      const { data: rule, error } = await supabase
        .from('escalation_rules')
        .insert([{
          ...ruleData,
          created_by: user.id,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return response.status(201).json(rule);
    }

    // PATCH /api/escalation/rules/:id - Toggle escalation rule
    if (request.method === 'PATCH' && action === 'rules' && id) {
      const { is_active } = request.body;
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
      return response.json(rule);
    }

    // DELETE /api/escalation/rules/:id - Delete escalation rule
    if (request.method === 'DELETE' && action === 'rules' && id) {
      const { error } = await supabase
        .from('escalation_rules')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return response.json({ success: true, message: 'Rule deleted' });
    }

    return response.status(404).json({ error: 'Endpoint not found' });

  } catch (error: any) {
    console.error('Escalation API error:', error);
    return response.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}
