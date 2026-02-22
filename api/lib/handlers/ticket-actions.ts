import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { getUserInfo, hasGlobalAccess, validateResourceAccess } from '../middleware/accessControl';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Use service role key for backend operations (bypasses RLS)
// We do manual access control via validateResourceAccess
const supabase = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : (supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null);

// Log untuk debugging
if (supabase) {
  console.log('✅ Supabase client initialized with', supabaseServiceKey ? 'SERVICE ROLE KEY' : 'ANON KEY');
} else {
  console.error('❌ Supabase client NOT initialized - missing credentials');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  
  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).json({ success: true });
  }

  try {
    if (!supabase) {
      return res.status(500).json({
        success: false,
        error: 'Konfigurasi server tidak lengkap'
      });
    }

    // Parse URL path
    let path = req.url?.split('?')[0] || '';
    if (path.startsWith('/api')) {
      path = path.substring(4);
    }
    if (path.startsWith('/public')) {
      path = path.substring(7);
    }

    console.log('🎯 Ticket Actions Handler:', req.method, path, 'original:', req.url);

    // Extract dan enrich user info dari database
    // Note: We use service role supabase client for all DB operations
    // Access control is done manually via validateResourceAccess
    const userInfo = await getUserInfo(req, supabase);
    if (!userInfo) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized - User info tidak ditemukan'
      });
    }

    console.log('👤 User Info:', { id: userInfo.id, role: userInfo.role, unit_id: userInfo.unit_id });

    // Route: POST /ticket-actions/tickets/{id}/respond
    const respondMatch = path.match(/^\/ticket-actions\/tickets\/([a-f0-9-]{36})\/respond$/i);
    if (respondMatch && req.method === 'POST') {
      const ticketId = respondMatch[1];
      return handleRespondTicket(req, res, supabase, ticketId, userInfo);
    }

    // Route: POST /ticket-actions/tickets/{id}/escalate
    const escalateMatch = path.match(/^\/ticket-actions\/tickets\/([a-f0-9-]{36})\/escalate$/i);
    if (escalateMatch && req.method === 'POST') {
      const ticketId = escalateMatch[1];
      return handleEscalateTicket(req, res, supabase, ticketId, userInfo);
    }

    // Route: POST /ticket-actions/tickets/{id}/flag
    const flagMatch = path.match(/^\/ticket-actions\/tickets\/([a-f0-9-]{36})\/flag$/i);
    if (flagMatch && req.method === 'POST') {
      const ticketId = flagMatch[1];
      return handleFlagTicket(req, res, supabase, ticketId, userInfo);
    }

    // Route: GET /ticket-actions/tickets/by-unit/{unitId}
    const byUnitMatch = path.match(/^\/ticket-actions\/tickets\/by-unit\/([a-f0-9-]{36})$/i);
    if (byUnitMatch && req.method === 'GET') {
      const unitId = byUnitMatch[1];
      return handleGetTicketsByUnit(req, res, supabase, unitId, userInfo);
    }

    // Route: GET /ticket-actions/tickets/{id}/escalations
    const escalationsMatch = path.match(/^\/ticket-actions\/tickets\/([a-f0-9-]{36})\/escalations$/i);
    if (escalationsMatch && req.method === 'GET') {
      const ticketId = escalationsMatch[1];
      return handleGetTicketEscalations(req, res, supabase, ticketId, userInfo);
    }

    // Route: GET /ticket-actions/tickets/{id}/escalation-units
    const escalationUnitsMatch = path.match(/^\/ticket-actions\/tickets\/([a-f0-9-]{36})\/escalation-units$/i);
    if (escalationUnitsMatch && req.method === 'GET') {
      const ticketId = escalationUnitsMatch[1];
      return handleGetEscalationUnits(req, res, supabase, ticketId, userInfo);
    }

    // Route: PATCH /ticket-actions/escalation-units/{id}/status
    const updateStatusMatch = path.match(/^\/ticket-actions\/escalation-units\/([a-f0-9-]{36})\/status$/i);
    if (updateStatusMatch && req.method === 'PATCH') {
      const escalationUnitId = updateStatusMatch[1];
      return handleUpdateEscalationUnitStatus(req, res, supabase, escalationUnitId, userInfo);
    }

    return res.status(404).json({
      success: false,
      error: 'API endpoint tidak ditemukan',
      path: path
    });

  } catch (error: any) {
    console.error('❌ Error in ticket-actions handler:', error);
    return res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan server',
      details: error.message
    });
  }
}

// Handler untuk respond ticket
async function handleRespondTicket(
  req: VercelRequest,
  res: VercelResponse,
  supabase: any,
  ticketId: string,
  userInfo: any
) {
  try {
    const { message, resolution, is_internal = false, mark_resolved = false } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Pesan respon harus diisi'
      });
    }

    console.log('📝 Responding to ticket:', ticketId, { is_internal, mark_resolved });

    // Verify ticket exists and user has access
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .select('id, unit_id, status, first_response_at')
      .eq('id', ticketId)
      .single();

    if (ticketError || !ticket) {
      return res.status(404).json({
        success: false,
        error: 'Tiket tidak ditemukan'
      });
    }

    // Validate access using centralized function
    const accessCheck = await validateResourceAccess(supabase, userInfo, 'ticket', ticketId);
    if (!accessCheck.hasAccess) {
      return res.status(403).json({
        success: false,
        error: accessCheck.error || 'Anda tidak memiliki akses ke tiket ini'
      });
    }

    // Get admin_id from admins table based on user ID or email
    // responder_id harus menggunakan ID dari tabel admins, bukan users
    
    // Coba langsung dengan user ID (jika user ID sama dengan admin ID)
    let adminId = userInfo.id;
    
    // Verifikasi apakah ID ini ada di tabel admins
    const { data: adminCheck, error: adminCheckError } = await supabase
      .from('admins')
      .select('id, email, unit_id, is_active')
      .eq('id', userInfo.id)
      .eq('is_active', true)
      .single();
    
    if (adminCheckError || !adminCheck) {
      // Jika tidak ada, coba cari berdasarkan email
      console.log('⚠️ Admin not found by ID, trying by email...');
      
      // Get user email from users table jika belum ada
      if (!userInfo.email) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('email')
          .eq('id', userInfo.id)
          .single();
        
        if (userError || !userData) {
          console.error('❌ Error getting user data:', userError);
          return res.status(403).json({
            success: false,
            error: 'Data user tidak ditemukan'
          });
        }
        userInfo.email = userData.email;
      }
      
      // Cari admin berdasarkan email
      const { data: adminData, error: adminError } = await supabase
        .from('admins')
        .select('id')
        .eq('email', userInfo.email)
        .eq('is_active', true)
        .single();
      
      if (adminError || !adminData) {
        console.error('❌ Error getting admin data:', adminError);
        return res.status(403).json({
          success: false,
          error: 'User tidak ditemukan sebagai admin aktif'
        });
      }
      
      adminId = adminData.id;
    }
    
    console.log('✅ Using admin_id:', adminId);

    // Insert response
    const { data: response, error: responseError } = await supabase
      .from('ticket_responses')
      .insert({
        ticket_id: ticketId,
        responder_id: adminId,
        message,
        is_internal,
        response_type: mark_resolved ? 'resolution' : 'response'
      })
      .select()
      .single();

    if (responseError) {
      console.error('❌ Error inserting response:', responseError);
      return res.status(500).json({
        success: false,
        error: 'Gagal menambahkan respon',
        details: responseError.message
      });
    }

    // Update ticket status if mark_resolved
    if (mark_resolved) {
      const { error: updateError } = await supabase
        .from('tickets')
        .update({
          status: 'resolved',
          resolved_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', ticketId);

      if (updateError) {
        console.error('❌ Error updating ticket status:', updateError);
      }
    } else {
      // Update first_response_at if this is the first response
      if (!ticket.first_response_at) {
        await supabase
          .from('tickets')
          .update({
            first_response_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', ticketId);
      }
    }

    console.log('✅ Response added successfully');

    return res.status(200).json({
      success: true,
      data: response,
      message: 'Respon berhasil ditambahkan'
    });

  } catch (error: any) {
    console.error('❌ Error in handleRespondTicket:', error);
    return res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan saat menambahkan respon',
      details: error.message
    });
  }
}

// Handler untuk escalate ticket
async function handleEscalateTicket(
  req: VercelRequest,
  res: VercelResponse,
  supabase: any,
  ticketId: string,
  userInfo: any
) {
  try {
    const { to_unit_id, cc_unit_ids = [], reason, notes, priority } = req.body;

    if (!to_unit_id || !reason) {
      return res.status(400).json({
        success: false,
        error: 'Unit tujuan dan alasan eskalasi harus diisi'
      });
    }

    console.log('🔼 Escalating ticket:', ticketId, 'to unit:', to_unit_id);

    // Verify ticket exists
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .select('id, unit_id')
      .eq('id', ticketId)
      .single();

    if (ticketError || !ticket) {
      return res.status(404).json({
        success: false,
        error: 'Tiket tidak ditemukan'
      });
    }

    // Validate access using centralized function
    const accessCheck = await validateResourceAccess(supabase, userInfo, 'ticket', ticketId);
    if (!accessCheck.hasAccess) {
      return res.status(403).json({
        success: false,
        error: accessCheck.error || 'Anda tidak memiliki akses untuk eskalasi tiket ini'
      });
    }

    // Get admin_id from admins table based on user ID or email
    let adminId = userInfo.id;
    
    // Verifikasi apakah ID ini ada di tabel admins
    const { data: adminCheck, error: adminCheckError } = await supabase
      .from('admins')
      .select('id, email, unit_id, is_active')
      .eq('id', userInfo.id)
      .eq('is_active', true)
      .single();
    
    if (adminCheckError || !adminCheck) {
      // Jika tidak ada, coba cari berdasarkan email
      console.log('⚠️ Admin not found by ID, trying by email...');
      
      // Get user email from users table jika belum ada
      if (!userInfo.email) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('email')
          .eq('id', userInfo.id)
          .single();
        
        if (userError || !userData) {
          console.error('❌ Error getting user data:', userError);
          return res.status(403).json({
            success: false,
            error: 'Data user tidak ditemukan'
          });
        }
        userInfo.email = userData.email;
      }
      
      // Cari admin berdasarkan email
      const { data: adminData, error: adminError } = await supabase
        .from('admins')
        .select('id')
        .eq('email', userInfo.email)
        .eq('is_active', true)
        .single();
      
      if (adminError || !adminData) {
        console.error('❌ Error getting admin data:', adminError);
        return res.status(403).json({
          success: false,
          error: 'User tidak ditemukan sebagai admin aktif'
        });
      }
      
      adminId = adminData.id;
    }
    
    console.log('✅ Using admin_id for escalation:', adminId);

    // Prepare escalation data
    const escalationData: any = {
      ticket_id: ticketId,
      to_unit_id,
      from_user_id: adminId,
      from_role: userInfo.role || 'user',
      to_role: 'admin',
      reason,
      escalation_type: 'manual'  // Harus 'manual', 'automatic', atau 'sla_breach'
    };

    // Add optional fields only if they have values
    if (notes) {
      escalationData.notes = notes;
    }
    if (cc_unit_ids && cc_unit_ids.length > 0) {
      escalationData.cc_unit_ids = cc_unit_ids;
    }

    console.log('📤 Inserting escalation data:', JSON.stringify(escalationData, null, 2));

    // Insert escalation record
    const { data: escalation, error: escalationError } = await supabase
      .from('ticket_escalations')
      .insert(escalationData)
      .select()
      .single();

    if (escalationError) {
      console.error('❌ Error creating escalation:', escalationError);
      console.error('❌ Escalation data that failed:', JSON.stringify(escalationData, null, 2));
      return res.status(500).json({
        success: false,
        error: 'Gagal melakukan eskalasi',
        details: escalationError.message,
        hint: escalationError.hint,
        code: escalationError.code
      });
    }

    // Create primary escalation unit entry
    const { error: primaryUnitError } = await supabase
      .from('ticket_escalation_units')
      .insert({
        ticket_id: ticketId,
        escalation_id: escalation.id,
        unit_id: to_unit_id,
        is_primary: true,
        is_cc: false,
        status: 'pending'
      });

    if (primaryUnitError) {
      console.error('❌ Error creating primary escalation unit:', primaryUnitError);
    }

    // Create CC escalation unit entries if provided
    if (cc_unit_ids && cc_unit_ids.length > 0) {
      const ccEntries = cc_unit_ids.map((unitId: string) => ({
        ticket_id: ticketId,
        escalation_id: escalation.id,
        unit_id: unitId,
        is_primary: false,
        is_cc: true,
        status: 'pending'
      }));

      const { error: ccUnitsError } = await supabase
        .from('ticket_escalation_units')
        .insert(ccEntries);

      if (ccUnitsError) {
        console.error('❌ Error creating CC escalation units:', ccUnitsError);
      }
    }

    // Create notification for target unit (unit penerima eskalasi)
    const { data: targetUnit } = await supabase
      .from('units')
      .select('name')
      .eq('id', to_unit_id)
      .single();

    const { data: ticketData } = await supabase
      .from('tickets')
      .select('ticket_number, title')
      .eq('id', ticketId)
      .single();

    if (targetUnit && ticketData) {
      // Get admins in target unit to notify (unit penerima) - PERBAIKAN: gunakan admins bukan users
      const { data: targetAdmins } = await supabase
        .from('admins')
        .select('id')
        .eq('unit_id', to_unit_id)
        .eq('is_active', true);

      if (targetAdmins && targetAdmins.length > 0) {
        const notifications = targetAdmins.map((admin: any) => ({
          user_id: admin.id,
          unit_id: to_unit_id,
          ticket_id: ticketId,
          escalation_id: escalation.id,
          type: 'escalation',
          title: 'Tiket Eskalasi Masuk',
          message: `Tiket ${ticketData.ticket_number} - ${ticketData.title} telah dieskalasi ke unit Anda. Alasan: ${reason}`,
          is_read: false,
          channels: ['in_app']
        }));

        const { error: notifError } = await supabase.from('notifications').insert(notifications);
        if (notifError) {
          console.error('❌ Error creating notifications for target unit:', notifError);
        } else {
          console.log('✅ Created', notifications.length, 'notifications for target unit');
        }
      }
    }

    // Update ticket status to 'escalated' and priority if specified
    const ticketUpdate: any = {
      status: 'escalated',
      is_escalated: true,
      updated_at: new Date().toISOString()
    };
    
    if (priority) {
      ticketUpdate.priority = priority;
    }
    
    const { error: ticketUpdateError } = await supabase
      .from('tickets')
      .update(ticketUpdate)
      .eq('id', ticketId);
    
    if (ticketUpdateError) {
      console.error('❌ Error updating ticket status:', ticketUpdateError);
    } else {
      console.log('✅ Ticket status updated to escalated');
    }

    console.log('✅ Ticket escalated successfully');

    return res.status(200).json({
      success: true,
      data: escalation,
      message: 'Tiket berhasil dieskalasi'
    });

  } catch (error: any) {
    console.error('❌ Error in handleEscalateTicket:', error);
    return res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan saat eskalasi tiket',
      details: error.message
    });
  }
}

// Handler untuk flag ticket
async function handleFlagTicket(
  req: VercelRequest,
  res: VercelResponse,
  supabase: any,
  ticketId: string,
  userInfo: any
) {
  try {
    const { is_flagged, flag_reason } = req.body;

    console.log('🚩 Flagging ticket:', ticketId, { is_flagged });

    const { error: updateError } = await supabase
      .from('tickets')
      .update({
        is_flagged,
        flag_reason: is_flagged ? flag_reason : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', ticketId);

    if (updateError) {
      console.error('❌ Error flagging ticket:', updateError);
      return res.status(500).json({
        success: false,
        error: 'Gagal mengubah status flag',
        details: updateError.message
      });
    }

    console.log('✅ Ticket flag updated');

    return res.status(200).json({
      success: true,
      message: is_flagged ? 'Tiket berhasil ditandai' : 'Tanda tiket berhasil dihapus'
    });

  } catch (error: any) {
    console.error('❌ Error in handleFlagTicket:', error);
    return res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan saat mengubah flag tiket',
      details: error.message
    });
  }
}

// Handler untuk get tickets by unit
async function handleGetTicketsByUnit(
  req: VercelRequest,
  res: VercelResponse,
  supabase: any,
  unitId: string,
  userInfo: any
) {
  try {
    const { status, priority } = req.query;

    let query = supabase
      .from('tickets')
      .select('*')
      .eq('unit_id', unitId)
      .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);
    if (priority) query = query.eq('priority', priority);

    const { data, error } = await query;

    if (error) {
      return res.status(500).json({
        success: false,
        error: 'Gagal mengambil data tiket',
        details: error.message
      });
    }

    return res.status(200).json({
      success: true,
      data: data || []
    });

  } catch (error: any) {
    console.error('❌ Error in handleGetTicketsByUnit:', error);
    return res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan',
      details: error.message
    });
  }
}

// Handler untuk get ticket escalations
async function handleGetTicketEscalations(
  req: VercelRequest,
  res: VercelResponse,
  supabase: any,
  ticketId: string,
  userInfo: any
) {
  try {
    const { data, error } = await supabase
      .from('ticket_escalations')
      .select(`
        *,
        from_user:users!ticket_escalations_from_user_id_fkey(id, full_name, email),
        to_unit:units!ticket_escalations_to_unit_id_fkey(id, name, code)
      `)
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({
        success: false,
        error: 'Gagal mengambil data eskalasi',
        details: error.message
      });
    }

    return res.status(200).json({
      success: true,
      data: data || []
    });

  } catch (error: any) {
    console.error('❌ Error in handleGetTicketEscalations:', error);
    return res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan',
      details: error.message
    });
  }
}

// Handler untuk get escalation units
async function handleGetEscalationUnits(
  req: VercelRequest,
  res: VercelResponse,
  supabase: any,
  ticketId: string,
  userInfo: any
) {
  try {
    const { data, error } = await supabase
      .from('ticket_escalation_units')
      .select(`
        *,
        units(id, name, code)
      `)
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({
        success: false,
        error: 'Gagal mengambil data unit eskalasi',
        details: error.message
      });
    }

    return res.status(200).json({
      success: true,
      data: data || []
    });

  } catch (error: any) {
    console.error('❌ Error in handleGetEscalationUnits:', error);
    return res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan',
      details: error.message
    });
  }
}

// Handler untuk update escalation unit status
async function handleUpdateEscalationUnitStatus(
  req: VercelRequest,
  res: VercelResponse,
  supabase: any,
  escalationUnitId: string,
  userInfo: any
) {
  try {
    const { status, notes } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Status harus diisi'
      });
    }

    const updateData: any = {
      status,
      notes,
      updated_at: new Date().toISOString()
    };

    if (status === 'completed') {
      updateData.completed_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('ticket_escalation_units')
      .update(updateData)
      .eq('id', escalationUnitId);

    if (error) {
      return res.status(500).json({
        success: false,
        error: 'Gagal mengupdate status',
        details: error.message
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Status berhasil diupdate'
    });

  } catch (error: any) {
    console.error('❌ Error in handleUpdateEscalationUnitStatus:', error);
    return res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan',
      details: error.message
    });
  }
}
