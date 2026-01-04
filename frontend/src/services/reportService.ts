import api, { isVercelProduction } from './api';
import { supabaseService } from './supabaseService';
import { supabase } from '../utils/supabaseClient';

export interface ReportData {
  id: string;
  ticket_number: string;
  title: string;
  type: string;
  status: string;
  priority: string;
  created_at: string;
  resolved_at?: string;
  unit?: {
    name: string;
    code: string;
  };
  category?: {
    name: string;
    code: string;
  };
  // KPI data
  kpi?: {
    totalComplaints: number;
    totalComplaintsChange: number;
    resolvedComplaints: number;
    resolvedComplaintsChange: number;
    averageResponseTime: number;
    averageResponseTimeChange: number;
    projectedNextWeek: number;
  };
  // Trend data
  trends?: Array<{
    date: string;
    complaints: number;
    resolved: number;
  }>;
  // Risk analysis
  riskAnalysis?: Array<{
    category: string;
    level: string;
    count: number;
    description: string;
  }>;
  // Detailed reports
  detailedReports?: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
    created_at: string;
  }>;
  // Pagination
  totalReports?: number;
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

class ReportService {
  async getReportData(params?: {
    page?: number;
    limit?: number;
    dateRange?: string;
    unitId?: string;
    categoryId?: string;
    status?: string;
    priority?: string;
  }): Promise<{
    data: ReportData[];
    summary: ReportSummary;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    // Di Vercel production, gunakan Supabase langsung
    if (isVercelProduction()) {
      try {
        const { data: tickets, error } = await supabase
          .from('tickets')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(params?.limit || 50);

        if (error) throw error;

        const total = tickets?.length || 0;
        const resolved = tickets?.filter((t: any) => t.status === 'resolved').length || 0;

        return {
          data: tickets || [],
          summary: {
            total_tickets: total,
            open_tickets: tickets?.filter((t: any) => t.status === 'open').length || 0,
            in_progress_tickets: tickets?.filter((t: any) => t.status === 'in_progress').length || 0,
            resolved_tickets: resolved,
            closed_tickets: tickets?.filter((t: any) => t.status === 'closed').length || 0,
            average_resolution_time: 30
          },
          pagination: {
            page: params?.page || 1,
            limit: params?.limit || 10,
            total,
            totalPages: Math.ceil(total / (params?.limit || 10))
          }
        };
      } catch (error) {
        console.error('Supabase direct report error:', error);
        return {
          data: [],
          summary: { total_tickets: 0, open_tickets: 0, in_progress_tickets: 0, resolved_tickets: 0, closed_tickets: 0, average_resolution_time: 0 },
          pagination: { page: 1, limit: 10, total: 0, totalPages: 0 }
        };
      }
    }

    try {
      const response = await api.get('/reports', { params });
      return response.data || {
        data: [],
        summary: { total_tickets: 0, open_tickets: 0, in_progress_tickets: 0, resolved_tickets: 0, closed_tickets: 0, average_resolution_time: 0 },
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 }
      };
    } catch (error) {
      console.error('Error fetching report data:', error);
      // Fallback ke Supabase
      try {
        const { data: tickets } = await supabase.from('tickets').select('*').order('created_at', { ascending: false }).limit(50);
        const total = tickets?.length || 0;
        return {
          data: tickets || [],
          summary: {
            total_tickets: total,
            open_tickets: tickets?.filter((t: any) => t.status === 'open').length || 0,
            in_progress_tickets: tickets?.filter((t: any) => t.status === 'in_progress').length || 0,
            resolved_tickets: tickets?.filter((t: any) => t.status === 'resolved').length || 0,
            closed_tickets: tickets?.filter((t: any) => t.status === 'closed').length || 0,
            average_resolution_time: 30
          },
          pagination: { page: 1, limit: 10, total, totalPages: Math.ceil(total / 10) }
        };
      } catch {
        return {
          data: [],
          summary: { total_tickets: 0, open_tickets: 0, in_progress_tickets: 0, resolved_tickets: 0, closed_tickets: 0, average_resolution_time: 0 },
          pagination: { page: 1, limit: 10, total: 0, totalPages: 0 }
        };
      }
    }
  }

  async getUnits(): Promise<Unit[]> {
    if (isVercelProduction()) {
      const result = await supabaseService.getUnits();
      return result.data || [];
    }
    try {
      const response = await api.get('/reports/units');
      return response.data || [];
    } catch {
      const result = await supabaseService.getUnits();
      return result.data || [];
    }
  }

  async getServiceCategories(): Promise<ServiceCategory[]> {
    if (isVercelProduction()) {
      const result = await supabaseService.getCategories();
      return result.data || [];
    }
    try {
      const response = await api.get('/reports/categories');
      return response.data || [];
    } catch {
      const result = await supabaseService.getCategories();
      return result.data || [];
    }
  }

  async exportToExcel(params?: any): Promise<Blob> {
    try {
      const response = await api.get('/reports/export/excel', {
        params,
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      throw error;
    }
  }

  async exportToPDF(params?: any): Promise<Blob> {
    try {
      const response = await api.get('/reports/export/pdf', {
        params,
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      throw error;
    }
  }

  // Survey report methods
  async getSurveyReports(startDate: string, endDate: string): Promise<any[]> {
    try {
      const response = await api.get('/reports/surveys', {
        params: { start_date: startDate, end_date: endDate }
      });
      return response.data || [];
    } catch (error) {
      console.error('Error fetching survey reports:', error);
      return [];
    }
  }

  async getSurveyStats(startDate: string, endDate: string): Promise<any> {
    try {
      const response = await api.get('/reports/surveys/stats', {
        params: { start_date: startDate, end_date: endDate }
      });
      return response.data || {
        total_surveys: 0,
        total_responses: 0,
        average_completion_rate: 0,
        active_surveys: 0
      };
    } catch (error) {
      console.error('Error fetching survey stats:', error);
      return {
        total_surveys: 0,
        total_responses: 0,
        average_completion_rate: 0,
        active_surveys: 0
      };
    }
  }

  async exportSurveyReport(startDate: string, endDate: string): Promise<void> {
    try {
      const response = await api.get('/reports/surveys/export', {
        params: { start_date: startDate, end_date: endDate },
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `survey-report-${startDate}-to-${endDate}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting survey report:', error);
      throw error;
    }
  }
}

const reportService = new ReportService();
export { reportService };
export default reportService;