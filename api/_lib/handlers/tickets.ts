import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { getUserInfo, hasGlobalAccess } from '../middleware/accessControl';
import { logSuccessfulAccess } from '../utils/auditLog';

// Initialize Supabase client - coba berbagai environment variable
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

console.log('🔧 Supabase config check:', {
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseKey,
  urlPrefix: supabaseUrl.substring(0, 30),
  env: Object.keys(process.env).filter(k => k.includes('SUPABASE'))
});

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  console.error('Available env vars:', Object.keys(process.env).filter(k => k.includes('SUPABASE')));
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
    console.log('🎯 GET /api/public/tickets');
    
    if (!supabase) {
      return res.status(500).json({
        success: false,
        error: 'Konfigurasi server tidak lengkap'
      });
    }

    // Extract user info untuk access control
    const userInfo = await getUserInfo(req, supabase);
    console.log('👤 User info:', userInfo);

    // Get query parameters for filtering
    const {
      status,
      priority,
      unit_id,
      category_id,
      type,
      date_from,
      date_to,
      search,
      limit = '100'
    } = req.query;

    console.log('📥 Query params:', { status, priority, unit_id, type, limit });

    // Untuk user dengan unit tertentu (bukan global access), ambil tiket yang relevan
    let tickets: any[] = [];
    
    if (userInfo && !hasGlobalAccess(userInfo.role) && userInfo.unit_id) {
      console.log('🔒 Fetching tickets for unit:', userInfo.unit_id);
      
      // 1. Ambil tiket yang unit_id = userUnitId
      let directQuery = supabase
        .from('tickets')
        .select(`
          *,
          units!tickets_unit_id_fkey(id, name, code),
          service_categories!tickets_category_id_fkey(id, name)
        `)
        .eq('unit_id', userInfo.unit_id)
        .order('created_at', { ascending: false });

      const { data: directTickets, error: directError } = await directQuery;
      
      if (directError) {
        console.error('❌ Error fetching direct tickets:', directError);
        return res.status(500).json({
          success: false,
          error: 'Gagal mengambil data tiket',
          details: directError.message
        });
      }

      console.log(`✅ Found ${directTickets?.length || 0} direct tickets`);

      // 2. Ambil tiket yang dieskalasi ke unit ini (sebagai penerima)
      const { data: escalationsReceived, error: escalationReceivedError } = await supabase
        .from('ticket_escalations')
        .select('ticket_id, from_unit_id, created_at')
        .eq('to_unit_id', userInfo.unit_id);

      if (escalationReceivedError) {
        console.error('❌ Error fetching received escalations:', escalationReceivedError);
      }

      // 3. Ambil tiket yang dieskalasi dari unit ini (sebagai pengirim)
      const { data: escalationsSent, error: escalationSentError } = await supabase
        .from('ticket_escalations')
        .select('ticket_id, to_unit_id, created_at')
        .eq('from_unit_id', userInfo.unit_id);

      if (escalationSentError) {
        console.error('❌ Error fetching sent escalations:', escalationSentError);
      }

      // Gabungkan semua escalations
      const allEscalations = [
        ...(escalationsReceived || []).map(e => ({ ...e, type: 'received' })),
        ...(escalationsSent || []).map(e => ({ ...e, type: 'sent' }))
      ];

      const escalatedTicketIds = Array.from(new Set(allEscalations.map(e => e.ticket_id)));
      console.log(`✅ Found escalations - received: ${escalationsReceived?.length || 0}, sent: ${escalationsSent?.length || 0}, total unique: ${escalatedTicketIds.length}`);

      // 3. Ambil detail tiket yang dieskalasi
      let escalatedTickets: any[] = [];
      if (escalatedTicketIds.length > 0) {
        const { data: escTickets, error: escError } = await supabase
          .from('tickets')
          .select(`
            *,
            units!tickets_unit_id_fkey(id, name, code),
            service_categories!tickets_category_id_fkey(id, name)
          `)
          .in('id', escalatedTicketIds)
          .order('created_at', { ascending: false });

        if (escError) {
          console.error('❌ Error fetching escalated ticket details:', escError);
        } else {
          escalatedTickets = escTickets || [];
        }
      }

      // 4. Gabungkan dan deduplikasi
      const allTickets = [...(directTickets || []), ...escalatedTickets];
      const uniqueTicketsMap = new Map(allTickets.map(t => [t.id, t]));
      tickets = Array.from(uniqueTicketsMap.values());

      // 5. Tambahkan escalation info
      const escalationMap = new Map(
        allEscalations.map(e => {
          const info: any = {
            escalation_date: e.created_at,
            type: e.type
          };
          
          // Add from_unit_id or to_unit_id based on what exists
          if ('from_unit_id' in e && e.from_unit_id) {
            info.from_unit_id = e.from_unit_id;
          }
          if ('to_unit_id' in e && e.to_unit_id) {
            info.to_unit_id = e.to_unit_id;
          }
          
          return [e.ticket_id, info];
        })
      );

      tickets = tickets.map(ticket => {
        const escalationInfo = escalationMap.get(ticket.id);
        if (escalationInfo) {
          return {
            ...ticket,
            is_escalated: true,
            escalation_date: escalationInfo.escalation_date,
            escalation_type: escalationInfo.type
          };
        }
        return {
          ...ticket,
          is_escalated: false
        };
      });

      console.log(`🔄 After deduplication: ${tickets.length} unique tickets`);
    } else {
      // Untuk admin/superadmin - ambil semua atau filter by unit
      console.log('🌐 Global access mode - fetching all tickets');
      
      let query = supabase
        .from('tickets')
        .select(`
          *,
          units!tickets_unit_id_fkey(id, name, code),
          service_categories!tickets_category_id_fkey(id, name)
        `)
        .order('created_at', { ascending: false });

      // Apply unit filter jika ada di query params (untuk superadmin yang pilih unit tertentu)
      if (unit_id) {
        query = query.eq('unit_id', unit_id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Error fetching tickets:', error);
        return res.status(500).json({
          success: false,
          error: 'Gagal mengambil data tiket',
          details: error.message
        });
      }

      tickets = data || [];
    }

    // Apply filters pada hasil
    let filteredTickets = tickets;

    if (status && status !== 'all') {
      filteredTickets = filteredTickets.filter(t => t.status === status);
    }

    if (priority && priority !== 'all') {
      filteredTickets = filteredTickets.filter(t => t.priority === priority);
    }

    if (category_id) {
      filteredTickets = filteredTickets.filter(t => t.category_id === category_id);
    }

    if (type && type !== 'all') {
      filteredTickets = filteredTickets.filter(t => t.type === type);
    }

    if (date_from) {
      filteredTickets = filteredTickets.filter(t => new Date(t.created_at) >= new Date(date_from as string));
    }

    if (date_to) {
      filteredTickets = filteredTickets.filter(t => new Date(t.created_at) <= new Date(date_to as string));
    }

    if (search) {
      const searchLower = (search as string).toLowerCase();
      filteredTickets = filteredTickets.filter(t => 
        t.ticket_number?.toLowerCase().includes(searchLower) ||
        t.title?.toLowerCase().includes(searchLower) ||
        t.description?.toLowerCase().includes(searchLower)
      );
    }

    // Apply limit
    const limitNum = parseInt(limit as string) || 100;
    filteredTickets = filteredTickets.slice(0, limitNum);

    console.log(`✅ Returning ${filteredTickets.length} tickets after filters`);

    // Log successful access (non-blocking)
    if (userInfo && filteredTickets && filteredTickets.length > 0) {
      (async () => {
        try {
          await logSuccessfulAccess(
            supabase,
            userInfo.id,
            userInfo.role,
            'view',
            'ticket',
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
      data: filteredTickets || [],
      message: 'Tickets berhasil diambil'
    });

  } catch (error: any) {
    console.error('❌ Error in tickets handler:', error);
    return res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan server',
      details: error.message
    });
  }
}
