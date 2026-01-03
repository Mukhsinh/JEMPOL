const fs = require('fs');

console.log('🔍 Memverifikasi perbaikan timeout...');

try {
  // Check supabaseClient.ts
  const supabaseClientContent = fs.readFileSync('frontend/src/utils/supabaseClient.ts', 'utf8');
  
  if (supabaseClientContent.includes('AbortSignal.timeout(5000)')) {
    console.log('✅ supabaseClient.ts - Timeout 5s detected');
  } else {
    console.log('❌ supabaseClient.ts - Timeout 5s NOT found');
  }

  if (supabaseClientContent.includes('CONNECTION_CHECK_INTERVAL = 30000')) {
    console.log('✅ supabaseClient.ts - Connection caching detected');
  } else {
    console.log('❌ supabaseClient.ts - Connection caching NOT found');
  }

  if (supabaseClientContent.includes('setTimeout(() => reject(new Error(\'Connection check timeout\')), 2000)')) {
    console.log('✅ supabaseClient.ts - 2s connection timeout detected');
  } else {
    console.log('❌ supabaseClient.ts - 2s connection timeout NOT found');
  }

  // Check AuthContext.tsx
  const authContextContent = fs.readFileSync('frontend/src/contexts/AuthContext.tsx', 'utf8');
  
  if (authContextContent.includes('setTimeout(() => reject(new Error(\'Auth initialization timeout\')), 3000)')) {
    console.log('✅ AuthContext.tsx - 3s auth timeout detected');
  } else {
    console.log('❌ AuthContext.tsx - 3s auth timeout NOT found');
  }

  if (authContextContent.includes('setTimeout(() => reject(new Error(\'Login timeout\')), 5000)')) {
    console.log('✅ AuthContext.tsx - 5s login timeout detected');
  } else {
    console.log('❌ AuthContext.tsx - 5s login timeout NOT found');
  }

  if (authContextContent.includes('Skip connection test untuk mempercepat inisialisasi')) {
    console.log('✅ AuthContext.tsx - Skip connection test detected');
  } else {
    console.log('❌ AuthContext.tsx - Skip connection test NOT found');
  }

  if (authContextContent.includes('from \'../utils/supabaseClient\'')) {
    console.log('✅ AuthContext.tsx - Correct import detected');
  } else {
    console.log('❌ AuthContext.tsx - Incorrect import found');
  }

  console.log('\n🎉 Verifikasi selesai!');
  console.log('\n📋 Langkah selanjutnya:');
  console.log('1. Jalankan: RESTART_APP_TIMEOUT_FIXED.bat');
  console.log('2. Test login dengan admin@jempol.com / admin123');
  console.log('3. Buka test-login-timeout-fixed.html untuk test detail');

} catch (error) {
  console.error('❌ Error saat verifikasi:', error.message);
}