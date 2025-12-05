import api from './api';
import { InnovationItem, APIResponse } from '../types';

/**
 * Get all innovations
 */
export const getAllInnovations = async (type?: 'powerpoint' | 'pdf' | 'video' | 'photo'): Promise<APIResponse<InnovationItem[]>> => {
  const params = type ? { type } : {};
  const response = await api.get<APIResponse<InnovationItem[]>>('/innovations', { params });
  return response.data;
};

/**
 * Upload new innovation
 */
export const uploadInnovation = async (
  data: {
    title: string;
    description: string;
    file: File;
  },
  onProgress?: (progress: number) => void
): Promise<APIResponse<InnovationItem>> => {
  const formData = new FormData();
  formData.append('title', data.title);
  formData.append('description', data.description);
  formData.append('file', data.file);

  console.log('Sending upload request...');

  const response = await api.post<APIResponse<InnovationItem>>('/innovations', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        console.log('Upload progress:', percentCompleted + '%');
        if (onProgress) {
          onProgress(percentCompleted);
        }
      }
    },
    timeout: 120000, // 2 minutes timeout for large files
  });
  
  console.log('Upload response:', response.data);
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

/**
 * Upload multiple photos at once
 */
export const uploadBulkPhotos = async (
  data: {
    title: string;
    description: string;
    files: File[];
  },
  onProgress?: (progress: number) => void
): Promise<APIResponse<InnovationItem[]>> => {
  const formData = new FormData();
  formData.append('title', data.title);
  formData.append('description', data.description);
  
  // Append all files
  data.files.forEach((file) => {
    formData.append('files', file);
  });

  console.log('Sending bulk photo upload request...');

  const response = await api.post<APIResponse<InnovationItem[]>>('/innovations/bulk-photos', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        console.log('Bulk upload progress:', percentCompleted + '%');
        if (onProgress) {
          onProgress(percentCompleted);
        }
      }
    },
    timeout: 300000, // 5 minutes timeout for multiple files
  });
  
  console.log('Bulk upload response:', response.data);
  return response.data;
};
