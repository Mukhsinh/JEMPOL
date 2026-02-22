import { supabase } from '../utils/supabaseClient';

export interface Ticket {
  id: string;
  ticket_number: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  type: string;
  created_at: string;
  updated_at: string;
  unit_id: string;
  category_id?: string;
  assigned_to?: string;
  first_response_at?: string;
  sla_deadline?: string;
  units?: {
    id: string;
    name: string;
    code: string;
  };
  service_categories?: {
    id: string;
    name: string;
    code: string;
  };
  // Escalation info
  is_escalated?: boolean;
  escalated_from_unit?: {
    id: string;
    name: string;
    code: string;
  };
  escalation_date?: string;
}

export interface GetTicketsParams {
  unitId?: string;
  status?: string;
  priority?: string;
  categoryId?: string;
  page?: number;
  limit?: number;
}

export interface GetTicketsResult {
  data: Ticket[];
  total: number;
  page: number;
  limit: number;
}

class TicketService {
  /**
   * Get tickets dengan auto-apply unit filter untuk regular user
   */
  async getTickets(
    params?: GetTicketsParams,
    userUnitId?: string | null,
    hasGlobalAccess?: boolean
  ): Promise<GetTicketsResult> {
    try {
      const page = params?.page || 1;
      const limit = params?.limit || 100;
      const offset = (page - 1) * limit;

      // DEBUG: Log input parameters
      console.log('🔍 [ticketService.getTickets] Input params:', {
        userUnitId,
        hasGlobalAccess,
        filters: params,
        timestamp: new Date().toISOString()
      });

      // Untuk user dengan unit tertentu, ambil tiket yang relevan
      // PENTING: Jika user tidak punya global access tapi juga tidak punya unit_id,
      // maka user tidak boleh melihat tiket apapun (return empty)
      if (!hasGlobalAccess) {
        if (!userUnitId) {
          console.warn('⚠️ [ticketService.getTickets] User has no unit_id and no global access - returning empty');
          return {
            data: [],
            total: 0,
            page,
            limit,
          };
        }
        
        console.log('🔒 [ticketService.getTickets] Fetching tickets for unit:', userUnitId);
        
        // Ambil semua tiket yang unit_id = userUnitId
        const { data: directTickets, error: directError } = await supabase
          .from('tickets')
          .select(`
            id,
            ticket_number,
            title,
            description,
            status,
            priority,
            type,
            created_at,
            updated_at,
            unit_id,
            category_id,
            assigned_to,
            first_response_at,
            sla_deadline,
            units (id, name, code),
            service_categories (id, name, code)
          `)
          .eq('unit_id', userUnitId)
          .order('created_at', { ascending: false });

        if (directError) {
          console.error('❌ [ticketService.getTickets] Error fetching direct tickets:', directError);
          throw directError;
        }

        console.log('✅ [ticketService.getTickets] Found direct tickets:', {
          count: directTickets?.length || 0,
          tickets: directTickets?.map((t: any) => ({ id: t.id, ticket_number: t.ticket_number, unit: t.units?.name }))
        });

        // Ambil tiket yang dieskalasi ke unit ini (sebagai penerima)
        const { data: escalationsReceived, error: escalationReceivedError } = await supabase
          .from('ticket_escalations')
          .select(`
            ticket_id,
            from_unit_id,
            created_at
          `)
          .eq('to_unit_id', userUnitId);

        if (escalationReceivedError) {
          console.error('❌ [ticketService.getTickets] Error fetching received escalations:', escalationReceivedError);
          throw escalationReceivedError;
        }

        // Ambil tiket yang dieskalasi dari unit ini (sebagai pengirim)
        const { data: escalationsSent, error: escalationSentError } = await supabase
          .from('ticket_escalations')
          .select(`
            ticket_id,
            to_unit_id,
            created_at
          `)
          .eq('from_unit_id', userUnitId);

        if (escalationSentError) {
          console.error('❌ [ticketService.getTickets] Error fetching sent escalations:', escalationSentError);
          throw escalationSentError;
        }

        // Gabungkan semua escalations
        const allEscalations = [
          ...(escalationsReceived || []).map((e: any) => ({ ...e, type: 'received' })),
          ...(escalationsSent || []).map((e: any) => ({ ...e, type: 'sent' }))
        ];

        // Create map untuk escalation info
        const escalationMap = new Map(
          allEscalations.map((e: any) => [
            e.ticket_id,
            {
              escalation_date: e.created_at,
              type: e.type,
              from_unit_id: e.from_unit_id,
              to_unit_id: e.to_unit_id
            }
          ])
        );

        const escalatedTicketIds = Array.from(new Set(allEscalations.map((e: any) => e.ticket_id)));
        
        console.log('✅ [ticketService.getTickets] Found escalations:', {
          received: escalationsReceived?.length || 0,
          sent: escalationsSent?.length || 0,
          total: allEscalations.length,
          escalatedTicketIds
        });

        // Ambil tiket yang dieskalasi (jika ada)
        let escalatedTickets: any[] = [];
        if (escalatedTicketIds.length > 0) {
          const { data: escTickets, error: escError } = await supabase
            .from('tickets')
            .select(`
              id,
              ticket_number,
              title,
              description,
              status,
              priority,
              type,
              created_at,
              updated_at,
              unit_id,
              category_id,
              assigned_to,
              first_response_at,
              sla_deadline,
              units (id, name, code),
              service_categories (id, name, code)
            `)
            .in('id', escalatedTicketIds)
            .order('created_at', { ascending: false });

          if (escError) {
            console.error('❌ [ticketService.getTickets] Error fetching escalated tickets:', escError);
          } else {
            escalatedTickets = escTickets || [];
            console.log('✅ [ticketService.getTickets] Found escalated tickets:', {
              count: escalatedTickets.length,
              tickets: escalatedTickets.map(t => ({ id: t.id, ticket_number: t.ticket_number, unit: t.units?.name }))
            });
          }
        } else {
          console.log('ℹ️ [ticketService.getTickets] No escalations found for this unit');
        }

        // Gabungkan dan deduplikasi
        const allTickets = [...(directTickets || []), ...escalatedTickets];
        const uniqueTickets = Array.from(
          new Map(allTickets.map(t => [t.id, t])).values()
        );

        // Tambahkan escalation info
        const ticketsWithEscalationInfo = uniqueTickets.map(ticket => {
          const escalationInfo = escalationMap.get(ticket.id);
          if (escalationInfo) {
            // Jika unit ini adalah penerima eskalasi
            if ((escalationInfo as any).type === 'received') {
              return {
                ...ticket,
                is_escalated: true,
                escalated_from_unit: ticket.units, // Unit asal adalah unit dari tiket
                escalation_date: (escalationInfo as any).escalation_date,
                escalation_type: 'received'
              };
            }
            // Jika unit ini adalah pengirim eskalasi
            else {
              return {
                ...ticket,
                is_escalated: true,
                escalation_date: (escalationInfo as any).escalation_date,
                escalation_type: 'sent'
              };
            }
          }
          return {
            ...ticket,
            is_escalated: false
          };
        });

        console.log('🔄 [ticketService.getTickets] After deduplication:', {
          totalBeforeDedup: allTickets.length,
          totalAfterDedup: uniqueTickets.length,
          duplicatesRemoved: allTickets.length - uniqueTickets.length,
          escalatedCount: ticketsWithEscalationInfo.filter(t => t.is_escalated).length
        });

        // Apply filters
        let filteredData = ticketsWithEscalationInfo;
        
        if (params?.status) {
          filteredData = filteredData.filter(t => t.status === params.status);
        }
        if (params?.priority) {
          filteredData = filteredData.filter(t => t.priority === params.priority);
        }
        if (params?.categoryId) {
          filteredData = filteredData.filter(t => t.category_id === params.categoryId);
        }

        // Sort: Eskalasi di atas, lalu by created_at descending
        filteredData.sort((a, b) => {
          // Prioritaskan tiket eskalasi
          if (a.is_escalated && !b.is_escalated) return -1;
          if (!a.is_escalated && b.is_escalated) return 1;
          // Jika sama-sama eskalasi atau sama-sama bukan, sort by created_at
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });

        console.log('📊 [ticketService.getTickets] Final result:', {
          totalTickets: filteredData.length,
          page,
          limit,
          appliedFilters: {
            status: params?.status,
            priority: params?.priority,
            categoryId: params?.categoryId
          }
        });

        return {
          data: filteredData,
          total: filteredData.length,
          page,
          limit,
        };
      }

      // Untuk admin/superadmin - ambil semua atau filter by unit
      console.log('🌐 [ticketService.getTickets] Global access mode - fetching all tickets');
      let query = supabase
        .from('tickets')
        .select(`
          id,
          ticket_number,
          title,
          description,
          status,
          priority,
          type,
          created_at,
          updated_at,
          unit_id,
          category_id,
          assigned_to,
          first_response_at,
          sla_deadline,
          units (id, name, code),
          service_categories (id, name, code)
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (params?.unitId) {
        query = query.eq('unit_id', params.unitId);
      }
      if (params?.status) {
        query = query.eq('status', params.status);
      }
      if (params?.priority) {
        query = query.eq('priority', params.priority);
      }
      if (params?.categoryId) {
        query = query.eq('category_id', params.categoryId);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('❌ [ticketService.getTickets] Error fetching tickets (global mode):', error);
        throw error;
      }

      console.log('📊 [ticketService.getTickets] Final result (global mode):', {
        totalTickets: count || 0,
        returnedTickets: data?.length || 0,
        page,
        limit
      });

      return {
        data: data || [],
        total: count || 0,
        page,
        limit,
      };
    } catch (error) {
      console.error('❌ [ticketService.getTickets] Error in getTickets:', error);
      throw error;
    }
  }

  /**
   * Get ticket by ID dengan access validation
   */
  async getTicketById(
    ticketId: string,
    userUnitId?: string | null,
    hasGlobalAccess?: boolean
  ): Promise<Ticket | null> {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          id,
          ticket_number,
          title,
          description,
          status,
          priority,
          type,
          created_at,
          updated_at,
          unit_id,
          category_id,
          assigned_to,
          first_response_at,
          sla_deadline,
          units (id, name, code),
          service_categories (id, name, code)
        `)
        .eq('id', ticketId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Not found
          return null;
        }
        console.error('❌ Error fetching ticket:', error);
        throw error;
      }

      // Validate access untuk regular user
      if (!hasGlobalAccess && userUnitId && data.unit_id !== userUnitId) {
        console.warn('🚫 Access denied: User unit', userUnitId, 'trying to access ticket from unit', data.unit_id);
        throw new Error('ACCESS_DENIED');
      }

      return data;
    } catch (error: any) {
      if (error.message === 'ACCESS_DENIED') {
        throw error;
      }
      console.error('❌ Error in getTicketById:', error);
      throw error;
    }
  }
}

const ticketService = new TicketService();
export { ticketService };
export default ticketService;
