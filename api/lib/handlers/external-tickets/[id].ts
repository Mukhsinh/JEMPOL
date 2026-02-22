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
    // Extract ticket ID from path parameter
    const ticketId = req.query.id as string;
    
    console.log(`🎯 GET /api/public/external-tickets/${ticketId}`);
    
    // Validate ticket ID
    if (!ticketId || ticketId === 'external-tickets' || ticketId.trim() === '') {
      console.error('❌ External ticket ID missing or invalid');
      return res.status(400).json({
        success: false,
        error: 'External ticket ID diperlukan dan harus valid'
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
      'external_ticket',
      ticketId
    );

    if (!accessValidation.hasAccess) {
      console.warn('⚠️ Access denied for user:', userInfo?.id, 'to external ticket:', ticketId);
      
      // Log unauthorized attempt
      if (userInfo) {
        await logUnauthorizedAttempt(
          supabase,
          userInfo.id,
          userInfo.role,
          'external_ticket',
          ticketId,
          {
            ip: req.headers['x-forwarded-for'] as string || req.headers['x-real-ip'] as string,
            userAgent: req.headers['user-agent'] as string
          }
        );
      }
      
      return res.status(403).json({
        success: false,
        error: 'Anda tidak memiliki akses ke data unit ini',
        code: 'FORBIDDEN_CROSS_UNIT_ACCESS',
        details: accessValidation.error
      });
    }

    // Fetch external ticket dengan relasi
    const { data: ticket, error } = await supabase
      .from('tickets')
      .select(`
        *,
        units!tickets_unit_id_fkey(id, name, code),
        service_categories!tickets_category_id_fkey(id, name),
        patient_types!tickets_patient_type_id_fkey(id, name),
        qr_codes!tickets_qr_code_id_fkey(id, token, location)
      `)
      .eq('id', ticketId)
      .single();

    if (error) {
      console.error('❌ Error fetching external ticket:', error);
      
      // Check if ticket not found
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Tiket eksternal tidak ditemukan'
        });
      }
      
      return res.status(500).json({
        success: false,
        error: 'Gagal mengambil data tiket eksternal',
        details: error.message
      });
    }

    console.log(`✅ Successfully fetched external ticket: ${ticket.ticket_number}`);

    // Log successful access (non-blocking)
    if (userInfo) {
      (async () => {
        try {
          await logSuccessfulAccess(
            supabase,
            userInfo.id,
            userInfo.role,
            'view',
            'external_ticket',
            ticketId,
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
      data: ticket,
      message: 'Tiket eksternal berhasil diambil'
    });

  } catch (error: any) {
    console.error('❌ Error in external ticket detail handler:', error);
    return res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan server',
      details: error.message
    });
  }
}
