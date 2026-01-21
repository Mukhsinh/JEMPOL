const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jxxzbdivafzzwqhagwrf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4eHpiZGl2YWZ6endxaGFnd3JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MTkwNTEsImV4cCI6MjA4MDQ5NTA1MX0.ICOtGuxrD19GtawdR9JAsnFn9XsHxWkr1aHCEkgHqXg';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixPassword() {
  console.log('🔄 Memperbaiki password admin@jempol.com...\n');

  const email = 'admin@jempol.com';
  
  try {
    // Coba beberapa password yang mungkin
    const possiblePasswords = [
      'Admin123!@#',
      'admin123',
      'Admin123',
      'Admin123!',
      'Admin@123',
      'admin@123',
      'Jempol123',
      'jempol123',
      'Admin1234',
      'password',
      'Password123',
      'Admin@jempol123'
    ];

    console.log('🔍 Mencoba berbagai password yang mungkin...\n');

    for (const password of possiblePasswords) {
      // Sign out dulu
      await supabase.auth.signOut();
      await new Promise(resolve => setTimeout(resolve, 500));

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (!error && data.user) {
        console.log('✅ PASSWORD DITEMUKAN!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Email    :', email);
        console.log('Password :', password);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('\nUser ID:', data.user.id);
        console.log('Email confirmed:', data.user.email_confirmed_at ? 'Yes' : 'No');
        
        // Test fetch admin profile
        console.log('\n🔄 Mengecek profile admin...');
        const { data: adminProfile, error: profileError } = await supabase
          .from('admins')
          .select('*')
          .eq('email', email)
          .eq('is_active', true)
          .single();

        if (profileError) {
          console.error('❌ Error fetch profile:', profileError.message);
        } else {
          console.log('✅ Profile admin ditemukan!');
          console.log('Username:', adminProfile.username);
          console.log('Role:', adminProfile.role);
          console.log('Active:', adminProfile.is_active);
        }
        
        return;
      }
    }

    console.log('❌ Tidak ada password yang cocok dari daftar.');
    console.log('\n📋 SOLUSI:');
    console.log('Gunakan Supabase Dashboard untuk reset password:');
    console.log('1. Buka: https://supabase.com/dashboard/project/jxxzbdivafzzwqhagwrf');
    console.log('2. Pilih Authentication > Users');
    console.log('3. Cari user: admin@jempol.com');
    console.log('4. Klik "..." > Reset Password');
    console.log('5. Set password baru: Admin123!@#');
    console.log('6. Klik "Update user"');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fixPassword();
