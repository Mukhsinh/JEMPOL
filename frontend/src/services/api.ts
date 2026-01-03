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
  timeout: 60000, // 60 seconds timeout
  withCredentials: false,
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
        console.log('🔑 Token added to request:', config.url);
      } else {
        console.log('⚠️ No token available for request:', config.url);
      }
    } catch (error) {
      console.error('❌ Error getting token:', error);
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
  async (error: AxiosError<APIResponse>) => {
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

      // Handle authentication errors
      if (error.response.status === 401 || error.response.status === 403) {
        console.warn('🔐 Authentication error:', {
          status: error.response.status,
          message: message,
          url: error.config?.url,
          code: error.response.data?.code
        });

        // Only logout if backend explicitly says token is invalid
        // Check for specific error codes that indicate token is truly bad
        const isTokenInvalid =
          error.response.data?.code === 'ERR_INVALID_TOKEN' ||
          error.response.data?.code === 'ERR_BAD_REQUEST' ||
          error.response.data?.error === 'Token tidak valid. Silakan login ulang.';

        if (isTokenInvalid) {
          console.log('🚫 Backend rejected token as invalid, forcing logout...');
          try {
            const { authService } = await import('./authService');
            await authService.logout();

            // Only redirect to login if on protected pages
            const isProtectedPage =
              window.location.pathname.startsWith('/admin') ||
              window.location.pathname.startsWith('/dashboard') ||
              window.location.pathname.startsWith('/tickets') ||
              window.location.pathname.startsWith('/master-data');

            if (isProtectedPage) {
              window.location.href = '/login';
            }

            return Promise.reject(new Error('Sesi telah berakhir. Silakan login kembali.'));
          } catch (e) {
            console.error('Error during forced logout:', e);
          }
        } else {
          // For other 401/403 errors (like permission denied), just log
          console.log('⚠️ Auth error but token may be valid (permission issue)');
          message = error.response.data?.error || 'Anda tidak memiliki izin untuk mengakses resource ini.';
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