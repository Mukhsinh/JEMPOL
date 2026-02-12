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

class AuthService {
  private userKey = 'adminUser';

  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      console.log('🔄 AuthService: Attempting login...');

      // Clear any existing session
      await supabase.auth.signOut();
      await new Promise(resolve => setTimeout(resolve, 500));

      // Validate input
      const cleanEmail = email.trim().toLowerCase();
      if (!cleanEmail || !password) {
        return {
          success: false,
          error: 'Email dan password harus diisi',
        };
      }

      console.log('📧 Login attempt for:', cleanEmail);

      // Attempt login with Supabase Auth dengan timeout lebih panjang (30 detik)
      const loginPromise = supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password,
      });

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Login timeout')), 30000);
      });

      const { data: authData, error: authError } = await Promise.race([
        loginPromise,
        timeoutPromise
      ]) as any;

      if (authError) {
        console.error('❌ Auth error:', authError);
        let errorMessage = 'Login gagal';
        if (authError.message?.includes('Invalid login credentials')) {
          errorMessage = 'Email atau password salah';
        } else if (authError.message?.includes('Email not confirmed')) {
          errorMessage = 'Email belum dikonfirmasi';
        } else if (authError.message?.includes('timeout')) {
          errorMessage = 'Koneksi timeout, coba lagi';
        }
        return {
          success: false,
          error: errorMessage,
        };
      }

      if (!authData?.user || !authData?.session) {
        return {
          success: false,
          error: 'Login gagal - tidak ada data user',
        };
      }

      console.log('✅ Auth successful, fetching admin profile...');

      // Tunggu sebentar untuk memastikan session sudah di-set
      await new Promise(resolve => setTimeout(resolve, 500));

      // Get admin profile from admins table dengan timeout lebih panjang (20 detik)
      // Gunakan session yang baru saja dibuat untuk query
      const profilePromise = supabase
        .from('admins')
        .select('*')
        .eq('email', cleanEmail)
        .eq('is_active', true)
        .maybeSingle(); // Gunakan maybeSingle untuk menghindari error jika tidak ada data

      const profileTimeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Profile fetch timeout')), 20000);
      });

      const { data: adminProfile, error: profileError } = await Promise.race([
        profilePromise,
        profileTimeoutPromise
      ]) as any;

      if (profileError) {
        console.error('❌ Profile error:', profileError);
        await supabase.auth.signOut();
        return {
          success: false,
          error: `Gagal mengambil data admin: ${profileError.message}`,
        };
      }

      if (!adminProfile) {
        console.error('❌ Admin profile not found for email:', cleanEmail);
        await supabase.auth.signOut();
        return {
          success: false,
          error: 'Admin tidak ditemukan atau tidak aktif',
        };
      }

      // Store user data in localStorage
      const adminData = {
        id: adminProfile.id,
        username: adminProfile.username,
        full_name: adminProfile.full_name,
        email: adminProfile.email,
        role: adminProfile.role || 'admin',
      };

      localStorage.setItem(this.userKey, JSON.stringify(adminData));

      console.log('✅ Login successful:', adminData.email, 'Role:', adminData.role);
      return {
        success: true,
        data: {
          session: authData.session,
          user: authData.user,
          admin: adminData,
        },
        message: 'Login berhasil',
      };
    } catch (error: any) {
      console.error('❌ Unexpected login error:', error);
      let errorMessage = 'Terjadi kesalahan yang tidak terduga';
      if (error.message?.includes('timeout')) {
        errorMessage = 'Koneksi timeout, silakan coba lagi';
      }
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  async logout(): Promise<void> {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem(this.userKey);
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout error:', error);
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
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return !!user;
    } catch (error) {
      return false;
    }
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