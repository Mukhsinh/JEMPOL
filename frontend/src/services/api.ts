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
  
  // In development, use localhost
  return 'http://localhost:5000/api';
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
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
      message = 'Tidak dapat terhubung ke server. Pastikan koneksi internet stabil.';
    } else if (error.code === 'ERR_BAD_REQUEST') {
      message = error.response?.data?.error || 'Permintaan tidak valid';
    } else if (error.response) {
      message = error.response.data?.error || error.message || 'Terjadi kesalahan';
      
      // If unauthorized and trying to access admin endpoints, redirect to login
      if (error.response.status === 401) {
        localStorage.removeItem('adminToken');
        // Only redirect to login if we're on admin page or trying to access protected resources
        if (window.location.pathname.startsWith('/admin')) {
          window.location.href = '/login';
        }
      }
    } else if (error.request) {
      message = 'Server tidak merespons. Periksa koneksi internet Anda.';
    }
    
    console.error('API Error:', {
      message,
      code: error.code,
      status: error.response?.status,
      url: error.config?.url,
      data: error.response?.data
    });
    
    return Promise.reject(new Error(message));
  }
);

export default api;
