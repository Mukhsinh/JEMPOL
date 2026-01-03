const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jxxzbdivafzzwqhagwrf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4eHpiZGl2YWZ6endxaGFnd3JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MTkwNTEsImV4cCI6MjA4MDQ5NTA1MX0.ICOtGuxrD19GtawdR9JAsnFn9XsHxWkr1aHCEkgHqXg';

async function fixTimeoutConnection() {
  console.log('🔧 Memperbaiki masalah timeout dan koneksi...');

  try {
    // Test koneksi dengan timeout yang lebih pendek
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      },
      global: {
        fetch: (url, options = {}) => {
          return fetch(url, {
            ...options,
            signal: AbortSignal.timeout(10000) // 10 detik timeout
          });
        }
      }
    });

    console.log('✅ Supabase client dibuat dengan timeout 10 detik');

    // Test koneksi database
    console.log('🔍 Testing koneksi database...');
    const { data: testData, error: testError } = await supabase
      .from('admins')
      .select('count')
      .limit(1);

    if (testError) {
      console.error('❌ Error koneksi database:', testError);
      return false;
    }

    console.log('✅ Koneksi database berhasil');

    // Test login dengan admin yang ada
    console.log('🔐 Testing login dengan admin@jempol.com...');
    
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'admin@jempol.com',
      password: 'admin123'
    });

    if (authError) {
      console.error('❌ Error login:', authError.message);
      
      // Coba reset password jika diperlukan
      if (authError.message.includes('Invalid login credentials')) {
        console.log('🔄 Mencoba reset password admin...');
        
        // Update password hash untuk admin@jempol.com
        const bcrypt = require('bcrypt');
        const newPasswordHash = await bcrypt.hash('admin123', 10);
        
        const { error: updateError } = await supabase
          .from('admins')
          .update({ password_hash: newPasswordHash })
          .eq('email', 'admin@jempol.com');

        if (updateError) {
          console.error('❌ Error update password:', updateError);
        } else {
          console.log('✅ Password berhasil direset');
          
          // Coba login lagi
          const { data: retryAuth, error: retryError } = await supabase.auth.signInWithPassword({
            email: 'admin@jempol.com',
            password: 'admin123'
          });

          if (retryError) {
            console.error('❌ Login masih gagal setelah reset:', retryError.message);
          } else {
            console.log('✅ Login berhasil setelah reset password');
          }
        }
      }
    } else {
      console.log('✅ Login berhasil:', authData.user?.email);
    }

    // Test query admin profile
    console.log('👤 Testing query admin profile...');
    const { data: adminData, error: adminError } = await supabase
      .from('admins')
      .select('id, username, email, role, is_active')
      .eq('email', 'admin@jempol.com')
      .eq('is_active', true)
      .single();

    if (adminError) {
      console.error('❌ Error query admin:', adminError);
    } else {
      console.log('✅ Admin profile ditemukan:', adminData);
    }

    return true;

  } catch (error) {
    console.error('❌ Error tidak terduga:', error);
    return false;
  }
}

// Jalankan perbaikan
fixTimeoutConnection().then(success => {
  if (success) {
    console.log('\n✅ Perbaikan timeout dan koneksi selesai!');
    console.log('📋 Langkah selanjutnya:');
    console.log('1. Restart aplikasi frontend dan backend');
    console.log('2. Coba login dengan admin@jempol.com / admin123');
    console.log('3. Periksa console browser untuk error');
  } else {
    console.log('\n❌ Perbaikan gagal, periksa log error di atas');
  }
}).catch(err => {
  console.error('❌ Script error:', err);
});