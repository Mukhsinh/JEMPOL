import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { getUserInfo, validateResourceAccess } from '../../middleware/accessControl';
import { logSuccessfulAccess, logUnauthorizedAttempt } from '../../utils/auditLog';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

console.log('🔧 Supabase config check (ticket detail handler):', {
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
    console.log('🎯 GET /api/public/tickets/[id]');
    
    if (!supabase) {
      return res.status(500).json({
        success: false,
        error: 'Konfigurasi server tidak lengkap'
      });
    }

    // Extract ticket ID from URL
    const ticketId = req.query.id as string;
    
    if (!ticketId) {
      return res.status(400).json({
        success: false,
        error: 'Ticket ID is required'
      });
    }

    console.log('📥 Fetching ticket:', ticketId);

    // Extract user info untuk access control
    const userInfo = await getUserInfo(req, supabase);
    console.log('👤 User info:', userInfo);

    // Fetch ticket details
    const { data: ticket, error: fetchError } = await supabase
      .from('tickets')
      .select(`
        *,
        units!tickets_unit_id_fkey(id, name, code, contact_email, contact_phone),
        service_categories!tickets_category_id_fkey(id, name, description),
        patient_types!tickets_patient_type_id_fkey(id, name),
        ticket_responses(
          id,
          message,
          is_internal,
          response_type,
          created_at,
          updated_at,
          responder:responder_id(id, full_name, role)
        ),
        ticket_attachments(
          id,
          file_name,
          file_path,
          file_size,
          mime_type,
          created_at
        )
      `)
      .eq('id', ticketId)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        // Not found
        console.log('❌ Ticket not found:', ticketId);
        return res.status(404).json({
          success: false,
          error: 'Tiket tidak ditemukan'
        });
      }
      
      console.error('❌ Error fetching ticket:', fetchError);
      return res.status(500).json({
        success: false,
        error: 'Gagal mengambil data tiket',
        details: fetchError.message
      });
    }

    // Validate access untuk regular user
    if (userInfo) {
      const accessValidation = await validateResourceAccess(
        supabase,
        userInfo,
        'ticket',
        ticketId
      );

      if (!accessValidation.hasAccess) {
        console.warn('🚫 Access denied:', {
          userId: userInfo.id,
          userRole: userInfo.role,
          userUnit: userInfo.unit_id,
          ticketUnit: ticket.unit_id,
          reason: accessValidation.error
        });

        // Log unauthorized attempt
        await logUnauthorizedAttempt(
          supabase,
          userInfo.id,
          userInfo.role,
          'ticket',
          ticketId,
          {
            ip: req.headers['x-forwarded-for'] as string || req.headers['x-real-ip'] as string,
            userAgent: req.headers['user-agent'] as string
          }
        );

        return res.status(403).json({
          success: false,
          error: 'Anda tidak memiliki akses ke tiket ini',
          message: 'Tiket ini berada di unit kerja lain',
          code: 'ACCESS_DENIED'
        });
      }

      // Log successful access
      await logSuccessfulAccess(
        supabase,
        userInfo.id,
        userInfo.role,
        'view',
        'ticket',
        ticketId,
        ticket.unit_id,
        {
          ip: req.headers['x-forwarded-for'] as string || req.headers['x-real-ip'] as string,
          userAgent: req.headers['user-agent'] as string
        }
      );
    }

    console.log(`✅ Ticket fetched successfully: ${ticket.ticket_number}`);

    return res.status(200).json({
      success: true,
      data: ticket,
      message: 'Ticket berhasil diambil'
    });

  } catch (error: any) {
    console.error('❌ Error in ticket detail handler:', error);
    return res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan server',
      details: error.message
    });
  }
}
