import { createClient } from '@supabase/supabase-js';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

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
          // Timeout lebih singkat (15 detik) tanpa retry untuk performa lebih cepat
          const timeout = 15000;
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
            throw error;
          }
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
    
    // Clear all possible Supabase storage keys
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('sb-') || key.includes('supabase')) {
        localStorage.removeItem(key);
      }
    });
    
    sessionStorage.clear();
  } catch (e) {
    // Force clear even if signOut fails
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('sb-') || key.includes('supabase')) {
          localStorage.removeItem(key);
        }
      });
      sessionStorage.clear();
    } catch (err) {
      // Silent error
    }
  }
};

// Clear invalid session on page load
if (typeof window !== 'undefined') {
  try {
    const keys = Object.keys(localStorage);
    const supabaseKeys = keys.filter(key => key.startsWith('sb-') || key.includes('supabase'));
    
    supabaseKeys.forEach(key => {
      try {
        const data = localStorage.getItem(key);
        if (data) {
          const parsed = JSON.parse(data);
          // Check if refresh token is invalid or expired
          if (parsed.refresh_token && (
            typeof parsed.refresh_token !== 'string' ||
            parsed.refresh_token === 'null' ||
            parsed.refresh_token === ''
          )) {
            console.log('Clearing invalid session on page load');
            localStorage.removeItem(key);
          }
          
          // Check if access token is expired
          if (parsed.expires_at) {
            const expiresAt = new Date(parsed.expires_at * 1000);
            if (expiresAt < new Date()) {
              console.log('Clearing expired session on page load');
              localStorage.removeItem(key);
            }
          }
        }
      } catch (e) {
        // Invalid JSON, remove it
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    // Silent error
  }
}

// Auto-clear session on 400 error - DISABLED to prevent infinite reload
// This was causing issues with login flow
if (typeof window !== 'undefined') {
  // Only clear on explicit 400 error, not on page load
  const originalGetSession = supabase.auth.getSession.bind(supabase.auth);
  supabase.auth.getSession = async function() {
    try {
      const result = await originalGetSession();
      
      // If error contains 400 or invalid session, clear it
      if (result.error && (
        result.error.message.includes('400') || 
        result.error.message.includes('invalid') ||
        result.error.message.includes('refresh_token')
      )) {
        console.log('Detected invalid session, clearing...');
        await clearInvalidSession();
        // Return empty session instead of error
        return { data: { session: null }, error: null };
      }
      
      return result;
    } catch (e) {
      console.error('Error in getSession:', e);
      return { data: { session: null }, error: null };
    }
  };
}

// Handle 400 errors globally - DISABLED to prevent interference with login
// The error handling is now done in authService.ts
// if (typeof window !== 'undefined') {
//   const originalFetch = window.fetch;
//   window.fetch = async (...args) => {
//     try {
//       const response = await originalFetch(...args);
//       
//       // If 400 error from Supabase, clear session
//       if (response.status === 400 && args[0].toString().includes('supabase.co')) {
//         const url = args[0].toString();
//         if (url.includes('/auth/') || url.includes('/rest/')) {
//           console.log('400 error detected, clearing invalid session...');
//           await clearInvalidSession();
//         }
//       }
//       
//       return response;
//     } catch (error) {
//       throw error;
//     }
//   };
// }

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