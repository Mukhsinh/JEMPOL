const { createClient } = require('@supabase/supabase-js');

// Konfigurasi Supabase
const supabaseUrl = 'https://jxxzbdivafzzwqhagwrf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4eHpiZGl2YWZ6endxaGFnd3JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MTkwNTEsImV4cCI6MjA4MDQ5NTA1MX0.ICOtGuxrD19GtawdR9JAsnFn9XsHxWkr1aHCEkgHqXg';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function updateAuthPasswords() {
  console.log('🔧 Mengupdate password di Supabase Auth...');
  
  try {
    const accounts = [
      { email: 'admin@jempol.com', password: 'admin123' },
      { email: 'mukhsin9@gmail.com', password: 'admin123' }
    ];
    
    for (const account of accounts) {
      console.log(`\n📧 Memproses: ${account.email}`);
      
      // Coba login dengan password lama untuk mendapatkan session
      console.log('🔑 Mencoba login dengan password lama...');
      
      const oldPasswords = ['password', 'admin123', '123456', 'admin'];
      let loginSuccess = false;
      
      for (const oldPassword of oldPasswords) {
        try {
          const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
            email: account.email,
            password: oldPassword
          });
          
          if (!loginError && loginData.user) {
            console.log(`✅ Login berhasil dengan password: ${oldPassword}`);
            loginSuccess = true;
            
            // Update password
            const { data: updateData, error: updateError } = await supabase.auth.updateUser({
              password: account.password
            });
            
            if (updateError) {
              console.error('❌ Error updating password:', updateError);
            } else {
              console.log('✅ Password berhasil diupdate');
            }
            
            // Sign out
            await supabase.auth.signOut();
            break;
          }
        } catch (error) {
          // Continue to next password
        }
      }
      
      if (!loginSuccess) {
        console.log('⚠️ Tidak bisa login dengan password yang ada, mencoba reset...');
        
        // Coba reset password
        const { data: resetData, error: resetError } = await supabase.auth.resetPasswordForEmail(
          account.email,
          {
            redirectTo: 'http://localhost:3001/reset-password'
          }
        );
        
        if (resetError) {
          console.error('❌ Error sending reset email:', resetError);
        } else {
          console.log('📧 Email reset password telah dikirim');
        }
      }
    }
    
    console.log('\n🎉 Proses update password selesai!');
    console.log('\n📋 Kredensial login yang baru:');
    accounts.forEach(account => {
      console.log(`   Email: ${account.email}`);
      console.log(`   Password: ${account.password}\n`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Jalankan update
updateAuthPasswords();