const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jxxzbdivafzzwqhagwrf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4eHpiZGl2YWZ6endxaGFnd3JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MTkwNTEsImV4cCI6MjA4MDQ5NTA1MX0.ICOtGuxrD19GtawdR9JAsnFn9XsHxWkr1aHCEkgHqXg';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testLogin() {
  console.log('🔐 Testing login...\n');

  const testAccounts = [
    { email: 'admin@jempol.com', password: 'admin123' },
    { email: 'admin@jempol.com', password: 'Admin123!' },
    { email: 'mukhsin9@gmail.com', password: 'admin123' },
    { email: 'admin@kiss.com', password: 'admin123' }
  ];

  for (const account of testAccounts) {
    console.log(`Testing: ${account.email}`);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: account.email,
      password: account.password
    });

    if (error) {
      console.log(`❌ Gagal: ${error.message}\n`);
    } else {
      console.log(`✅ BERHASIL LOGIN!`);
      console.log(`   Email: ${account.email}`);
      console.log(`   Password: ${account.password}`);
      console.log(`   Token: ${data.session.access_token.substring(0, 30)}...\n`);
      
      // Cek admin profile
      const { data: admin } = await supabase
        .from('admins')
        .select('*')
        .eq('email', account.email)
        .single();
      
      if (admin) {
        console.log(`   Username: ${admin.username}`);
        console.log(`   Role: ${admin.role}`);
        console.log(`   Active: ${admin.is_active}\n`);
      }
      
      console.log('✅ GUNAKAN KREDENSIAL INI UNTUK LOGIN!\n');
      return;
    }
  }

  console.log('❌ Semua akun gagal login. Perlu reset password via Supabase Dashboard.');
}

testLogin();
