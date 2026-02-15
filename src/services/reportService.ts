import api from './api';
import { supabaseService } from './supabaseService';
import { supabase } from '../utils/supabaseClient';

export interface TrendData {
  date: string;
  complaints: number;
  resolved: number;
}

export interface PeriodTrendData {
  period: string;
  total: number;
  complaints: number;
  suggestions: number;
  information: number;
}

export interface CategoryTrendData {
  categoryName: string;
  count: number;
  percentage: number;
}

export interface PatientTypeTrendData {
  patientTypeName: string;
  count: number;
  percentage: number;
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
  patientTypeName: string;
  status: string;
  responseTime: number | null;
  title: string;
  description?: string;
  reporterName?: string;
  reporterEmail?: string;
  reporterPhone?: string;
  reporterAddress?: string;
  reporterIdentityType?: string;
  ageRange?: string;
  source?: string;
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
  totalSuggestions: number;
  totalSuggestionsChange: number;
  totalRequests: number;
  totalRequestsChange: number;
  totalSurveys: number;
  totalSurveysChange: number;
  resolvedComplaints: number;
  resolvedComplaintsChange: number;
  averageResponseTime: number;
  averageResponseTimeChange: number;
  projectedNextWeek: number;
}

export interface FullReportData {
  kpi: KPIData;
  trends: TrendData[];
  periodTrends: {
    daily: PeriodTrendData[];
    weekly: PeriodTrendData[];
    monthly: PeriodTrendData[];
    quarterly: PeriodTrendData[];
    semester: PeriodTrendData[];
    yearly: PeriodTrendData[];
  };
  categoryTrends: CategoryTrendData[];
  patientTypeTrends?: PatientTypeTrendData[];
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
  patient_types: { id: string; name: string; code: string } | null;
  type: string;
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

      // OPTIMASI: Query kedua tabel sekaligus dengan Promise.all
      let ticketsQuery = supabase.from('tickets')
        .select('id, status, created_at')
        .gte('created_at', sevenDaysAgo.toISOString())
        .lte('created_at', now.toISOString());

      let externalQuery = supabase.from('external_tickets')
        .select('id, status, created_at')
        .gte('created_at', sevenDaysAgo.toISOString())
        .lte('created_at', now.toISOString());

      if (unitId) {
        ticketsQuery = ticketsQuery.eq('unit_id', unitId);
        externalQuery = externalQuery.eq('unit_id', unitId);
      }
      if (categoryId) {
        ticketsQuery = ticketsQuery.eq('category_id', categoryId);
        externalQuery = externalQuery.eq('service_category_id', categoryId);
      }

      const [ticketsResult, externalResult] = await Promise.all([ticketsQuery, externalQuery]);
      
      if (ticketsResult.error || externalResult.error) {
        console.error('❌ Error fetching trend data:', ticketsResult.error || externalResult.error);
        return [];
      }

      const allTickets = [...(ticketsResult.data || []), ...(externalResult.data || [])];
      console.log('✅ Trend tickets found:', allTickets.length);

      // Group by date
      const ticketsByDate: { [key: string]: { complaints: number; resolved: number } } = {};
      
      allTickets.forEach((ticket: { id: string; status: string; created_at: string }) => {
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

  private async calculatePeriodTrends(unitId?: string, categoryId?: string): Promise<{
    daily: PeriodTrendData[];
    weekly: PeriodTrendData[];
    monthly: PeriodTrendData[];
    quarterly: PeriodTrendData[];
    semester: PeriodTrendData[];
    yearly: PeriodTrendData[];
  }> {
    try {
      const now = new Date();
      const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

      console.log('📊 Calculating period trends from', oneYearAgo.toISOString());

      // Query tickets dengan type
      let ticketsQuery = supabase.from('tickets')
        .select('id, type, created_at')
        .gte('created_at', oneYearAgo.toISOString());

      let externalQuery = supabase.from('external_tickets')
        .select('id, service_type, created_at')
        .gte('created_at', oneYearAgo.toISOString());

      if (unitId) {
        ticketsQuery = ticketsQuery.eq('unit_id', unitId);
        externalQuery = externalQuery.eq('unit_id', unitId);
      }
      if (categoryId) {
        ticketsQuery = ticketsQuery.eq('category_id', categoryId);
        externalQuery = externalQuery.eq('service_category_id', categoryId);
      }

      const [ticketsResult, externalResult] = await Promise.all([ticketsQuery, externalQuery]);

      if (ticketsResult.error || externalResult.error) {
        console.error('❌ Error fetching period trend data');
        return { daily: [], weekly: [], monthly: [], quarterly: [], semester: [], yearly: [] };
      }

      const allTickets = [
        ...(ticketsResult.data || []).map((t: any) => ({ ...t, type: t.type || 'complaint' })),
        ...(externalResult.data || []).map((et: any) => ({ ...et, type: et.service_type || 'complaint' }))
      ];

      // Helper function untuk group tickets
      const groupByPeriod = (tickets: any[], periodFn: (date: Date) => string, periods: string[]) => {
        const grouped: { [key: string]: { total: number; complaints: number; suggestions: number; information: number } } = {};
        
        periods.forEach(p => {
          grouped[p] = { total: 0, complaints: 0, suggestions: 0, information: 0 };
        });

        tickets.forEach(ticket => {
          const date = new Date(ticket.created_at);
          const periodKey = periodFn(date);
          if (grouped[periodKey]) {
            grouped[periodKey].total++;
            if (ticket.type === 'complaint') grouped[periodKey].complaints++;
            else if (ticket.type === 'suggestion') grouped[periodKey].suggestions++;
            else if (ticket.type === 'information') grouped[periodKey].information++;
          }
        });

        return periods.map(p => ({
          period: p,
          ...grouped[p]
        }));
      };

      // Daily (7 hari terakhir)
      const dailyPeriods: string[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        dailyPeriods.push(d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }));
      }
      const daily = groupByPeriod(allTickets, (date) => date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }), dailyPeriods);

      // Weekly (8 minggu terakhir)
      const weeklyPeriods: string[] = [];
      for (let i = 7; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - (i * 7));
        const weekNum = Math.ceil(d.getDate() / 7);
        weeklyPeriods.push(`Minggu ${weekNum} ${d.toLocaleDateString('id-ID', { month: 'short' })}`);
      }
      const weekly = groupByPeriod(allTickets, (date) => {
        const weekNum = Math.ceil(date.getDate() / 7);
        return `Minggu ${weekNum} ${date.toLocaleDateString('id-ID', { month: 'short' })}`;
      }, weeklyPeriods);

      // Monthly (12 bulan terakhir)
      const monthlyPeriods: string[] = [];
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        monthlyPeriods.push(d.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }));
      }
      const monthly = groupByPeriod(allTickets, (date) => date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }), monthlyPeriods);

      // Quarterly (4 kuartal terakhir)
      const quarterlyPeriods: string[] = [];
      for (let i = 3; i >= 0; i--) {
        const quarterMonth = Math.floor(now.getMonth() / 3) * 3 - (i * 3);
        const d = new Date(now.getFullYear(), quarterMonth, 1);
        const q = Math.floor(d.getMonth() / 3) + 1;
        quarterlyPeriods.push(`Q${q} ${d.getFullYear()}`);
      }
      const quarterly = groupByPeriod(allTickets, (date) => {
        const q = Math.floor(date.getMonth() / 3) + 1;
        return `Q${q} ${date.getFullYear()}`;
      }, quarterlyPeriods);

      // Semester (4 semester terakhir)
      const semesterPeriods: string[] = [];
      for (let i = 3; i >= 0; i--) {
        const semesterMonth = Math.floor(now.getMonth() / 6) * 6 - (i * 6);
        const d = new Date(now.getFullYear(), semesterMonth, 1);
        const s = Math.floor(d.getMonth() / 6) + 1;
        semesterPeriods.push(`Semester ${s} ${d.getFullYear()}`);
      }
      const semester = groupByPeriod(allTickets, (date) => {
        const s = Math.floor(date.getMonth() / 6) + 1;
        return `Semester ${s} ${date.getFullYear()}`;
      }, semesterPeriods);

      // Yearly (3 tahun terakhir)
      const yearlyPeriods: string[] = [];
      for (let i = 2; i >= 0; i--) {
        yearlyPeriods.push(`${now.getFullYear() - i}`);
      }
      const yearly = groupByPeriod(allTickets, (date) => `${date.getFullYear()}`, yearlyPeriods);

      console.log('📊 Period trends calculated');
      return { daily, weekly, monthly, quarterly, semester, yearly };
    } catch (error) {
      console.error('❌ Error calculating period trends:', error);
      return { daily: [], weekly: [], monthly: [], quarterly: [], semester: [], yearly: [] };
    }
  }

  private async calculatePatientTypeTrends(startDate: Date, unitId?: string): Promise<PatientTypeTrendData[]> {
    try {
      console.log('📊 Calculating patient type trends from', startDate.toISOString());

      // Query external tickets dengan patient types
      let externalTicketsQuery = supabase.from('external_tickets')
        .select(`
          id,
          patient_type_id,
          patient_types (id, name)
        `)
        .gte('created_at', startDate.toISOString());

      if (unitId) externalTicketsQuery = externalTicketsQuery.eq('unit_id', unitId);

      const { data: externalTickets, error } = await externalTicketsQuery;

      if (error) {
        console.error('❌ Error fetching external tickets for patient type trends:', error);
        return [];
      }

      // Hitung per jenis pasien
      const patientTypeCount: { [key: string]: number } = {};
      (externalTickets || []).forEach((ticket: any) => {
        const typeName = ticket.patient_types?.name || 'Tidak Diketahui';
        patientTypeCount[typeName] = (patientTypeCount[typeName] || 0) + 1;
      });

      const totalTickets = externalTickets?.length || 0;

      // Convert ke array dan sort
      const patientTypeTrends: PatientTypeTrendData[] = Object.entries(patientTypeCount)
        .map(([patientTypeName, count]) => ({
          patientTypeName,
          count,
          percentage: totalTickets > 0 ? Math.round((count / totalTickets) * 100) : 0
        }))
        .sort((a, b) => b.count - a.count);

      console.log('📊 Patient type trends calculated:', patientTypeTrends);
      return patientTypeTrends;
    } catch (error) {
      console.error('❌ Error calculating patient type trends:', error);
      return [];
    }
  }

  private async calculateCategoryTrends(startDate: Date, unitId?: string): Promise<CategoryTrendData[]> {
    try {
      console.log('📊 Calculating category trends from', startDate.toISOString());

      // Query tickets internal dengan kategori
      let ticketsQuery = supabase.from('tickets')
        .select(`
          id,
          category_id,
          service_categories (id, name)
        `)
        .gte('created_at', startDate.toISOString());

      if (unitId) ticketsQuery = ticketsQuery.eq('unit_id', unitId);

      // Query external tickets dengan kategori
      let externalTicketsQuery = supabase.from('external_tickets')
        .select(`
          id,
          service_category_id,
          service_categories (id, name)
        `)
        .gte('created_at', startDate.toISOString());

      if (unitId) externalTicketsQuery = externalTicketsQuery.eq('unit_id', unitId);

      const [ticketsResult, externalTicketsResult] = await Promise.all([
        ticketsQuery,
        externalTicketsQuery
      ]);

      if (ticketsResult.error) {
        console.error('❌ Error fetching tickets for category trends:', ticketsResult.error);
        return [];
      }
      if (externalTicketsResult.error) {
        console.error('❌ Error fetching external tickets for category trends:', externalTicketsResult.error);
        return [];
      }

      // Gabungkan data
      const allTickets = [
        ...(ticketsResult.data || []).map((t: any) => ({
          categoryName: t.service_categories?.name || 'Tidak Berkategori'
        })),
        ...(externalTicketsResult.data || []).map((et: any) => ({
          categoryName: et.service_categories?.name || 'Tidak Berkategori'
        }))
      ];

      // Hitung per kategori
      const categoryCount: { [key: string]: number } = {};
      allTickets.forEach(ticket => {
        const catName = ticket.categoryName;
        categoryCount[catName] = (categoryCount[catName] || 0) + 1;
      });

      const totalTickets = allTickets.length;

      // Convert ke array dan sort
      const categoryTrends: CategoryTrendData[] = Object.entries(categoryCount)
        .map(([categoryName, count]) => ({
          categoryName,
          count,
          percentage: totalTickets > 0 ? Math.round((count / totalTickets) * 100) : 0
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10); // Ambil top 10 kategori

      console.log('📊 Category trends calculated:', categoryTrends);
      return categoryTrends;
    } catch (error) {
      console.error('❌ Error calculating category trends:', error);
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
      
      // OPTIMASI: Query hanya field yang diperlukan untuk mengurangi payload
      let ticketsQuery = supabase.from('tickets')
        .select(`
          id,
          ticket_number,
          title,
          description,
          status,
          priority,
          created_at,
          first_response_at,
          sla_deadline,
          unit_id,
          category_id,
          type,
          units!inner (id, name, code),
          service_categories (id, name, code),
          patient_types (id, name, code)
        `)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (params?.unitId) ticketsQuery = ticketsQuery.eq('unit_id', params.unitId);
      if (params?.categoryId) ticketsQuery = ticketsQuery.eq('category_id', params.categoryId);
      if (params?.status) ticketsQuery = ticketsQuery.eq('status', params.status);
      if (params?.priority) ticketsQuery = ticketsQuery.eq('priority', params.priority);

      // OPTIMASI: Query hanya field yang diperlukan
      let externalTicketsQuery = supabase.from('external_tickets')
        .select(`
          id,
          ticket_number,
          title,
          description,
          status,
          priority,
          created_at,
          first_response_at,
          sla_deadline,
          unit_id,
          service_category_id,
          service_type,
          reporter_name,
          reporter_email,
          reporter_phone,
          reporter_address,
          reporter_identity_type,
          age_range,
          source,
          units!inner (id, name, code),
          service_categories (id, name, code),
          patient_types (id, name, code)
        `)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (params?.unitId) externalTicketsQuery = externalTicketsQuery.eq('unit_id', params.unitId);
      if (params?.categoryId) externalTicketsQuery = externalTicketsQuery.eq('service_category_id', params.categoryId);
      if (params?.status) externalTicketsQuery = externalTicketsQuery.eq('status', params.status);
      if (params?.priority) externalTicketsQuery = externalTicketsQuery.eq('priority', params.priority);

      const [ticketsResult, externalTicketsResult] = await Promise.all([
        ticketsQuery,
        externalTicketsQuery
      ]);
      
      if (ticketsResult.error) {
        console.error('❌ Error fetching tickets:', ticketsResult.error);
        throw ticketsResult.error;
      }
      if (externalTicketsResult.error) {
        console.error('❌ Error fetching external tickets:', externalTicketsResult.error);
        throw externalTicketsResult.error;
      }

      console.log('✅ Fetched internal tickets:', ticketsResult.data?.length || 0);
      console.log('✅ Fetched external tickets:', externalTicketsResult.data?.length || 0);

      // Normalize internal tickets
      const internalTickets = (ticketsResult.data || []).map((t: any) => ({
        id: t.id,
        ticket_number: t.ticket_number,
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        created_at: t.created_at,
        first_response_at: t.first_response_at,
        sla_deadline: t.sla_deadline,
        unit_id: t.unit_id,
        category_id: t.category_id,
        units: t.units,
        service_categories: t.service_categories,
        patient_types: t.patient_types,
        type: t.type || 'complaint',
        reporter_name: null,
        reporter_email: null,
        reporter_phone: null,
        reporter_address: null,
        reporter_identity_type: null,
        age_range: null,
        source: 'internal'
      }));

      // Normalize external tickets
      const externalTickets = (externalTicketsResult.data || []).map((et: any) => ({
        id: et.id,
        ticket_number: et.ticket_number,
        title: et.title,
        description: et.description,
        status: et.status,
        priority: et.priority,
        created_at: et.created_at,
        first_response_at: et.first_response_at,
        sla_deadline: et.sla_deadline,
        unit_id: et.unit_id,
        category_id: et.service_category_id,
        units: et.units,
        service_categories: et.service_categories,
        patient_types: et.patient_types,
        type: et.service_type || 'complaint',
        reporter_name: et.reporter_name,
        reporter_email: et.reporter_email,
        reporter_phone: et.reporter_phone,
        reporter_address: et.reporter_address,
        reporter_identity_type: et.reporter_identity_type,
        age_range: et.age_range,
        source: et.source || 'external'
      }));

      // Gabungkan semua tickets
      const allTickets = [...internalTickets, ...externalTickets] as TicketRecord[];

      const totalComplaints = allTickets.filter(t => t.type === 'complaint').length;
      const totalSuggestions = allTickets.filter(t => t.type === 'suggestion').length;
      const totalRequests = allTickets.filter(t => t.type === 'information').length;
      const totalSurveys = allTickets.filter(t => t.type === 'satisfaction').length;
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
      
      const [prevTicketsResult, prevExternalResult] = await Promise.all([
        supabase.from('tickets')
          .select('id, status, type')
          .gte('created_at', previousStartDate.toISOString())
          .lt('created_at', startDate.toISOString()),
        supabase.from('external_tickets')
          .select('id, status, service_type')
          .gte('created_at', previousStartDate.toISOString())
          .lt('created_at', startDate.toISOString())
      ]);

      const previousTickets = [
        ...(prevTicketsResult.data || []).map((t: any) => ({ ...t, type: t.type })),
        ...(prevExternalResult.data || []).map((et: any) => ({ ...et, type: et.service_type }))
      ];

      const previousResolved = previousTickets.filter((t: any) => t.status === 'resolved' || t.status === 'closed').length;
      const previousComplaints = previousTickets.filter((t: any) => t.type === 'complaint').length;
      const previousSuggestions = previousTickets.filter((t: any) => t.type === 'suggestion').length;
      const previousRequests = previousTickets.filter((t: any) => t.type === 'information').length;
      const previousSurveys = previousTickets.filter((t: any) => t.type === 'satisfaction').length;

      const totalComplaintsChange = previousComplaints > 0 ? Math.round(((totalComplaints - previousComplaints) / previousComplaints) * 100) : (totalComplaints > 0 ? 100 : 0);
      const totalSuggestionsChange = previousSuggestions > 0 ? Math.round(((totalSuggestions - previousSuggestions) / previousSuggestions) * 100) : (totalSuggestions > 0 ? 100 : 0);
      const totalRequestsChange = previousRequests > 0 ? Math.round(((totalRequests - previousRequests) / previousRequests) * 100) : (totalRequests > 0 ? 100 : 0);
      const totalSurveysChange = previousSurveys > 0 ? Math.round(((totalSurveys - previousSurveys) / previousSurveys) * 100) : (totalSurveys > 0 ? 100 : 0);
      const resolvedComplaintsChange = previousResolved > 0 ? Math.round(((resolvedCount - previousResolved) / previousResolved) * 100) : (resolvedCount > 0 ? 100 : 0);

      const kpi: KPIData = {
        totalComplaints,
        totalSuggestions,
        totalRequests,
        totalSurveys,
        resolvedComplaints: resolvedCount,
        averageResponseTime,
        projectedNextWeek: Math.max(Math.round(total * 1.1), 8),
        totalComplaintsChange,
        totalSuggestionsChange,
        totalRequestsChange,
        totalSurveysChange,
        resolvedComplaintsChange,
        averageResponseTimeChange: -2
      };

      const trends = await this.calculateTrends(params?.unitId, params?.categoryId);
      const periodTrends = await this.calculatePeriodTrends(params?.unitId, params?.categoryId);
      const categoryTrends = await this.calculateCategoryTrends(startDate, params?.unitId);
      const patientTypeTrends = await this.calculatePatientTypeTrends(startDate, params?.unitId);
      const riskAnalysis = await this.calculateRiskAnalysis(startDate);

      const page = params?.page || 1;
      const limit = params?.limit || 10;
      const offset = (page - 1) * limit;
      
      // Map detailed reports dengan patient_type_name dan detail pasien
      const detailedReports: DetailedReport[] = allTickets.slice(offset, offset + limit).map((ticket: any) => {
        const unitName = ticket.units?.name || 'N/A';
        const categoryName = ticket.service_categories?.name || 'Tidak Berkategori';
        const patientTypeName = ticket.patient_types?.name || '-';
        
        return {
          id: ticket.id,
          ticketNumber: ticket.ticket_number || '-',
          date: new Date(ticket.created_at).toLocaleDateString('id-ID'),
          unitName,
          categoryName,
          patientTypeName,
          status: ticket.status,
          responseTime: ticket.first_response_at
            ? Math.round((new Date(ticket.first_response_at).getTime() - new Date(ticket.created_at).getTime()) / (1000 * 60))
            : null,
          title: ticket.title,
          description: ticket.description,
          reporterName: ticket.reporter_name,
          reporterEmail: ticket.reporter_email,
          reporterPhone: ticket.reporter_phone,
          reporterAddress: ticket.reporter_address,
          reporterIdentityType: ticket.reporter_identity_type,
          ageRange: ticket.age_range,
          source: ticket.source
        };
      });

      console.log('📋 Detailed reports:', detailedReports.length, 'Total:', total);

      return { kpi, trends, periodTrends, categoryTrends, patientTypeTrends, riskAnalysis, detailedReports, totalReports: total };
    } catch (error) {
      console.error('❌ Error fetching report data:', error);
      return {
        kpi: { 
          totalComplaints: 0, 
          totalSuggestions: 0,
          totalRequests: 0,
          totalSurveys: 0,
          resolvedComplaints: 0, 
          averageResponseTime: 0, 
          projectedNextWeek: 0, 
          totalComplaintsChange: 0,
          totalSuggestionsChange: 0,
          totalRequestsChange: 0,
          totalSurveysChange: 0,
          resolvedComplaintsChange: 0, 
          averageResponseTimeChange: 0 
        },
        trends: [],
        periodTrends: { daily: [], weekly: [], monthly: [], quarterly: [], semester: [], yearly: [] },
        categoryTrends: [],
        patientTypeTrends: [],
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
