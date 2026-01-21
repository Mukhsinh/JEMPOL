const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jxxzbdivafzzwqhagwrf.supabase.co';
// Gunakan service role key untuk reset password
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4eHpiZGl2YWZ6endxaGFnd3JmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDkxOTA1MSwiZXhwIjoyMDgwNDk1MDUxfQ.Yx_Yx-Yx-Yx-Yx-Yx-Yx-Yx-Yx-Yx-Yx-Yx-Yx-Yx-Yx-Yx-Yx';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function resetPassword() {
  console.log('🔄 Resetting password untuk admin@jempol.com...\n');

  try {
    // Get user ID dari auth.users
    const { data: users, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) {
      console.error('❌ Error listing users:', userError.message);
      return;
    }

    const user = users.users.find(u => u.email === 'admin@jempol.com');
    
    if (!user) {
      console.error('❌ User tidak ditemukan');
      return;
    }

    console.log('✅ User ditemukan:', user.id);
    console.log('Email:', user.email);
    console.log('Email confirmed:', user.email_confirmed_at ? 'Yes' : 'No');

    // Reset password ke "Admin123!@#"
    const newPassword = 'Admin123!@#';
    
    console.log('\n🔄 Updating password...');
    const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { 
        password: newPassword,
        email_confirm: true
      }
    );

    if (updateError) {
      console.error('❌ Error updating password:', updateError.message);
      return;
    }

    console.log('✅ Password berhasil direset!');
    console.log('\n📋 Credentials untuk login:');
    console.log('Email: admin@jempol.com');
    console.log('Password: Admin123!@#');
    console.log('\n🔄 Testing login dengan password baru...');

    // Test login dengan password baru
    const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4eHpiZGl2YWZ6endxaGFnd3JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MTkwNTEsImV4cCI6MjA4MDQ5NTA1MX0.ICOtGuxrD19GtawdR9JAsnFn9XsHxWkr1aHCEkgHqXg';
    const testClient = createClient(supabaseUrl, anonKey);

    const { data: authData, error: authError } = await testClient.auth.signInWithPassword({
      email: 'admin@jempol.com',
      password: newPassword,
    });

    if (authError) {
      console.error('❌ Login test failed:', authError.message);
      return;
    }

    console.log('✅ Login test berhasil!');
    console.log('User ID:', authData.user?.id);
    console.log('Email:', authData.user?.email);

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

resetPassword();
