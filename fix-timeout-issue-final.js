const fs = require('fs');
const path = require('path');

console.log('🔧 Memperbaiki masalah timeout pada Supabase client dan AuthContext...');

try {
  // Backup file lama
  const supabaseClientPath = 'frontend/src/utils/supabaseClient.ts';
  const authContextPath = 'frontend/src/contexts/AuthContext.tsx';
  
  const supabaseClientOptimizedPath = 'frontend/src/utils/supabaseClient-optimized.ts';
  const authContextOptimizedPath = 'frontend/src/contexts/AuthContext-optimized.tsx';

  // Backup file lama
  if (fs.existsSync(supabaseClientPath)) {
    fs.copyFileSync(supabaseClientPath, supabaseClientPath + '.backup');
    console.log('✅ Backup supabaseClient.ts dibuat');
  }

  if (fs.existsSync(authContextPath)) {
    fs.copyFileSync(authContextPath, authContextPath + '.backup');
    console.log('✅ Backup AuthContext.tsx dibuat');
  }

  // Replace dengan versi optimized
  if (fs.existsSync(supabaseClientOptimizedPath)) {
    fs.copyFileSync(supabaseClientOptimizedPath, supabaseClientPath);
    console.log('✅ supabaseClient.ts diganti dengan versi optimized');
  }

  if (fs.existsSync(authContextOptimizedPath)) {
    fs.copyFileSync(authContextOptimizedPath, authContextPath);
    console.log('✅ AuthContext.tsx diganti dengan versi optimized');
  }

  console.log('\n🎉 Perbaikan timeout selesai!');
  console.log('\n📋 Perubahan yang dilakukan:');
  console.log('- Timeout connection check: 30s → 2s');
  console.log('- Timeout auth initialization: 30s → 3s');
  console.log('- Timeout login: 30s → 5s');
  console.log('- Timeout profile fetch: 3s → 1.5s');
  console.log('- Skip connection test saat initialization');
  console.log('- Caching connection status (30s interval)');
  console.log('- Optimized retry mechanism');

  console.log('\n🚀 Silakan restart aplikasi untuk melihat perbaikan!');

} catch (error) {
  console.error('❌ Error saat memperbaiki timeout:', error);
  process.exit(1);
}