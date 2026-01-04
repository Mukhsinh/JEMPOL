import api, { isVercelProduction } from './api';
import { supabaseService } from './supabaseService';

export interface QRCode {
  id: string;
  unit_id: string;
  code: string;
  token: string;
  name: string;
  description?: string;
  is_active: boolean;
  usage_count: number;
  created_at: string;
  updated_at: string;
  units?: {
    id: string;
    name: string;
    code: string;
    description?: string;
  };
  analytics?: {
    scans_30d: number;
    tickets_30d: number;
    trend: number[];
  };
}

export interface CreateQRCodeData {
  unit_id: string;
  name: string;
  description?: string;
}

export interface QRCodeAnalytics {
  analytics: Array<{
    qr_code_id: string;
    scan_date: string;
    scan_count: number;
    ticket_count: number;
    unique_visitors: number;
  }>;
  summary: {
    total_scans: number;
    total_tickets: number;
    total_unique_visitors: number;
    conversion_rate: number;
    average_daily_scans: number;
  };
}

export const qrCodeService = {
  // Get QR code by code (public endpoint for scanning)
  async getByCode(code: string): Promise<QRCode> {
    const response = await api.get(`/qr-codes/scan/${code}`);
    return response.data;
  },

  // Create QR code (admin only)
  async createQRCode(data: CreateQRCodeData): Promise<any> {
    try {
      console.log('🔄 Creating QR code...');
      const response = await api.post('/qr-codes', data);
      console.log('✅ QR code created successfully');
      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to create QR code:', error.message);
      throw error;
    }
  },

  // Get QR codes (admin only) with improved error handling
  async getQRCodes(params?: {
    page?: number;
    limit?: number;
    unit_id?: string;
    is_active?: boolean;
    search?: string;
    include_analytics?: boolean;
  }): Promise<{ qr_codes: QRCode[]; pagination: any }> {
    // Di Vercel production, gunakan Supabase langsung
    if (isVercelProduction()) {
      try {
        const result = await supabaseService.getQRCodes();
        return {
          qr_codes: result.data || [],
          pagination: {
            page: params?.page || 1,
            limit: params?.limit || 10,
            total: result.data?.length || 0,
            pages: Math.ceil((result.data?.length || 0) / (params?.limit || 10))
          }
        };
      } catch (error: any) {
        console.error('❌ Supabase direct failed:', error.message);
        return {
          qr_codes: [],
          pagination: { page: 1, limit: 10, total: 0, pages: 0 }
        };
      }
    }
    
    try {
      console.log('🔄 Fetching QR codes...');
      const response = await api.get('/qr-codes', { params });
      console.log('✅ QR codes fetched successfully');
      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to fetch QR codes:', error.message);
      // Fallback ke Supabase langsung
      try {
        const result = await supabaseService.getQRCodes();
        return {
          qr_codes: result.data || [],
          pagination: {
            page: params?.page || 1,
            limit: params?.limit || 10,
            total: result.data?.length || 0,
            pages: Math.ceil((result.data?.length || 0) / (params?.limit || 10))
          }
        };
      } catch (supaError: any) {
        console.error('❌ Supabase fallback also failed:', supaError.message);
      }
      
      return {
        qr_codes: [],
        pagination: { page: 1, limit: 10, total: 0, pages: 0 }
      };
    }
  },

  // Get QR code by ID (admin only)
  async getQRCodeById(id: string): Promise<QRCode> {
    const response = await api.get(`/qr-codes/${id}`);
    return response.data;
  },

  // Update QR code (admin only)
  async updateQRCode(
    id: string,
    data: {
      name?: string;
      description?: string;
      is_active?: boolean;
    }
  ): Promise<any> {
    try {
      console.log(`🔄 Updating QR code ${id}...`);
      const response = await api.patch(`/qr-codes/${id}`, data);
      console.log('✅ QR code updated successfully');
      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to update QR code:', error.message);
      throw error;
    }
  },

  // Delete QR code (admin only)
  async deleteQRCode(id: string): Promise<any> {
    try {
      console.log(`🔄 Deleting QR code ${id}...`);
      const response = await api.delete(`/qr-codes/${id}`);
      console.log('✅ QR code deleted successfully');
      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to delete QR code:', error.message);
      throw error;
    }
  },

  // Get QR code analytics (admin only)
  async getAnalytics(
    id: string,
    params?: {
      date_from?: string;
      date_to?: string;
    }
  ): Promise<QRCodeAnalytics> {
    const response = await api.get(`/qr-codes/${id}/analytics`, { params });
    return response.data;
  },

  // Get QR code statistics (admin only)
  async getStats(): Promise<any> {
    const response = await api.get('/qr-codes/stats');
    return response.data;
  },

  // Generate QR code URL
  generateQRUrl(code: string): string {
    return `${window.location.origin}/tiket-eksternal/${code}`;
  },

  // Generate QR code image URL (for display)
  generateQRImageUrl(code: string, size: number = 200): string {
    const url = this.generateQRUrl(code);
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}`;
  },
};

export default qrCodeService;