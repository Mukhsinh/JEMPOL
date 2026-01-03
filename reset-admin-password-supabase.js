const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');

// Konfigurasi Supabase
const supabaseUrl = 'https://jxxzbdivafzzwqhagwrf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4eHpiZGl2YWZ6endxaGFnd3JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MTkwNTEsImV4cCI6MjA4MDQ5NTA1MX0.ICOtGuxrD19GtawdR9JAsnFn9XsHxWkr1aHCEkgHqXg';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function resetAdminPasswords() {
  console.log('🔧 Reset password admin...');
  
  try {
    // Password baru yang akan digunakan
    const newPassword = 'admin123';
    const passwordHash = await bcrypt.hash(newPassword, 10);
    
    console.log('🔑 Password hash baru:', passwordHash);
    
    // Update password hash di tabel admins
    const { data: updateData, error: updateError } = await supabase
      .from('admins')
      .update({ 
        password_hash: passwordHash,
        updated_at: new Date().toISOString()
      })
      .in('email', ['admin@jempol.com', 'mukhsin9@gmail.com']);
    
    if (updateError) {
      console.error('❌ Error updating admin passwords:', updateError);
      return;
    }
    
    console.log('✅ Password hash berhasil diupdate di tabel admins');
    
    // Verifikasi update
    const { data: verifyData, error: verifyError } = await supabase
      .from('admins')
      .select('username, email, password_hash')
      .in('email', ['admin@jempol.com', 'mukhsin9@gmail.com']);
    
    if (verifyError) {
      console.error('❌ Error verifying update:', verifyError);
      return;
    }
    
    console.log('📋 Data admin setelah update:');
    verifyData.forEach(admin => {
      console.log(`   Email: ${admin.email}`);
      console.log(`   Username: ${admin.username}`);
      console.log(`   Password Hash: ${admin.password_hash.substring(0, 20)}...`);
    });
    
    console.log('\n🎉 Reset password selesai!');
    console.log(`📝 Password baru untuk semua admin: ${newPassword}`);
    console.log('\n📋 Akun yang dapat digunakan:');
    console.log('   Email: admin@jempol.com');
    console.log(`   Password: ${newPassword}`);
    console.log('   Email: mukhsin9@gmail.com');
    console.log(`   Password: ${newPassword}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Jalankan reset
resetAdminPasswords();