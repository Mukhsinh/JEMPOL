import { supabase } from '../utils/supabaseClient';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data?: {
    session: any;
    user: any;
    admin: {
      id: string;
      username: string;
      full_name?: string;
      email?: string;
      role: string;
    };
  };
  error?: string;
  message?: string;
}

export interface VerifyTokenResponse {
  success: boolean;
  data?: {
    user: any;
    admin: {
      id: string;
      username: string;
      full_name?: string;
      email?: string;
      role?: string;
    };
  };
  error?: string;
}

class AuthService {
  private userKey = 'adminUser';

  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      // Sign in with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return {
          success: false,
          error: 'Email atau password salah',
        };
      }

      if (!data.user || !data.session) {
        return {
          success: false,
          error: 'Login gagal',
        };
      }

      // Get admin profile from admins table
      const { data: adminProfile, error: profileError } = await supabase
        .from('admins')
        .select('*')
        .eq('email', email)
        .eq('is_active', true)
        .single();

      if (profileError || !adminProfile) {
        await supabase.auth.signOut();
        return {
          success: false,
          error: 'Admin tidak ditemukan atau tidak aktif',
        };
      }

      // Store user data
      const adminData = {
        id: adminProfile.id,
        username: adminProfile.username,
        full_name: adminProfile.full_name,
        email: adminProfile.email,
        role: adminProfile.role || 'admin',
      };

      localStorage.setItem(this.userKey, JSON.stringify(adminData));

      return {
        success: true,
        data: {
          session: data.session,
          user: data.user,
          admin: adminData,
        },
        message: 'Login berhasil',
      };
    } catch (error: any) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.message || 'Login gagal',
      };
    }
  }

  async verifyToken(): Promise<VerifyTokenResponse> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        this.logout();
        return {
          success: false,
          error: 'Token tidak valid',
        };
      }

      // Get admin profile
      const { data: adminProfile, error: profileError } = await supabase
        .from('admins')
        .select('*')
        .eq('email', user.email)
        .eq('is_active', true)
        .single();

      if (profileError || !adminProfile) {
        this.logout();
        return {
          success: false,
          error: 'Admin tidak ditemukan',
        };
      }

      const adminData = {
        id: adminProfile.id,
        username: adminProfile.username,
        full_name: adminProfile.full_name,
        email: adminProfile.email,
        role: adminProfile.role || 'admin',
      };

      localStorage.setItem(this.userKey, JSON.stringify(adminData));

      return {
        success: true,
        data: {
          user,
          admin: adminData,
        },
      };
    } catch (error: any) {
      console.error('Token verification error:', error);
      this.logout();
      return {
        success: false,
        error: error.message || 'Token tidak valid',
      };
    }
  }

  async logout(): Promise<void> {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem(this.userKey);
    }
  }

  async getToken(): Promise<string | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session?.access_token || null;
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  getUser(): any | null {
    const userData = localStorage.getItem(this.userKey);
    return userData ? JSON.parse(userData) : null;
  }

  async isAuthenticated(): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    return !!user;
  }

  isAdmin(): boolean {
    const user = this.getUser();
    return user && (user.role === 'admin' || user.role === 'superadmin');
  }

  isSuperAdmin(): boolean {
    const user = this.getUser();
    return user && user.role === 'superadmin';
  }

  // Get Supabase client for other operations
  getSupabaseClient() {
    return supabase;
  }
}

export const authService = new AuthService();
export default authService;