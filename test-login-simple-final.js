const { createClient } = require('@supabase/supabase-js');

// Konfigurasi Supabase
const supabaseUrl = 'https://jxxzbdivafzzwqhagwrf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4eHpiZGl2YWZ6endxaGFnd3JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MTkwNTEsImV4cCI6MjA4MDQ5NTA1MX0.ICOtGuxrD19GtawdR9JAsnFn9XsHxWkr1aHCEkgHqXg';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testLogin() {
  try {
    console.log('🔍 Testing login...');
    console.log('URL:', supabaseUrl);
    console.log('Key:', supabaseAnonKey.substring(0, 50) + '...');

    const email = 'admin@jempol.com';
    const password = 'admin123';

    console.log(`\n🔄 Attempting login for: ${email}`);

    // Clear any existing session
    await supabase.auth.signOut();
    console.log('🧹 Cleared existing session');

    // Test connection first
    console.log('🔍 Testing database connection...');
    const { data: testData, error: testError } = await supabase
      .from('admins')
      .select('count')
      .limit(1);

    if (testError) {
      console.error('❌ Database connection failed:', testError);
      return;
    }

    console.log('✅ Database connection successful');

    // Attempt login
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (authError) {
      console.error('❌ Login failed:', authError.message);
      
      if (authError.message.includes('Invalid login credentials')) {
        console.log('\n💡 Kemungkinan penyebab:');
        console.log('1. Password tidak sinkron antara Auth dan Database');
        console.log('2. User belum ada di Supabase Auth');
        console.log('3. Email belum dikonfirmasi');
        console.log('\n🔧 Solusi: Jalankan reset-admin-password-final.js');
      }
      return;
    }

    if (!authData?.user) {
      console.error('❌ No user data returned');
      return;
    }

    console.log('✅ Login successful!');
    console.log('📧 Email:', authData.user.email);
    console.log('🆔 User ID:', authData.user.id);
    console.log('✅ Email confirmed:', authData.user.email_confirmed_at ? 'Yes' : 'No');

    // Test admin profile fetch
    console.log('\n🔍 Fetching admin profile...');
    const { data: adminProfile, error: profileError } = await supabase
      .from('admins')
      .select('*')
      .eq('email', email)
      .single();

    if (profileError) {
      console.error('❌ Profile fetch failed:', profileError);
      return;
    }

    console.log('✅ Admin profile found:');
    console.log('👤 Username:', adminProfile.username);
    console.log('🏷️ Role:', adminProfile.role);
    console.log('✅ Active:', adminProfile.is_active);

    console.log('\n🎉 LOGIN TEST BERHASIL!');
    console.log('Aplikasi seharusnya bisa login dengan kredensial ini.');

    // Sign out
    await supabase.auth.signOut();
    console.log('👋 Signed out');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Jalankan test
testLogin();