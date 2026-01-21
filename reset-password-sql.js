const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const supabaseUrl = 'https://jxxzbdivafzzwqhagwrf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4eHpiZGl2YWZ6endxaGFnd3JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MTkwNTEsImV4cCI6MjA4MDQ5NTA1MX0.ICOtGuxrD19GtawdR9JAsnFn9XsHxWkr1aHCEkgHqXg';

const supabase = createClient(supabaseUrl, supabaseKey);

async function resetPassword() {
  console.log('🔄 Mereset password untuk admin@jempol.com...\n');

  const email = 'admin@jempol.com';
  const newPassword = 'Admin123!@#';

  try {
    // Cek user di auth.users
    console.log('1️⃣ Mengecek user di database...');
    const { data: users } = await supabase
      .from('admins')
      .select('*')
      .eq('email', email)
      .single();

    if (!users) {
      console.error('❌ User tidak ditemukan di tabel admins');
      return;
    }

    console.log('✅ User ditemukan:', users.username);

    // Hash password baru
    console.log('\n2️⃣ Membuat hash password...');
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log('✅ Password hash dibuat');

    // Update password di tabel admins
    console.log('\n3️⃣ Update password di tabel admins...');
    const { error: updateError } = await supabase
      .from('admins')
      .update({ password_hash: hashedPassword })
      .eq('email', email);

    if (updateError) {
      console.error('❌ Error update password:', updateError.message);
      return;
    }

    console.log('✅ Password berhasil diupdate di tabel admins!');

    console.log('\n📋 INFORMASI LOGIN:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Email    : admin@jempol.com');
    console.log('Password : Admin123!@#');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    console.log('\n⚠️  CATATAN PENTING:');
    console.log('Sistem menggunakan Supabase Auth.');
    console.log('Password di Supabase Auth perlu direset manual.');
    console.log('\nCara reset password di Supabase Auth:');
    console.log('1. Buka Supabase Dashboard');
    console.log('2. Pilih Authentication > Users');
    console.log('3. Cari user admin@jempol.com');
    console.log('4. Klik "..." > Reset Password');
    console.log('5. Set password: Admin123!@#');

    console.log('\n🔄 Mencoba login dengan password baru...');
    
    // Test login
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email,
      password: newPassword,
    });

    if (authError) {
      console.log('❌ Login gagal:', authError.message);
      console.log('\n⚠️  Password di Supabase Auth belum direset.');
      console.log('Silakan reset manual di Supabase Dashboard.');
    } else {
      console.log('✅ Login berhasil!');
      console.log('User ID:', authData.user?.id);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

resetPassword();
