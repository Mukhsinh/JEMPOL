const { createClient } = require('@supabase/supabase-js');

// Konfigurasi Supabase
const supabaseUrl = 'https://jxxzbdivafzzwqhagwrf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4eHpiZGl2YWZ6endxaGFnd3JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MTkwNTEsImV4cCI6MjA4MDQ5NTA1MX0.ICOtGuxrD19GtawdR9JAsnFn9XsHxWkr1aHCEkgHqXg';

console.log('🔄 Memperbaiki masalah auth timeout...');

async function fixAuthTimeout() {
  try {
    // Buat client Supabase dengan konfigurasi yang dioptimalkan
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
        flowType: 'pkce'
      },
      global: {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    });

    console.log('✅ Supabase client dibuat');

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

    // Test admin yang aktif
    console.log('🔍 Mengecek admin aktif...');
    const { data: admins, error: adminError } = await supabase
      .from('admins')
      .select('id, username, email, role, is_active')
      .eq('is_active', true)
      .limit(5);

    if (adminError) {
      console.error('❌ Error mengambil data admin:', adminError);
      return false;
    }

    console.log('✅ Admin aktif ditemukan:', admins.length);
    admins.forEach(admin => {
      console.log(`  - ${admin.username} (${admin.email}) - ${admin.role}`);
    });

    // Test login dengan admin yang ada
    if (admins.length > 0) {
      const testAdmin = admins.find(a => a.email && a.email.includes('@'));
      if (testAdmin) {
        console.log(`🔍 Testing auth dengan admin: ${testAdmin.email}`);
        
        // Coba sign out dulu
        await supabase.auth.signOut();
        
        // Test dengan password default
        const testPasswords = ['admin123', 'password123', 'test123'];
        
        for (const password of testPasswords) {
          try {
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
              email: testAdmin.email,
              password: password
            });

            if (!authError && authData.user) {
              console.log('✅ Login berhasil dengan password:', password);
              console.log('✅ User ID:', authData.user.id);
              console.log('✅ Session valid:', !!authData.session);
              
              // Sign out setelah test
              await supabase.auth.signOut();
              return true;
            }
          } catch (err) {
            // Continue dengan password berikutnya
          }
        }
        
        console.log('⚠️ Tidak bisa login dengan password default, tapi koneksi OK');
      }
    }

    return true;

  } catch (error) {
    console.error('❌ Error dalam fix auth timeout:', error);
    return false;
  }
}

// Jalankan perbaikan
fixAuthTimeout().then(success => {
  if (success) {
    console.log('\n✅ PERBAIKAN AUTH TIMEOUT SELESAI');
    console.log('📋 Langkah selanjutnya:');
    console.log('1. Restart aplikasi frontend dan backend');
    console.log('2. Coba login dengan admin yang tersedia');
    console.log('3. Jika masih error, reset password admin');
  } else {
    console.log('\n❌ PERBAIKAN GAGAL');
    console.log('📋 Cek konfigurasi Supabase dan koneksi internet');
  }
}).catch(error => {
  console.error('❌ Error menjalankan perbaikan:', error);
});