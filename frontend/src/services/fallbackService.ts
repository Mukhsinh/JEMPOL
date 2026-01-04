import api from './api';

/**
 * Fallback service untuk mengakses endpoint publik ketika autentikasi gagal
 */
class FallbackService {
  
  // Fallback untuk mendapatkan tickets tanpa autentikasi
  async getPublicTickets(params: any = {}) {
    try {
      const response = await api.get('/complaints/public/tickets', { params });
      return response.data;
    } catch (error) {
      console.error('Fallback getPublicTickets error:', error);
      return {
        success: false,
        error: 'Tidak dapat mengambil data tiket',
        data: []
      };
    }
  }

  // Fallback untuk mendapatkan units tanpa autentikasi
  async getPublicUnits() {
    try {
      const response = await api.get('/public/units');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Fallback getPublicUnits error:', error);
      return {
        success: false,
        error: 'Tidak dapat mengambil data unit',
        data: []
      };
    }
  }

  // Fallback untuk mendapatkan categories tanpa autentikasi
  async getPublicCategories() {
    try {
      const response = await api.get('/public/categories');
      return response.data;
    } catch (error) {
      console.error('Fallback getPublicCategories error:', error);
      return {
        success: false,
        error: 'Tidak dapat mengambil data kategori',
        data: []
      };
    }
  }

  // Test koneksi ke backend
  async testConnection() {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (error) {
      console.error('Connection test failed:', error);
      return {
        success: false,
        error: 'Tidak dapat terhubung ke server'
      };
    }
  }

  // Test endpoint complaints
  async testComplaints() {
    try {
      const response = await api.get('/complaints/test');
      return response.data;
    } catch (error) {
      console.error('Complaints test failed:', error);
      return {
        success: false,
        error: 'Tidak dapat mengakses endpoint complaints'
      };
    }
  }
}

export const fallbackService = new FallbackService();
export default fallbackService;