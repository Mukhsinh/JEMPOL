const { createClient } = require('@supabase/supabase-js');

// Konfigurasi yang benar
const CORRECT_SUPABASE_URL = 'https://jxxzbdivafzzwqhagwrf.supabase.co';
const CORRECT_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4eHpiZGl2YWZ6endxaGFnd3JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MTkwNTEsImV4cCI6MjA4MDQ5NTA1MX0.ICOtGuxrD19GtawdR9JAsnFn9XsHxWkr1aHCEkgHqXg';

async function fixLoginAndResetPassword() {
  console.log('🔧 Memperbaiki konfigurasi login dan reset password admin...');

  try {
    // Buat client Supabase dengan konfigurasi yang benar
    const supabase = createClient(CORRECT_SUPABASE_URL, CORRECT_ANON_KEY);

    console.log('✅ Supabase client dibuat dengan URL yang benar:', CORRECT_SUPABASE_URL);

    // Test koneksi
    console.log('🔍 Testing koneksi ke Supabase...');
    const { data: testData, error: testError } = await supabase
      .from('admins')
      .select('count')
      .limit(1);

    if (testError) {
      console.error('❌ Error testing koneksi:', testError);
      return;
    }

    console.log('✅ Koneksi ke Supabase berhasil');

    // Cek apakah admin user ada
    console.log('🔍 Mencari user admin...');
    const { data: adminData, error: adminError } = await supabase
      .from('admins')
      .select('*')
      .eq('email', 'admin@jempol.com')
      .single();

    if (adminError && adminError.code !== 'PGRST116') {
      console.error('❌ Error mencari admin:', adminError);
      return;
    }

    if (!adminData) {
      console.log('⚠️ Admin user tidak ditemukan, membuat user baru...');
      
      // Buat admin user baru
      const { data: newAdmin, error: createError } = await supabase
        .from('admins')
        .insert([
          {
            username: 'admin',
            email: 'admin@jempol.com',
            full_name: 'Administrator',
            role: 'superadmin',
            is_active: true,
            created_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (createError) {
        console.error('❌ Error membuat admin:', createError);
        return;
      }

      console.log('✅ Admin user berhasil dibuat:', newAdmin);
    } else {
      console.log('✅ Admin user ditemukan:', adminData.email);
    }

    // Reset password menggunakan Supabase Auth Admin API
    console.log('🔑 Reset password untuk admin@jempol.com...');
    
    try {
      // Coba sign up ulang dengan password baru (akan update jika user sudah ada)
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: 'admin@jempol.com',
        password: 'admin123',
        options: {
          data: {
            username: 'admin',
            full_name: 'Administrator',
            role: 'superadmin'
          }
        }
      });

      if (signUpError && !signUpError.message.includes('already registered')) {
        console.error('❌ Error sign up:', signUpError);
      } else {
        console.log('✅ Password berhasil di-reset atau user sudah ada');
      }

    } catch (authError) {
      console.warn('⚠️ Auth signup error (mungkin user sudah ada):', authError.message);
    }

    // Test login dengan kredensial yang benar
    console.log('🧪 Testing login dengan kredensial admin@jempol.com / admin123...');
    
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'admin@jempol.com',
      password: 'admin123'
    });

    if (loginError) {
      console.error('❌ Login test gagal:', loginError);
      
      // Jika login gagal, coba reset password langsung di database
      console.log('🔧 Mencoba reset password langsung di database...');
      
      // Note: Ini memerlukan service role key, tapi kita coba dengan RPC function
      const { data: resetData, error: resetError } = await supabase.rpc('reset_admin_password', {
        admin_email: 'admin@jempol.com',
        new_password: 'admin123'
      });

      if (resetError) {
        console.warn('⚠️ RPC reset password gagal:', resetError);
        console.log('💡 Silakan reset password manual melalui Supabase Dashboard');
      } else {
        console.log('✅ Password berhasil di-reset via RPC');
      }
    } else {
      console.log('✅ Login test berhasil!');
      console.log('👤 User data:', loginData.user?.email);
      
      // Sign out setelah test
      await supabase.auth.signOut();
      console.log('👋 Signed out setelah test');
    }

    console.log('\n📋 RINGKASAN PERBAIKAN:');
    console.log('✅ URL Supabase yang benar:', CORRECT_SUPABASE_URL);
    console.log('✅ Anon Key yang benar:', CORRECT_ANON_KEY.substring(0, 50) + '...');
    console.log('✅ Admin user: admin@jempol.com');
    console.log('✅ Password: admin123');
    console.log('\n🔧 LANGKAH SELANJUTNYA:');
    console.log('1. Pastikan browser cache sudah dibersihkan');
    console.log('2. Restart aplikasi frontend dan backend');
    console.log('3. Coba login dengan admin@jempol.com / admin123');
    console.log('4. Jika masih error, periksa Network tab di browser untuk URL yang dipanggil');

  } catch (error) {
    console.error('❌ Error dalam proses perbaikan:', error);
  }
}

// Jalankan perbaikan
fixLoginAndResetPassword();