const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jxxzbdivafzzwqhagwrf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4eHpiZGl2YWZ6endxaGFnd3JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MTkwNTEsImV4cCI6MjA4MDQ5NTA1MX0.ICOtGuxrD19GtawdR9JAsnFn9XsHxWkr1aHCEkgHqXg';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testLogin() {
  console.log('🔄 Testing login for admin@jempol.com...\n');

  try {
    // Test 1: Sign out first
    console.log('1️⃣ Signing out any existing session...');
    await supabase.auth.signOut();
    console.log('✅ Signed out\n');

    // Test 2: Try to login
    console.log('2️⃣ Attempting login...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'admin@jempol.com',
      password: 'Admin123!@#',
    });

    if (authError) {
      console.error('❌ Auth Error:', authError.message);
      console.error('Error details:', JSON.stringify(authError, null, 2));
      return;
    }

    console.log('✅ Auth successful!');
    console.log('User ID:', authData.user?.id);
    console.log('Email:', authData.user?.email);
    console.log('Session token:', authData.session?.access_token?.substring(0, 50) + '...\n');

    // Test 3: Fetch admin profile
    console.log('3️⃣ Fetching admin profile...');
    const { data: adminProfile, error: profileError } = await supabase
      .from('admins')
      .select('*')
      .eq('email', 'admin@jempol.com')
      .eq('is_active', true)
      .single();

    if (profileError) {
      console.error('❌ Profile Error:', profileError.message);
      console.error('Error details:', JSON.stringify(profileError, null, 2));
      return;
    }

    console.log('✅ Admin profile found!');
    console.log('Admin data:', JSON.stringify(adminProfile, null, 2));

    // Test 4: Test with different passwords
    console.log('\n4️⃣ Testing other possible passwords...');
    const passwords = ['admin123', 'Admin123', 'Admin123!', 'Admin@123'];
    
    for (const pwd of passwords) {
      await supabase.auth.signOut();
      const { error } = await supabase.auth.signInWithPassword({
        email: 'admin@jempol.com',
        password: pwd,
      });
      
      if (!error) {
        console.log(`✅ Password yang benar: "${pwd}"`);
        break;
      } else {
        console.log(`❌ Password "${pwd}" salah`);
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testLogin();
