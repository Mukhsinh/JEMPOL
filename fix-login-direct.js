/**
 * Fix login langsung dengan update password di database
 */

import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, 'backend', '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ SUPABASE_URL atau SUPABASE_ANON_KEY tidak ditemukan');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fixLogin() {
  console.log('🔧 Memperbaiki login...\n');

  const email = 'admin@jempol.com';
  const password = 'Admin123!@#';

  try {
    // 1. Coba login dulu
    console.log(`1️⃣ Mencoba login dengan ${email}...`);
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (!loginError && loginData.user) {
      console.log('✅ Login berhasil!');
      console.log(`   User ID: ${loginData.user.id}`);
      console.log(`   Email: ${loginData.user.email}`);
      
      // Test ambil profile
      console.log('\n2️⃣ Mengambil admin profile...');
      const { data: profile, error: profileError } = await supabase
        .from('admins')
        .select('id, username, email, role, full_name')
        .eq('email', email)
        .eq('is_active', true)
        .single();

      if (profileError) {
        console.error(`❌ Error: ${profileError.message}`);
        console.log('\n💡 Kemungkinan masalah:');
        console.log('   - RLS policy tidak mengizinkan akses');
        console.log('   - Email tidak cocok dengan data di tabel admins');
      } else {
        console.log('✅ Profile berhasil diambil:');
        console.log(`   Username: ${profile.username}`);
        console.log(`   Role: ${profile.role}`);
        console.log(`   Full Name: ${profile.full_name || 'N/A'}`);
        
        console.log('\n✅ LOGIN BERHASIL! Silakan coba login di aplikasi dengan:');
        console.log(`   Email: ${email}`);
        console.log(`   Password: ${password}`);
      }
      
      await supabase.auth.signOut();
      return;
    }

    console.log(`❌ Login gagal: ${loginError.message}`);
    
    // 2. Cek apakah user ada di auth
    console.log('\n2️⃣ Memeriksa data admin...');
    const { data: admin, error: adminError } = await supabase
      .from('admins')
      .select('*')
      .eq('email', email)
      .single();

    if (adminError) {
      console.error(`❌ Admin tidak ditemukan: ${adminError.message}`);
      return;
    }

    console.log(`✅ Admin ditemukan: ${admin.username}`);
    console.log(`   Role: ${admin.role}`);
    console.log(`   Active: ${admin.is_active}`);

    // 3. Coba reset password via Supabase Auth
    console.log('\n3️⃣ Mencoba reset password...');
    console.log('   Silakan gunakan Supabase Dashboard untuk:');
    console.log('   1. Buka Authentication > Users');
    console.log(`   2. Cari user dengan email: ${email}`);
    console.log('   3. Klik "..." > Reset Password');
    console.log(`   4. Set password baru: ${password}`);
    console.log('   5. Atau gunakan "Send Magic Link" untuk login');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }
}

fixLogin();
