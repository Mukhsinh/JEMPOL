import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { APIResponse } from '../types';

// Cache untuk API base URL
let cachedApiBaseUrl: string | null = null;

// Determine API base URL based on environment dengan caching
const getApiBaseUrl = (): string => {
  if (cachedApiBaseUrl) {
    return cachedApiBaseUrl;
  }

  const envApiUrl = (import.meta as any).env?.VITE_API_URL;

  if (envApiUrl) {
    cachedApiBaseUrl = envApiUrl;
    return cachedApiBaseUrl;
  }

  // In production (Vercel), use relative path
  if (import.meta.env.PROD) {
    cachedApiBaseUrl = '/api';
    return cachedApiBaseUrl;
  }

  // In development, use localhost with correct port
  cachedApiBaseUrl = 'http://localhost:3004/api';
  return cachedApiBaseUrl;
};

const API_BASE_URL = getApiBaseUrl();

// Optimized axios instance dengan timeout yang lebih singkat
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 15000, // Kurangi timeout untuk performa lebih cepat
  withCredentials: false,
});

// Cache untuk token
let cachedToken: string | null = null;
let tokenCacheTime = 0;
const TOKEN_CACHE_DURATION = 30000; // 30 detik

// Request interceptor yang dioptimalkan
api.interceptors.request.use(
  async (config: AxiosRequestConfig) => {
    try {
      const now = Date.now();
      
      // Gunakan cached token jika masih valid
      if (cachedToken && (now - tokenCacheTime) < TOKEN_CACHE_DURATION) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${cachedToken}`;
        return config;
      }

      // Import authService dinamis untuk menghindari circular dependency
      const { authService } = await import('./authService');
      const token = await authService.getToken();
      
      if (token) {
        cachedToken = token;
        tokenCacheTime = now;
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      // Jangan log error untuk mengurangi noise
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor yang dioptimalkan untuk error handling
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<APIResponse>) => {
    let message = 'Terjadi kesalahan';

    if (error.code === 'ECONNABORTED') {
      message = 'Koneksi timeout. Periksa koneksi internet Anda.';
    } else if (error.code === 'ERR_NETWORK') {
      message = 'Tidak dapat terhubung ke server.';
    } else if (error.code === 'ERR_CONNECTION_REFUSED') {
      message = 'Koneksi ditolak. Server tidak tersedia.';
    } else if (error.response) {
      message = error.response.data?.error || error.message || 'Terjadi kesalahan';

      // Handle authentication errors dengan optimasi
      if (error.response.status === 401 || error.response.status === 403) {
        const isTokenInvalid =
          error.response.data?.code === 'ERR_INVALID_TOKEN' ||
          error.response.data?.code === 'ERR_BAD_REQUEST' ||
          error.response.data?.error === 'Token tidak valid. Silakan login ulang.';

        if (isTokenInvalid) {
          // Clear cached token
          cachedToken = null;
          tokenCacheTime = 0;
          
          try {
            const { authService } = await import('./authService');
            await authService.logout();

            // Hanya redirect jika di halaman yang dilindungi
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
            // Silent error handling
          }
        } else {
          message = error.response.data?.error || 'Anda tidak memiliki izin untuk mengakses resource ini.';
        }
      }
    } else if (error.request) {
      message = 'Server tidak merespons. Periksa koneksi internet Anda.';
    }

    return Promise.reject(new Error(message));
  }
);

export default api;
export { api };