import api from './api';
import { supabase } from '../utils/supabaseClient';

export interface ExternalTicket {
  id: string;
  ticket_number: string;
  qr_code_id?: string;
  unit_id: string;
  reporter_identity_type: 'personal' | 'anonymous';
  reporter_name?: string;
  reporter_email?: string;
  reporter_phone?: string;
  reporter_address?: string;
  service_type: 'complaint' | 'request' | 'suggestion' | 'survey';
  category?: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'escalated' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  urgency_level: number;
  ai_classification?: any;
  sentiment_score?: number;
  confidence_score?: number;
  sla_deadline?: string;
  first_response_at?: string;
  resolved_at?: string;
  source: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  updated_at: string;
  units?: {
    id: string;
    name: string;
    code: string;
  };
  qr_codes?: {
    id: string;
    name: string;
    code: string;
  };
}

export interface CreateExternalTicketData {
  qr_code_id?: string;
  unit_id: string;
  reporter_identity_type: 'personal' | 'anonymous';
  reporter_name?: string;
  reporter_email?: string;
  reporter_phone?: string;
  reporter_address?: string;
  service_type: string;
  category?: string;
  service_category_id?: string;
  patient_type_id?: string;
  title: string;
  description: string;
  attachments?: File[];
}

// Helper function to generate ticket number
const generateTicketNumber = async (): Promise<string> => {
  const year = new Date().getFullYear();
  const { data: lastTicket } = await supabase
    .from('tickets')
    .select('ticket_number')
    .like('ticket_number', `TKT-${year}-%`)
    .order('created_at', { ascending: false })
    .limit(1);

  let nextNumber = 1;
  if (lastTicket && lastTicket.length > 0) {
    const lastNumber = parseInt(lastTicket[0].ticket_number.split('-')[2]);
    nextNumber = lastNumber + 1;
  }

  return `TKT-${year}-${nextNumber.toString().padStart(4, '0')}`;
};

export const externalTicketService = {
  // Create external ticket (public endpoint)
  async createTicket(data: CreateExternalTicketData): Promise<any> {
    try {
      console.log('📤 Creating external ticket:', data);

      // Coba gunakan backend API terlebih dahulu
      try {
        const response = await api.post('/public/external-tickets', {
          reporter_identity_type: data.reporter_identity_type,
          reporter_name: data.reporter_name,
          reporter_email: data.reporter_email,
          reporter_phone: data.reporter_phone,
          reporter_address: data.reporter_address,
          service_type: data.service_type,
          category: data.category,
          service_category_id: data.service_category_id,
          patient_type_id: data.patient_type_id,
          title: data.title,
          description: data.description,
          qr_code: data.qr_code_id,
          unit_id: data.unit_id,
          source: 'web'
        });

        // Jika response sukses, kembalikan data
        if (response.data && response.data.success) {
          console.log('✅ External ticket created via backend:', response.data);
          return response.data;
        }

        // Jika response gagal, cek apakah error server/infrastruktur
        const errorMsg = response.data?.error || '';
        if (!response.data || errorMsg.includes('Server') || errorMsg.includes('HTML') || errorMsg.includes('kosong')) {
          throw new Error(errorMsg || 'Backend response invalid');
        }

        // Untuk error validasi (misal input tidak lengkap), kembalikan response error ke frontend
        return response.data;
      } catch (backendError: any) {
        console.warn('⚠️ Backend tidak tersedia, menggunakan Supabase langsung:', backendError.message);

        // Fallback: Gunakan Supabase client langsung
        // Generate ticket number
        const ticketNumber = await generateTicketNumber();

        // Mapping service_type ke type yang valid di database
        const serviceTypeMapping: { [key: string]: string } = {
          'complaint': 'complaint',
          'request': 'information',
          'suggestion': 'suggestion',
          'survey': 'satisfaction'
        };

        const mappedType = serviceTypeMapping[data.service_type] || 'complaint';

        // Calculate SLA deadline
        const slaDeadline = new Date();
        if (data.service_type === 'complaint') {
          slaDeadline.setHours(slaDeadline.getHours() + 24);
        } else if (data.service_type === 'request') {
          slaDeadline.setHours(slaDeadline.getHours() + 48);
        } else {
          slaDeadline.setHours(slaDeadline.getHours() + 72);
        }

        // Determine priority
        let priority = 'medium';
        if (data.service_type === 'complaint') {
          priority = 'high';
        } else if (data.service_type === 'request') {
          priority = 'medium';
        } else {
          priority = 'low';
        }

        const isAnonymous = data.reporter_identity_type === 'anonymous';

        // Insert ticket langsung ke Supabase
        const ticketData: any = {
          ticket_number: ticketNumber,
          type: mappedType,
          title: data.title,
          description: data.description,
          unit_id: data.unit_id,
          priority: priority,
          status: 'open',
          sla_deadline: slaDeadline.toISOString(),
          source: 'web',
          is_anonymous: isAnonymous,
          submitter_name: isAnonymous ? null : data.reporter_name,
          submitter_email: isAnonymous ? null : data.reporter_email,
          submitter_phone: isAnonymous ? null : data.reporter_phone,
          submitter_address: isAnonymous ? null : data.reporter_address
        };

        // Tambahkan category_id jika ada
        if (data.category) {
          ticketData.category_id = data.category;
        }

        const { data: ticket, error } = await supabase
          .from('tickets')
          .insert(ticketData)
          .select(`
            *,
            units:unit_id(name, code)
          `)
          .single();

        if (error) {
          console.error('❌ Error creating ticket via Supabase:', error);
          throw new Error(`Gagal membuat tiket: ${error.message}`);
        }

        console.log('✅ External ticket created via Supabase:', ticket);

        return {
          success: true,
          ticket_number: ticket.ticket_number,
          data: ticket,
          message: 'Tiket berhasil dibuat. Nomor tiket Anda: ' + ticket.ticket_number
        };
      }
    } catch (error: any) {
      console.error('❌ Error creating external ticket:', error);
      throw error;
    }
  },

  // Get external tickets (admin only)
  async getTickets(params?: {
    page?: number;
    limit?: number;
    status?: string;
    service_type?: string;
    priority?: string;
    unit_id?: string;
    search?: string;
  }): Promise<{ tickets: ExternalTicket[]; pagination: any }> {
    const response = await api.get('/external-tickets', { params });
    return response.data;
  },

  // Get external ticket by ID (admin only)
  async getTicketById(id: string): Promise<ExternalTicket> {
    const response = await api.get(`/external-tickets/${id}`);
    return response.data;
  },

  // Update external ticket status (admin only)
  async updateTicketStatus(
    id: string,
    data: {
      status: string;
      response_message?: string;
      responder_id?: string;
    }
  ): Promise<any> {
    const response = await api.patch(`/external-tickets/${id}/status`, data);
    return response.data;
  },

  // Get external ticket statistics (admin only)
  async getStats(params?: {
    unit_id?: string;
    date_from?: string;
    date_to?: string;
  }): Promise<any> {
    const response = await api.get('/external-tickets/stats', { params });
    return response.data;
  },
};

export default externalTicketService;