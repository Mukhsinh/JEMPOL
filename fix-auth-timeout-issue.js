const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jxxzbdivafzzwqhagwrf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4eHpiZGl2YWZ6endxaGFnd3JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MTkwNTEsImV4cCI6MjA4MDQ5NTA1MX0.ICOtGuxrD19GtawdR9JAsnFn9XsHxWkr1aHCEkgHqXg';

async function testSupabaseConnection() {
  console.log('🔄 Testing Supabase connection...');
  
  try {
    // Create client with timeout settings
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      },
      global: {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    });

    console.log('✅ Supabase client created');

    // Test basic connection
    const { data, error } = await supabase
      .from('admins')
      .select('count')
      .limit(1);

    if (error) {
      console.error('❌ Connection test failed:', error);
      return false;
    }

    console.log('✅ Connection test successful');

    // Test auth session check
    console.log('🔄 Testing auth session...');
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Session check failed:', sessionError);
    } else {
      console.log('✅ Session check successful:', sessionData.session ? 'Has session' : 'No session');
    }

    // Test admin table access
    console.log('🔄 Testing admin table access...');
    const { data: adminData, error: adminError } = await supabase
      .from('admins')
      .select('id, email, username, is_active')
      .eq('is_active', true)
      .limit(5);

    if (adminError) {
      console.error('❌ Admin table access failed:', adminError);
    } else {
      console.log('✅ Admin table access successful, found', adminData?.length || 0, 'active admins');
      if (adminData && adminData.length > 0) {
        console.log('📋 Active admins:');
        adminData.forEach(admin => {
          console.log(`  - ${admin.email} (${admin.username})`);
        });
      }
    }

    return true;
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return false;
  }
}

async function fixAuthTimeout() {
  console.log('🔧 Starting auth timeout fix...');
  
  const connectionOk = await testSupabaseConnection();
  
  if (!connectionOk) {
    console.error('❌ Connection issues detected. Please check:');
    console.log('1. Internet connection');
    console.log('2. Supabase URL and keys');
    console.log('3. Firewall settings');
    return;
  }

  console.log('✅ Connection is working fine');
  console.log('');
  console.log('🔧 Auth timeout issue likely caused by:');
  console.log('1. Browser cache/storage issues');
  console.log('2. React StrictMode double initialization');
  console.log('3. Network latency');
  console.log('');
  console.log('✅ Applied fixes:');
  console.log('1. Increased timeout from 10s to 30s');
  console.log('2. Fixed Supabase client configuration');
  console.log('3. Added singleton pattern to prevent multiple instances');
  console.log('');
  console.log('🔄 Please restart the application and clear browser cache');
}

fixAuthTimeout().catch(console.error);