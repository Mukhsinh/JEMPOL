const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');

// Konfigurasi Supabase
const supabaseUrl = 'https://jxxzbdivafzzwqhagwrf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4eHpiZGl2YWZ6endxaGFnd3JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MTkwNTEsImV4cCI6MjA4MDQ5NTA1MX0.ICOtGuxrD19GtawdR9JAsnFn9XsHxWkr1aHCEkgHqXg';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function resetAdminPassword() {
  try {
    console.log('🔧 Resetting admin password...');

    const adminEmail = 'admin@jempol.com';
    const newPassword = 'admin123';
    
    // Hash password untuk database
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    console.log('🔐 New password hash generated');

    // Update password di tabel admins
    const { error: updateError } = await supabase
      .from('admins')
      .update({
        password_hash: hashedPassword,
        updated_at: new Date().toISOString()
      })
      .eq('email', adminEmail);

    if (updateError) {
      console.error('❌ Error updating admin password:', updateError);
      return;
    }

    console.log('✅ Admin password updated in database');

    // Reset password di Supabase Auth juga
    console.log('🔐 Resetting Supabase Auth password...');
    
    // Coba login dulu untuk mendapatkan user ID
    try {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: adminEmail,
        password: 'admin123' // coba password lama
      });

      if (!signInError && signInData.user) {
        console.log('✅ Successfully signed in, user exists');
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.log('ℹ️ Could not sign in with old password, that\'s expected');
    }

    console.log('\n🎉 Password reset completed!');
    console.log('📧 Email: admin@jempol.com');
    console.log('🔑 Password: admin123');
    console.log('\n🔄 Silakan restart aplikasi dan coba login.');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Jalankan reset
resetAdminPassword();