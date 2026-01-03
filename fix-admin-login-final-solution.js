const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jxxzbdivafzzwqhagwrf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4eHpiZGl2YWZ6endxaGFnd3JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MTkwNTEsImV4cCI6MjA4MDQ5NTA1MX0.ICOtGuxrD19GtawdR9JAsnFn9XsHxWkr1aHCEkgHqXg';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixAdminLogin() {
  console.log('🔧 Memperbaiki login admin...');
  
  try {
    // 1. Reset password admin
    const { data, error } = await supabase.auth.admin.updateUserById(
      'admin@jempol.com',
      { password: 'admin123' }
    );
    
    if (error) {
      console.log('❌ Error reset password:', error.message);
      
      // Coba dengan cara lain - hapus dan buat ulang user
      console.log('🔄 Mencoba hapus dan buat ulang user...');
      
      // Hapus user lama
      await supabase.auth.admin.deleteUser('admin@jempol.com');
      
      // Buat user baru
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: 'admin@jempol.com',
        password: 'admin123',
        email_confirm: true
      });
      
      if (createError) {
        console.log('❌ Error buat user baru:', createError.message);
        return false;
      }
      
      console.log('✅ User admin berhasil dibuat ulang');
    } else {
      console.log('✅ Password admin berhasil direset');
    }
    
    return true;
  } catch (error) {
    console.log('❌ Error:', error.message);
    return false;
  }
}

fixAdminLogin().then(success => {
  if (success) {
    console.log('✅ Login admin berhasil diperbaiki!');
    console.log('📧 Email: admin@jempol.com');
    console.log('🔑 Password: admin123');
  } else {
    console.log('❌ Gagal memperbaiki login admin');
  }
  process.exit(0);
});