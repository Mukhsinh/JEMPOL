const { createClient } = require('@supabase/supabase-js');

// Konfigurasi Supabase
const SUPABASE_URL = 'https://jxxzbdivafzzwqhagwrf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4eHpiZGl2YWZ6endxaGFnd3JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MTkwNTEsImV4cCI6MjA4MDQ5NTA1MX0.ICOtGuxrD19GtawdR9JAsnFn9XsHxWkr1aHCEkgHqXg';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function createAuthUser() {
  console.log('🔧 Membuat auth user untuk QR Management...');
  
  try {
    const adminEmail = 'admin@kiss.com';
    const adminPassword = 'admin123';
    
    // Coba signup dulu
    console.log('📝 Creating auth user...');
    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email: adminEmail,
      password: adminPassword
    });
    
    if (signupError) {
      if (signupError.message.includes('already registered')) {
        console.log('✅ Auth user already exists');
      } else {
        console.error('❌ Signup error:', signupError.message);
        return;
      }
    } else {
      console.log('✅ Auth user created');
    }
    
    // Coba login untuk test
    console.log('🔐 Testing login...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword
    });
    
    if (loginError) {
      console.error('❌ Login error:', loginError.message);
      
      if (loginError.message.includes('Email not confirmed')) {
        console.log('⚠️ Email needs confirmation - this is expected for new users');
        console.log('💡 In production, user would need to confirm email');
        console.log('💡 For testing, we can proceed with the existing admin record');
      }
    } else {
      console.log('✅ Login successful');
      console.log('📧 User email:', loginData.user.email);
      console.log('🔑 Token available:', !!loginData.session?.access_token);
    }
    
    console.log('\n✅ Auth user setup completed!');
    console.log('\n📋 Test credentials:');
    console.log('Email: admin@kiss.com');
    console.log('Password: admin123');
    console.log('\n💡 Note: If email confirmation is required, use existing admin@jempol.com for testing');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Jalankan
createAuthUser();