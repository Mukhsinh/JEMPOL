const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jxxzbdivafzzwqhagwrf.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4eHpiZGl2YWZ6endxaGFnd3JmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDkxOTA1MSwiZXhwIjoyMDgwNDk1MDUxfQ.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fixAdminLogin() {
  console.log('🔧 Memperbaiki login admin...');

  try {
    // 1. Pastikan email dikonfirmasi
    console.log('📧 Mengkonfirmasi email admin...');
    const { error: confirmError } = await supabase.auth.admin.updateUserById(
      'e235a49c-e8bb-4a28-8571-8509a849ee5c',
      { email_confirm: true }
    );

    if (confirmError) {
      console.error('❌ Error konfirmasi email:', confirmError);
    } else {
      console.log('✅ Email admin dikonfirmasi');
    }

    // 2. Reset password admin
    console.log('🔑 Reset password admin...');
    const { error: resetError } = await supabase.auth.admin.updateUserById(
      'e235a49c-e8bb-4a28-8571-8509a849ee5c',
      { password: 'admin123' }
    );

    if (resetError) {
      console.error('❌ Error reset password:', resetError);
    } else {
      console.log('✅ Password admin direset ke: admin123');
    }

    // 3. Test login dengan anon key
    console.log('🧪 Testing login...');
    const anonClient = createClient(supabaseUrl, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4eHpiZGl2YWZ6endxaGFnd3JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MTkwNTEsImV4cCI6MjA4MDQ5NTA1MX0.ICOtGuxrD19GtawdR9JAsnFn9XsHxWkr1aHCEkgHqXg');

    const { data: loginData, error: loginError } = await anonClient.auth.signInWithPassword({
      email: 'admin@kiss.com',
      password: 'admin123'
    });

    if (loginError) {
      console.error('❌ Test login gagal:', loginError);
    } else {
      console.log('✅ Test login berhasil!');
      console.log('👤 User:', loginData.user?.email);
      
      // Test akses ke tabel admins
      const { data: adminData, error: adminError } = await anonClient
        .from('admins')
        .select('*')
        .eq('email', 'admin@kiss.com')
        .single();

      if (adminError) {
        console.error('❌ Error akses tabel admins:', adminError);
      } else {
        console.log('✅ Data admin berhasil diambil:', adminData);
      }

      // Sign out setelah test
      await anonClient.auth.signOut();
    }

    console.log('\n🎉 Perbaikan selesai!');
    console.log('📋 Kredensial login:');
    console.log('   Email: admin@kiss.com');
    console.log('   Password: admin123');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixAdminLogin();