import api from './api';

export interface User {
  id: string;
  admin_id?: string;
  employee_id?: string;
  full_name: string;
  email: string;
  phone?: string;
  unit_id?: string;
  role: 'staff' | 'supervisor' | 'manager' | 'director' | 'admin';
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
}

export interface CreateUserData {
  employee_id?: string;
  full_name: string;
  email: string;
  phone?: string;
  unit_id?: string;
  role: string;
  password?: string;
  create_admin_account?: boolean;
}

export interface UpdateUserData extends CreateUserData {
  is_active?: boolean;
  update_admin_password?: boolean;
}

class UserService {
  // Get all users
  async getUsers(): Promise<User[]> {
    try {
      const response = await api.get('/users');
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  // Get all units
  async getUnits(): Promise<Unit[]> {
    try {
      const response = await api.get('/users/units');
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching units:', error);
      throw error;
    }
  }

  // Get user by ID
  async getUserById(id: string): Promise<User> {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  // Create new user
  async createUser(userData: CreateUserData): Promise<User> {
    try {
      const response = await api.post('/users', userData);
      return response.data.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Update user
  async updateUser(id: string, userData: UpdateUserData): Promise<User> {
    try {
      const response = await api.put(`/users/${id}`, userData);
      return response.data.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  // Delete user (soft delete)
  async deleteUser(id: string): Promise<void> {
    try {
      await api.delete(`/users/${id}`);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
}

export default new UserService();