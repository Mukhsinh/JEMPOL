import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase Configuration Interface
 */
export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConfigured: boolean;
  source: 'production' | 'development' | 'missing';
}

/**
 * Get Supabase configuration from environment variables
 * Priority: SUPABASE_* (Vercel production) > VITE_SUPABASE_* (local development)
 */
export function getSupabaseConfig(): SupabaseConfig {
  // Priority: non-VITE vars first (for Vercel), then VITE vars (for local dev)
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
  
  // Trim whitespace yang mungkin ada
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

/**
 * Check if Supabase is properly configured
 */
export function isSupabaseConfigured(): boolean {
  const config = getSupabaseConfig();
  return config.isConfigured;
}

/**
 * Singleton Supabase client instance
 */
let supabaseClient: SupabaseClient | null = null;

/**
 * Get or create Supabase client
 * Returns null if configuration is missing
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseClient) {
    return supabaseClient;
  }
  
  const config = getSupabaseConfig();
  
  // Log configuration status
  console.log('🔧 Supabase Configuration Check:');
  console.log('   Source:', config.source);
  console.log('   URL:', config.url ? `${config.url.substring(0, 40)}...` : 'NOT SET');
  console.log('   Key:', config.anonKey ? `SET (length: ${config.anonKey.length})` : 'NOT SET');
  console.log('   Configured:', config.isConfigured ? '✅ YES' : '❌ NO');
  
  if (!config.isConfigured) {
    console.error('❌ Supabase configuration missing!');
    console.error('   Please set SUPABASE_URL and SUPABASE_ANON_KEY in Vercel environment variables');
    console.error('   Or set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY for local development');
    return null;
  }
  
  try {
    supabaseClient = createClient(config.url, config.anonKey);
    console.log('✅ Supabase client initialized successfully');
    return supabaseClient;
  } catch (error: any) {
    console.error('❌ Failed to initialize Supabase client:', error.message);
    return null;
  }
}

/**
 * Log environment variables for debugging (safe - no sensitive data)
 */
export function logEnvironmentStatus(): void {
  console.log('📋 Environment Variables Status:');
  console.log('   SUPABASE_URL:', process.env.SUPABASE_URL ? 'SET' : 'NOT SET');
  console.log('   SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? 'SET' : 'NOT SET');
  console.log('   VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL ? 'SET' : 'NOT SET');
  console.log('   VITE_SUPABASE_ANON_KEY:', process.env.VITE_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET');
  console.log('   NODE_ENV:', process.env.NODE_ENV || 'NOT SET');
}
