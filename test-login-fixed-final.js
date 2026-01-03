const { createClient } = require('@supabase/supabase-js');

// Konfigurasi Supabase
const supabaseUrl = 'https://jxxzbdivafzzwqhagwrf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4eHpiZGl2YWZ6endxaGFnd3JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MTkwNTEsImV4cCI6MjA4MDQ5NTA1MX0.ICOtGuxrD19GtawdR9JAsnFn9XsHxWkr1aHCEkgHqXg';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testLogin() {
  console.log('🧪 Testing login dengan kredensial yang sudah diperbaiki...');
  
  try {
    const testAccounts = [
      { email: 'admin@jempol.com', password: 'admin123' },
      { email: 'mukhsin9@gmail.com', password: 'admin123' }
    ];
    
    for (const account of testAccounts) {
      console.log(`\n📧 Testing login: ${account.email}`);
      
      // Clear any existing session
      await supabase.auth.signOut();
      
      // Test login
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: account.email,
        password: account.password
      });
      
      if (authError) {
        console.error('❌ Login failed:', authError.message);
        continue;
      }
      
      if (!authData.user || !authData.session) {
        console.error('❌ Login failed: No user or session data');
        continue;
      }
      
      console.log('✅ Auth login successful!');
      console.log(`   User ID: ${authData.user.id}`);
      console.log(`   Email: ${authData.user.email}`);
      
      // Test getting admin profile
      const { data: adminProfile, error: profileError } = await supabase
        .from('admins')
        .select('*')
        .eq('email', account.email)
        .eq('is_active', true)
        .single();
      
      if (profileError) {
        console.error('❌ Admin profile error:', profileError.message);
      } else {
        console.log('✅ Admin profile found!');
        console.log(`   Username: ${adminProfile.username}`);
        console.log(`   Role: ${adminProfile.role}`);
        console.log(`   Full Name: ${adminProfile.full_name || 'N/A'}`);
      }
      
      // Sign out
      await supabase.auth.signOut();
      console.log('✅ Signed out successfully');
    }
    
    console.log('\n🎉 Test login selesai!');
    console.log('\n📋 Kredensial yang dapat digunakan:');
    testAccounts.forEach(account => {
      console.log(`   Email: ${account.email}`);
      console.log(`   Password: ${account.password}\n`);
    });
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

// Jalankan test
testLogin();