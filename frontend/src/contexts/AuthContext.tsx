import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../utils/supabaseClientOptimized';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

interface User {
  id: string;
  username: string;
  full_name?: string;
  email?: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ error?: string; success: boolean }>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [initComplete, setInitComplete] = useState(false);

  useEffect(() => {
    // Prevent double initialization in React StrictMode
    if (initComplete) return;

    const initAuth = async () => {
      try {
        console.log('🔄 Initializing auth...');

        // Add timeout untuk mencegah hanging
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Auth initialization timeout')), 10000);
        });

        const authPromise = (async () => {
          // Simply check if Supabase session exists
          const { data: { session }, error } = await supabase.auth.getSession();

          if (error) {
            console.error('❌ Error getting session:', error);
            return null;
          }

          if (!session?.user) {
            console.log('ℹ️ No active session found');
            return null;
          }

          console.log('✅ Found existing session for:', session.user.email);

          // Get admin profile using user-scoped Supabase client
          // This respects RLS policies that allow users to read their own profile
          const { data: profileData, error: profileError } = await supabase
            .from('admins')
            .select('id, username, full_name, email, role, is_active')
            .eq('email', session.user.email)
            .eq('is_active', true)
            .single();

          if (profileError || !profileData) {
            console.error('❌ Admin profile not found or not active:', profileError);
            // Clear invalid session
            await supabase.auth.signOut();
            return null;
          }

          const userData = {
            id: profileData.id,
            username: profileData.username,
            full_name: profileData.full_name,
            email: profileData.email,
            role: profileData.role || 'admin',
          };

          console.log('✅ User restored from session:', userData.email);
          return userData;
        })();

        // Race between auth check and timeout
        const result = await Promise.race([authPromise, timeoutPromise]);
        
        if (result) {
          setUser(result as User);
        }

      } catch (error) {
        console.error('❌ Auth initialization error:', error);
        // On error, clear session just to be safe
        try {
          await supabase.auth.signOut();
        } catch (signOutError) {
          console.error('Error signing out:', signOutError);
        }
      } finally {
        setIsLoading(false);
        setInitComplete(true);
      }
    };

    initAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      console.log('🔔 Auth state changed:', event);

      if (event === 'SIGNED_IN' && session?.user) {
        try {
          // Fetch admin profile on sign in
          const { data: profileData, error: profileError } = await supabase
            .from('admins')
            .select('id, username, full_name, email, role, is_active')
            .eq('email', session.user.email)
            .eq('is_active', true)
            .single();

          if (!profileError && profileData) {
            setUser({
              id: profileData.id,
              username: profileData.username,
              full_name: profileData.full_name,
              email: profileData.email,
              role: profileData.role || 'admin',
            });
          }
        } catch (error) {
          console.error('Error fetching profile on sign in:', error);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('✅ Token refreshed successfully');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [initComplete]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log('🔄 Attempting login...');

      // Clear any existing session first
      await supabase.auth.signOut();

      // Wait a moment for cleanup
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

      // Coba login dengan timeout yang lebih panjang
      const loginPromise = supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password,
      });

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Login timeout')), 20000);
      });

      const { data: authData, error: authError } = await Promise.race([loginPromise, timeoutPromise]) as any;

      if (authError) {
        console.error('❌ Auth error:', authError);
        let errorMessage = 'Login gagal';
        
        if (authError.message?.includes('Invalid login credentials')) {
          errorMessage = 'Email atau password salah. Pastikan menggunakan: admin@jempol.com / admin123';
        } else if (authError.message?.includes('Email not confirmed')) {
          errorMessage = 'Email belum dikonfirmasi';
        } else if (authError.message?.includes('timeout')) {
          errorMessage = 'Koneksi timeout, silakan coba lagi';
        } else if (authError.message?.includes('network')) {
          errorMessage = 'Masalah koneksi jaringan, periksa internet Anda';
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

      // Get admin profile dengan retry mechanism
      let adminProfile = null;
      let profileError = null;
      
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const { data, error } = await supabase
            .from('admins')
            .select('id, username, full_name, email, role, is_active')
            .eq('email', cleanEmail)
            .eq('is_active', true)
            .single();

          if (!error && data) {
            adminProfile = data;
            break;
          } else {
            profileError = error;
            console.warn(`⚠️ Profile fetch attempt ${attempt} failed:`, error);
            
            if (attempt < 3) {
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }
        } catch (err) {
          profileError = err;
          console.warn(`⚠️ Profile fetch attempt ${attempt} error:`, err);
          
          if (attempt < 3) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }

      if (!adminProfile) {
        console.error('❌ Profile error after all attempts:', profileError);
        await supabase.auth.signOut();
        return {
          success: false,
          error: 'Admin tidak ditemukan atau tidak aktif. Silakan hubungi administrator.',
        };
      }

      // Set user data
      const userData = {
        id: adminProfile.id,
        username: adminProfile.username,
        full_name: adminProfile.full_name,
        email: adminProfile.email,
        role: adminProfile.role || 'admin',
      };

      setUser(userData);
      console.log('✅ Login successful:', userData.email, 'Role:', userData.role);

      return { success: true };
    } catch (error: any) {
      console.error('❌ Unexpected login error:', error);
      let errorMessage = 'Terjadi kesalahan yang tidak terduga';
      
      if (error.message?.includes('timeout')) {
        errorMessage = 'Koneksi timeout, silakan coba lagi';
      } else if (error.message?.includes('network')) {
        errorMessage = 'Masalah koneksi jaringan';
      }
      
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout error:', error);
      setUser(null);
    }
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
  const isSuperAdmin = user?.role === 'superadmin';

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated,
      login,
      logout,
      isAdmin,
      isSuperAdmin
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
