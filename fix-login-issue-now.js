const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const supabaseUrl = 'https://jxxzbdivafzzwqhagwrf.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4eHpiZGl2YWZ6endxaGFnd3JmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNTU0MzE5NiwiZXhwIjoyMDUxMTE5MTk2fQ.Aq-Aq0Aq0Aq0Aq0Aq0Aq0Aq0Aq0Aq0Aq0Aq0Aq0Aq0';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fixLoginIssue() {
  console.log('🔧 Memperbaiki masalah login...\n');

  try {
    // 1. Reset password untuk admin utama
    const adminEmail = 'admin@jempol.com';
    const newPassword = 'admin123';

    console.log(`📧 Mereset password untuk: ${adminEmail}`);

    // Update password di Supabase Auth
    const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
      'e235a49c-e8bb-4a28-8571-8509a849ee5c',
      { password: newPassword }
    );

    if (updateError) {
      console.error('❌ Error update password:', updateError.message);
    } else {
      console.log('✅ Password berhasil direset');
    }

    // 2. Verifikasi admin di tabel admins
    const { data: adminData, error: adminError } = await supabase
      .from('admins')
      .select('*')
      .eq('email', adminEmail)
      .single();

    if (adminError) {
      console.error('❌ Error cek admin:', adminError.message);
    } else {
      console.log('✅ Admin ditemukan:', {
        email: adminData.email,
        username: adminData.username,
        role: adminData.role,
        is_active: adminData.is_active
      });

      // Update is_active jika perlu
      if (!adminData.is_active) {
        await supabase
          .from('admins')
          .update({ is_active: true })
          .eq('id', adminData.id);
        console.log('✅ Admin diaktifkan');
      }
    }

    // 3. Test login
    console.log('\n🧪 Testing login...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: newPassword
    });

    if (loginError) {
      console.error('❌ Login test gagal:', loginError.message);
    } else {
      console.log('✅ Login test berhasil!');
      console.log('   User ID:', loginData.user.id);
      console.log('   Email:', loginData.user.email);
    }

    console.log('\n✅ Perbaikan selesai!');
    console.log('\n📝 Kredensial login:');
    console.log('   Email: admin@jempol.com');
    console.log('   Password: admin123');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fixLoginIssue();
