// Script untuk mengatasi masalah timeout dan QUIC protocol error Supabase
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jxxzbdivafzzwqhagwrf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4eHpiZGl2YWZ6endxaGFnd3JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MTkwNTEsImV4cCI6MjA4MDQ5NTA1MX0.ICOtGuxrD19GtawdR9JAsnFn9XsHxWkr1aHCEkgHqXg';

// Konfigurasi dengan timeout dan retry yang lebih baik
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false
  },
  global: {
    headers: {
      'Connection': 'keep-alive',
      'Cache-Control': 'no-cache'
    }
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

async function testConnection() {
  console.log('🔍 Testing Supabase connection...');
  
  try {
    // Test 1: Basic connection
    console.log('1. Testing basic connection...');
    const { data, error } = await supabase.from('auth.users').select('count').limit(1);
    if (error) {
      console.log('❌ Basic connection failed:', error.message);
    } else {
      console.log('✅ Basic connection successful');
    }

    // Test 2: Auth service
    console.log('2. Testing auth service...');
    const { data: session } = await supabase.auth.getSession();
    console.log('✅ Auth service accessible, session:', session ? 'exists' : 'none');

    // Test 3: Test login dengan credentials yang benar
    console.log('3. Testing login...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'admin@jempol.com',
      password: 'admin123'
    });

    if (loginError) {
      console.log('❌ Login failed:', loginError.message);
      
      // Coba dengan password alternatif
      console.log('3b. Trying alternative password...');
      const { data: altLoginData, error: altLoginError } = await supabase.auth.signInWithPassword({
        email: 'admin@jempol.com',
        password: 'password123'
      });
      
      if (altLoginError) {
        console.log('❌ Alternative login failed:', altLoginError.message);
      } else {
        console.log('✅ Alternative login successful');
        console.log('User:', altLoginData.user?.email);
      }
    } else {
      console.log('✅ Login successful');
      console.log('User:', loginData.user?.email);
    }

  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    
    // Analisis error
    if (error.message.includes('QUIC_PROTOCOL_ERROR')) {
      console.log('🔧 QUIC Protocol Error detected - trying HTTP/1.1 fallback');
    }
    if (error.message.includes('NETWORK_IDLE_TIMEOUT')) {
      console.log('🔧 Network timeout detected - connection may be slow');
    }
    if (error.message.includes('ERR_INTERNET_DISCONNECTED')) {
      console.log('🔧 Internet connection issue detected');
    }
  }
}

async function fixConnectionIssues() {
  console.log('🔧 Attempting to fix connection issues...');
  
  try {
    // Clear any cached sessions
    await supabase.auth.signOut();
    console.log('✅ Cleared cached sessions');
    
    // Test with fresh connection
    await testConnection();
    
  } catch (error) {
    console.error('❌ Fix attempt failed:', error.message);
  }
}

// Jalankan test dan fix
async function main() {
  console.log('🚀 Starting Supabase connection diagnostics...\n');
  
  await testConnection();
  console.log('\n' + '='.repeat(50) + '\n');
  await fixConnectionIssues();
  
  console.log('\n✨ Diagnostics complete!');
  console.log('\n📋 Recommendations:');
  console.log('1. Check internet connection stability');
  console.log('2. Try disabling QUIC in browser (chrome://flags/#enable-quic)');
  console.log('3. Use HTTP/1.1 instead of HTTP/2 if issues persist');
  console.log('4. Consider using a VPN if regional connectivity issues exist');
}

main().catch(console.error);