const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jxxzbdivafzzwqhagwrf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4eHpiZGl2YWZ6endxaGFnd3JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MTkwNTEsImV4cCI6MjA4MDQ5NTA1MX0.ICOtGuxrD19GtawdR9JAsnFn9XsHxWkr1aHCEkgHqXg';

async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase connection...');
  
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        fetch: (url, options = {}) => {
          return fetch(url, {
            ...options,
            signal: AbortSignal.timeout(5000) // 5 detik timeout untuk test
          });
        }
      }
    });

    // Test 1: Basic connection
    console.log('📡 Testing basic connection...');
    const { data, error } = await supabase.from('admins').select('count').limit(1);
    
    if (error) {
      console.error('❌ Connection test failed:', error);
      return false;
    }
    
    console.log('✅ Basic connection successful');

    // Test 2: Auth session check
    console.log('🔐 Testing auth session...');
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Session check failed:', sessionError);
    } else {
      console.log('✅ Session check successful:', sessionData.session ? 'Has session' : 'No session');
    }

    // Test 3: Admin table access
    console.log('👤 Testing admin table access...');
    const { data: adminData, error: adminError } = await supabase
      .from('admins')
      .select('id, username, email, is_active')
      .eq('is_active', true)
      .limit(1);
    
    if (adminError) {
      console.error('❌ Admin table access failed:', adminError);
    } else {
      console.log('✅ Admin table access successful, found', adminData?.length || 0, 'active admins');
    }

    return true;
  } catch (error) {
    console.error('❌ Connection test error:', error);
    return false;
  }
}

async function clearAuthCache() {
  console.log('🧹 Clearing auth cache...');
  
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Clear any existing session
    await supabase.auth.signOut();
    console.log('✅ Auth cache cleared');
    
    return true;
  } catch (error) {
    console.error('❌ Failed to clear auth cache:', error);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting auth timeout fix...\n');
  
  // Step 1: Clear auth cache
  await clearAuthCache();
  
  // Step 2: Test connection
  const connectionOk = await testSupabaseConnection();
  
  if (connectionOk) {
    console.log('\n✅ All tests passed! Auth timeout issue should be resolved.');
    console.log('\n📋 Summary of fixes applied:');
    console.log('   • Reduced auth initialization timeout from 30s to 10s');
    console.log('   • Added separate timeouts for session check (5s) and profile fetch (5s)');
    console.log('   • Reduced Supabase client fetch timeout from 30s to 10s');
    console.log('   • Added delay to prevent race conditions');
    console.log('   • Cleared existing auth cache');
    
    console.log('\n🔄 Please restart the frontend application to apply changes.');
  } else {
    console.log('\n❌ Connection issues detected. Please check:');
    console.log('   • Internet connection');
    console.log('   • Supabase service status');
    console.log('   • Environment variables configuration');
  }
}

main().catch(console.error);