import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { getUserInfo, validateResourceAccess } from '../../middleware/accessControl';
import { logSuccessfulAccess, logUnauthorizedAttempt } from '../../utils/auditLog';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

console.log('🔧 Supabase config check:', {
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseKey,
  urlPrefix: supabaseUrl.substring(0, 30)
});

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
}

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  
  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).json({ success: true });
  }

  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: `Method ${req.method} not allowed. Use GET method.`
    });
  }

  try {
    // Extract escalation ID from path parameter
    const escalationId = req.query.id as string;
    
    console.log(`🎯 GET /api/public/escalation/${escalationId}`);
    
    // Validate escalation ID
    if (!escalationId || escalationId === 'escalation' || escalationId.trim() === '') {
      console.error('❌ Escalation ID missing or invalid');
      return res.status(400).json({
        success: false,
        error: 'Escalation ID diperlukan dan harus valid'
      });
    }
    
    if (!supabase) {
      return res.status(500).json({
        success: false,
        error: 'Konfigurasi server tidak lengkap'
      });
    }

    // Extract user info untuk access control
    const userInfo = await getUserInfo(req, supabase);
    console.log('👤 User info:', userInfo);

    // Validate resource access
    const accessValidation = await validateResourceAccess(
      supabase,
      userInfo,
      'escalation',
      escalationId
    );

    if (!accessValidation.hasAccess) {
      console.warn('⚠️ Access denied for user:', userInfo?.id, 'to escalation:', escalationId);
      
      // Log unauthorized attempt
      if (userInfo) {
        await logUnauthorizedAttempt(
          supabase,
          userInfo.id,
          userInfo.role,
          'escalation',
          escalationId,
          {
            ip: req.headers['x-forwarded-for'] as string || req.headers['x-real-ip'] as string,
            userAgent: req.headers['user-agent'] as string
          }
        );
      }
      
      return res.status(403).json({
        success: false,
        error: 'Anda tidak memiliki akses ke eskalasi ini',
        code: 'FORBIDDEN_CROSS_UNIT_ACCESS',
        details: accessValidation.error
      });
    }

    // Fetch escalation dengan relasi
    const { data: escalation, error } = await supabase
      .from('ticket_escalations')
      .select(`
        *,
        tickets!ticket_escalations_ticket_id_fkey(id, ticket_number, title, status, description),
        from_units:from_unit_id(id, name, code),
        to_units:to_unit_id(id, name, code),
        escalated_by_user:escalated_by(id, full_name, email),
        resolved_by_user:resolved_by(id, full_name, email)
      `)
      .eq('id', escalationId)
      .single();

    if (error) {
      console.error('❌ Error fetching escalation:', error);
      
      // Check if escalation not found
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Eskalasi tidak ditemukan'
        });
      }
      
      return res.status(500).json({
        success: false,
        error: 'Gagal mengambil data eskalasi',
        details: error.message
      });
    }

    console.log(`✅ Successfully fetched escalation for ticket: ${escalation.tickets?.ticket_number}`);

    // Log successful access (non-blocking)
    if (userInfo) {
      (async () => {
        try {
          await logSuccessfulAccess(
            supabase,
            userInfo.id,
            userInfo.role,
            'view',
            'escalation',
            escalationId,
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
      data: escalation,
      message: 'Eskalasi berhasil diambil'
    });

  } catch (error: any) {
    console.error('❌ Error in escalation detail handler:', error);
    return res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan server',
      details: error.message
    });
  }
}
