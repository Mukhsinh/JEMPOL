import { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { supabase, clearInvalidSession } from '../utils/supabaseClient';
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
    // Prevent double initialization
    if (initComplete) return;

    const initAuth = async () => {
      try {
        // Timeout yang lebih singkat untuk inisialisasi cepat
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Auth initialization timeout')), 2000);
        });

        const authPromise = (async () => {
          try {
            // Check session tanpa connection test untuk kecepatan
            const { data: { session }, error } = await supabase.auth.getSession();

            // Handle invalid refresh token error
            if (error) {
              console.log('Session error, clearing invalid session:', error.message);
              await clearInvalidSession();
              return null;
            }

            if (!session?.user) {
              return null;
            }

            // Get admin profile dengan timeout singkat
            const profilePromise = supabase
              .from('admins')
              .select('id, username, full_name, email, role, is_active')
              .eq('email', session.user.email)
              .eq('is_active', true)
              .single();

            const profileTimeout = new Promise((_, reject) => {
              setTimeout(() => reject(new Error('Profile fetch timeout')), 1000);
            });

            const { data: profileData, error: profileError } = await Promise.race([profilePromise, profileTimeout]) as any;

            if (profileError || !profileData) {
              await supabase.auth.signOut();
              return null;
            }

            return {
              id: profileData.id,
              username: profileData.username,
              full_name: profileData.full_name,
              email: profileData.email,
              role: profileData.role || 'admin',
            };
          } catch (error: any) {
            // Handle refresh token error
            if (error?.message?.includes('Refresh Token') || error?.message?.includes('refresh_token')) {
              console.log('Invalid refresh token, clearing session...');
              await clearInvalidSession();
            }
            return null;
          }
        })();

        const result = await Promise.race([authPromise, timeoutPromise]);
        
        if (result) {
          setUser(result as User);
        }

      } catch (error) {
        // Silent error handling untuk performa
      } finally {
        setIsLoading(false);
        setInitComplete(true);
      }
    };

    initAuth();

    // Auth state listener yang dioptimalkan
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      // Handle token refresh error
      if (event === 'TOKEN_REFRESHED' && !session) {
        console.log('Token refresh failed in auth listener');
        await clearInvalidSession();
        setUser(null);
        return;
      }
      
      if (event === 'SIGNED_IN' && session?.user) {
        try {
          const profilePromise = supabase
            .from('admins')
            .select('id, username, full_name, email, role, is_active')
            .eq('email', session.user.email)
            .eq('is_active', true)
            .single();

          const profileTimeout = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Profile fetch timeout')), 1000);
          });

          const { data: profileData, error: profileError } = await Promise.race([profilePromise, profileTimeout]) as any;

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
          // Silent error handling
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [initComplete]);

  // Optimized login function dengan caching dan timeout yang lebih singkat
  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Clear any existing session first
      await supabase.auth.signOut();
      await new Promise(resolve => setTimeout(resolve, 100)); // Kurangi delay

      // Validate input
      const cleanEmail = email.trim().toLowerCase();
      if (!cleanEmail || !password) {
        return {
          success: false,
          error: 'Email dan password harus diisi',
        };
      }

      // Login dengan timeout yang lebih singkat untuk performa
      const loginPromise = supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password,
      });

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Login timeout')), 3000); // Kurangi timeout
      });

      const { data: authData, error: authError } = await Promise.race([loginPromise, timeoutPromise]) as any;

      if (authError) {
        let errorMessage = 'Login gagal';
        
        if (authError.message?.includes('Invalid login credentials')) {
          errorMessage = 'Email atau password salah';
        } else if (authError.message?.includes('timeout')) {
          errorMessage = 'Koneksi timeout, silakan coba lagi';
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

      // Get admin profile dengan timeout yang lebih singkat
      const profilePromise = supabase
        .from('admins')
        .select('id, username, full_name, email, role, is_active')
        .eq('email', cleanEmail)
        .eq('is_active', true)
        .single();

      const profileTimeout = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Profile timeout')), 1000); // Timeout lebih singkat
      });

      const { data: adminProfile, error: profileError } = await Promise.race([profilePromise, profileTimeout]) as any;

      if (profileError || !adminProfile) {
        await supabase.auth.signOut();
        return {
          success: false,
          error: 'Admin tidak ditemukan atau tidak aktif',
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
      return { success: true };
    } catch (error: any) {
      let errorMessage = 'Terjadi kesalahan yang tidak terduga';
      
      if (error.message?.includes('timeout')) {
        errorMessage = 'Koneksi timeout, silakan coba lagi';
      }
      
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      setUser(null);
    }
  }, []);

  // Memoized computed values untuk menghindari re-render
  const authValues = useMemo(() => ({
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    isAdmin: user?.role === 'admin' || user?.role === 'superadmin',
    isSuperAdmin: user?.role === 'superadmin'
  }), [user, isLoading, login, logout]);

  return (
    <AuthContext.Provider value={authValues}>
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