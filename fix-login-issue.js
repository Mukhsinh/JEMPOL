// Script untuk memperbaiki masalah login
// Jalankan dengan: node fix-login-issue.js

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jxxzbdivafzzwqhagwrf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4eHpiZGl2YWZ6endxaGFnd3JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MTkwNTEsImV4cCI6MjA4MDQ5NTA1MX0.ICOtGuxrD19GtawdR9JAsnFn9XsHxWkr1aHCEkgHqXg';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAuthUsers() {
  console.log('🔧 Membuat user Supabase Auth untuk admin...');
  
  const admins = [
    {
      email: 'admin@jempol.com',
      password: 'admin123',
      full_name: 'Administrator'
    },
    {
      email: 'mukhsin9@gmail.com',
      password: 'admin123',
      full_name: 'Mukhsin Superadmin'
    }
  ];

  for (const admin of admins) {
    try {
      console.log(`\nMembuat user untuk: ${admin.email}`);
      
      const { data, error } = await supabase.auth.signUp({
        email: admin.email,
        password: admin.password,
        options: {
          data: {
            full_name: admin.full_name
          }
        }
      });

      if (error) {
        if (error.message.includes('already registered')) {
          console.log(`✅ User sudah ada untuk: ${admin.email}`);
        } else {
          console.log(`❌ Error membuat user ${admin.email}:`, error.message);
        }
      } else {
        console.log(`✅ User berhasil dibuat untuk: ${admin.email}`);
        console.log(`   User ID: ${data.user?.id}`);
      }
    } catch (error) {
      console.error(`❌ Exception untuk ${admin.email}:`, error.message);
    }
  }
}

async function testLogin() {
  console.log('\n🧪 Testing login...');
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'admin@jempol.com',
      password: 'admin123'
    });

    if (error) {
      console.log(`❌ Login gagal: ${error.message}`);
    } else {
      console.log(`✅ Login berhasil!`);
      console.log(`   User: ${data.user?.email}`);
      console.log(`   Session: ${data.session ? 'Ada' : 'Tidak ada'}`);
      
      // Test admin profile
      const { data: adminProfile, error: profileError } = await supabase
        .from('admins')
        .select('*')
        .eq('email', 'admin@jempol.com')
        .eq('is_active', true)
        .single();

      if (profileError) {
        console.log(`❌ Admin profile error: ${profileError.message}`);
      } else {
        console.log(`✅ Admin profile found:`);
        console.log(`   Username: ${adminProfile.username}`);
        console.log(`   Role: ${adminProfile.role}`);
      }
      
      // Logout
      await supabase.auth.signOut();
      console.log(`✅ Logout berhasil`);
    }
  } catch (error) {
    console.error(`❌ Exception saat test login:`, error.message);
  }
}

async function main() {
  await createAuthUsers();
  await testLogin();
  
  console.log('\n🎉 Selesai!');
  console.log('📋 Informasi login:');
  console.log('- Email: admin@jempol.com atau mukhsin9@gmail.com');
  console.log('- Password: admin123');
  console.log('- Silakan coba login di aplikasi sekarang');
}

main().catch(console.error);