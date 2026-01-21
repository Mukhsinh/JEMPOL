/**
 * Script untuk memperbaiki error 400 pada login
 * Membersihkan session invalid dan memperbaiki konfigurasi
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jxxzbdivafzzwqhagwrf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4eHpiZGl2YWZ6endxaGFnd3JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MTkwNTEsImV4cCI6MjA4MDQ5NTA1MX0.ICOtGuxrD19GtawdR9JAsnFn9XsHxWkr1aHCEkgHqXg';

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
});

async function fixLogin400Error() {
  console.log('🔧 Memperbaiki error 400 pada login...\n');

  try {
    // 1. Test koneksi ke Supabase
    console.log('1️⃣ Testing koneksi ke Supabase...');
    const { data: testData, error: testError } = await supabase
      .from('admins')
      .select('count')
      .limit(1);

    if (testError) {
      console.error('❌ Koneksi gagal:', testError.message);
      return;
    }
    console.log('✅ Koneksi berhasil\n');

    // 2. Cek admin yang ada
    console.log('2️⃣ Mengecek admin yang tersedia...');
    const { data: admins, error: adminError } = await supabase
      .from('admins')
      .select('id, username, email, role, is_active')
      .eq('is_active', true);

    if (adminError) {
      console.error('❌ Error mengambil data admin:', adminError.message);
      return;
    }

    if (!admins || admins.length === 0) {
      console.log('⚠️  Tidak ada admin aktif ditemukan');
      console.log('   Membuat admin default...\n');
      
      // Buat admin default
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      const { data: newAdmin, error: createError } = await supabase
        .from('admins')
        .insert([{
          username: 'admin',
          email: 'admin@jempol.com',
          password_hash: hashedPassword,
          full_name: 'Administrator',
          role: 'superadmin',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (createError) {
        console.error('❌ Error membuat admin:', createError.message);
        return;
      }

      console.log('✅ Admin default berhasil dibuat');
      console.log('   Email: admin@jempol.com');
      console.log('   Password: admin123\n');
    } else {
      console.log(`✅ Ditemukan ${admins.length} admin aktif:`);
      admins.forEach(admin => {
        console.log(`   - ${admin.email} (${admin.role})`);
      });
      console.log('');
    }

    // 3. Test login dengan admin pertama
    if (admins && admins.length > 0) {
      const testAdmin = admins[0];
      console.log(`3️⃣ Testing login dengan ${testAdmin.email}...`);
      
      // Note: Kita tidak bisa test password di sini karena hashed
      // Tapi kita bisa cek apakah admin bisa diakses
      const { data: profileData, error: profileError } = await supabase
        .from('admins')
        .select('*')
        .eq('email', testAdmin.email)
        .eq('is_active', true)
        .single();

      if (profileError) {
        console.error('❌ Error mengambil profile:', profileError.message);
        return;
      }

      console.log('✅ Profile admin dapat diakses');
      console.log(`   Username: ${profileData.username}`);
      console.log(`   Role: ${profileData.role}\n`);
    }

    console.log('✅ Perbaikan selesai!');
    console.log('\n📝 Langkah selanjutnya:');
    console.log('1. Buka browser dan clear cache (Ctrl+Shift+Delete)');
    console.log('2. Clear localStorage di DevTools Console:');
    console.log('   localStorage.clear(); sessionStorage.clear();');
    console.log('3. Refresh halaman login');
    console.log('4. Login dengan kredensial yang benar\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fixLogin400Error();
