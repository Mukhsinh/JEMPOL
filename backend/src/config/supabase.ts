import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

console.log('🔧 Supabase Config:', {
  url: supabaseUrl,
  hasAnonKey: !!supabaseAnonKey,
  hasServiceKey: !!supabaseServiceKey,
  serviceKeyValid: supabaseServiceKey && supabaseServiceKey.length > 100 && !supabaseServiceKey.includes('placeholder')
});

// Create client with anon key for regular operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Create admin client - use service role key for admin operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

console.log('✅ Supabase clients created:', {
  regularClient: 'supabase (anon)',
  adminClient: 'supabaseAdmin (anon with auth context)',
  note: 'Authentication handled by middleware'
});

export default supabase;
