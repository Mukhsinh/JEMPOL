import api from './api';
import { supabase } from '../utils/supabaseClient';

export interface Role {
  id: string;
  name: string;
  code: string;
  description: string;
  permissions: any;
  is_system_role?: boolean;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
}

export const roleService = {
  // Fetch all roles
  async getRoles(): Promise<Role[]> {
    try {
      // Cek apakah API tersedia
      const apiUrl = import.meta.env.VITE_API_URL;
      
      // Jika VITE_API_URL kosong, langsung gunakan Supabase
      if (!apiUrl || apiUrl.trim() === '') {
        console.log('VITE_API_URL kosong, menggunakan Supabase langsung');
        const { data, error: supabaseError } = await supabase
          .from('roles')
          .select('*')
          .order('created_at', { ascending: false });

        if (supabaseError) throw supabaseError;
        return data || [];
      }

      // Try API first jika tersedia
      const response = await api.get('/public/roles');
      if (response.data.success) {
        return response.data.data || [];
      }
      throw new Error(response.data.message || 'Failed to fetch roles');
    } catch (error: any) {
      // Fallback to direct Supabase query
      console.log('API error, menggunakan Supabase langsung:', error.message);
      const { data, error: supabaseError } = await supabase
        .from('roles')
        .select('*')
        .order('created_at', { ascending: false });

      if (supabaseError) throw supabaseError;
      return data || [];
    }
  },

  // Get role by ID
  async getRoleById(id: string): Promise<Role> {
    try {
      // Cek apakah API tersedia
      const apiUrl = import.meta.env.VITE_API_URL;
      
      // Jika VITE_API_URL kosong, langsung gunakan Supabase
      if (!apiUrl || apiUrl.trim() === '') {
        const { data, error: supabaseError } = await supabase
          .from('roles')
          .select('*')
          .eq('id', id)
          .single();

        if (supabaseError) throw supabaseError;
        return data;
      }

      const response = await api.get(`/public/roles/${id}`);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch role');
    } catch (error: any) {
      console.log('API error, menggunakan Supabase langsung:', error.message);
      const { data, error: supabaseError } = await supabase
        .from('roles')
        .select('*')
        .eq('id', id)
        .single();

      if (supabaseError) throw supabaseError;
      return data;
    }
  },

  // Create new role
  async createRole(roleData: Partial<Role>): Promise<Role> {
    try {
      const response = await api.post('/public/roles', roleData);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to create role');
    } catch (error: any) {
      console.log('API tidak tersedia, menggunakan Supabase langsung');
      const { data, error: supabaseError } = await supabase
        .from('roles')
        .insert([roleData])
        .select()
        .single();

      if (supabaseError) throw supabaseError;
      return data;
    }
  },

  // Update role
  async updateRole(id: string, roleData: Partial<Role>): Promise<Role> {
    try {
      const response = await api.put(`/public/roles/${id}`, roleData);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to update role');
    } catch (error: any) {
      console.log('API tidak tersedia, menggunakan Supabase langsung');
      const { data, error: supabaseError } = await supabase
        .from('roles')
        .update(roleData)
        .eq('id', id)
        .select()
        .single();

      if (supabaseError) throw supabaseError;
      return data;
    }
  },

  // Delete role
  async deleteRole(id: string): Promise<void> {
    try {
      const response = await api.delete(`/public/roles/${id}`);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to delete role');
      }
    } catch (error: any) {
      console.log('API tidak tersedia, menggunakan Supabase langsung');
      const { error: supabaseError } = await supabase
        .from('roles')
        .delete()
        .eq('id', id);

      if (supabaseError) throw supabaseError;
    }
  },

  // Get users by role
  async getUsersByRole(roleId: string): Promise<any[]> {
    try {
      // Cek apakah API tersedia
      const apiUrl = import.meta.env.VITE_API_URL;
      
      // Jika VITE_API_URL kosong, langsung gunakan Supabase
      if (!apiUrl || apiUrl.trim() === '') {
        const { data, error: supabaseError } = await supabase
          .from('users')
          .select('id, full_name, email, role_id')
          .eq('role_id', roleId);

        if (supabaseError) throw supabaseError;
        return data || [];
      }

      const response = await api.get(`/public/roles/${roleId}/users`);
      if (response.data.success) {
        return response.data.data || [];
      }
      throw new Error(response.data.message || 'Failed to fetch users');
    } catch (error: any) {
      console.log('API error, menggunakan Supabase langsung:', error.message);
      const { data, error: supabaseError } = await supabase
        .from('users')
        .select('id, full_name, email, role_id')
        .eq('role_id', roleId);

      if (supabaseError) throw supabaseError;
      return data || [];
    }
  }
};
