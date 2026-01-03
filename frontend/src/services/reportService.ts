import api from './api';

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
  // Helper function untuk fallback ke public endpoint
  private async withPublicFallback<T>(
    primaryEndpoint: string,
    publicEndpoint: string,
    defaultData: T[] = []
  ): Promise<T[]> {
    try {
      const response = await api.get(primaryEndpoint);
      return response.data || [];
    } catch (error) {
      console.warn(`Primary endpoint ${primaryEndpoint} failed, trying public fallback...`, error);
      try {
        const fallbackResponse = await api.get(publicEndpoint);
        return fallbackResponse.data || [];
      } catch (fallbackError) {
        console.error(`Public fallback ${publicEndpoint} also failed:`, fallbackError);
        return defaultData;
      }
    }
  }

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
    try {
      const response = await api.get('/reports', { params });
      return response.data || {
        data: [],
        summary: {
          total_tickets: 0,
          open_tickets: 0,
          in_progress_tickets: 0,
          resolved_tickets: 0,
          closed_tickets: 0,
          average_resolution_time: 0
        },
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0
        }
      };
    } catch (error) {
      console.error('Error fetching report data:', error);
      return {
        data: [],
        summary: {
          total_tickets: 0,
          open_tickets: 0,
          in_progress_tickets: 0,
          resolved_tickets: 0,
          closed_tickets: 0,
          average_resolution_time: 0
        },
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0
        }
      };
    }
  }

  async getUnits(): Promise<Unit[]> {
    return this.withPublicFallback<Unit>(
      '/reports/units',
      '/master-data/public/units'
    );
  }

  async getServiceCategories(): Promise<ServiceCategory[]> {
    return this.withPublicFallback<ServiceCategory>(
      '/reports/categories',
      '/master-data/public/service-categories'
    );
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