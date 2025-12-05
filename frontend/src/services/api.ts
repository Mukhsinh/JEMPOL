import axios, { AxiosError } from 'axios';
import { APIResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<APIResponse>) => {
    const message = error.response?.data?.error || error.message || 'Terjadi kesalahan';
    return Promise.reject(new Error(message));
  }
);

export default api;
