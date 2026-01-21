import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabaseUrl = 'https://jxxzbdivafzzwqhagwrf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4eHpiZGl2YWZ6endxaGFnd3JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MTkwNTEsImV4cCI6MjA4MDQ5NTA1MX0.ICOtGuxrD19GtawdR9JAsnFn9XsHxWkr1aHCEkgHqXg';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function resetPasswordDirectSQL() {
  console.log('🔧 Reset Password via SQL...\n');

  const email = 'admin@jempol.com';
  const newPassword = 'admin123';

  try {
    // 1. Generate bcrypt hash untuk password
    console.log('1️⃣ Generating password hash...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    console.log('✅ Hash generated');

    // 2. Get user ID dari auth.users
    console.log('\n2️⃣ Getting user ID...');
    const { data: authUser, error: authError } = await supabase
      .rpc('get_auth_user_by_email', { user_email: email });

    if (authError) {
      console.log('⚠️  RPC function tidak tersedia, menggunakan cara alternatif...');
      
      // Alternatif: query langsung (mungkin tidak bisa karena RLS)
      const { data: users, error: usersError } = await supabase
        .from('auth.users')
        .select('id')
        .eq('email', email)
        .single();

      if (usersError) {
        console.error('❌ Tidak bisa mendapatkan user ID:', usersError.message);
        console.log('\n📝 Solusi Manual:');
        console.log('1. Buka Supabase Dashboard');
        console.log('2. Ke SQL Editor');
        console.log('3. Jalankan query ini:');
        console.log(`
UPDATE auth.users 
SET 
  encrypted_password = crypt('${newPassword}', gen_salt('bf')),
  updated_at = now()
WHERE email = '${email}';
        `);
        return;
      }

      console.log('✅ User ID:', users.id);
    }

    // 3. Test login dengan password lama dulu
    console.log('\n3️⃣ Testing current login status...');
    await supabase.auth.signOut();
    
    const passwords = ['admin123', 'Admin123!', 'password', 'admin'];
    let loginSuccess = false;

    for (const pwd of passwords) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: pwd
      });

      if (!error && data.user) {
        console.log(`✅ Login berhasil dengan password: ${pwd}`);
        loginSuccess = true;
        
        console.log('\n📋 Kredensial yang Benar:');
        console.log(`   Email: ${email}`);
        console.log(`   Password: ${pwd}`);
        console.log('\n🌐 Silakan login di: http://localhost:3002/login');
        break;
      }
    }

    if (!loginSuccess) {
      console.log('❌ Tidak ada password yang berhasil');
      console.log('\n📝 Solusi:');
      console.log('1. Buka Supabase Dashboard: https://supabase.com/dashboard');
      console.log('2. Pilih project: jxxzbdivafzzwqhagwrf');
      console.log('3. Ke Authentication > Users');
      console.log('4. Cari user: admin@jempol.com');
      console.log('5. Klik menu "..." > "Reset Password"');
      console.log('6. Set password baru: admin123');
      console.log('\nATAU gunakan SQL Editor:');
      console.log(`
UPDATE auth.users 
SET 
  encrypted_password = crypt('admin123', gen_salt('bf')),
  updated_at = now()
WHERE email = 'admin@jempol.com';
      `);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

resetPasswordDirectSQL();
