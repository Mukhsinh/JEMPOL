import api from './api';

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
    const response = await api.post('/qr-codes', data);
    return response.data;
  },

  // Get QR codes (admin only)
  async getQRCodes(params?: {
    page?: number;
    limit?: number;
    unit_id?: string;
    is_active?: boolean;
    search?: string;
    include_analytics?: boolean;
  }): Promise<{ qr_codes: QRCode[]; pagination: any }> {
    const response = await api.get('/qr-codes', { params });
    return response.data;
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
    const response = await api.patch(`/qr-codes/${id}`, data);
    return response.data;
  },

  // Delete QR code (admin only)
  async deleteQRCode(id: string): Promise<any> {
    const response = await api.delete(`/qr-codes/${id}`);
    return response.data;
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