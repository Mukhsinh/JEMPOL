import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { APIResponse } from '../types';

// Cache untuk API base URL
let cachedApiBaseUrl: string = '';

// Check if backend is available (will be set after first check)
let backendAvailable: boolean | null = null;

// Check if running in Vercel production or backend not available
export const isVercelProduction = (): boolean => {
  // Jika sudah dicek dan backend tidak tersedia, return true
  if (backendAvailable === false) return true;
  // Jika di production mode
  if (import.meta.env.PROD) return true;
  // Jika VITE_API_URL tidak ada atau kosong
  if (!import.meta.env.VITE_API_URL) return true;
  return false;
};

// Set backend availability status
export const setBackendAvailable = (available: boolean) => {
  backendAvailable = available;
};

// Determine API base URL based on environment dengan caching
const getApiBaseUrl = (): string => {
  if (cachedApiBaseUrl) {
    return cachedApiBaseUrl;
  }

  const envApiUrl = (import.meta as any).env?.VITE_API_URL;

  // In production (Vercel), gunakan relative path /api
  // Ini akan di-route ke Vercel serverless functions di folder /api
  if (import.meta.env.PROD) {
    cachedApiBaseUrl = '/api';
    console.log('🚀 Production mode: Using Vercel API at /api');
    return cachedApiBaseUrl;
  }

  // In development with explicit API URL
  if (envApiUrl) {
    cachedApiBaseUrl = envApiUrl;
    console.log('🔧 Development mode: Using API at', cachedApiBaseUrl);
    return cachedApiBaseUrl;
  }

  // Default fallback untuk development
  cachedApiBaseUrl = 'http://localhost:3004/api';
  console.log('🔧 Development mode (fallback): Using API at', cachedApiBaseUrl);
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
  timeout: 45000, // 45 detik untuk koneksi lambat // 60 detik untuk koneksi yang stabil
  withCredentials: false,
  // Validasi response sebelum axios parse JSON
  validateStatus: (status) => status >= 200 && status < 600, // Accept all status codes
  transformResponse: [(data, headers) => {
    // Jika response kosong, return object error
    if (!data || data === '') {
      console.error('❌ Response kosong dari server');
      return {
        success: false,
        error: 'Server mengembalikan response kosong',
        data: null
      };
    }
    
    // Jika sudah object, return langsung
    if (typeof data === 'object') {
      return data;
    }
    
    // Cek apakah response adalah HTML (error page)
    if (typeof data === 'string' && data.trim().startsWith('<!')) {
      console.error('❌ Server mengembalikan HTML bukan JSON');
      console.error('❌ Response data:', data?.substring(0, 200));
      return {
        success: false,
        error: 'Server mengembalikan halaman HTML. Endpoint mungkin tidak tersedia.',
        data: null,
        isHtmlError: true
      };
    }
    
    // Coba parse JSON
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error('❌ Error parsing JSON:', e);
      console.error('❌ Response data:', data?.substring(0, 200));
      return {
        success: false,
        error: 'Response bukan JSON valid',
        data: null,
        rawData: data?.substring(0, 100)
      };
    }
  }]
});

// Cache untuk token
let cachedToken: string | null = null;
let tokenCacheTime = 0;
const TOKEN_CACHE_DURATION = 30000; // 30 detik


// Retry interceptor untuk request yang gagal
api.interceptors.response.use(
  (response) => {
    // Validasi response data
    if (!response.data) {
      console.error('❌ Response data kosong');
      response.data = {
        success: false,
        error: 'Response data kosong dari server',
        data: null
      };
    }
    return response;
  },
  async (error) => {
    const config = error.config;
    
    // Jika belum ada retry count, set ke 0
    if (!config.__retryCount) {
      config.__retryCount = 0;
    }
    
    // Jika connection refused, set backend tidak tersedia dan jangan retry
    if (error.code === 'ERR_CONNECTION_REFUSED') {
      console.log('⚠️ Backend tidak tersedia, menggunakan Supabase langsung');
      setBackendAvailable(false);
      return Promise.reject(error);
    }
    
    // Retry maksimal 2 kali untuk error timeout atau network (bukan connection refused)
    if (
      config.__retryCount < 2 &&
      (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK')
    ) {
      config.__retryCount += 1;
      console.log(`🔄 Retrying request (${config.__retryCount}/2): ${config.url}`);
      
      // Delay sebelum retry
      await new Promise(resolve => setTimeout(resolve, 500 * config.__retryCount));
      
      return api(config);
    }
    
    return Promise.reject(error);
  }
);

// Request interceptor yang dioptimalkan
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const now = Date.now();
      
      // Gunakan cached token jika masih valid
      if (cachedToken && (now - tokenCacheTime) < TOKEN_CACHE_DURATION) {
        config.headers.Authorization = `Bearer ${cachedToken}`;
        return config;
      }

      // Import authService dinamis untuk menghindari circular dependency
      const { authService } = await import('./authService');
      const token = await authService.getToken();
      
      if (token) {
        cachedToken = token;
        tokenCacheTime = now;
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
            // JANGAN redirect untuk halaman public seperti /m/, /public/, /login
            const isPublicPage =
              window.location.pathname.startsWith('/m/') ||
              window.location.pathname.startsWith('/public/') ||
              window.location.pathname.startsWith('/login');
            
            const isProtectedPage =
              !isPublicPage && (
                window.location.pathname.startsWith('/admin') ||
                window.location.pathname.startsWith('/dashboard') ||
                window.location.pathname.startsWith('/tickets') ||
                window.location.pathname.startsWith('/master-data') ||
                window.location.pathname === '/'
              );

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