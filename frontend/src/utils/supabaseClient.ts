import { createClient } from '@supabase/supabase-js';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://jxxzbdivafzzwqhagwrf.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4eHpiZGl2YWZ6endxaGFnd3JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MTkwNTEsImV4cCI6MjA4MDQ5NTA1MX0.ICOtGuxrD19GtawdR9JAsnFn9XsHxWkr1aHCEkgHqXg';

// Singleton pattern untuk menghindari multiple instances dan meningkatkan performa
let supabaseInstance: any = null;

const createSupabaseClient = () => {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
        flowType: 'pkce',
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        storageKey: 'supabase.auth.token',
        debug: false
      },
      global: {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        fetch: async (url, options = {}) => {
          // Timeout lebih panjang (30 detik) dengan retry
          const maxRetries = 2;
          const timeout = 30000;
          
          for (let attempt = 0; attempt <= maxRetries; attempt++) {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);
            
            try {
              const response = await fetch(url, {
                ...options,
                signal: controller.signal
              });
              clearTimeout(timeoutId);
              return response;
            } catch (error: any) {
              clearTimeout(timeoutId);
              if (attempt === maxRetries || error.name !== 'AbortError') {
                throw error;
              }
              // Wait before retry
              await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
            }
          }
          throw new Error('Request failed after retries');
        }
      },
      realtime: {
        params: {
          eventsPerSecond: 5 // Kurangi untuk performa lebih baik
        }
      }
    });

    return supabaseInstance;
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    throw error;
  }
};

export const supabase = createSupabaseClient();

// Connection status tracking dengan cache untuk performa
let isConnected = true;
let lastConnectionCheck = 0;
const CONNECTION_CHECK_INTERVAL = 60000; // 1 menit untuk mengurangi overhead

// Setup auth state listener hanya sekali
let authListenerSetup = false;

if (!authListenerSetup && typeof window !== 'undefined') {
  try {
    supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      if (event === 'SIGNED_IN' && session?.access_token) {
        isConnected = true;
        // Update authorization header untuk axios
        import('../services/api').then(({ api }) => {
          api.defaults.headers.common['Authorization'] = `Bearer ${session.access_token}`;
        }).catch(() => {});
      } else if (event === 'SIGNED_OUT') {
        import('../services/api').then(({ api }) => {
          delete api.defaults.headers.common['Authorization'];
        }).catch(() => {});
      } else if (event === 'TOKEN_REFRESHED' && session?.access_token) {
        isConnected = true;
        import('../services/api').then(({ api }) => {
          api.defaults.headers.common['Authorization'] = `Bearer ${session.access_token}`;
        }).catch(() => {});
      }
      
      // Handle token refresh error - clear invalid session
      if (event === 'TOKEN_REFRESHED' && !session) {
        console.log('Token refresh failed, clearing session...');
        try {
          await supabase.auth.signOut();
          localStorage.removeItem('supabase.auth.token');
        } catch (e) {
          // Silent error
        }
      }
    });

    authListenerSetup = true;
  } catch (error) {
    console.error('Failed to setup auth listener:', error);
  }
}

// Helper untuk clear invalid session
export const clearInvalidSession = async () => {
  try {
    await supabase.auth.signOut();
    localStorage.removeItem('supabase.auth.token');
    localStorage.removeItem('sb-jxxzbdivafzzwqhagwrf-auth-token');
  } catch (e) {
    // Silent error
  }
};

// Connection checker yang dioptimalkan dengan cache dan timeout singkat
export const checkConnection = async (): Promise<boolean> => {
  const now = Date.now();
  
  // Return cached result jika baru saja dicek
  if (now - lastConnectionCheck < CONNECTION_CHECK_INTERVAL && isConnected) {
    return isConnected;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500); // Timeout lebih singkat
    
    const { error } = await supabase
      .from('admins')
      .select('count')
      .limit(1)
      .abortSignal(controller.signal);
    
    clearTimeout(timeoutId);
    isConnected = !error;
    lastConnectionCheck = now;
    return isConnected;
  } catch (error) {
    isConnected = false;
    lastConnectionCheck = now;
    return false;
  }
};

export const getConnectionStatus = (): boolean => isConnected;