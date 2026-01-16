import api from './api';
import { supabaseService } from './supabaseService';
import { supabase } from '../utils/supabaseClient';

export interface TrendData {
  date: string;
  complaints: number;
  resolved: number;
}

export interface RiskAnalysis {
  unitName: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskPercentage: number;
}

export interface DetailedReport {
  id: string;
  ticketNumber: string;
  date: string;
  unitName: string;
  categoryName: string;
  status: string;
  responseTime: number | null;
  title: string;
}

export interface ReportFilters {
  dateRange?: string;
  unitId?: string;
  categoryId?: string;
  status?: string;
  priority?: string;
  page?: number;
  limit?: number;
}

export interface ReportSummary {
  total_tickets: number;
  open_tickets: number;
  in_progress_tickets: number;
  resolved_tickets: number;
  closed_tickets: number;
  average_resolution_time: number;
}

export interface Unit {
  id: string;
  name: string;
  code: string;
  is_active: boolean;
}

export interface ServiceCategory {
  id: string;
  name: string;
  code: string;
  is_active: boolean;
}

export interface KPIData {
  totalComplaints: number;
  totalComplaintsChange: number;
  resolvedComplaints: number;
  resolvedComplaintsChange: number;
  averageResponseTime: number;
  averageResponseTimeChange: number;
  projectedNextWeek: number;
}

export interface FullReportData {
  kpi: KPIData;
  trends: TrendData[];
  riskAnalysis: RiskAnalysis[];
  detailedReports: DetailedReport[];
  totalReports: number;
}

interface TicketRecord {
  id: string;
  ticket_number: string;
  title: string;
  status: string;
  priority: string;
  created_at: string;
  first_response_at: string | null;
  sla_deadline: string | null;
  unit_id: string | null;
  category_id: string | null;
  units: { id: string; name: string; code: string } | null;
  service_categories: { id: string; name: string; code: string } | null;
}

class ReportService {
  private getStartDate(dateRange: string = 'month'): Date {
    const now = new Date();
    switch (dateRange) {
      case 'week': return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case 'month': return new Date(now.getFullYear(), now.getMonth(), 1);
      case 'quarter': return new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
      case 'year': return new Date(now.getFullYear(), 0, 1);
      default: return new Date(now.getFullYear(), now.getMonth(), 1);
    }
  }

  private async calculateTrends(unitId?: string, categoryId?: string): Promise<TrendData[]> {
    try {
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      console.log('📈 Calculating trends from', sevenDaysAgo.toISOString(), 'to', now.toISOString());

      // Query semua tiket dalam 7 hari terakhir sekaligus
      let query = supabase.from('tickets')
        .select('id, status, created_at')
        .gte('created_at', sevenDaysAgo.toISOString())
        .lte('created_at', now.toISOString());

      if (unitId) query = query.eq('unit_id', unitId);
      if (categoryId) query = query.eq('category_id', categoryId);

      const { data: allTickets, error } = await query;
      
      if (error) {
        console.error('❌ Error fetching trend data:', error);
        return [];
      }

      console.log('✅ Trend tickets found:', allTickets?.length || 0);

      // Group by date
      const ticketsByDate: { [key: string]: { complaints: number; resolved: number } } = {};
      
      (allTickets || []).forEach((ticket: { id: string; status: string; created_at: string }) => {
        const dateKey = new Date(ticket.created_at).toISOString().split('T')[0];
        if (!ticketsByDate[dateKey]) {
          ticketsByDate[dateKey] = { complaints: 0, resolved: 0 };
        }
        ticketsByDate[dateKey].complaints++;
        if (ticket.status === 'resolved' || ticket.status === 'closed') {
          ticketsByDate[dateKey].resolved++;
        }
      });

      // Generate 7 hari terakhir untuk tampilan
      const trends: TrendData[] = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateKey = date.toISOString().split('T')[0];
        const dayData = ticketsByDate[dateKey] || { complaints: 0, resolved: 0 };
        
        trends.push({
          date: date.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit' }),
          complaints: dayData.complaints,
          resolved: dayData.resolved
        });
      }

      console.log('📊 Trends calculated:', trends);
      return trends;
    } catch (error) {
      console.error('❌ Error calculating trends:', error);
      return [];
    }
  }

  private async calculateRiskAnalysis(startDate: Date): Promise<RiskAnalysis[]> {
    try {
      const { data: units } = await supabase.from('units').select('id, name').eq('is_active', true);
      if (!units) return [];

      const riskAnalysis: RiskAnalysis[] = [];

      for (const unit of units) {
        const { data: tickets } = await supabase.from('tickets')
          .select('id, status, sla_deadline')
          .eq('unit_id', unit.id)
          .gte('created_at', startDate.toISOString());

        if (tickets && tickets.length > 0) {
          const totalTickets = tickets.length;
          const overdueTickets = tickets.filter((t: { status: string; sla_deadline: string | null }) => {
            if (t.sla_deadline && t.status !== 'resolved' && t.status !== 'closed') {
              return new Date(t.sla_deadline) < new Date();
            }
            return false;
          }).length;

          const riskPercentage = Math.round((overdueTickets / totalTickets) * 100);
          let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
          if (riskPercentage >= 80) riskLevel = 'critical';
          else if (riskPercentage >= 60) riskLevel = 'high';
          else if (riskPercentage >= 40) riskLevel = 'medium';

          riskAnalysis.push({ unitName: unit.name, riskPercentage, riskLevel });
        }
      }
      return riskAnalysis.sort((a, b) => b.riskPercentage - a.riskPercentage).slice(0, 4);
    } catch (error) {
      console.error('Error calculating risk analysis:', error);
      return [];
    }
  }

  async getReportData(params?: ReportFilters): Promise<FullReportData> {
    try {
      const startDate = this.getStartDate(params?.dateRange);
      console.log('📊 Report: Fetching data from', startDate.toISOString());
      
      // Query tickets dengan select semua field dan relasi
      let query = supabase.from('tickets')
        .select(`
          *,
          units (id, name, code),
          service_categories (id, name, code)
        `)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (params?.unitId) query = query.eq('unit_id', params.unitId);
      if (params?.categoryId) query = query.eq('category_id', params.categoryId);
      if (params?.status) query = query.eq('status', params.status);
      if (params?.priority) query = query.eq('priority', params.priority);

      const { data: tickets, error } = await query;
      
      if (error) {
        console.error('❌ Error fetching tickets:', error);
        throw error;
      }

      console.log('✅ Fetched tickets:', tickets?.length || 0);

      // Map data dengan handling untuk nested relations
      const allTickets = (tickets || []).map((t: any) => ({
        id: t.id,
        ticket_number: t.ticket_number,
        title: t.title,
        status: t.status,
        priority: t.priority,
        created_at: t.created_at,
        first_response_at: t.first_response_at,
        sla_deadline: t.sla_deadline,
        unit_id: t.unit_id,
        category_id: t.category_id,
        units: t.units,
        service_categories: t.service_categories
      })) as TicketRecord[];

      const total = allTickets.length;
      const resolvedCount = allTickets.filter(t => t.status === 'resolved' || t.status === 'closed').length;

      const responseTimes = allTickets
        .filter(t => t.first_response_at && t.created_at)
        .map(t => new Date(t.first_response_at!).getTime() - new Date(t.created_at).getTime());
      
      const averageResponseTime = responseTimes.length > 0
        ? Math.round(responseTimes.reduce((sum: number, time: number) => sum + time, 0) / responseTimes.length / (1000 * 60))
        : 0;

      // Hitung perubahan dibanding periode sebelumnya
      const periodLength = new Date().getTime() - startDate.getTime();
      const previousStartDate = new Date(startDate.getTime() - periodLength);
      const { data: previousTickets } = await supabase
        .from('tickets')
        .select('id, status')
        .gte('created_at', previousStartDate.toISOString())
        .lt('created_at', startDate.toISOString());

      const previousTotal = previousTickets?.length || 0;
      const previousResolved = previousTickets?.filter((t: any) => t.status === 'resolved' || t.status === 'closed').length || 0;

      const totalComplaintsChange = previousTotal > 0 ? Math.round(((total - previousTotal) / previousTotal) * 100) : (total > 0 ? 100 : 0);
      const resolvedComplaintsChange = previousResolved > 0 ? Math.round(((resolvedCount - previousResolved) / previousResolved) * 100) : (resolvedCount > 0 ? 100 : 0);

      const kpi: KPIData = {
        totalComplaints: total,
        resolvedComplaints: resolvedCount,
        averageResponseTime,
        projectedNextWeek: Math.max(Math.round(total * 1.1), 8),
        totalComplaintsChange,
        resolvedComplaintsChange,
        averageResponseTimeChange: -2
      };

      const trends = await this.calculateTrends(params?.unitId, params?.categoryId);
      const riskAnalysis = await this.calculateRiskAnalysis(startDate);

      const page = params?.page || 1;
      const limit = params?.limit || 10;
      const offset = (page - 1) * limit;
      
      // Map detailed reports dengan null-safe access
      const detailedReports: DetailedReport[] = allTickets.slice(offset, offset + limit).map((ticket: TicketRecord) => {
        const unitName = ticket.units?.name || 'N/A';
        const categoryName = ticket.service_categories?.name || 'N/A';
        
        return {
          id: ticket.id,
          ticketNumber: ticket.ticket_number || '-',
          date: new Date(ticket.created_at).toLocaleDateString('id-ID'),
          unitName,
          categoryName,
          status: ticket.status,
          responseTime: ticket.first_response_at
            ? Math.round((new Date(ticket.first_response_at).getTime() - new Date(ticket.created_at).getTime()) / (1000 * 60))
            : null,
          title: ticket.title
        };
      });

      console.log('📋 Detailed reports:', detailedReports.length, 'Total:', total);

      return { kpi, trends, riskAnalysis, detailedReports, totalReports: total };
    } catch (error) {
      console.error('❌ Error fetching report data:', error);
      return {
        kpi: { totalComplaints: 0, resolvedComplaints: 0, averageResponseTime: 0, projectedNextWeek: 0, totalComplaintsChange: 0, resolvedComplaintsChange: 0, averageResponseTimeChange: 0 },
        trends: [],
        riskAnalysis: [],
        detailedReports: [],
        totalReports: 0
      };
    }
  }

  async getUnits(): Promise<Unit[]> {
    try {
      const result = await supabaseService.getUnits();
      return result.data || [];
    } catch { return []; }
  }

  async getServiceCategories(): Promise<ServiceCategory[]> {
    try {
      const result = await supabaseService.getCategories();
      return result.data || [];
    } catch { return []; }
  }

  async exportToExcel(params?: ReportFilters): Promise<Blob> {
    const response = await api.get('/reports/export/excel', { params, responseType: 'blob' });
    return response.data;
  }

  async exportToPDF(params?: ReportFilters): Promise<Blob> {
    const response = await api.get('/reports/export/pdf', { params, responseType: 'blob' });
    return response.data;
  }
}

const reportService = new ReportService();
export { reportService };
export default reportService;
