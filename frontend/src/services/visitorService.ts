import api from './api';
import { VisitorFormData, VisitorRecord, APIResponse } from '../types';

/**
 * Register a new visitor
 */
export const registerVisitor = async (data: VisitorFormData): Promise<APIResponse> => {
  const response = await api.post<APIResponse>('/visitors', data);
  return response.data;
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
