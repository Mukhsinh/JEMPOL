import axios, { AxiosError } from 'axios';
import { APIResponse } from '../types';

// Determine API base URL based on environment
const getApiBaseUrl = () => {
  // Check if VITE_API_URL is set
  const envApiUrl = (import.meta as any).env?.VITE_API_URL;
  
  if (envApiUrl) {
    return envApiUrl;
  }
  
  // In production (Vercel), use relative path
  if (import.meta.env.PROD) {
    return '/api';
  }
  
  // In development, use localhost with correct port
  return 'http://localhost:3003/api';
};

const API_BASE_URL = getApiBaseUrl();

console.log('API Base URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60 seconds timeout for better stability
  withCredentials: false, // Enable CORS
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      // Import authService dynamically to avoid circular dependency
      const { authService } = await import('./authService');
      const token = await authService.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<APIResponse>) => {
    let message = 'Terjadi kesalahan';
    
    if (error.code === 'ECONNABORTED') {
      message = 'Koneksi timeout. Periksa koneksi internet Anda.';
    } else if (error.code === 'ERR_NETWORK') {
      message = 'Tidak dapat terhubung ke server. Pastikan server backend berjalan di ' + API_BASE_URL;
    } else if (error.code === 'ERR_CONNECTION_REFUSED') {
      message = 'Koneksi ditolak. Pastikan server backend berjalan di ' + API_BASE_URL;
    } else if (error.code === 'ERR_BAD_REQUEST') {
      message = error.response?.data?.error || 'Permintaan tidak valid';
    } else if (error.response) {
      message = error.response.data?.error || error.message || 'Terjadi kesalahan';
      
      // If unauthorized and trying to access admin endpoints, redirect to login
      if (error.response.status === 401) {
        // Import authService dynamically to avoid circular dependency
        import('./authService').then(({ authService }) => {
          authService.logout();
        });
        // Only redirect to login if we're on admin page or trying to access protected resources
        if (window.location.pathname.startsWith('/admin') || window.location.pathname.startsWith('/dashboard') || window.location.pathname.startsWith('/tickets')) {
          window.location.href = '/login';
        }
      }
    } else if (error.request) {
      message = 'Server tidak merespons. Periksa koneksi internet Anda dan pastikan server backend berjalan.';
    }
    
    console.error('API Error:', {
      message,
      code: error.code,
      status: error.response?.status,
      url: error.config?.url,
      baseURL: API_BASE_URL,
      data: error.response?.data
    });
    
    return Promise.reject(new Error(message));
  }
);

export default api;
export { api };
