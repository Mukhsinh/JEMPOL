/**
 * Script untuk memperbaiki Vercel Serverless Functions
 * Masalah: Error 405, Non-JSON response, gagal memuat data
 * Solusi: Perbaiki error handling dan pastikan SELALU return JSON
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Memperbaiki Vercel Serverless Functions...\n');

// 1. Backup file lama
console.log('📦 Step 1: Backup file lama...');
const filesToBackup = [
  'api/public/internal-tickets.ts',
  'api/public/app-settings.ts',
  'api/public/units.ts'
];

filesToBackup.forEach(file => {
  if (fs.existsSync(file)) {
    const backupFile = file.replace('.ts', '.backup.ts');
    fs.copyFileSync(file, backupFile);
    console.log(`✅ Backup: ${file} -> ${backupFile}`);
  }
});

// 2. Copy file yang sudah diperbaiki
console.log('\n📝 Step 2: Mengganti dengan file yang sudah diperbaiki...');

// Copy internal-tickets-fixed.ts ke internal-tickets.ts
if (fs.existsSync('api/public/internal-tickets-fixed.ts')) {
  fs.copyFileSync('api/public/internal-tickets-fixed.ts', 'api/public/internal-tickets.ts');
  console.log('✅ Updated: api/public/internal-tickets.ts');
}

console.log('\n✅ Perbaikan selesai!');
console.log('\n📋 Langkah selanjutnya:');
console.log('1. Commit perubahan: git add . && git commit -m "fix: perbaiki vercel serverless functions"');
console.log('2. Push ke GitHub: git push');
console.log('3. Vercel akan otomatis deploy ulang');
console.log('4. Test di https://kiss2.vercel.app');
console.log('\n⚠️  PENTING: Pastikan environment variables sudah di-set di Vercel Dashboard:');
console.log('   - VITE_SUPABASE_URL');
console.log('   - VITE_SUPABASE_SERVICE_ROLE_KEY atau VITE_SUPABASE_ANON_KEY');
