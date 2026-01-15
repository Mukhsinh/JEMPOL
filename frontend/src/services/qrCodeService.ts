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
  redirect_type?: 'selection' | 'internal_ticket' | 'external_ticket' | 'survey';
  auto_fill_unit?: boolean;
  show_options?: string[];
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
  redirect_type?: 'selection' | 'internal_ticket' | 'external_ticket' | 'survey';
  auto_fill_unit?: boolean;
  show_options?: string[];
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
    // Di Vercel production, gunakan Supabase langsung
    if (isVercelProduction()) {
      try {
        console.log(`🔄 Getting QR code by code ${code} via Supabase...`);
        const result = await supabaseService.getQRCodeByCode(code);
        if (!result.success || !result.data) {
          throw new Error(result.error || 'QR code tidak ditemukan');
        }
        console.log('✅ QR code found via Supabase');
        return result.data;
      } catch (error: any) {
        console.error('❌ Supabase getByCode failed:', error.message);
        throw error;
      }
    }

    try {
      const response = await api.get(`/qr-codes/scan/${code}`);
      return response.data;
    } catch (error: any) {
      // Fallback ke Supabase
      try {
        const result = await supabaseService.getQRCodeByCode(code);
        if (!result.success || !result.data) {
          throw new Error(result.error || 'QR code tidak ditemukan');
        }
        return result.data;
      } catch (supaError: any) {
        throw error;
      }
    }
  },

  // Create QR code (admin only)
  async createQRCode(data: CreateQRCodeData): Promise<any> {
    // Di Vercel production, gunakan Supabase langsung
    if (isVercelProduction()) {
      try {
        console.log('🔄 Creating QR code via Supabase...');
        const result = await supabaseService.createQRCode(data);
        if (!result.success) {
          throw new Error(result.error || 'Gagal membuat QR code');
        }
        console.log('✅ QR code created successfully via Supabase');
        return result.data;
      } catch (error: any) {
        console.error('❌ Supabase create failed:', error.message);
        throw error;
      }
    }

    try {
      console.log('🔄 Creating QR code...');
      const response = await api.post('/qr-codes', data);
      console.log('✅ QR code created successfully');
      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to create QR code:', error.message);
      // Fallback ke Supabase
      try {
        console.log('🔄 Trying Supabase fallback...');
        const result = await supabaseService.createQRCode(data);
        if (!result.success) {
          throw new Error(result.error || 'Gagal membuat QR code');
        }
        console.log('✅ QR code created via Supabase fallback');
        return result.data;
      } catch (supaError: any) {
        console.error('❌ Supabase fallback also failed:', supaError.message);
        throw error;
      }
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
      redirect_type?: 'selection' | 'internal_ticket' | 'external_ticket' | 'survey';
      auto_fill_unit?: boolean;
      show_options?: string[];
    }
  ): Promise<any> {
    // Di Vercel production, gunakan Supabase langsung
    if (isVercelProduction()) {
      try {
        console.log(`🔄 Updating QR code ${id} via Supabase...`);
        const result = await supabaseService.updateQRCode(id, data);
        if (!result.success) {
          throw new Error(result.error || 'Gagal mengupdate QR code');
        }
        console.log('✅ QR code updated successfully via Supabase');
        return result.data;
      } catch (error: any) {
        console.error('❌ Supabase update failed:', error.message);
        throw error;
      }
    }

    try {
      console.log(`🔄 Updating QR code ${id}...`);
      const response = await api.patch(`/qr-codes/${id}`, data);
      console.log('✅ QR code updated successfully');
      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to update QR code:', error.message);
      // Fallback ke Supabase
      try {
        console.log('🔄 Trying Supabase fallback...');
        const result = await supabaseService.updateQRCode(id, data);
        if (!result.success) {
          throw new Error(result.error || 'Gagal mengupdate QR code');
        }
        console.log('✅ QR code updated via Supabase fallback');
        return result.data;
      } catch (supaError: any) {
        console.error('❌ Supabase fallback also failed:', supaError.message);
        throw error;
      }
    }
  },

  // Delete QR code (admin only)
  async deleteQRCode(id: string): Promise<any> {
    // Di Vercel production, gunakan Supabase langsung
    if (isVercelProduction()) {
      try {
        console.log(`🔄 Deleting QR code ${id} via Supabase...`);
        const result = await supabaseService.deleteQRCode(id);
        if (!result.success) {
          throw new Error(result.error || 'Gagal menghapus QR code');
        }
        console.log('✅ QR code deleted successfully via Supabase');
        return result;
      } catch (error: any) {
        console.error('❌ Supabase delete failed:', error.message);
        throw error;
      }
    }

    try {
      console.log(`🔄 Deleting QR code ${id}...`);
      const response = await api.delete(`/qr-codes/${id}`);
      console.log('✅ QR code deleted successfully');
      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to delete QR code:', error.message);
      // Fallback ke Supabase
      try {
        console.log('🔄 Trying Supabase fallback...');
        const result = await supabaseService.deleteQRCode(id);
        if (!result.success) {
          throw new Error(result.error || 'Gagal menghapus QR code');
        }
        console.log('✅ QR code deleted via Supabase fallback');
        return result;
      } catch (supaError: any) {
        console.error('❌ Supabase fallback also failed:', supaError.message);
        throw error;
      }
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

  // Generate QR code URL - SELALU mengarah ke halaman fullscreen tanpa sidebar
  // Menggunakan route /form/:type untuk tampilan mobile-first yang clean
  // URL langsung ke form berdasarkan redirect_type
  generateQRUrl(code: string, redirectType?: string, unitId?: string, unitName?: string, _autoFillUnit?: boolean): string {
    const baseUrl = window.location.origin;
    
    // Jika ada redirect_type spesifik, langsung ke form yang sesuai
    if (redirectType && redirectType !== 'selection') {
      const params = new URLSearchParams();
      if (unitId) params.append('unit_id', unitId);
      if (unitName) params.append('unit_name', unitName);
      if (code) params.append('qr', code);
      
      const queryString = params.toString() ? `?${params.toString()}` : '';
      
      switch (redirectType) {
        case 'internal_ticket':
          return `${baseUrl}/form/internal${queryString}`;
        case 'external_ticket':
          return `${baseUrl}/form/eksternal${queryString}`;
        case 'survey':
          return `${baseUrl}/form/survey${queryString}`;
        default:
          return `${baseUrl}/m/${code}`;
      }
    }
    
    // Default: gunakan route /m/:code untuk tampilan selection menu
    return `${baseUrl}/m/${code}`;
  },

  // Generate QR code image URL (for display)
  // Mendukung redirect langsung ke form berdasarkan redirect_type
  generateQRImageUrl(
    code: string, 
    size: number = 200, 
    redirectType?: string, 
    unitId?: string, 
    unitName?: string, 
    autoFillUnit?: boolean
  ): string {
    const url = this.generateQRUrl(code, redirectType, unitId, unitName, autoFillUnit);
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}`;
  },
};

export default qrCodeService;