import express, { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { authenticateSupabase, optionalSupabaseAuth } from '../middleware/supabaseAuthMiddleware.js';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
    role: string;
    unit_id?: string;
  };
}

const router = express.Router();

// ============================================================================
// ESKALASI TIKET - Multi Unit dengan Tembusan
// ============================================================================

// Eskalasi tiket ke unit lain dengan tembusan
router.post('/tickets/:id/escalate', authenticateSupabase, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      to_unit_id,      // Unit utama tujuan eskalasi
      cc_unit_ids,     // Array unit ID untuk tembusan
      reason,          // Alasan eskalasi
      notes,           // Catatan tambahan
      priority         // Prioritas baru (opsional)
    } = req.body;

    if (!to_unit_id || !reason) {
      return res.status(400).json({
        success: false,
        error: 'Unit tujuan dan alasan eskalasi wajib diisi'
      });
    }

    // Ambil data tiket
    const { data: ticket, error: ticketError } = await supabaseAdmin
      .from('tickets')
      .select('*, units:unit_id(name, code)')
      .eq('id', id)
      .single();

    if (ticketError || !ticket) {
      return res.status(404).json({
        success: false,
        error: 'Tiket tidak ditemukan'
      });
    }

    // Ambil data unit tujuan
    const { data: toUnit, error: unitError } = await supabaseAdmin
      .from('units')
      .select('id, name, code')
      .eq('id', to_unit_id)
      .single();

    if (unitError || !toUnit) {
      return res.status(404).json({
        success: false,
        error: 'Unit tujuan tidak ditemukan'
      });
    }

    // Buat record eskalasi
    const { data: escalation, error: escalationError } = await supabaseAdmin
      .from('ticket_escalations')
      .insert({
        ticket_id: id,
        from_user_id: req.user?.id,
        to_unit_id: to_unit_id,
        cc_unit_ids: cc_unit_ids || [],
        from_role: req.user?.role || 'staff',
        to_role: 'unit_handler',
        reason: reason,
        notes: notes,
        escalation_type: 'manual',
        escalated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (escalationError) {
      console.error('Error creating escalation:', escalationError);
      return res.status(500).json({
        success: false,
        error: 'Gagal membuat eskalasi'
      });
    }

    // Simpan unit eskalasi utama
    await supabaseAdmin
      .from('ticket_escalation_units')
      .insert({
        ticket_id: id,
        escalation_id: escalation.id,
        unit_id: to_unit_id,
        is_primary: true,
        is_cc: false,
        status: 'pending'
      });

    // Simpan unit tembusan jika ada
    if (cc_unit_ids && cc_unit_ids.length > 0) {
      const ccInserts = cc_unit_ids.map((unitId: string) => ({
        ticket_id: id,
        escalation_id: escalation.id,
        unit_id: unitId,
        is_primary: false,
        is_cc: true,
        status: 'pending'
      }));

      await supabaseAdmin
        .from('ticket_escalation_units')
        .insert(ccInserts);
    }

    // Update status tiket
    const updateData: any = {
      status: 'escalated',
      escalated_to_units: [to_unit_id],
      cc_units: cc_unit_ids || [],
      updated_at: new Date().toISOString()
    };

    if (priority) {
      updateData.priority = priority;
    }

    await supabaseAdmin
      .from('tickets')
      .update(updateData)
      .eq('id', id);

    // Kirim notifikasi ke unit tujuan
    const allUnitIds = [to_unit_id, ...(cc_unit_ids || [])];
    
    // Ambil user dari unit-unit terkait
    const { data: unitUsers } = await supabaseAdmin
      .from('users')
      .select('id, unit_id')
      .in('unit_id', allUnitIds)
      .eq('is_active', true);

    if (unitUsers && unitUsers.length > 0) {
      const notifications = unitUsers.map(user => ({
        user_id: user.id,
        ticket_id: id,
        type: 'ticket_escalated',
        title: 'Tiket Dieskalasi',
        message: `Tiket ${ticket.ticket_number} telah dieskalasi ke unit Anda. Alasan: ${reason}`,
        channels: ['web']
      }));

      await supabaseAdmin
        .from('notifications')
        .insert(notifications);
    }

    // Tambah response log
    await supabaseAdmin
      .from('ticket_responses')
      .insert({
        ticket_id: id,
        responder_id: req.user?.id,
        message: `Tiket dieskalasi ke ${toUnit.name}${cc_unit_ids?.length > 0 ? ` dengan tembusan ke ${cc_unit_ids.length} unit lain` : ''}. Alasan: ${reason}`,
        is_internal: true,
        response_type: 'escalation'
      });

    res.json({
      success: true,
      data: escalation,
      message: 'Tiket berhasil dieskalasi'
    });

  } catch (error: any) {
    console.error('Error in escalate ticket:', error);
    res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan server: ' + error.message
    });
  }
});

// ============================================================================
// RESPON TIKET - Langsung selesaikan
// ============================================================================

// Respon dan selesaikan tiket langsung
router.post('/tickets/:id/respond', authenticateSupabase, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      message,           // Pesan respon
      resolution,        // Resolusi/solusi
      is_internal,       // Apakah internal note
      mark_resolved      // Tandai sebagai selesai
    } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Pesan respon wajib diisi'
      });
    }

    // Ambil data tiket
    const { data: ticket, error: ticketError } = await supabaseAdmin
      .from('tickets')
      .select('*')
      .eq('id', id)
      .single();

    if (ticketError || !ticket) {
      return res.status(404).json({
        success: false,
        error: 'Tiket tidak ditemukan'
      });
    }

    // Buat response
    const { data: response, error: responseError } = await supabaseAdmin
      .from('ticket_responses')
      .insert({
        ticket_id: id,
        responder_id: req.user?.id,
        message: message,
        is_internal: is_internal || false,
        response_type: mark_resolved ? 'resolution' : 'comment'
      })
      .select()
      .single();

    if (responseError) {
      console.error('Error creating response:', responseError);
      return res.status(500).json({
        success: false,
        error: 'Gagal menambahkan respon'
      });
    }

    // Update tiket jika mark_resolved
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    // Set first_response_at jika belum ada
    if (!ticket.first_response_at) {
      updateData.first_response_at = new Date().toISOString();
    }

    if (mark_resolved) {
      updateData.status = 'resolved';
      updateData.resolved_at = new Date().toISOString();
    } else if (ticket.status === 'open') {
      updateData.status = 'in_progress';
    }

    await supabaseAdmin
      .from('tickets')
      .update(updateData)
      .eq('id', id);

    // Kirim notifikasi jika tiket diselesaikan
    if (mark_resolved && ticket.created_by) {
      await supabaseAdmin
        .from('notifications')
        .insert({
          user_id: ticket.created_by,
          ticket_id: id,
          type: 'ticket_resolved',
          title: 'Tiket Diselesaikan',
          message: `Tiket ${ticket.ticket_number} telah diselesaikan.`,
          channels: ['web']
        });
    }

    res.json({
      success: true,
      data: response,
      message: mark_resolved ? 'Tiket berhasil diselesaikan' : 'Respon berhasil ditambahkan'
    });

  } catch (error: any) {
    console.error('Error in respond ticket:', error);
    res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan server: ' + error.message
    });
  }
});

// ============================================================================
// FLAG TIKET
// ============================================================================

// Flag/unflag tiket
router.post('/tickets/:id/flag', authenticateSupabase, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { is_flagged, flag_reason } = req.body;

    const updateData: any = {
      is_flagged: is_flagged,
      updated_at: new Date().toISOString()
    };

    if (is_flagged) {
      updateData.flag_reason = flag_reason || 'Ditandai untuk perhatian khusus';
      updateData.flagged_at = new Date().toISOString();
      updateData.flagged_by = req.user?.id;
    } else {
      updateData.flag_reason = null;
      updateData.flagged_at = null;
      updateData.flagged_by = null;
    }

    const { data: ticket, error } = await supabaseAdmin
      .from('tickets')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error flagging ticket:', error);
      return res.status(500).json({
        success: false,
        error: 'Gagal mengubah status flag tiket'
      });
    }

    res.json({
      success: true,
      data: ticket,
      message: is_flagged ? 'Tiket berhasil ditandai' : 'Tanda tiket berhasil dihapus'
    });

  } catch (error: any) {
    console.error('Error in flag ticket:', error);
    res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan server: ' + error.message
    });
  }
});

// ============================================================================
// GET TIKET BERDASARKAN UNIT (untuk filter akses)
// ============================================================================

// Get tiket yang ditujukan ke unit tertentu atau dieskalasi ke unit tersebut
router.get('/tickets/by-unit/:unitId', optionalSupabaseAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { unitId } = req.params;
    const { status, priority, page = 1, limit = 50 } = req.query;

    // Query tiket yang:
    // 1. Unit asal = unitId, ATAU
    // 2. Dieskalasi ke unitId, ATAU
    // 3. Tembusan ke unitId
    let query = supabaseAdmin
      .from('tickets')
      .select(`
        *,
        units:unit_id(name, code),
        service_categories:category_id(name)
      `)
      .or(`unit_id.eq.${unitId},escalated_to_units.cs.["${unitId}"],cc_units.cs.["${unitId}"]`)
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    if (priority && priority !== 'all') {
      query = query.eq('priority', priority);
    }

    const offset = (Number(page) - 1) * Number(limit);
    query = query.range(offset, offset + Number(limit) - 1);

    const { data: tickets, error } = await query;

    if (error) {
      console.error('Error fetching tickets by unit:', error);
      return res.status(500).json({
        success: false,
        error: 'Gagal mengambil data tiket'
      });
    }

    res.json({
      success: true,
      data: tickets || []
    });

  } catch (error: any) {
    console.error('Error in get tickets by unit:', error);
    res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan server: ' + error.message
    });
  }
});

// Get eskalasi history untuk tiket
router.get('/tickets/:id/escalations', optionalSupabaseAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const { data: escalations, error } = await supabaseAdmin
      .from('ticket_escalations')
      .select(`
        *,
        from_user:from_user_id(full_name, email),
        to_unit:to_unit_id(name, code)
      `)
      .eq('ticket_id', id)
      .order('escalated_at', { ascending: false });

    if (error) {
      console.error('Error fetching escalations:', error);
      return res.status(500).json({
        success: false,
        error: 'Gagal mengambil data eskalasi'
      });
    }

    // Ambil detail unit tembusan
    for (const esc of escalations || []) {
      if (esc.cc_unit_ids && esc.cc_unit_ids.length > 0) {
        const { data: ccUnits } = await supabaseAdmin
          .from('units')
          .select('id, name, code')
          .in('id', esc.cc_unit_ids);
        esc.cc_units = ccUnits || [];
      }
    }

    res.json({
      success: true,
      data: escalations || []
    });

  } catch (error: any) {
    console.error('Error in get escalations:', error);
    res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan server: ' + error.message
    });
  }
});

// Get unit escalation status
router.get('/tickets/:id/escalation-units', optionalSupabaseAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const { data: escalationUnits, error } = await supabaseAdmin
      .from('ticket_escalation_units')
      .select(`
        *,
        units:unit_id(name, code)
      `)
      .eq('ticket_id', id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching escalation units:', error);
      return res.status(500).json({
        success: false,
        error: 'Gagal mengambil data unit eskalasi'
      });
    }

    res.json({
      success: true,
      data: escalationUnits || []
    });

  } catch (error: any) {
    console.error('Error in get escalation units:', error);
    res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan server: ' + error.message
    });
  }
});

// Update status eskalasi unit
router.patch('/escalation-units/:id/status', authenticateSupabase, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    };

    if (notes) updateData.notes = notes;
    if (status === 'received') updateData.received_at = new Date().toISOString();
    if (status === 'completed') updateData.completed_at = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from('ticket_escalation_units')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating escalation unit status:', error);
      return res.status(500).json({
        success: false,
        error: 'Gagal mengupdate status eskalasi'
      });
    }

    res.json({
      success: true,
      data,
      message: 'Status eskalasi berhasil diupdate'
    });

  } catch (error: any) {
    console.error('Error in update escalation unit status:', error);
    res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan server: ' + error.message
    });
  }
});

export default router;
