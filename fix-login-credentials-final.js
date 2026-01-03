const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');

// Konfigurasi Supabase yang benar
const supabaseUrl = 'https://jxxzbdivafzzwqhagwrf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4eHpiZGl2YWZ6endxaGFnd3JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MTkwNTEsImV4cCI6MjA4MDQ5NTA1MX0.ICOtGuxrD19GtawdR9JAsnFn9XsHxWkr1aHCEkgHqXg';

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fixLoginCredentials() {
  try {
    console.log('🔧 Memperbaiki kredensial login admin...');

    const adminEmail = 'admin@jempol.com';
    const adminPassword = 'admin123';
    
    // Hash password dengan bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);
    
    console.log('🔐 Password hash generated:', hashedPassword.substring(0, 20) + '...');

    // Cek apakah admin sudah ada
    const { data: existingAdmin, error: checkError } = await supabase
      .from('admins')
      .select('*')
      .eq('email', adminEmail)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Error checking existing admin:', checkError);
      return;
    }

    if (existingAdmin) {
      console.log('📝 Updating existing admin...');
      
      // Update admin yang sudah ada
      const { error: updateError } = await supabase
        .from('admins')
        .update({
          password: hashedPassword,
          is_active: true,
          role: 'superadmin',
          updated_at: new Date().toISOString()
        })
        .eq('email', adminEmail);

      if (updateError) {
        console.error('❌ Error updating admin:', updateError);
        return;
      }

      console.log('✅ Admin credentials updated successfully');
    } else {
      console.log('➕ Creating new admin...');
      
      // Buat admin baru
      const { error: insertError } = await supabase
        .from('admins')
        .insert({
          username: 'admin',
          email: adminEmail,
          password: hashedPassword,
          full_name: 'Administrator',
          role: 'superadmin',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (insertError) {
        console.error('❌ Error creating admin:', insertError);
        return;
      }

      console.log('✅ New admin created successfully');
    }

    // Buat auth user di Supabase Auth
    console.log('🔐 Creating Supabase Auth user...');
    
    try {
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true,
        user_metadata: {
          full_name: 'Administrator',
          role: 'superadmin'
        }
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          console.log('ℹ️ Auth user already exists, updating password...');
          
          // Update password untuk user yang sudah ada
          const { error: updateAuthError } = await supabase.auth.admin.updateUserById(
            authData?.user?.id || 'existing-user-id',
            { password: adminPassword }
          );

          if (updateAuthError) {
            console.warn('⚠️ Could not update auth password:', updateAuthError.message);
          } else {
            console.log('✅ Auth password updated');
          }
        } else {
          console.error('❌ Auth user creation error:', authError);
        }
      } else {
        console.log('✅ Auth user created successfully');
      }
    } catch (authErr) {
      console.warn('⚠️ Auth operation failed:', authErr.message);
    }

    console.log('\n🎉 Login credentials fixed!');
    console.log('📧 Email: admin@jempol.com');
    console.log('🔑 Password: admin123');
    console.log('\n🔄 Please restart the frontend application and try logging in.');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Jalankan perbaikan
fixLoginCredentials();