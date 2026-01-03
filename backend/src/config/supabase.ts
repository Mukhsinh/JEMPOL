import { createClient } from '@supabase/supabase-js';

// Hardcode sementara untuk debugging
const supabaseUrl = process.env.SUPABASE_URL || 'https://jxxzbdivafzzwqhagwrf.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4eHpiZGl2YWZ6endxaGFnd3JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MTkwNTEsImV4cCI6MjA4MDQ5NTA1MX0.ICOtGuxrD19GtawdR9JAsnFn9XsHxWkr1aHCEkgHqXg';

console.log('🔍 Supabase Config Debug:');
console.log('SUPABASE_URL:', supabaseUrl);
console.log('SUPABASE_SERVICE_ROLE_KEY exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
console.log('SUPABASE_ANON_KEY exists:', !!process.env.SUPABASE_ANON_KEY);
console.log('Final supabaseServiceKey exists:', !!supabaseServiceKey);

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration:');
  console.error('supabaseUrl:', supabaseUrl);
  console.error('supabaseServiceKey:', !!supabaseServiceKey);
  throw new Error('Missing Supabase configuration');
}

// Supabase client untuk backend dengan service role key
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
  global: {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    fetch: (url, options = {}) => {
      // Timeout yang lebih panjang untuk backend (45 detik)
      return fetch(url, {
        ...options,
        signal: AbortSignal.timeout(45000)
      });
    }
  }
});

// Export supabaseAdmin sebagai alias untuk kompatibilitas
export const supabaseAdmin = supabase;

// Test koneksi saat startup
export const testConnection = async (): Promise<boolean> => {
  try {
    console.log('🔄 Testing Supabase connection...');
    const { error } = await supabase.from('admins').select('count').limit(1);
    
    if (error) {
      console.error('❌ Supabase connection failed:', error);
      return false;
    }
    
    console.log('✅ Supabase connection successful');
    return true;
  } catch (error) {
    console.error('❌ Supabase connection error:', error);
    return false;
  }
};

export default supabase;
