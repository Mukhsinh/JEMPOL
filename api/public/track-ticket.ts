import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  
  try {
    // Handle OPTIONS request
    if (req.method === 'OPTIONS') {
      return res.status(200).json({ success: true });
    }

    // Only allow GET
    if (req.method !== 'GET') {
      return res.status(405).json({
        success: false,
        error: 'Method not allowed. Use GET method.'
      });
    }
    
    // Get ticket number from query parameter
    const ticketNumber = req.query.ticket as string;
    
    if (!ticketNumber) {
      return res.status(400).json({
        success: false,
        error: 'Nomor tiket harus diisi'
      });
    }

    console.log('🎯 GET /api/public/track-ticket dipanggil untuk:', ticketNumber);
    
    // Initialize Supabase client
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Supabase credentials tidak tersedia');
      return res.status(500).json({
        success: false,
        error: 'Konfigurasi server tidak lengkap'
      });
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
    console.log('✅ Supabase client initialized');
    
    // Fetch ticket dengan nomor tiket
    const { data: ticket, error: ticketError } = await supabase
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
        reporter_name,
        units:unit_id(name, code),
        service_categories:category_id(name)
      `)
      .eq('ticket_number', ticketNumber)
      .single();

    if (ticketError) {
      console.error('❌ Error fetching ticket:', ticketError);
      return res.status(404).json({
        success: false,
        error: 'Tiket tidak ditemukan'
      });
    }

    if (!ticket) {
      console.error('❌ Tiket tidak ditemukan');
      return res.status(404).json({
        success: false,
        error: 'Tiket tidak ditemukan'
      });
    }

    console.log('✅ Tiket ditemukan:', ticket.ticket_number);

    // Fetch responses (hanya yang tidak internal)
    const { data: responses } = await supabase
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
    const { data: escalations } = await supabase
      .from('ticket_escalations')
      .select(`
        id,
        escalation_level,
        reason,
        created_at,
        resolved_at
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

    console.log('✅ Data tracking berhasil diambil');

    return res.status(200).json({
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
          reporter_name: ticket.reporter_name,
          unit: ticket.units,
          category: ticket.service_categories
        },
        timeline,
        stats: {
          totalResponses: responses?.length || 0,
          totalEscalations: escalations?.length || 0,
          isResolved: !!ticket.resolved_at,
          isOverSLA: ticket.sla_deadline && new Date(ticket.sla_deadline) < new Date() && !ticket.resolved_at
        }
      }
    });
  } catch (error: any) {
    console.error('❌ Unexpected error in track ticket:', {
      message: error.message,
      stack: error.stack?.substring(0, 200)
    });
    
    return res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan saat melacak tiket',
      debug: {
        errorType: error.constructor.name,
        timestamp: new Date().toISOString()
      }
    });
  }
}
