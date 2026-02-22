import { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { supabase, clearInvalidSession } from '../utils/supabaseClient';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

interface User {
  id: string;
  username: string;
  full_name?: string;
  email?: string;
  role: string;
  name?: string;
  unit_id?: string;
  unit_name?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ error?: string; success: boolean }>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  hasGlobalAccess: boolean;
  userUnitId: string | null;
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
        // Cek cache dulu untuk instant load
        const cachedUser = localStorage.getItem('adminUser');
        if (cachedUser) {
          try {
            const userData = JSON.parse(cachedUser);
            setUser(userData);
            setIsLoading(false);
            // Lanjutkan verifikasi di background tanpa blocking UI
          } catch (e) {
            localStorage.removeItem('adminUser');
          }
        }

        // Timeout yang cukup untuk inisialisasi
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Auth initialization timeout')), 10000);
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

            // Jika sudah ada cache, skip profile fetch untuk performa
            if (cachedUser) {
              return JSON.parse(cachedUser);
            }

            // Get admin profile dengan timeout singkat
            const profilePromise = supabase
              .from('admins')
              .select(`
                id, 
                username, 
                full_name, 
                email, 
                role, 
                is_active,
                unit_id,
                units:unit_id (
                  name
                )
              `)
              .eq('email', session.user.email)
              .eq('is_active', true)
              .single();

            const profileTimeout = new Promise((_, reject) => {
              setTimeout(() => reject(new Error('Profile fetch timeout')), 5000);
            });

            const { data: profileData, error: profileError } = await Promise.race([profilePromise, profileTimeout]) as any;

            if (profileError || !profileData) {
              await supabase.auth.signOut();
              return null;
            }

            const userData = {
              id: profileData.id,
              username: profileData.username,
              full_name: profileData.full_name,
              email: profileData.email,
              role: profileData.role || 'admin',
              unit_id: profileData.unit_id,
              unit_name: profileData.units?.name,
            };

            // DEBUG: Log user data
            console.log('🔍 [AuthContext.initAuth] User data loaded:', {
              id: userData.id,
              email: userData.email,
              role: userData.role,
              unit_id: userData.unit_id,
              unit_name: userData.unit_name,
              timestamp: new Date().toISOString()
            });

            // Simpan ke cache untuk next load
            localStorage.setItem('adminUser', JSON.stringify(userData));

            return userData;
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
            .select(`
              id, 
              username, 
              full_name, 
              email, 
              role, 
              is_active,
              unit_id,
              units:unit_id (
                name
              )
            `)
            .eq('email', session.user.email)
            .eq('is_active', true)
            .single();

          const profileTimeout = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Profile fetch timeout')), 5000);
          });

          const { data: profileData, error: profileError } = await Promise.race([profilePromise, profileTimeout]) as any;

          if (!profileError && profileData) {
            setUser({
              id: profileData.id,
              username: profileData.username,
              full_name: profileData.full_name,
              email: profileData.email,
              role: profileData.role || 'admin',
              unit_id: profileData.unit_id,
              unit_name: profileData.units?.name,
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
      // Validate input
      const cleanEmail = email.trim().toLowerCase();
      if (!cleanEmail || !password) {
        return {
          success: false,
          error: 'Email dan password harus diisi',
        };
      }

      // Login dengan timeout yang cukup untuk koneksi stabil
      const loginPromise = supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password,
      });

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Login timeout')), 20000); // 20 detik untuk koneksi stabil
      });

      const { data: authData, error: authError } = await Promise.race([loginPromise, timeoutPromise]) as any;

      if (authError) {
        console.error('Auth error details:', authError);
        let errorMessage = 'Login gagal';
        
        if (authError.message?.includes('Invalid login credentials')) {
          errorMessage = 'Email atau password salah';
        } else if (authError.message?.includes('Email not confirmed')) {
          errorMessage = 'Email belum dikonfirmasi. Silakan cek email Anda untuk konfirmasi.';
        } else if (authError.message?.includes('timeout')) {
          errorMessage = 'Koneksi timeout, silakan coba lagi';
        } else if (authError.status === 400) {
          errorMessage = 'Email atau password salah. Pastikan email sudah terdaftar dan dikonfirmasi.';
        } else {
          errorMessage = `Login gagal: ${authError.message}`;
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

      // Tunggu sebentar untuk memastikan session sudah di-set
      await new Promise(resolve => setTimeout(resolve, 500));

      // Get admin profile dengan timeout yang cukup
      const profilePromise = supabase
        .from('admins')
        .select(`
          id, 
          username, 
          full_name, 
          email, 
          role, 
          is_active,
          unit_id,
          units:unit_id (
            name
          )
        `)
        .eq('email', cleanEmail)
        .eq('is_active', true)
        .maybeSingle(); // Gunakan maybeSingle untuk menghindari error jika tidak ada data

      const profileTimeout = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Profile timeout')), 10000); // 10 detik
      });

      const { data: adminProfile, error: profileError } = await Promise.race([profilePromise, profileTimeout]) as any;

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        await supabase.auth.signOut();
        return {
          success: false,
          error: `Gagal mengambil data admin: ${profileError.message}`,
        };
      }

      if (!adminProfile) {
        console.error('Admin profile not found for email:', cleanEmail);
        await supabase.auth.signOut();
        return {
          success: false,
          error: 'Admin tidak ditemukan atau tidak aktif',
        };
      }

      // Set user data dan simpan ke cache
      const userData = {
        id: adminProfile.id,
        username: adminProfile.username,
        full_name: adminProfile.full_name,
        email: adminProfile.email,
        role: adminProfile.role || 'admin',
        unit_id: adminProfile.unit_id,
        unit_name: adminProfile.units?.name,
      };

      // DEBUG: Log user data after login
      console.log('🔍 [AuthContext.login] User logged in:', {
        id: userData.id,
        email: userData.email,
        role: userData.role,
        unit_id: userData.unit_id,
        unit_name: userData.unit_name,
        timestamp: new Date().toISOString()
      });

      setUser(userData);
      // Simpan ke cache untuk next load
      localStorage.setItem('adminUser', JSON.stringify(userData));
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
      localStorage.removeItem('adminUser'); // Clear cache saat logout
    } catch (error) {
      setUser(null);
      localStorage.removeItem('adminUser');
    }
  }, []);

  // Memoized computed values untuk menghindari re-render
  const authValues = useMemo(() => {
    const values = {
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      logout,
      isAdmin: user?.role === 'admin' || user?.role === 'superadmin',
      isSuperAdmin: user?.role === 'superadmin',
      hasGlobalAccess: user?.role === 'superadmin' || user?.role === 'direktur',
      userUnitId: user?.unit_id || null,
    };
    
    // DEBUG: Log auth values untuk debugging notifikasi
    console.log('🔐 [AuthContext] Auth values updated:', {
      userId: user?.id,
      userUnitId: values.userUnitId,
      role: user?.role,
      hasGlobalAccess: values.hasGlobalAccess,
      timestamp: new Date().toISOString()
    });
    
    return values;
  }, [user, isLoading, login, logout]);

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