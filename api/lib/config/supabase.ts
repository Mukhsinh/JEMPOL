import { createClient, SupabaseClient } from '@supabase/supabase-js';

const isProd = process.env.NODE_ENV === 'production';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConfigured: boolean;
  source: 'production' | 'development' | 'missing';
}

export function getSupabaseConfig(): SupabaseConfig {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
  
  const trimmedUrl = url.trim();
  const trimmedKey = anonKey.trim();
  
  const isConfigured = !!(trimmedUrl && trimmedKey && trimmedUrl.length > 0 && trimmedKey.length > 0);
  
  let source: 'production' | 'development' | 'missing' = 'missing';
  if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
    source = 'production';
  } else if (process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_ANON_KEY) {
    source = 'development';
  }
  
  return {
    url: trimmedUrl,
    anonKey: trimmedKey,
    isConfigured,
    source
  };
}

export function isSupabaseConfigured(): boolean {
  const config = getSupabaseConfig();
  return config.isConfigured;
}

let supabaseClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseClient) {
    return supabaseClient;
  }
  
  const config = getSupabaseConfig();
  
  if (!isProd) {
    console.log('🔧 Supabase Configuration Check:');
    console.log('   Source:', config.source);
    console.log('   URL:', config.url ? `${config.url.substring(0, 40)}...` : 'NOT SET');
    console.log('   Key:', config.anonKey ? `SET (length: ${config.anonKey.length})` : 'NOT SET');
    console.log('   Configured:', config.isConfigured ? '✅ YES' : '❌ NO');
  }
  
  if (!config.isConfigured) {
    console.error('❌ Supabase configuration missing!');
    if (!isProd) {
      console.error('   Please set SUPABASE_URL and SUPABASE_ANON_KEY in Vercel environment variables');
      console.error('   Or set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY for local development');
    }
    return null;
  }
  
  try {
    supabaseClient = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
    if (!isProd) {
      console.log('✅ Supabase client initialized successfully');
    }
    return supabaseClient;
  } catch (error: any) {
    console.error('❌ Failed to initialize Supabase client:', error.message);
    return null;
  }
}

export function logEnvironmentStatus(): void {
  if (isProd) return;
  
  console.log('📋 Environment Variables Status:');
  console.log('   SUPABASE_URL:', process.env.SUPABASE_URL ? 'SET' : 'NOT SET');
  console.log('   SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? 'SET' : 'NOT SET');
  console.log('   VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL ? 'SET' : 'NOT SET');
  console.log('   VITE_SUPABASE_ANON_KEY:', process.env.VITE_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET');
  console.log('   NODE_ENV:', process.env.NODE_ENV || 'NOT SET');
}
