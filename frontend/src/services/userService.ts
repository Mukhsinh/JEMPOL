import api from './api';

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
    try {
      const response = await api.get('/users');
      return response.data?.data || [];
    } catch (error: any) {
      console.warn('Primary endpoint /users failed, trying public fallback...', error.message);
      try {
        const fallbackResponse = await api.get('/public/users');
        return fallbackResponse.data?.data || [];
      } catch (fallbackError) {
        console.error('Public fallback /public/users also failed:', fallbackError);
        return [];
      }
    }
  }

  async getUnits(): Promise<Unit[]> {
    // Fix: Use correct public endpoint and handle response structure
    try {
      const response = await api.get('/users/units');
      return response.data?.data || [];
    } catch (error) {
      console.warn('Primary endpoint /users/units failed, trying public fallback...', error);
      try {
        const fallbackResponse = await api.get('/public/units');
        // Public endpoint returns array directly
        return Array.isArray(fallbackResponse.data) ? fallbackResponse.data : (fallbackResponse.data?.data || []);
      } catch (fallbackError) {
        console.error('Public fallback /public/units also failed:', fallbackError);
        return [];
      }
    }
  }

  async getRoles(): Promise<Role[]> {
    try {
      const response = await api.get('/users/roles');
      return response.data?.data || [];
    } catch (error) {
      console.warn('Primary endpoint /users/roles failed, trying public fallback...', error);
      try {
        const fallbackResponse = await api.get('/public/roles');
        // Public endpoint returns array directly
        return Array.isArray(fallbackResponse.data) ? fallbackResponse.data : (fallbackResponse.data?.data || []);
      } catch (fallbackError) {
        console.error('Public fallback /public/roles also failed:', fallbackError);
        return [];
      }
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