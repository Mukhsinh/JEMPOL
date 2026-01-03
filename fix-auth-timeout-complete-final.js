/**
 * Script untuk memperbaiki masalah Auth timeout yang menyebabkan halaman putih kosong
 * Masalah: AuthContext timeout 30 detik, race condition, loading state tidak optimal
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Memperbaiki masalah Auth timeout...');

// 1. Perbaiki AuthContext dengan timeout yang lebih pendek dan fallback yang lebih baik
const authContextPath = path.join(__dirname, 'frontend/src/contexts/AuthContext.tsx');
const newAuthContext = `import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../utils/supabaseClient';
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

        // Timeout yang lebih pendek (10 detik) untuk mencegah hanging
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Auth initialization timeout')), 10000);
        });

        const authPromise = (async () => {
          try {
            // Quick connection test first
            const { error: testError } = await supabase.from('admins').select('count').limit(1);
            if (testError) {
              console.warn('⚠️ Database connection issue:', testError);
              // Continue anyway, might be RLS issue
            }

            // Check if Supabase session exists
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
          } catch (error) {
            console.error('❌ Auth promise error:', error);
            return null;
          }
        })();

        // Race between auth check and timeout
        const result = await Promise.race([authPromise, timeoutPromise]);
        
        if (result) {
          setUser(result as User);
        }

      } catch (error) {
        console.error('❌ Auth initialization error:', error);
        // On timeout or error, just continue without user
        // Don't try to sign out as it might cause more issues
      } finally {
        // Always set loading to false after max 10 seconds
        setIsLoading(false);
        setInitComplete(true);
        console.log('✅ Auth initialization complete');
      }
    };

    // Start auth initialization
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

      // Login dengan timeout yang lebih pendek (15 detik)
      const loginPromise = supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password,
      });

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Login timeout')), 15000);
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

      // Get admin profile dengan retry mechanism yang lebih cepat
      let adminProfile = null;
      let profileError = null;
      
      for (let attempt = 1; attempt <= 2; attempt++) {
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
            console.warn(\`⚠️ Profile fetch attempt \${attempt} failed:\`, error);
            
            if (attempt < 2) {
              await new Promise(resolve => setTimeout(resolve, 500));
            }
          }
        } catch (err) {
          profileError = err;
          console.warn(\`⚠️ Profile fetch attempt \${attempt} error:\`, err);
          
          if (attempt < 2) {
            await new Promise(resolve => setTimeout(resolve, 500));
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
`;

// 2. Perbaiki ProtectedRoute dengan loading state yang lebih baik
const protectedRoutePath = path.join(__dirname, 'frontend/src/components/ProtectedRoute.tsx');
const newProtectedRoute = `import { ReactNode, useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
  requireSuperAdmin?: boolean;
}

function ProtectedRoute({ 
  children, 
  requireAdmin = false, 
  requireSuperAdmin = false 
}: ProtectedRouteProps) {
  const { isAuthenticated, isAdmin, isSuperAdmin, isLoading } = useAuth();
  const location = useLocation();
  const [showTimeoutMessage, setShowTimeoutMessage] = useState(false);
  const [showRefreshButton, setShowRefreshButton] = useState(false);

  // Show timeout message after 5 seconds, refresh button after 8 seconds
  useEffect(() => {
    if (isLoading) {
      const timeoutMessage = setTimeout(() => {
        setShowTimeoutMessage(true);
      }, 5000);

      const refreshButton = setTimeout(() => {
        setShowRefreshButton(true);
      }, 8000);

      return () => {
        clearTimeout(timeoutMessage);
        clearTimeout(refreshButton);
      };
    } else {
      setShowTimeoutMessage(false);
      setShowRefreshButton(false);
    }
  }, [isLoading]);

  const handleRefresh = () => {
    window.location.reload();
  };

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="flex flex-col items-center space-y-4 max-w-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-slate-600 dark:text-slate-400">Memverifikasi akses...</p>
          
          {showTimeoutMessage && (
            <div className="text-sm text-orange-600 dark:text-orange-400 mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              ⚠️ Proses verifikasi memakan waktu lebih lama dari biasanya.
              <br />
              Ini bisa terjadi karena koneksi internet yang lambat.
            </div>
          )}
          
          {showRefreshButton && (
            <div className="mt-4 space-y-2">
              <button
                onClick={handleRefresh}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
              >
                Refresh Halaman
              </button>
              <p className="text-xs text-slate-500">
                Atau coba buka di tab baru jika masalah berlanjut
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check admin requirements
  if (requireSuperAdmin && !isSuperAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Akses Ditolak</h1>
          <p className="text-slate-600 dark:text-slate-400">Anda tidak memiliki izin untuk mengakses halaman ini.</p>
          <p className="text-sm text-slate-500 mt-2">Diperlukan akses Super Admin.</p>
        </div>
      </div>
    );
  }

  if (requireAdmin && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Akses Ditolak</h1>
          <p className="text-slate-600 dark:text-slate-400">Anda tidak memiliki izin untuk mengakses halaman ini.</p>
          <p className="text-sm text-slate-500 mt-2">Diperlukan akses Admin.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default ProtectedRoute;
`;

// 3. Perbaiki supabaseClient dengan timeout yang lebih optimal
const supabaseClientPath = path.join(__dirname, 'frontend/src/utils/supabaseClient.ts');
const newSupabaseClient = `import { createClient } from '@supabase/supabase-js';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://jxxzbdivafzzwqhagwrf.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4eHpiZGl2YWZ6endxaGFnd3JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MTkwNTEsImV4cCI6MjA4MDQ5NTA1MX0.ICOtGuxrD19GtawdR9JAsnFn9XsHxWkr1aHCEkgHqXg';

// Singleton pattern untuk menghindari multiple instances
let supabaseInstance: any = null;

const createSupabaseClient = () => {
  if (supabaseInstance) {
    console.log('♻️ Reusing existing Supabase client instance');
    return supabaseInstance;
  }

  try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
        flowType: 'pkce',
        storage: window.localStorage,
        storageKey: 'supabase.auth.token',
        debug: false
      },
      global: {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        fetch: (url, options = {}) => {
          // Timeout yang lebih pendek (15 detik)
          return fetch(url, {
            ...options,
            signal: AbortSignal.timeout(15000)
          });
        }
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    });

    console.log('✅ Supabase client initialized successfully');
    return supabaseInstance;
  } catch (error) {
    console.error('❌ Failed to initialize Supabase client:', error);
    throw error;
  }
};

export const supabase = createSupabaseClient();

// Add connection health check
let isConnected = true;

// Setup auth state listener only once
let authListenerSetup = false;

if (!authListenerSetup && typeof window !== 'undefined') {
  try {
    supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      console.log('🔐 Auth state changed:', event, session ? 'Session exists' : 'No session');

      if (event === 'SIGNED_IN') {
        console.log('✅ User signed in:', session?.user?.email);
        isConnected = true;

        // Update authorization header for axios
        if (session?.access_token) {
          console.log('🔑 Updating authorization header with new token');
          // Import api dynamically to avoid circular dependency
          import('../services/api').then(({ api }) => {
            api.defaults.headers.common['Authorization'] = \`Bearer \${session.access_token}\`;
          }).catch(err => {
            console.warn('Could not update API headers:', err);
          });
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('👋 User signed out');
        // Clear authorization header
        import('../services/api').then(({ api }) => {
          delete api.defaults.headers.common['Authorization'];
        }).catch(err => {
          console.warn('Could not clear API headers:', err);
        });
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('🔄 Token refreshed');
        isConnected = true;

        // Update authorization header with new token
        if (session?.access_token) {
          console.log('🔑 Updating authorization header with refreshed token');
          import('../services/api').then(({ api }) => {
            api.defaults.headers.common['Authorization'] = \`Bearer \${session.access_token}\`;
          }).catch(err => {
            console.warn('Could not update API headers:', err);
          });
        }
      }
    });

    authListenerSetup = true;
  } catch (error) {
    console.error('❌ Failed to setup auth listener:', error);
  }
}

// Export connection status checker dengan timeout yang lebih pendek
export const checkConnection = async (): Promise<boolean> => {
  try {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Connection check timeout')), 5000);
    });

    const checkPromise = supabase.from('admins').select('count').limit(1);
    
    const { error } = await Promise.race([checkPromise, timeoutPromise]) as any;
    isConnected = !error;
    return isConnected;
  } catch (error) {
    console.warn('Connection check failed:', error);
    isConnected = false;
    return false;
  }
};

export const getConnectionStatus = (): boolean => isConnected;

// Test connection on initialization dengan timeout
if (typeof window !== 'undefined') {
  checkConnection().then(connected => {
    console.log('🌐 Initial connection status:', connected ? 'Connected' : 'Disconnected');
  }).catch(err => {
    console.warn('Initial connection check failed:', err);
  });
}
`;

try {
  // Write the fixed files
  fs.writeFileSync(authContextPath, newAuthContext);
  console.log('✅ AuthContext.tsx diperbaiki');

  fs.writeFileSync(protectedRoutePath, newProtectedRoute);
  console.log('✅ ProtectedRoute.tsx diperbaiki');

  fs.writeFileSync(path.join(__dirname, 'frontend/src/utils/supabaseClient.ts'), newSupabaseClient);
  console.log('✅ supabaseClient.ts diperbaiki');

  console.log('\n🎉 Perbaikan Auth timeout selesai!');
  console.log('\nPerbaikan yang dilakukan:');
  console.log('1. ✅ Timeout dikurangi dari 30 detik ke 10 detik untuk init auth');
  console.log('2. ✅ Timeout login dikurangi ke 15 detik');
  console.log('3. ✅ Timeout Supabase fetch dikurangi ke 15 detik');
  console.log('4. ✅ Loading state diperbaiki dengan pesan yang lebih informatif');
  console.log('5. ✅ Tombol refresh otomatis setelah 8 detik loading');
  console.log('6. ✅ Connection check dengan timeout 5 detik');
  console.log('7. ✅ Retry mechanism dipercepat');
  console.log('8. ✅ Error handling yang lebih baik');

  console.log('\n📋 Langkah selanjutnya:');
  console.log('1. Restart aplikasi frontend');
  console.log('2. Test login dengan admin@jempol.com / admin123');
  console.log('3. Jika masih ada masalah, cek koneksi internet dan Supabase');

} catch (error) {
  console.error('❌ Error saat memperbaiki file:', error);
}