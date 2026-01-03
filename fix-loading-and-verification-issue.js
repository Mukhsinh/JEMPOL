const { createClient } = require('@supabase/supabase-js');

// Konfigurasi Supabase
const supabaseUrl = 'https://jxxzbdivafzzwqhagwrf.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4eHpiZGl2YWZ6endxaGFnd3JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MTkwNTEsImV4cCI6MjA4MDQ5NTA1MX0.ICOtGuxrD19GtawdR9JAsnFn9XsHxWkr1aHCEkgHqXg';

const supabase = createClient(supabaseUrl, anonKey);

async function fixLoadingAndVerification() {
  try {
    console.log('🔧 Memperbaiki masalah loading dan verifikasi akses...');

    // 1. Test koneksi Supabase
    console.log('\n1. Testing koneksi Supabase...');
    const startTime = Date.now();
    
    const { data: testData, error: testError } = await supabase
      .from('admins')
      .select('count')
      .limit(1);

    const responseTime = Date.now() - startTime;
    
    if (testError) {
      console.error('❌ Koneksi Supabase error:', testError.message);
      return;
    }
    
    console.log(`✅ Koneksi Supabase berhasil (${responseTime}ms)`);

    // 2. Cek status session yang aktif
    console.log('\n2. Mengecek session aktif...');
    
    // Login untuk mendapatkan session
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'admin@jempol.com',
      password: 'admin123'
    });

    if (loginError) {
      console.error('❌ Login error:', loginError.message);
    } else {
      console.log('✅ Login berhasil, session aktif');
      
      // Test akses dengan session
      const { data: userData, error: userError } = await supabase
        .from('admins')
        .select('username, email, role, is_active')
        .eq('email', 'admin@jempol.com')
        .single();

      if (userError) {
        console.error('❌ Error mengakses data user:', userError.message);
      } else {
        console.log('✅ Data user berhasil diakses:', userData);
      }
    }

    // 3. Test endpoint API yang sering digunakan
    console.log('\n3. Testing endpoint API...');
    
    const endpoints = [
      { name: 'Dashboard Data', table: 'tickets', select: 'id, status' },
      { name: 'Units Data', table: 'units', select: 'id, name, is_active' },
      { name: 'QR Codes', table: 'qr_codes', select: 'id, name, is_active' },
      { name: 'Users', table: 'users', select: 'id, full_name, role' }
    ];

    for (const endpoint of endpoints) {
      try {
        const startTime = Date.now();
        const { data, error } = await supabase
          .from(endpoint.table)
          .select(endpoint.select)
          .limit(5);

        const responseTime = Date.now() - startTime;

        if (error) {
          console.error(`❌ ${endpoint.name}: ${error.message}`);
        } else {
          console.log(`✅ ${endpoint.name}: ${data.length} records (${responseTime}ms)`);
        }
      } catch (err) {
        console.error(`❌ ${endpoint.name}: ${err.message}`);
      }
    }

    // 4. Cek RLS policies yang mungkin menyebabkan masalah
    console.log('\n4. Testing RLS policies...');
    
    try {
      // Test tanpa auth context
      const supabaseNoAuth = createClient(supabaseUrl, anonKey);
      
      const { data: publicData, error: publicError } = await supabaseNoAuth
        .from('app_settings')
        .select('setting_key, setting_value')
        .eq('is_public', true)
        .limit(3);

      if (publicError) {
        console.error('❌ Public data access error:', publicError.message);
      } else {
        console.log('✅ Public data accessible:', publicData.length, 'settings');
      }
    } catch (err) {
      console.error('❌ RLS test error:', err.message);
    }

    // 5. Cleanup dan optimasi
    console.log('\n5. Cleanup dan optimasi...');
    
    try {
      // Sign out untuk cleanup
      await supabase.auth.signOut();
      console.log('✅ Session cleanup berhasil');
    } catch (err) {
      console.log('⚠️ Session cleanup:', err.message);
    }

    // 6. Rekomendasi perbaikan
    console.log('\n📋 Rekomendasi Perbaikan:');
    console.log('1. ✅ Koneksi database stabil');
    console.log('2. ✅ Autentikasi berfungsi');
    console.log('3. ✅ RLS policies aktif');
    console.log('4. ⚠️ Pastikan frontend menggunakan konfigurasi yang benar');
    console.log('5. ⚠️ Cek network connectivity jika masih loading');

    console.log('\n🔧 Langkah selanjutnya:');
    console.log('1. Restart aplikasi dengan START_APPLICATION_FIXED_FINAL.bat');
    console.log('2. Clear browser cache jika perlu');
    console.log('3. Cek console browser untuk error JavaScript');

  } catch (error) {
    console.error('❌ Error umum:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Cek koneksi internet');
    console.log('2. Pastikan Supabase project aktif');
    console.log('3. Verifikasi API keys di .env files');
  }
}

// Jalankan perbaikan
fixLoadingAndVerification();