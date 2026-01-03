const { createClient } = require('@supabase/supabase-js');

console.log('🔧 MEMPERBAIKI MASALAH LOGIN - CACHE DAN KONFIGURASI');
console.log('='.repeat(60));

// Konfigurasi yang benar
const CORRECT_SUPABASE_URL = 'https://jxxzbdivafzzwqhagwrf.supabase.co';
const CORRECT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4eHpiZGl2YWZ6endxaGFnd3JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MTkwNTEsImV4cCI6MjA4MDQ5NTA1MX0.ICOtGuxrD19GtawdR9JAsnFn9XsHxWkr1aHCEkgHqXg';

async function testLogin() {
  console.log('\n1️⃣ Testing login dengan konfigurasi yang benar...');
  
  try {
    const supabase = createClient(CORRECT_SUPABASE_URL, CORRECT_SUPABASE_ANON_KEY);
    
    console.log('📧 Mencoba login dengan admin@jempol.com...');
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'admin@jempol.com',
      password: 'admin123'
    });
    
    if (error) {
      console.error('❌ Login gagal:', error.message);
      return false;
    }
    
    if (data.user) {
      console.log('✅ Login berhasil!');
      console.log('👤 User ID:', data.user.id);
      console.log('📧 Email:', data.user.email);
      
      // Test admin profile
      const { data: adminData, error: adminError } = await supabase
        .from('admins')
        .select('*')
        .eq('email', 'admin@jempol.com')
        .single();
        
      if (adminError) {
        console.error('❌ Error mengambil profile admin:', adminError.message);
      } else {
        console.log('✅ Profile admin ditemukan:', adminData.username);
      }
      
      // Logout
      await supabase.auth.signOut();
      return true;
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
  
  return false;
}

async function checkEnvironmentFiles() {
  console.log('\n2️⃣ Memeriksa file environment...');
  
  const fs = require('fs');
  const path = require('path');
  
  // Check frontend .env
  const frontendEnvPath = path.join(__dirname, 'frontend', '.env');
  if (fs.existsSync(frontendEnvPath)) {
    const frontendEnv = fs.readFileSync(frontendEnvPath, 'utf8');
    
    if (frontendEnv.includes(CORRECT_SUPABASE_URL)) {
      console.log('✅ Frontend .env menggunakan URL yang benar');
    } else {
      console.log('❌ Frontend .env menggunakan URL yang salah');
      console.log('🔧 Memperbaiki frontend .env...');
      
      const correctedEnv = frontendEnv
        .replace(/VITE_SUPABASE_URL=.*/g, `VITE_SUPABASE_URL=${CORRECT_SUPABASE_URL}`)
        .replace(/VITE_SUPABASE_ANON_KEY=.*/g, `VITE_SUPABASE_ANON_KEY=${CORRECT_SUPABASE_ANON_KEY}`);
        
      fs.writeFileSync(frontendEnvPath, correctedEnv);
      console.log('✅ Frontend .env diperbaiki');
    }
  }
  
  // Check backend .env
  const backendEnvPath = path.join(__dirname, 'backend', '.env');
  if (fs.existsSync(backendEnvPath)) {
    const backendEnv = fs.readFileSync(backendEnvPath, 'utf8');
    
    if (backendEnv.includes(CORRECT_SUPABASE_URL)) {
      console.log('✅ Backend .env menggunakan URL yang benar');
    } else {
      console.log('❌ Backend .env menggunakan URL yang salah');
      console.log('🔧 Memperbaiki backend .env...');
      
      const correctedEnv = backendEnv
        .replace(/SUPABASE_URL=.*/g, `SUPABASE_URL=${CORRECT_SUPABASE_URL}`)
        .replace(/SUPABASE_ANON_KEY=.*/g, `SUPABASE_ANON_KEY=${CORRECT_SUPABASE_ANON_KEY}`);
        
      fs.writeFileSync(backendEnvPath, correctedEnv);
      console.log('✅ Backend .env diperbaiki');
    }
  }
}

async function main() {
  try {
    await checkEnvironmentFiles();
    
    const loginSuccess = await testLogin();
    
    if (loginSuccess) {
      console.log('\n🎉 SEMUA BERHASIL!');
      console.log('✅ Konfigurasi sudah benar');
      console.log('✅ Login test berhasil');
      console.log('\n📋 Langkah selanjutnya:');
      console.log('1. Restart aplikasi frontend dan backend');
      console.log('2. Clear browser cache (Ctrl+Shift+Delete)');
      console.log('3. Coba login dengan admin@jempol.com / admin123');
    } else {
      console.log('\n❌ MASIH ADA MASALAH');
      console.log('🔍 Periksa kembali konfigurasi Supabase');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

main();