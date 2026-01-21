/**
 * Script untuk memperbaiki error 400 pada login
 * Error ini terjadi karena:
 * 1. Invalid session di localStorage
 * 2. Password hash tidak cocok
 * 3. Konflik antara auth.users dan admins table
 */

import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabaseUrl = 'https://jxxzbdivafzzwqhagwrf.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4eHpiZGl2YWZ6endxaGFnd3JmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDY2NjU5MSwiZXhwIjoyMDUwMjQyNTkxfQ.ant_type-password1';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fixLoginError() {
  console.log('🔧 Memperbaiki error 400 pada login...\n');

  const email = 'admin@jempol.com';
  const password = 'Admin123!@#';

  try {
    // Step 1: Cek user di auth.users
    console.log('📋 Step 1: Mengecek user di auth.users...');
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Error listing users:', listError.message);
      return;
    }

    const authUser = users.find(u => u.email === email);
    
    if (!authUser) {
      console.log('❌ User tidak ditemukan di auth.users');
      console.log('📝 Membuat user baru...');
      
      // Buat user baru
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true,
        user_metadata: {
          full_name: 'Admin Jempol',
          role: 'superadmin'
        }
      });

      if (createError) {
        console.error('❌ Error creating user:', createError.message);
        return;
      }

      console.log('✅ User berhasil dibuat:', newUser.user.email);
    } else {
      console.log('✅ User ditemukan:', authUser.email);
      console.log('   ID:', authUser.id);
      console.log('   Confirmed:', authUser.email_confirmed_at ? 'Yes' : 'No');
      console.log('   Last sign in:', authUser.last_sign_in_at || 'Never');

      // Step 2: Reset password untuk memastikan password benar
      console.log('\n📋 Step 2: Reset password...');
      const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
        authUser.id,
        {
          password: password,
          email_confirm: true
        }
      );

      if (updateError) {
        console.error('❌ Error updating password:', updateError.message);
        return;
      }

      console.log('✅ Password berhasil direset');
    }

    // Step 3: Cek dan update admins table
    console.log('\n📋 Step 3: Mengecek admins table...');
    const { data: adminData, error: adminError } = await supabase
      .from('admins')
      .select('*')
      .eq('email', email)
      .single();

    if (adminError) {
      console.log('❌ Admin tidak ditemukan di admins table');
      console.log('📝 Membuat admin baru...');

      // Hash password untuk admins table
      const hashedPassword = await bcrypt.hash(password, 10);

      const { error: insertError } = await supabase
        .from('admins')
        .insert({
          username: 'admin_jempol',
          email: email,
          password: hashedPassword,
          full_name: 'Admin Jempol',
          role: 'superadmin',
          is_active: true
        });

      if (insertError) {
        console.error('❌ Error creating admin:', insertError.message);
        return;
      }

      console.log('✅ Admin berhasil dibuat');
    } else {
      console.log('✅ Admin ditemukan:', adminData.email);
      console.log('   Username:', adminData.username);
      console.log('   Role:', adminData.role);
      console.log('   Active:', adminData.is_active);

      // Update password hash di admins table
      console.log('\n📋 Step 4: Update password hash di admins table...');
      const hashedPassword = await bcrypt.hash(password, 10);

      const { error: updateAdminError } = await supabase
        .from('admins')
        .update({
          password: hashedPassword,
          is_active: true
        })
        .eq('email', email);

      if (updateAdminError) {
        console.error('❌ Error updating admin:', updateAdminError.message);
        return;
      }

      console.log('✅ Password hash berhasil diupdate');
    }

    // Step 5: Test login
    console.log('\n📋 Step 5: Testing login...');
    
    // Gunakan client baru tanpa service role untuk test login
    const testClient = createClient(supabaseUrl, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4eHpiZGl2YWZ6endxaGFnd3JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MTkwNTEsImV4cCI6MjA4MDQ5NTA1MX0.ICOtGuxrD19GtawdR9JAsnFn9XsHxWkr1aHCEkgHqXg');

    const { data: loginData, error: loginError } = await testClient.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (loginError) {
      console.error('❌ Login test failed:', loginError.message);
      console.log('\n⚠️  Kemungkinan penyebab:');
      console.log('   1. Password salah - coba reset manual di Supabase Dashboard');
      console.log('   2. Email belum confirmed - sudah diperbaiki di script ini');
      console.log('   3. User disabled - sudah diperbaiki di script ini');
      return;
    }

    console.log('✅ Login test berhasil!');
    console.log('   User ID:', loginData.user.id);
    console.log('   Email:', loginData.user.email);
    console.log('   Session valid:', !!loginData.session);

    // Cleanup - sign out
    await testClient.auth.signOut();

    console.log('\n✅ SEMUA PERBAIKAN SELESAI!');
    console.log('\n📝 Kredensial login:');
    console.log('   Email: admin@jempol.com');
    console.log('   Password: Admin123!@#');
    console.log('\n💡 Silakan coba login di aplikasi sekarang!');
    console.log('💡 Jika masih error, clear browser cache dan localStorage terlebih dahulu');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }
}

// Run the fix
fixLoginError();
