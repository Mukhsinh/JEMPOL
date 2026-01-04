import api from './api';
import { supabaseService } from './supabaseService';

// Check if running in Vercel production (no backend available)
const isVercelProduction = (): boolean => {
  return import.meta.env.PROD && !import.meta.env.VITE_API_URL?.includes('localhost');
};

export interface User {
  id: string;
  admin_id?: string;
  employee_id?: string;
  full_name: string;
  email: string;
  phone?: string;
  unit_id?: string;
  role: string;
  role_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  units?: {
    id: string;
    name: string;
    code: string;
  };
  admins?: {
    id: string;
    username: string;
    full_name: string;
    email: string;
  };
}

export interface Unit {
  id: string;
  name: string;
  code: string;
  description?: string;
  is_active: boolean;
}

export interface Role {
  id: string;
  name: string;
  code: string;
  description?: string;
  permissions: any;
  is_system_role: boolean;
  is_active: boolean;
}

export interface CreateUserData {
  full_name: string;
  email: string;
  employee_id?: string;
  phone?: string;
  unit_id?: string;
  role: string;
  password?: string;
  create_admin_account?: boolean;
}

export interface UpdateUserData {
  full_name?: string;
  email?: string;
  employee_id?: string;
  phone?: string;
  unit_id?: string;
  role?: string;
  password?: string;
  update_admin_password?: boolean;
  is_active?: boolean;
}

class UserService {

  async getUsers(): Promise<User[]> {
    // Di Vercel production, gunakan Supabase langsung
    if (isVercelProduction()) {
      const result = await supabaseService.getUsers();
      return result.data || [];
    }
    
    try {
      const response = await api.get('/users');
      return response.data?.data || [];
    } catch (error: any) {
      console.warn('Primary endpoint /users failed, trying Supabase direct...', error.message);
      // Fallback ke Supabase langsung
      const result = await supabaseService.getUsers();
      return result.data || [];
    }
  }

  async getUnits(): Promise<Unit[]> {
    // Di Vercel production, gunakan Supabase langsung
    if (isVercelProduction()) {
      const result = await supabaseService.getUnits();
      return result.data || [];
    }
    
    try {
      const response = await api.get('/users/units');
      return response.data?.data || [];
    } catch (error) {
      console.warn('Primary endpoint /users/units failed, trying Supabase direct...', error);
      // Fallback ke Supabase langsung
      const result = await supabaseService.getUnits();
      return result.data || [];
    }
  }

  async getRoles(): Promise<Role[]> {
    // Di Vercel production, gunakan Supabase langsung
    if (isVercelProduction()) {
      const result = await supabaseService.getRoles();
      return result.data || [];
    }
    
    try {
      const response = await api.get('/users/roles');
      return response.data?.data || [];
    } catch (error) {
      console.warn('Primary endpoint /users/roles failed, trying Supabase direct...', error);
      // Fallback ke Supabase langsung
      const result = await supabaseService.getRoles();
      return result.data || [];
    }
  }

  async createUser(user: CreateUserData): Promise<User> {
    const response = await api.post('/users', user);
    return response.data?.data;
  }

  async updateUser(id: string, user: UpdateUserData): Promise<User> {
    const response = await api.put(`/users/${id}`, user);
    return response.data?.data;
  }

  async deleteUser(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  }

  async getUserById(id: string): Promise<User> {
    const response = await api.get(`/users/${id}`);
    return response.data?.data;
  }

  async assignRole(userId: string, roleId: string): Promise<void> {
    await api.post(`/users/${userId}/roles`, { roleId });
  }

  async removeRole(userId: string, roleId: string): Promise<void> {
    await api.delete(`/users/${userId}/roles/${roleId}`);
  }
}

export default new UserService();