import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers PERTAMA SEBELUM SEMUA LOGIC
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  
  try {
    console.log('🎯 track-ticket handler called:', req.method, req.url);
    
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
    console.log('📋 Full query object:', JSON.stringify(req.query));
    const ticketNumber = req.query.ticket as string;
    
    if (!ticketNumber) {
      console.log('❌ Ticket number missing from query');
      console.log('❌ Available query keys:', Object.keys(req.query));
      return res.status(400).json({
        success: false,
        error: 'Nomor tiket harus diisi',
        debug: {
          receivedQuery: req.query,
          url: req.url
        }
      });
    }

    console.log('🔍 Searching for ticket:', ticketNumber);
    
    // Initialize Supabase client - Prioritaskan VITE_ env vars
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
    
    console.log('🔑 Checking credentials:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseKey,
      urlPrefix: supabaseUrl ? supabaseUrl.substring(0, 30) : 'none',
      keyPrefix: supabaseKey ? supabaseKey.substring(0, 20) : 'none',
      envVars: Object.keys(process.env).filter(k => k.includes('SUPABASE'))
    });
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Supabase credentials tidak tersedia');
      return res.status(500).json({
        success: false,
        error: 'Konfigurasi server tidak lengkap',
        debug: {
          hasUrl: !!supabaseUrl,
          hasKey: !!supabaseKey,
          envVars: Object.keys(process.env).filter(k => k.includes('SUPABASE'))
        }
      });
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      },
      global: {
        headers: {
          'apikey': supabaseKey
        }
      }
    });
    console.log('✅ Supabase client initialized with anon key');
    
    // Fetch ticket dengan nomor tiket - coba beberapa variasi untuk memastikan ditemukan
    const normalizedTicketNumber = ticketNumber.trim();
    console.log('🔍 Mencari tiket dengan nomor (original):', normalizedTicketNumber);
    
    // Coba query dengan eq dulu (exact match, case sensitive)
    let { data: tickets, error: ticketError } = await supabase
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
        units!tickets_unit_id_fkey(name, code),
        service_categories!tickets_category_id_fkey(name)
      `)
      .eq('ticket_number', normalizedTicketNumber);

    // Jika tidak ditemukan, coba dengan ilike (case insensitive)
    if ((!tickets || tickets.length === 0) && !ticketError) {
      console.log('🔍 Mencoba dengan case-insensitive search...');
      const result = await supabase
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
          units!tickets_unit_id_fkey(name, code),
          service_categories!tickets_category_id_fkey(name)
        `)
        .ilike('ticket_number', normalizedTicketNumber);
      
      tickets = result.data;
      ticketError = result.error;
    }

    if (ticketError) {
      console.error('❌ Error fetching ticket:', ticketError);
      return res.status(500).json({
        success: false,
        error: 'Terjadi kesalahan saat mencari tiket',
        debug: {
          errorMessage: ticketError.message,
          errorCode: ticketError.code,
          searchedTicket: normalizedTicketNumber
        }
      });
    }

    console.log('📊 Hasil query tickets:', tickets ? tickets.length : 0, 'tiket ditemukan');

    if (!tickets || tickets.length === 0) {
      // Coba cari di external_tickets jika tidak ditemukan di tickets
      console.log('🔍 Mencari di external_tickets...');
      
      // Coba exact match dulu
      let { data: externalTickets, error: externalError } = await supabase
        .from('external_tickets')
        .select(`
          id,
          ticket_number,
          complaint_type,
          description,
          status,
          priority,
          created_at,
          updated_at,
          resolved_at,
          units:unit_id(name, code)
        `)
        .eq('ticket_number', normalizedTicketNumber);
      
      // Jika tidak ditemukan, coba case-insensitive
      if ((!externalTickets || externalTickets.length === 0) && !externalError) {
        console.log('🔍 Mencoba external tickets dengan case-insensitive...');
        const result = await supabase
          .from('external_tickets')
          .select(`
            id,
            ticket_number,
            complaint_type,
            description,
            status,
            priority,
            created_at,
            updated_at,
            resolved_at,
            units:unit_id(name, code)
          `)
          .ilike('ticket_number', normalizedTicketNumber);
        
        externalTickets = result.data;
        externalError = result.error;
      }

      if (externalError) {
        console.error('❌ Error fetching external ticket:', externalError);
      }

      if (externalTickets && externalTickets.length > 0) {
        const externalTicket = externalTickets[0];
        console.log('✅ Tiket eksternal ditemukan:', externalTicket.ticket_number);
        
        // Map external ticket ke format ticket biasa
        const mappedTicket = {
          id: externalTicket.id,
          ticket_number: externalTicket.ticket_number,
          title: externalTicket.complaint_type || 'Tiket Eksternal',
          description: externalTicket.description,
          status: externalTicket.status,
          priority: externalTicket.priority || 'medium',
          created_at: externalTicket.created_at,
          updated_at: externalTicket.updated_at,
          resolved_at: externalTicket.resolved_at,
          sla_deadline: null,
          unit: externalTicket.units,
          category: null
        };

        // Return dengan timeline minimal untuk external ticket
        return res.status(200).json({
          success: true,
          data: {
            ticket: mappedTicket,
            timeline: [
              {
                type: 'created',
                title: 'Tiket Dibuat',
                description: 'Tiket pengaduan eksternal telah dibuat dan terdaftar dalam sistem',
                timestamp: externalTicket.created_at,
                icon: 'add_circle',
                color: 'blue'
              }
            ],
            escalationUnits: [],
            stats: {
              totalResponses: 0,
              totalEscalations: 0,
              isResolved: !!externalTicket.resolved_at,
              isOverSLA: false
            }
          }
        });
      }

      console.error('❌ Tiket tidak ditemukan di database manapun');
      return res.status(404).json({
        success: false,
        error: 'Tiket tidak ditemukan. Pastikan nomor tiket yang Anda masukkan benar.',
        debug: {
          searchedTicketNumber: normalizedTicketNumber,
          ticketsFound: 0,
          externalTicketsFound: 0
        }
      });
    }

    const ticket = tickets[0];
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

    // Fetch escalations - PERBAIKAN: tabel tidak punya kolom escalation_level dan resolved_at
    const { data: escalations } = await supabase
      .from('ticket_escalations')
      .select(`
        id,
        reason,
        escalation_type,
        escalated_at,
        created_at
      `)
      .eq('ticket_id', ticket.id)
      .order('created_at', { ascending: true });

    // Fetch escalation units
    const { data: escalationUnits } = await supabase
      .from('ticket_escalation_units')
      .select(`
        id,
        status,
        is_primary,
        is_cc,
        created_at,
        units:unit_id(name, code)
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
      escalations.forEach((esc, index) => {
        timeline.push({
          type: 'escalation',
          title: `Eskalasi ${esc.escalation_type === 'automatic' ? 'Otomatis' : 'Manual'}`,
          description: esc.reason || 'Tiket dieskalasi untuk penanganan lebih lanjut',
          timestamp: esc.escalated_at || esc.created_at,
          icon: 'trending_up',
          color: 'orange'
        });
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
    
    const responseData = {
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
    };
    
    console.log('📤 Sending response:', JSON.stringify(responseData).substring(0, 200));

    return res.status(200).json(responseData);
  } catch (error: any) {
    console.error('❌ Unexpected error in track ticket:', {
      message: error.message,
      stack: error.stack?.substring(0, 200),
      name: error.name
    });
    
    // Pastikan response selalu JSON
    return res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan saat melacak tiket',
      details: error.message || 'Unknown error',
      debug: {
        errorType: error.constructor?.name || 'Unknown',
        errorName: error.name || 'Unknown',
        timestamp: new Date().toISOString()
      }
    });
  }
}
