/**
 * Script untuk memperbaiki masalah connection timeout
 * Mengatasi error: Connection check timeout dan Auth initialization timeout
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Memperbaiki masalah connection timeout...');

// 1. Update supabaseClient-fixed.ts dengan timeout yang lebih optimal
const supabaseClientFixedPath = path.join(__dirname, 'frontend/src/utils/supabaseClient-fixed.ts');
const supabaseClientFixedContent = `import { createClient } from '@supabase/supabase-js';
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
          // Timeout yang optimal (20 detik) - tidak terlalu pendek, tidak terlalu panjang
          return fetch(url, {
            ...options,
            signal: AbortSignal.timeout(20000)
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

// Export connection status checker dengan timeout yang optimal
export const checkConnection = async (): Promise<boolean> => {
  try {
    // Timeout 10 detik - cukup untuk koneksi lambat tapi tidak terlalu lama
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Connection check timeout')), 10000);
    });

    // Simple query untuk test koneksi
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

// Test connection on initialization dengan graceful handling
if (typeof window !== 'undefined') {
  // Delay initial check untuk menghindari race condition
  setTimeout(() => {
    checkConnection().then(connected => {
      console.log('🌐 Initial connection status:', connected ? 'Connected' : 'Disconnected');
    }).catch(err => {
      console.warn('Initial connection check failed:', err);
    });
  }, 1000);
}
`;

try {
  fs.writeFileSync(supabaseClientFixedPath, supabaseClientFixedContent);
  console.log('✅ Updated supabaseClient-fixed.ts');
} catch (error) {
  console.error('❌ Error updating supabaseClient-fixed.ts:', error);
}

// 2. Update AuthContext.tsx dengan timeout handling yang lebih baik
const authContextPath = path.join(__dirname, 'frontend/src/contexts/AuthContext.tsx');
const authContextContent = `import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../utils/supabaseClient-fixed';
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

        // Timeout yang lebih realistis (15 detik)
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Auth initialization timeout')), 15000);
        });

        const authPromise = (async () => {
          try {
            // Quick connection test first dengan timeout pendek
            const quickTestPromise = new Promise((resolve, reject) => {
              setTimeout(() => reject(new Error('Quick test timeout')), 5000);
            });

            try {
              const quickTest = supabase.from('admins').select('count').limit(1);
              await Promise.race([quickTest, quickTestPromise]);
              console.log('✅ Quick connection test passed');
            } catch (testError) {
              console.warn('⚠️ Quick connection test failed, continuing anyway:', testError);
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
        // Always set loading to false
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

      // Login dengan timeout yang optimal (20 detik)
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

      // Get admin profile dengan retry mechanism yang lebih cepat
      let adminProfile = null;
      let profileError = null;
      
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const profilePromise = supabase
            .from('admins')
            .select('id, username, full_name, email, role, is_active')
            .eq('email', cleanEmail)
            .eq('is_active', true)
            .single();

          const profileTimeout = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Profile fetch timeout')), 8000);
          });

          const { data, error } = await Promise.race([profilePromise, profileTimeout]) as any;

          if (!error && data) {
            adminProfile = data;
            break;
          } else {
            profileError = error;
            console.warn(\`⚠️ Profile fetch attempt \${attempt} failed:\`, error);
            
            if (attempt < 3) {
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }
        } catch (err) {
          profileError = err;
          console.warn(\`⚠️ Profile fetch attempt \${attempt} error:\`, err);
          
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
`;

try {
  fs.writeFileSync(authContextPath, authContextContent);
  console.log('✅ Updated AuthContext.tsx');
} catch (error) {
  console.error('❌ Error updating AuthContext.tsx:', error);
}

// 3. Update supabaseClient.ts utama juga
const supabaseClientPath = path.join(__dirname, 'frontend/src/utils/supabaseClient.ts');
const supabaseClientContent = `import { createClient } from '@supabase/supabase-js';
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
          // Timeout yang optimal (20 detik)
          return fetch(url, {
            ...options,
            signal: AbortSignal.timeout(20000)
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

// Export connection status checker dengan timeout yang optimal
export const checkConnection = async (): Promise<boolean> => {
  try {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Connection check timeout')), 10000);
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

// Test connection on initialization dengan graceful handling
if (typeof window !== 'undefined') {
  // Delay initial check untuk menghindari race condition
  setTimeout(() => {
    checkConnection().then(connected => {
      console.log('🌐 Initial connection status:', connected ? 'Connected' : 'Disconnected');
    }).catch(err => {
      console.warn('Initial connection check failed:', err);
    });
  }, 1000);
}
`;

try {
  fs.writeFileSync(supabaseClientPath, supabaseClientContent);
  console.log('✅ Updated supabaseClient.ts');
} catch (error) {
  console.error('❌ Error updating supabaseClient.ts:', error);
}

console.log('');
console.log('🎉 Perbaikan connection timeout selesai!');
console.log('');
console.log('📋 Perubahan yang dilakukan:');
console.log('1. ✅ Timeout fetch diubah dari 3 detik ke 20 detik');
console.log('2. ✅ Connection check timeout diubah dari 3 detik ke 10 detik');
console.log('3. ✅ Auth initialization timeout diubah dari 30 detik ke 15 detik');
console.log('4. ✅ Login timeout diubah dari 30 detik ke 20 detik');
console.log('5. ✅ Profile fetch timeout ditambahkan (8 detik)');
console.log('6. ✅ Quick connection test ditambahkan (5 detik)');
console.log('7. ✅ Delay initial connection check untuk menghindari race condition');
console.log('');
console.log('🚀 Silakan restart aplikasi untuk menerapkan perubahan');