import api from './api';
import { InnovationItem, APIResponse } from '../types';

/**
 * Get all innovations
 */
export const getAllInnovations = async (type?: 'powerpoint' | 'video'): Promise<APIResponse<InnovationItem[]>> => {
  const params = type ? { type } : {};
  const response = await api.get<APIResponse<InnovationItem[]>>('/innovations', { params });
  return response.data;
};

/**
 * Upload new innovation
 */
export const uploadInnovation = async (data: {
  title: string;
  description: string;
  file: File;
}): Promise<APIResponse<InnovationItem>> => {
  const formData = new FormData();
  formData.append('title', data.title);
  formData.append('description', data.description);
  formData.append('file', data.file);

  const response = await api.post<APIResponse<InnovationItem>>('/innovations', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Delete innovation
 */
export const deleteInnovation = async (id: string): Promise<APIResponse> => {
  const response = await api.delete<APIResponse>(`/innovations/${id}`);
  return response.data;
};

/**
 * Increment view count
 */
export const incrementView = async (id: string): Promise<APIResponse> => {
  const response = await api.post<APIResponse>(`/innovations/${id}/view`);
  return response.data;
};
