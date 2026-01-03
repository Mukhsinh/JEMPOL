const { createClient } = require('@supabase/supabase-js');

// Konfigurasi Supabase yang benar
const supabaseUrl = 'https://jxxzbdivafzzwqhagwrf.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4eHpiZGl2YWZ6endxaGFnd3JmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDkxOTA1MSwiZXhwIjoyMDgwNDk1MDUxfQ.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fixLoginIssue() {
  try {
    console.log('🔧 Memperbaiki masalah login...');

    // 1. Reset password untuk admin@jempol.com
    const newPassword = 'admin123';
    
    console.log('📧 Mereset password untuk admin@jempol.com...');
    
    const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
      'e235a49c-e8bb-4a28-8571-8509a849ee5c',
      { 
        password: newPassword,
        email_confirm: true
      }
    );

    if (updateError) {
      console.error('❌ Error updating password:', updateError);
      return;
    }

    console.log('✅ Password berhasil direset');

    // 2. Pastikan admin profile aktif
    console.log('👤 Memastikan admin profile aktif...');
    
    const { data: profileData, error: profileError } = await supabase
      .from('admins')
      .upsert({
        id: 'c56b8b9e-ac05-4323-b408-a0551a0d9ed9',
        username: 'admin_jempol',
        email: 'admin@jempol.com',
        role: 'superadmin',
        is_active: true,
        full_name: 'Administrator Jempol',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'email'
      });

    if (profileError) {
      console.error('❌ Error updating admin profile:', profileError);
    } else {
      console.log('✅ Admin profile berhasil diperbarui');
    }

    // 3. Test login
    console.log('🧪 Testing login...');
    
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'admin@jempol.com',
      password: newPassword
    });

    if (loginError) {
      console.error('❌ Login test failed:', loginError);
    } else {
      console.log('✅ Login test berhasil!');
      console.log('📧 Email:', loginData.user?.email);
      console.log('🆔 User ID:', loginData.user?.id);
    }

    console.log('\n🎉 Perbaikan selesai!');
    console.log('📝 Kredensial login:');
    console.log('   Email: admin@jempol.com');
    console.log('   Password: admin123');
    console.log('\n🌐 URL Supabase yang benar: https://jxxzbdivafzzwqhagwrf.supabase.co');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixLoginIssue();