import express, { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase.js';

const router = express.Router();

/**
 * Public endpoint untuk tracking tiket berdasarkan nomor tiket
 * GET /api/public/track/:ticketNumber
 */
router.get('/track/:ticketNumber', async (req: Request, res: Response) => {
  try {
    const { ticketNumber } = req.params;

    if (!ticketNumber) {
      return res.status(400).json({
        success: false,
        error: 'Nomor tiket harus diisi'
      });
    }

    // Fetch ticket dengan nomor tiket
    const { data: ticket, error: ticketError } = await supabaseAdmin
      .from('tickets')
      .select(`
        id,
        ticket_number,
        title,
        description,
        status,
        priority,
        created_at,
        updated_at,
        resolved_at,
        first_response_at,
        sla_deadline,
        units:unit_id(name, code),
        service_categories:category_id(name)
      `)
      .eq('ticket_number', ticketNumber)
      .single();

    if (ticketError || !ticket) {
      return res.status(404).json({
        success: false,
        error: 'Tiket tidak ditemukan'
      });
    }

    // Fetch responses (hanya yang tidak internal)
    const { data: responses } = await supabaseAdmin
      .from('ticket_responses')
      .select(`
        id,
        message,
        response_type,
        created_at
      `)
      .eq('ticket_id', ticket.id)
      .eq('is_internal', false)
      .order('created_at', { ascending: true });

    // Fetch escalations
    const { data: escalations } = await supabaseAdmin
      .from('ticket_escalations')
      .select(`
        id,
        escalation_level,
        reason,
        created_at,
        resolved_at,
        escalated_to,
        escalated_by
      `)
      .eq('ticket_id', ticket.id)
      .order('created_at', { ascending: true });

    // Fetch escalation units
    const { data: escalationUnits } = await supabaseAdmin
      .from('ticket_escalation_units')
      .select(`
        id,
        status,
        is_primary,
        is_cc,
        created_at,
        units:unit_id(name)
      `)
      .eq('ticket_id', ticket.id)
      .order('created_at', { ascending: true });

    // Build timeline dari semua events
    const timeline: any[] = [];

    // Event: Tiket dibuat
    timeline.push({
      type: 'created',
      title: 'Tiket Dibuat',
      description: 'Tiket pengaduan telah dibuat dan terdaftar dalam sistem',
      timestamp: ticket.created_at,
      icon: 'add_circle',
      color: 'blue'
    });

    // Event: Respon pertama
    if (ticket.first_response_at) {
      timeline.push({
        type: 'first_response',
        title: 'Respon Pertama',
        description: 'Tim telah memberikan respon pertama terhadap tiket Anda',
        timestamp: ticket.first_response_at,
        icon: 'reply',
        color: 'emerald'
      });
    }

    // Event: Responses
    if (responses && responses.length > 0) {
      responses.forEach((response) => {
        timeline.push({
          type: 'response',
          title: response.response_type === 'resolution' ? 'Resolusi' : 'Respon',
          description: response.message,
          timestamp: response.created_at,
          icon: response.response_type === 'resolution' ? 'check_circle' : 'chat',
          color: response.response_type === 'resolution' ? 'emerald' : 'blue'
        });
      });
    }

    // Event: Escalations
    if (escalations && escalations.length > 0) {
      escalations.forEach((esc) => {
        timeline.push({
          type: 'escalation',
          title: `Eskalasi Level ${esc.escalation_level || 1}`,
          description: esc.reason || 'Tiket dieskalasi ke level yang lebih tinggi',
          timestamp: esc.created_at,
          icon: 'trending_up',
          color: 'orange'
        });

        if (esc.resolved_at) {
          timeline.push({
            type: 'escalation_resolved',
            title: 'Eskalasi Diselesaikan',
            description: `Eskalasi level ${esc.escalation_level || 1} telah diselesaikan`,
            timestamp: esc.resolved_at,
            icon: 'check_circle',
            color: 'emerald'
          });
        }
      });
    }

    // Event: Tiket diselesaikan
    if (ticket.resolved_at) {
      timeline.push({
        type: 'resolved',
        title: 'Tiket Diselesaikan',
        description: 'Tiket pengaduan Anda telah diselesaikan',
        timestamp: ticket.resolved_at,
        icon: 'task_alt',
        color: 'emerald'
      });
    }

    // Sort timeline by timestamp
    timeline.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    res.json({
      success: true,
      data: {
        ticket: {
          id: ticket.id,
          ticket_number: ticket.ticket_number,
          title: ticket.title,
          description: ticket.description,
          status: ticket.status,
          priority: ticket.priority,
          created_at: ticket.created_at,
          updated_at: ticket.updated_at,
          resolved_at: ticket.resolved_at,
          sla_deadline: ticket.sla_deadline,
          unit: ticket.units,
          category: ticket.service_categories
        },
        timeline,
        escalationUnits: escalationUnits || [],
        stats: {
          totalResponses: responses?.length || 0,
          totalEscalations: escalations?.length || 0,
          isResolved: !!ticket.resolved_at,
          isOverSLA: ticket.sla_deadline && new Date(ticket.sla_deadline) < new Date() && !ticket.resolved_at
        }
      }
    });
  } catch (error: any) {
    console.error('Error tracking ticket:', error);
    res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan saat melacak tiket'
    });
  }
});

export default router;
