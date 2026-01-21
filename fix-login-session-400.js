const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jxxzbdivafzzwqhagwrf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4eHpiZGl2YWZ6endxaGFnd3JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MTkwNTEsImV4cCI6MjA4MDQ5NTA1MX0.ICOtGuxrD19GtawdR9JAsnFn9XsHxWkr1aHCEkgHqXg';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fixLoginSession() {
  console.log('🔧 Memperbaiki masalah login session 400...\n');

  try {
    // 1. Test koneksi Supabase
    console.log('1️⃣ Testing koneksi Supabase...');
    const { data: testData, error: testError } = await supabase
      .from('admins')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Koneksi Supabase gagal:', testError.message);
      return;
    }
    console.log('✅ Koneksi Supabase berhasil\n');

    // 2. Cek admin yang ada
    console.log('2️⃣ Mengecek admin yang ada...');
    const { data: admins, error: adminError } = await supabase
      .from('admins')
      .select('*');
    
    if (adminError) {
      console.error('❌ Error mengambil data admin:', adminError.message);
      return;
    }

    console.log(`✅ Ditemukan ${admins?.length || 0} admin\n`);
    
    if (admins && admins.length > 0) {
      console.log('Admin yang tersedia:');
      admins.forEach((admin, index) => {
        console.log(`   ${index + 1}. Email: ${admin.email}`);
      });
      console.log('');
    }

    // 3. Reset password untuk admin@jempol.com
    console.log('3️⃣ Reset password untuk admin@jempol.com...');
    const bcrypt = require('bcryptjs');
    const newPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const { error: updateError } = await supabase
      .from('admins')
      .update({ 
        password_hash: hashedPassword,
        updated_at: new Date().toISOString()
      })
      .eq('email', 'admin@jempol.com');

    if (updateError) {
      console.error('❌ Error update password:', updateError.message);
    } else {
      console.log('✅ Password berhasil direset\n');
    }

    // 4. Instruksi untuk user
    console.log('📋 INSTRUKSI PERBAIKAN:\n');
    console.log('1. Buka browser dan tekan F12 untuk membuka DevTools');
    console.log('2. Pergi ke tab "Application" atau "Storage"');
    console.log('3. Di sidebar kiri, klik "Local Storage"');
    console.log('4. Pilih "http://localhost:3002"');
    console.log('5. Hapus SEMUA item yang dimulai dengan "sb-" atau "supabase"');
    console.log('6. Tutup dan buka kembali browser (atau tekan Ctrl+Shift+Delete untuk clear cache)');
    console.log('7. Buka http://localhost:3002/login');
    console.log('8. Login dengan:');
    console.log('   Email: admin@jempol.com');
    console.log('   Password: admin123\n');

    console.log('✅ Script selesai dijalankan!');
    console.log('⚠️  PENTING: Ikuti instruksi di atas untuk membersihkan session di browser\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fixLoginSession();
