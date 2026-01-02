import api from './api';

export interface ReportFilters {
  dateRange?: string;
  unitId?: string;
  categoryId?: string;
  status?: string;
  priority?: string;
}

export interface KPIData {
  totalComplaints: number;
  resolvedComplaints: number;
  averageResponseTime: number;
  projectedNextWeek: number;
  totalComplaintsChange: number;
  resolvedComplaintsChange: number;
  averageResponseTimeChange: number;
}

export interface TrendData {
  date: string;
  complaints: number;
  resolved: number;
}

export interface RiskAnalysis {
  unitName: string;
  riskPercentage: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface DetailedReport {
  id: string;
  ticketNumber: string;
  date: string;
  unitName: string;
  categoryName: string;
  status: string;
  responseTime: number;
  title: string;
}

export interface ReportData {
  kpi: KPIData;
  trends: TrendData[];
  riskAnalysis: RiskAnalysis[];
  detailedReports: DetailedReport[];
  totalReports: number;
}

class ReportService {
  async getReportData(filters: ReportFilters = {}, page: number = 1, limit: number = 10): Promise<ReportData> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== undefined && value !== '')
        )
      });

      const response = await api.get(`/reports?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching report data:', error);
      throw error;
    }
  }

  async exportToPDF(filters: ReportFilters = {}): Promise<Blob> {
    try {
      const params = new URLSearchParams(
        Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== undefined && value !== '')
        )
      );

      const response = await api.get(`/reports/export/pdf?${params}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting PDF:', error);
      throw error;
    }
  }

  async exportToExcel(filters: ReportFilters = {}): Promise<Blob> {
    try {
      const params = new URLSearchParams(
        Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== undefined && value !== '')
        )
      );

      const response = await api.get(`/reports/export/excel?${params}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting Excel:', error);
      throw error;
    }
  }

  async getUnits(): Promise<Array<{ id: string; name: string }>> {
    try {
      const response = await api.get('/reports/units');
      return response.data.map((unit: any) => ({
        id: unit.id,
        name: unit.name
      }));
    } catch (error) {
      console.error('Error fetching units:', error);
      throw error;
    }
  }

  async getServiceCategories(): Promise<Array<{ id: string; name: string }>> {
    try {
      const response = await api.get('/reports/categories');
      return response.data.map((category: any) => ({
        id: category.id,
        name: category.name
      }));
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }
}

export default new ReportService();