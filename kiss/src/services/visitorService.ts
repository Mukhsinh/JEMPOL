import api from './api';
import { VisitorFormData, VisitorRecord, APIResponse } from '../types';

/**
 * Register a new visitor
 */
export const registerVisitor = async (data: VisitorFormData): Promise<APIResponse> => {
  try {
    // Convert camelCase to snake_case for backend
    const payload = {
      nama: data.nama.trim(),
      instansi: data.instansi.trim(),
      jabatan: data.jabatan.trim(),
      no_handphone: data.noHandphone.trim(),
    };
    
    console.log('Registering visitor:', payload);
    const response = await api.post<APIResponse>('/visitors', payload);
    console.log('Visitor registered successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error registering visitor:', error);
    throw error;
  }
};

/**
 * Get all visitors (admin)
 */
export const getAllVisitors = async (params?: {
  search?: string;
  page?: number;
  limit?: number;
}): Promise<APIResponse<VisitorRecord[]>> => {
  const response = await api.get<APIResponse<VisitorRecord[]>>('/visitors', { params });
  return response.data;
};

/**
 * Export visitors to CSV
 */
export const exportVisitors = async (): Promise<Blob> => {
  const response = await api.get('/visitors/export', {
    responseType: 'blob',
  });
  return response.data;
};
