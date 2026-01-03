import { createClient } from '@supabase/supabase-js';
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
            api.defaults.headers.common['Authorization'] = `Bearer ${session.access_token}`;
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
            api.defaults.headers.common['Authorization'] = `Bearer ${session.access_token}`;
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
