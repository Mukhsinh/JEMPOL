const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jxxzbdivafzzwqhagwrf.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4eHpiZGl2YWZ6endxaGFnd3JmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDkxOTA1MSwiZXhwIjoyMDgwNDk1MDUxfQ.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

// Create admin client with service role
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fixAdminLogin() {
  try {
    console.log('🔄 Memperbaiki login admin...');

    const adminEmail = 'admin@jempol.com';
    const newPassword = 'admin123';

    // 1. Update password di Supabase Auth
    console.log('📧 Mengupdate password untuk:', adminEmail);
    
    const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      'e235a49c-e8bb-4a28-8571-8509a849ee5c', // ID dari query sebelumnya
      {
        password: newPassword,
        email_confirm: true
      }
    );

    if (updateError) {
      console.error('❌ Error updating password:', updateError);
      
      // Coba cara alternatif - reset password
      console.log('🔄 Mencoba reset password...');
      const { error: resetError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'recovery',
        email: adminEmail,
        options: {
          redirectTo: 'http://localhost:3001/login'
        }
      });

      if (resetError) {
        console.error('❌ Error generating reset link:', resetError);
      } else {
        console.log('✅ Reset link generated successfully');
      }
    } else {
      console.log('✅ Password updated successfully');
    }

    // 2. Pastikan user aktif di tabel admins
    console.log('🔄 Memastikan admin aktif...');
    
    const { data: adminData, error: adminError } = await supabaseAdmin
      .from('admins')
      .upsert({
        email: adminEmail,
        username: 'admin',
        full_name: 'Administrator',
        role: 'superadmin',
        is_active: true,
        password_hash: '$2b$10$dummy.hash.for.supabase.auth',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'email'
      })
      .select();

    if (adminError) {
      console.error('❌ Error updating admin record:', adminError);
    } else {
      console.log('✅ Admin record updated:', adminData);
    }

    // 3. Test login
    console.log('🔄 Testing login...');
    
    const { data: loginData, error: loginError } = await supabaseAdmin.auth.signInWithPassword({
      email: adminEmail,
      password: newPassword
    });

    if (loginError) {
      console.error('❌ Login test failed:', loginError);
      
      // Coba dengan password lama yang mungkin masih berlaku
      console.log('🔄 Mencoba dengan password alternatif...');
      const alternativePasswords = ['password', '123456', 'admin', 'jempol123'];
      
      for (const pwd of alternativePasswords) {
        const { data: testData, error: testError } = await supabaseAdmin.auth.signInWithPassword({
          email: adminEmail,
          password: pwd
        });
        
        if (!testError && testData.user) {
          console.log(`✅ Login berhasil dengan password: ${pwd}`);
          break;
        }
      }
    } else {
      console.log('✅ Login test successful with new password:', newPassword);
    }

    console.log('\n=== INFORMASI LOGIN ===');
    console.log('Email:', adminEmail);
    console.log('Password:', newPassword);
    console.log('URL:', 'http://localhost:3001/login');
    console.log('=====================');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

fixAdminLogin();