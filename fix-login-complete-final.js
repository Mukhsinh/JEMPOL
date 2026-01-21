import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jxxzbdivafzzwqhagwrf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4eHpiZGl2YWZ6endxaGFnd3JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MTkwNTEsImV4cCI6MjA4MDQ5NTA1MX0.ICOtGuxrD19GtawdR9JAsnFn9XsHxWkr1aHCEkgHqXg';

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
});

async function fixLoginComplete() {
  console.log('🔧 Memperbaiki masalah login...\n');

  try {
    // 1. Cek admin di database
    console.log('1️⃣ Mengecek data admin di database...');
    const { data: admins, error: adminError } = await supabase
      .from('admins')
      .select('id, username, email, is_active, role')
      .eq('email', 'admin@jempol.com')
      .single();

    if (adminError) {
      console.error('❌ Error mengambil data admin:', adminError.message);
      return;
    }

    if (!admins) {
      console.error('❌ Admin tidak ditemukan di tabel admins');
      return;
    }

    console.log('✅ Admin ditemukan:', {
      username: admins.username,
      email: admins.email,
      is_active: admins.is_active,
      role: admins.role
    });

    // 2. Cek user di auth.users
    console.log('\n2️⃣ Mengecek user di Supabase Auth...');
    const { data: authUsers, error: authError } = await supabase
      .from('auth.users')
      .select('id, email, email_confirmed_at')
      .eq('email', 'admin@jempol.com')
      .single();

    if (authError) {
      console.error('❌ Error mengambil data auth user:', authError.message);
    } else {
      console.log('✅ Auth user ditemukan:', {
        email: authUsers.email,
        email_confirmed: !!authUsers.email_confirmed_at
      });
    }

    // 3. Reset password untuk memastikan password benar
    console.log('\n3️⃣ Mereset password admin...');
    const newPassword = 'admin123';
    
    // Gunakan admin API untuk update password
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      authUsers.id,
      { password: newPassword }
    );

    if (updateError) {
      console.log('⚠️  Tidak bisa update via admin API (normal untuk anon key)');
      console.log('   Silakan reset password manual via Supabase Dashboard');
    } else {
      console.log('✅ Password berhasil direset ke:', newPassword);
    }

    // 4. Test login
    console.log('\n4️⃣ Testing login...');
    
    // Clear any existing session
    await supabase.auth.signOut();
    
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'admin@jempol.com',
      password: newPassword
    });

    if (loginError) {
      console.error('❌ Login gagal:', loginError.message);
      console.log('\n📝 Solusi:');
      console.log('1. Buka Supabase Dashboard: https://supabase.com/dashboard');
      console.log('2. Pilih project Anda');
      console.log('3. Ke Authentication > Users');
      console.log('4. Cari user admin@jempol.com');
      console.log('5. Klik "..." > Reset Password');
      console.log('6. Set password baru: admin123');
      console.log('7. Atau gunakan "Send Magic Link" untuk reset via email');
      return;
    }

    console.log('✅ Login berhasil!');
    console.log('   User ID:', loginData.user.id);
    console.log('   Email:', loginData.user.email);

    // 5. Verify admin profile dapat diakses
    console.log('\n5️⃣ Verifikasi akses ke admin profile...');
    const { data: profile, error: profileError } = await supabase
      .from('admins')
      .select('*')
      .eq('email', 'admin@jempol.com')
      .eq('is_active', true)
      .single();

    if (profileError) {
      console.error('❌ Error mengakses profile:', profileError.message);
      return;
    }

    console.log('✅ Profile dapat diakses:', {
      username: profile.username,
      role: profile.role,
      is_active: profile.is_active
    });

    console.log('\n✅ SEMUA CEK BERHASIL!');
    console.log('\n📋 Kredensial Login:');
    console.log('   Email: admin@jempol.com');
    console.log('   Password: admin123');
    console.log('\n🌐 Silakan login di: http://localhost:3002/login');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fixLoginComplete();
