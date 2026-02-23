import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { getUserInfo, validateResourceAccess } from '../middleware/accessControl';

// Main handler function - explicitly typed for Vercel
export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void | VercelResponse> {
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
    
    // Remove /api prefix if exists
    if (path.startsWith('/api')) {
      path = path.substring(4);
    }
    
    // Remove /public/ticket-actions prefix if exists
    if (path.startsWith('/public/ticket-actions')) {
      path = path.substring(22); // Remove '/public/ticket-actions'
    } else if (path.startsWith('/public')) {
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

    // Route: POST /tickets/{id}/respond
    const respondMatch = path.match(/^\/tickets\/([a-f0-9-]{36})\/respond$/i);
    if (respondMatch && req.method === 'POST') {
      const ticketId = respondMatch[1];
      return handleRespondTicket(req, res, supabase, ticketId, userInfo);
    }

    // Route: POST /tickets/{id}/escalate
    const escalateMatch = path.match(/^\/tickets\/([a-f0-9-]{36})\/escalate$/i);
    if (escalateMatch && req.method === 'POST') {
      const ticketId = escalateMatch[1];
      return handleEscalateTicket(req, res, supabase, ticketId, userInfo);
    }

    // Route: POST /tickets/{id}/flag
    const flagMatch = path.match(/^\/tickets\/([a-f0-9-]{36})\/flag$/i);
    if (flagMatch && req.method === 'POST') {
      const ticketId = flagMatch[1];
      return handleFlagTicket(req, res, supabase, ticketId, userInfo);
    }

    // Route: GET /tickets/by-unit/{unitId}
    const byUnitMatch = path.match(/^\/tickets\/by-unit\/([a-f0-9-]{36})$/i);
    if (byUnitMatch && req.method === 'GET') {
      const unitId = byUnitMatch[1];
      return handleGetTicketsByUnit(req, res, supabase, unitId, userInfo);
    }

    // Route: GET /tickets/{id}/escalations
    const escalationsMatch = path.match(/^\/tickets\/([a-f0-9-]{36})\/escalations$/i);
    if (escalationsMatch && req.method === 'GET') {
      const ticketId = escalationsMatch[1];
      return handleGetTicketEscalations(req, res, supabase, ticketId, userInfo);
    }

    // Route: GET /tickets/{id}/escalation-units
    const escalationUnitsMatch = path.match(/^\/tickets\/([a-f0-9-]{36})\/escalation-units$/i);
    if (escalationUnitsMatch && req.method === 'GET') {
      const ticketId = escalationUnitsMatch[1];
      return handleGetEscalationUnits(req, res, supabase, ticketId, userInfo);
    }

    // Route: PATCH /escalation-units/{id}/status
    const updateStatusMatch = path.match(/^\/escalation-units\/([a-f0-9-]{36})\/status$/i);
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
  const startTime = Date.now();
  console.log('📝 [RESPOND] Starting respond ticket handler', {
    ticketId,
    userId: userInfo.id,
    userRole: userInfo.role,
    timestamp: new Date().toISOString()
  });

  try {
    // Validate request data
    const { message, resolution: _resolution, is_internal = false, mark_resolved = false } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      console.log('❌ [RESPOND] Validation failed: empty message');
      return res.status(400).json({
        success: false,
        error: 'Pesan respon harus diisi'
      });
    }

    console.log('📝 [RESPOND] Request validated', { 
      messageLength: message.length,
      is_internal, 
      mark_resolved 
    });

    // Verify ticket exists and user has access
    console.log('🔍 [RESPOND] Checking ticket existence and access');
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .select('id, unit_id, status, first_response_at, ticket_number')
      .eq('id', ticketId)
      .single();

    if (ticketError) {
      console.error('❌ [RESPOND] Database error fetching ticket:', ticketError);
      return res.status(500).json({
        success: false,
        error: 'Gagal mengambil data tiket',
        details: ticketError.message
      });
    }

    if (!ticket) {
      console.log('❌ [RESPOND] Ticket not found:', ticketId);
      return res.status(404).json({
        success: false,
        error: 'Tiket tidak ditemukan'
      });
    }

    console.log('✅ [RESPOND] Ticket found', {
      ticketNumber: ticket.ticket_number,
      unitId: ticket.unit_id,
      status: ticket.status
    });

    // Validate access using centralized function
    console.log('🔐 [RESPOND] Validating user access');
    const accessCheck = await validateResourceAccess(supabase, userInfo, 'ticket', ticketId);
    if (!accessCheck.hasAccess) {
      console.log('❌ [RESPOND] Access denied', {
        userId: userInfo.id,
        reason: accessCheck.error
      });
      return res.status(403).json({
        success: false,
        error: accessCheck.error || 'Anda tidak memiliki akses ke tiket ini'
      });
    }

    console.log('✅ [RESPOND] Access granted');

    // Get responder_id dari admins table
    // Foreign key ticket_responses.responder_id mengarah ke admins.id
    let responderId: string | null = null;
    
    console.log('🔍 [RESPOND] Step 1: Looking for admin_id from users table', {
      userId: userInfo.id
    });
    
    // Strategi 1: Ambil admin_id dari tabel users (kolom admin_id)
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('admin_id, email')
      .eq('id', userInfo.id)
      .maybeSingle();
    
    if (userError) {
      console.error('❌ [RESPOND] Database error fetching user data:', userError);
      return res.status(500).json({
        success: false,
        error: 'Gagal mengambil data user',
        details: userError.message
      });
    }
    
    if (userData?.admin_id) {
      console.log('✅ [RESPOND] Step 1 success: Found admin_id from users table', {
        adminId: userData.admin_id
      });
      responderId = userData.admin_id;
      
      // Verifikasi admin masih aktif
      console.log('🔍 [RESPOND] Verifying admin is active');
      const { data: adminCheck, error: adminCheckError } = await supabase
        .from('admins')
        .select('is_active, full_name')
        .eq('id', responderId)
        .maybeSingle();
      
      if (adminCheckError) {
        console.error('❌ [RESPOND] Database error checking admin status:', adminCheckError);
        return res.status(500).json({
          success: false,
          error: 'Gagal memverifikasi status admin',
          details: adminCheckError.message
        });
      }
      
      if (!adminCheck) {
        console.error('❌ [RESPOND] Admin record not found:', responderId);
        return res.status(403).json({
          success: false,
          error: 'Data admin tidak ditemukan'
        });
      }
      
      if (!adminCheck.is_active) {
        console.error('❌ [RESPOND] Admin is not active', {
          adminId: responderId,
          adminName: adminCheck.full_name
        });
        return res.status(403).json({
          success: false,
          error: 'Admin tidak aktif'
        });
      }
      
      console.log('✅ [RESPOND] Admin verified as active', {
        adminId: responderId,
        adminName: adminCheck.full_name
      });
    } else {
      console.log('⚠️ [RESPOND] Step 1 failed: admin_id not found in users table');
      console.log('🔍 [RESPOND] Step 2: Trying email lookup');
      
      // Strategi 2: Cari admin berdasarkan email
      let email = userData?.email || userInfo.email;
      
      if (!email) {
        console.log('⚠️ [RESPOND] Email not found in users or userInfo, trying auth.users');
        // Ambil email dari auth.users menggunakan RPC
        const { data: authEmail, error: emailError } = await supabase
          .rpc('get_auth_user_email', { user_id: userInfo.id });
        
        if (emailError) {
          console.error('❌ [RESPOND] RPC error getting email:', emailError);
        }
        
        if (authEmail) {
          email = authEmail;
          console.log('✅ [RESPOND] Got email from auth.users:', email);
        } else {
          console.error('❌ [RESPOND] Cannot find email for user', {
            userId: userInfo.id,
            error: emailError?.message
          });
          return res.status(403).json({
            success: false,
            error: 'Email user tidak ditemukan',
            details: emailError?.message
          });
        }
      } else {
        console.log('✅ [RESPOND] Email found:', email);
      }
      
      // Cari admin berdasarkan email
      console.log('🔍 [RESPOND] Searching admin by email:', email);
      const { data: adminByEmail, error: adminEmailError } = await supabase
        .from('admins')
        .select('id, email, is_active, full_name')
        .eq('email', email)
        .eq('is_active', true)
        .maybeSingle();
      
      if (adminEmailError) {
        console.error('❌ [RESPOND] Database error searching admin by email:', adminEmailError);
        return res.status(500).json({
          success: false,
          error: 'Gagal mencari data admin',
          details: adminEmailError.message
        });
      }
      
      if (adminByEmail) {
        console.log('✅ [RESPOND] Step 2 success: Found admin by email', {
          adminId: adminByEmail.id,
          adminName: adminByEmail.full_name,
          email: adminByEmail.email
        });
        responderId = adminByEmail.id;
      } else {
        console.error('❌ [RESPOND] Step 2 failed: Admin not found for email', {
          email,
          userId: userInfo.id
        });
        return res.status(403).json({
          success: false,
          error: 'User tidak ditemukan sebagai admin aktif',
          details: 'No admin found with email: ' + email
        });
      }
    }
    
    console.log('✅ [RESPOND] Admin ID resolution complete', {
      responderId,
      resolutionTime: Date.now() - startTime + 'ms'
    });

    // Insert response
    console.log('💾 [RESPOND] Inserting response to database');
    const responseData = {
      ticket_id: ticketId,
      responder_id: responderId,
      message,
      is_internal,
      response_type: mark_resolved ? 'resolution' : 'comment'
    };
    
    console.log('📤 [RESPOND] Response data:', {
      ...responseData,
      message: message.substring(0, 50) + (message.length > 50 ? '...' : '')
    });
    
    const { data: response, error: responseError } = await supabase
      .from('ticket_responses')
      .insert(responseData)
      .select()
      .single();

    if (responseError) {
      console.error('❌ [RESPOND] Database error inserting response:', {
        error: responseError,
        data: {
          ...responseData,
          message: message.substring(0, 50) + '...'
        }
      });
      return res.status(500).json({
        success: false,
        error: 'Gagal menambahkan respon',
        details: responseError.message,
        hint: responseError.hint,
        code: responseError.code
      });
    }

    console.log('✅ [RESPOND] Response inserted successfully', {
      responseId: response.id
    });

    // Update ticket status if mark_resolved
    if (mark_resolved) {
      console.log('🔄 [RESPOND] Marking ticket as resolved');
      const { error: updateError } = await supabase
        .from('tickets')
        .update({
          status: 'resolved',
          resolved_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', ticketId);

      if (updateError) {
        console.error('❌ [RESPOND] Error updating ticket status to resolved:', updateError);
        // Don't fail the request, response was already saved
      } else {
        console.log('✅ [RESPOND] Ticket marked as resolved');
      }
    } else {
      // Update first_response_at if this is the first response
      if (!ticket.first_response_at) {
        console.log('🔄 [RESPOND] Setting first_response_at timestamp');
        const { error: updateError } = await supabase
          .from('tickets')
          .update({
            first_response_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', ticketId);
        
        if (updateError) {
          console.error('❌ [RESPOND] Error updating first_response_at:', updateError);
          // Don't fail the request, response was already saved
        } else {
          console.log('✅ [RESPOND] first_response_at timestamp set');
        }
      }
    }

    const totalTime = Date.now() - startTime;
    console.log('✅ [RESPOND] Response added successfully', {
      ticketId,
      responseId: response.id,
      totalTime: totalTime + 'ms'
    });

    return res.status(200).json({
      success: true,
      data: response,
      message: 'Respon berhasil ditambahkan'
    });

  } catch (error: any) {
    const totalTime = Date.now() - startTime;
    console.error('❌ [RESPOND] Unexpected error in handleRespondTicket:', {
      error: error.message,
      stack: error.stack,
      ticketId,
      userId: userInfo.id,
      totalTime: totalTime + 'ms'
    });
    return res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan saat menambahkan respon',
      details: process.env.NODE_ENV === 'production' ? undefined : error.message
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
  const startTime = Date.now();
  console.log('🔼 [ESCALATE] Starting escalate ticket handler', {
    ticketId,
    userId: userInfo.id,
    userRole: userInfo.role,
    timestamp: new Date().toISOString()
  });

  try {
    // Validate request data
    const { to_unit_id, cc_unit_ids = [], reason, notes, priority } = req.body;

    if (!to_unit_id || typeof to_unit_id !== 'string') {
      console.log('❌ [ESCALATE] Validation failed: invalid to_unit_id');
      return res.status(400).json({
        success: false,
        error: 'Unit tujuan harus diisi'
      });
    }

    if (!reason || typeof reason !== 'string' || reason.trim().length === 0) {
      console.log('❌ [ESCALATE] Validation failed: empty reason');
      return res.status(400).json({
        success: false,
        error: 'Alasan eskalasi harus diisi'
      });
    }

    console.log('🔼 [ESCALATE] Request validated', {
      to_unit_id,
      cc_unit_ids: cc_unit_ids.length,
      reasonLength: reason.length,
      priority
    });

    // Verify ticket exists
    console.log('🔍 [ESCALATE] Checking ticket existence');
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .select('id, unit_id, ticket_number, title, status')
      .eq('id', ticketId)
      .single();

    if (ticketError) {
      console.error('❌ [ESCALATE] Database error fetching ticket:', ticketError);
      return res.status(500).json({
        success: false,
        error: 'Gagal mengambil data tiket',
        details: ticketError.message
      });
    }

    if (!ticket) {
      console.log('❌ [ESCALATE] Ticket not found:', ticketId);
      return res.status(404).json({
        success: false,
        error: 'Tiket tidak ditemukan'
      });
    }

    console.log('✅ [ESCALATE] Ticket found', {
      ticketNumber: ticket.ticket_number,
      title: ticket.title,
      currentUnitId: ticket.unit_id,
      currentStatus: ticket.status
    });

    // Validate access using centralized function
    console.log('🔐 [ESCALATE] Validating user access');
    const accessCheck = await validateResourceAccess(supabase, userInfo, 'ticket', ticketId);
    if (!accessCheck.hasAccess) {
      console.log('❌ [ESCALATE] Access denied', {
        userId: userInfo.id,
        reason: accessCheck.error
      });
      return res.status(403).json({
        success: false,
        error: accessCheck.error || 'Anda tidak memiliki akses untuk eskalasi tiket ini'
      });
    }

    console.log('✅ [ESCALATE] Access granted');

    // Get from_user_id dari admins table
    // Foreign key ticket_escalations.from_user_id mengarah ke admins.id
    let fromUserId: string | null = null;
    
    console.log('🔍 [ESCALATE] Step 1: Looking for admin_id from users table', {
      userId: userInfo.id
    });
    
    // Strategi 1: Ambil admin_id dari tabel users (kolom admin_id)
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('admin_id, email')
      .eq('id', userInfo.id)
      .maybeSingle();
    
    if (userError) {
      console.error('❌ [ESCALATE] Database error fetching user data:', userError);
      return res.status(500).json({
        success: false,
        error: 'Gagal mengambil data user',
        details: userError.message
      });
    }
    
    if (userData?.admin_id) {
      console.log('✅ [ESCALATE] Step 1 success: Found admin_id from users table', {
        adminId: userData.admin_id
      });
      fromUserId = userData.admin_id;
      
      // Verifikasi admin masih aktif
      console.log('🔍 [ESCALATE] Verifying admin is active');
      const { data: adminCheck, error: adminCheckError } = await supabase
        .from('admins')
        .select('is_active, full_name')
        .eq('id', fromUserId)
        .maybeSingle();
      
      if (adminCheckError) {
        console.error('❌ [ESCALATE] Database error checking admin status:', adminCheckError);
        return res.status(500).json({
          success: false,
          error: 'Gagal memverifikasi status admin',
          details: adminCheckError.message
        });
      }
      
      if (!adminCheck) {
        console.error('❌ [ESCALATE] Admin record not found:', fromUserId);
        return res.status(403).json({
          success: false,
          error: 'Data admin tidak ditemukan'
        });
      }
      
      if (!adminCheck.is_active) {
        console.error('❌ [ESCALATE] Admin is not active', {
          adminId: fromUserId,
          adminName: adminCheck.full_name
        });
        return res.status(403).json({
          success: false,
          error: 'Admin tidak aktif'
        });
      }
      
      console.log('✅ [ESCALATE] Admin verified as active', {
        adminId: fromUserId,
        adminName: adminCheck.full_name
      });
    } else {
      console.log('⚠️ [ESCALATE] Step 1 failed: admin_id not found in users table');
      console.log('🔍 [ESCALATE] Step 2: Trying email lookup');
      
      // Strategi 2: Cari admin berdasarkan email
      let email = userData?.email || userInfo.email;
      
      if (!email) {
        console.log('⚠️ [ESCALATE] Email not found in users or userInfo, trying auth.users');
        // Ambil email dari auth.users menggunakan RPC
        const { data: authEmail, error: emailError } = await supabase
          .rpc('get_auth_user_email', { user_id: userInfo.id });
        
        if (emailError) {
          console.error('❌ [ESCALATE] RPC error getting email:', emailError);
        }
        
        if (authEmail) {
          email = authEmail;
          console.log('✅ [ESCALATE] Got email from auth.users:', email);
        } else {
          console.error('❌ [ESCALATE] Cannot find email for user', {
            userId: userInfo.id,
            error: emailError?.message
          });
          return res.status(403).json({
            success: false,
            error: 'Email user tidak ditemukan',
            details: emailError?.message
          });
        }
      } else {
        console.log('✅ [ESCALATE] Email found:', email);
      }
      
      // Cari admin berdasarkan email
      console.log('🔍 [ESCALATE] Searching admin by email:', email);
      const { data: adminByEmail, error: adminEmailError } = await supabase
        .from('admins')
        .select('id, email, is_active, full_name')
        .eq('email', email)
        .eq('is_active', true)
        .maybeSingle();
      
      if (adminEmailError) {
        console.error('❌ [ESCALATE] Database error searching admin by email:', adminEmailError);
        return res.status(500).json({
          success: false,
          error: 'Gagal mencari data admin',
          details: adminEmailError.message
        });
      }
      
      if (adminByEmail) {
        console.log('✅ [ESCALATE] Step 2 success: Found admin by email', {
          adminId: adminByEmail.id,
          adminName: adminByEmail.full_name,
          email: adminByEmail.email
        });
        fromUserId = adminByEmail.id;
      } else {
        console.error('❌ [ESCALATE] Step 2 failed: Admin not found for email', {
          email,
          userId: userInfo.id
        });
        return res.status(403).json({
          success: false,
          error: 'User tidak ditemukan sebagai admin aktif',
          details: 'No admin found with email: ' + email
        });
      }
    }
    
    console.log('✅ [ESCALATE] Admin ID resolution complete', {
      fromUserId,
      resolutionTime: Date.now() - startTime + 'ms'
    });

    // Prepare escalation data
    const escalationData: any = {
      ticket_id: ticketId,
      to_unit_id,
      from_user_id: fromUserId,
      from_role: userInfo.role || 'user',
      to_role: 'admin',
      reason,
      escalation_type: 'manual'
    };

    // Add optional fields only if they have values
    if (notes) {
      escalationData.notes = notes;
    }
    if (cc_unit_ids && cc_unit_ids.length > 0) {
      escalationData.cc_unit_ids = cc_unit_ids;
    }

    console.log('📤 [ESCALATE] Inserting escalation data:', {
      ...escalationData,
      reason: reason.substring(0, 50) + (reason.length > 50 ? '...' : '')
    });

    // Insert escalation record
    const { data: escalation, error: escalationError } = await supabase
      .from('ticket_escalations')
      .insert(escalationData)
      .select()
      .single();

    if (escalationError) {
      console.error('❌ [ESCALATE] Database error creating escalation:', {
        error: escalationError,
        data: escalationData
      });
      return res.status(500).json({
        success: false,
        error: 'Gagal melakukan eskalasi',
        details: escalationError.message,
        hint: escalationError.hint,
        code: escalationError.code
      });
    }

    console.log('✅ [ESCALATE] Escalation record created', {
      escalationId: escalation.id
    });

    // Create primary escalation unit entry
    console.log('💾 [ESCALATE] Creating primary escalation unit entry');
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
      console.error('❌ [ESCALATE] Error creating primary escalation unit:', primaryUnitError);
      // Don't fail the request, escalation was already created
    } else {
      console.log('✅ [ESCALATE] Primary escalation unit entry created');
    }

    // Create CC escalation unit entries if provided
    if (cc_unit_ids && cc_unit_ids.length > 0) {
      console.log('💾 [ESCALATE] Creating CC escalation unit entries', {
        count: cc_unit_ids.length
      });
      
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
        console.error('❌ [ESCALATE] Error creating CC escalation units:', ccUnitsError);
        // Don't fail the request, escalation was already created
      } else {
        console.log('✅ [ESCALATE] CC escalation unit entries created', {
          count: cc_unit_ids.length
        });
      }
    }

    // Create notification for target unit (unit penerima eskalasi)
    console.log('🔔 [ESCALATE] Creating notifications for target unit');
    const { data: targetUnit } = await supabase
      .from('units')
      .select('name')
      .eq('id', to_unit_id)
      .single();

    if (targetUnit) {
      console.log('✅ [ESCALATE] Target unit found:', targetUnit.name);
      
      // Get admins in target unit to notify (unit penerima)
      const { data: targetAdmins, error: adminsError } = await supabase
        .from('admins')
        .select('id, full_name')
        .eq('unit_id', to_unit_id)
        .eq('is_active', true);

      if (adminsError) {
        console.error('❌ [ESCALATE] Error fetching target unit admins:', adminsError);
      } else if (targetAdmins && targetAdmins.length > 0) {
        console.log('✅ [ESCALATE] Found target unit admins', {
          count: targetAdmins.length
        });
        
        const notifications = targetAdmins.map((admin: any) => ({
          user_id: admin.id,
          unit_id: to_unit_id,
          ticket_id: ticketId,
          escalation_id: escalation.id,
          type: 'escalation',
          title: 'Tiket Eskalasi Masuk',
          message: `Tiket ${ticket.ticket_number} - ${ticket.title} telah dieskalasi ke unit Anda. Alasan: ${reason}`,
          is_read: false,
          channels: ['in_app']
        }));

        const { error: notifError } = await supabase.from('notifications').insert(notifications);
        if (notifError) {
          console.error('❌ [ESCALATE] Error creating notifications:', notifError);
        } else {
          console.log('✅ [ESCALATE] Notifications created', {
            count: notifications.length
          });
        }
      } else {
        console.log('⚠️ [ESCALATE] No active admins found in target unit');
      }
    } else {
      console.log('⚠️ [ESCALATE] Target unit not found:', to_unit_id);
    }

    // Update ticket status to 'escalated' and priority if specified
    console.log('🔄 [ESCALATE] Updating ticket status');
    const ticketUpdate: any = {
      status: 'escalated',
      is_escalated: true,
      updated_at: new Date().toISOString()
    };
    
    if (priority) {
      ticketUpdate.priority = priority;
      console.log('🔄 [ESCALATE] Updating priority to:', priority);
    }
    
    const { error: ticketUpdateError } = await supabase
      .from('tickets')
      .update(ticketUpdate)
      .eq('id', ticketId);
    
    if (ticketUpdateError) {
      console.error('❌ [ESCALATE] Error updating ticket status:', ticketUpdateError);
      // Don't fail the request, escalation was already created
    } else {
      console.log('✅ [ESCALATE] Ticket status updated to escalated');
    }

    const totalTime = Date.now() - startTime;
    console.log('✅ [ESCALATE] Ticket escalated successfully', {
      ticketId,
      escalationId: escalation.id,
      toUnitId: to_unit_id,
      totalTime: totalTime + 'ms'
    });

    return res.status(200).json({
      success: true,
      data: escalation,
      message: 'Tiket berhasil dieskalasi'
    });

  } catch (error: any) {
    const totalTime = Date.now() - startTime;
    console.error('❌ [ESCALATE] Unexpected error in handleEscalateTicket:', {
      error: error.message,
      stack: error.stack,
      ticketId,
      userId: userInfo.id,
      totalTime: totalTime + 'ms'
    });
    return res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan saat eskalasi tiket',
      details: process.env.NODE_ENV === 'production' ? undefined : error.message
    });
  }
}

// Handler untuk flag ticket
async function handleFlagTicket(
  req: VercelRequest,
  res: VercelResponse,
  supabase: any,
  ticketId: string,
  _userInfo: any
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
  _userInfo: any
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
  _req: VercelRequest,
  res: VercelResponse,
  supabase: any,
  ticketId: string,
  _userInfo: any
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
  _req: VercelRequest,
  res: VercelResponse,
  supabase: any,
  ticketId: string,
  _userInfo: any
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
  _userInfo: any
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
