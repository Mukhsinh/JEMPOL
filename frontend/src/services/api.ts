import axios, { AxiosError } from 'axios';
import { APIResponse } from '../types';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
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
    const message = error.response?.data?.error || error.message || 'Terjadi kesalahan';
    
    // If unauthorized and trying to access admin endpoints, redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      // Only redirect to login if we're on admin page or trying to access protected resources
      if (window.location.pathname.startsWith('/admin')) {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(new Error(message));
  }
);

export default api;
