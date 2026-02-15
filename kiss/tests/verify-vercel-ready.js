#!/usr/bin/env node

/**
 * Script untuk memverifikasi kesiapan aplikasi untuk deployment ke Vercel
 * Memeriksa:
 * 1. File .env tidak ter-commit
 * 2. Konfigurasi vercel.json benar
 * 3. Build script ada
 * 4. Environment variables menggunakan prefix yang benar
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Memverifikasi kesiapan deployment ke Vercel...\n');

let hasErrors = false;
let hasWarnings = false;

// ============================================
// 1. Cek file .env tidak ter-commit
// ============================================
console.log('📋 1. Memeriksa file environment...');

const envFiles = ['.env', '.env.local', '.env.production', 'kiss/.env.local', 'kiss/.env.production'];
const gitTrackedFiles = execSync('git ls-files', { encoding: 'utf-8' }).split('\n');

envFiles.forEach(file => {
  if (gitTrackedFiles.includes(file)) {
    console.error(`   ❌ ERROR: File ${file} ter-commit ke Git!`);
    console.error(`      Jalankan: git rm --cached ${file}`);
    hasErrors = true;
  } else {
    console.log(`   ✅ ${file} tidak ter-commit`);
  }
});

// Cek .gitignore
const gitignorePath = path.join(__dirname, '.gitignore');
if (fs.existsSync(gitignorePath)) {
  const gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8');
  const requiredIgnores = ['.env', '.env.local', '.env.production'];
  
  requiredIgnores.forEach(pattern => {
    if (gitignoreContent.includes(pattern)) {
      console.log(`   ✅ ${pattern} ada di .gitignore`);
    } else {
      console.error(`   ❌ ERROR: ${pattern} tidak ada di .gitignore`);
      hasErrors = true;
    }
  });
} else {
  console.error('   ❌ ERROR: File .gitignore tidak ditemukan');
  hasErrors = true;
}

console.log('');

// ============================================
// 2. Cek vercel.json
// ============================================
console.log('📋 2. Memeriksa vercel.json...');

const vercelJsonPath = path.join(__dirname, 'vercel.json');
if (fs.existsSync(vercelJsonPath)) {
  try {
    const vercelConfig = JSON.parse(fs.readFileSync(vercelJsonPath, 'utf-8'));
    
    // Cek buildCommand
    if (vercelConfig.buildCommand) {
      console.log(`   ✅ buildCommand: ${vercelConfig.buildCommand}`);
    } else {
      console.warn('   ⚠️  WARNING: buildCommand tidak didefinisikan');
      hasWarnings = true;
    }
    
    // Cek outputDirectory
    if (vercelConfig.outputDirectory === 'dist') {
      console.log(`   ✅ outputDirectory: ${vercelConfig.outputDirectory}`);
    } else {
      console.error(`   ❌ ERROR: outputDirectory harus 'dist', bukan '${vercelConfig.outputDirectory}'`);
      hasErrors = true;
    }
    
    // Cek rewrites untuk SPA
    if (vercelConfig.rewrites && vercelConfig.rewrites.length > 0) {
      console.log('   ✅ Rewrites untuk SPA routing sudah dikonfigurasi');
    } else {
      console.error('   ❌ ERROR: Rewrites untuk SPA routing tidak ada');
      hasErrors = true;
    }
    
    // Cek functions configuration
    if (vercelConfig.functions) {
      console.log('   ✅ Functions configuration ada');
    } else {
      console.warn('   ⚠️  WARNING: Functions configuration tidak ada');
      hasWarnings = true;
    }
    
  } catch (error) {
    console.error(`   ❌ ERROR: vercel.json tidak valid: ${error.message}`);
    hasErrors = true;
  }
} else {
  console.error('   ❌ ERROR: vercel.json tidak ditemukan');
  hasErrors = true;
}

console.log('');

// ============================================
// 3. Cek package.json scripts
// ============================================
console.log('📋 3. Memeriksa package.json scripts...');

const packageJsonPath = path.join(__dirname, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  
  if (packageJson.scripts && packageJson.scripts['vercel-build']) {
    console.log(`   ✅ vercel-build script: ${packageJson.scripts['vercel-build']}`);
  } else {
    console.error('   ❌ ERROR: vercel-build script tidak ditemukan');
    hasErrors = true;
  }
} else {
  console.error('   ❌ ERROR: package.json tidak ditemukan');
  hasErrors = true;
}

console.log('');

// ============================================
// 4. Cek penggunaan environment variables
// ============================================
console.log('📋 4. Memeriksa penggunaan environment variables...');

// Cek frontend files
const frontendFiles = [
  'kiss/src/utils/supabaseClient.ts',
  'kiss/src/services/api.ts'
];

let frontendEnvCorrect = true;
frontendFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Cek apakah menggunakan import.meta.env
    if (content.includes('import.meta.env.VITE_')) {
      console.log(`   ✅ ${file} menggunakan import.meta.env.VITE_`);
    } else if (content.includes('import.meta.env.')) {
      console.warn(`   ⚠️  WARNING: ${file} menggunakan import.meta.env tanpa prefix VITE_`);
      hasWarnings = true;
      frontendEnvCorrect = false;
    }
    
    // Cek apakah ada process.env (salah untuk frontend)
    if (content.includes('process.env.')) {
      console.error(`   ❌ ERROR: ${file} menggunakan process.env (harus import.meta.env)`);
      hasErrors = true;
      frontendEnvCorrect = false;
    }
  }
});

// Cek backend files
const backendFiles = [
  'api/public/users.ts',
  'api/public/qr-codes.ts'
];

let backendEnvCorrect = true;
backendFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Cek apakah menggunakan process.env
    if (content.includes('process.env.')) {
      console.log(`   ✅ ${file} menggunakan process.env`);
    } else {
      console.warn(`   ⚠️  WARNING: ${file} tidak menggunakan process.env`);
      hasWarnings = true;
      backendEnvCorrect = false;
    }
  }
});

console.log('');

// ============================================
// 5. Cek TypeScript types untuk env
// ============================================
console.log('📋 5. Memeriksa TypeScript types...');

const viteEnvDtsPath = path.join(__dirname, 'kiss/src/vite-env.d.ts');
if (fs.existsSync(viteEnvDtsPath)) {
  const content = fs.readFileSync(viteEnvDtsPath, 'utf-8');
  
  const requiredTypes = ['VITE_API_URL', 'VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
  requiredTypes.forEach(type => {
    if (content.includes(type)) {
      console.log(`   ✅ Type ${type} sudah didefinisikan`);
    } else {
      console.error(`   ❌ ERROR: Type ${type} tidak didefinisikan`);
      hasErrors = true;
    }
  });
} else {
  console.warn('   ⚠️  WARNING: vite-env.d.ts tidak ditemukan');
  hasWarnings = true;
}

console.log('');

// ============================================
// 6. Cek struktur folder
// ============================================
console.log('📋 6. Memeriksa struktur folder...');

const requiredFolders = [
  'api',
  'api/public',
  'kiss/src',
  'kiss/src/pages',
  'kiss/src/services'
];

requiredFolders.forEach(folder => {
  const folderPath = path.join(__dirname, folder);
  if (fs.existsSync(folderPath)) {
    console.log(`   ✅ Folder ${folder} ada`);
  } else {
    console.error(`   ❌ ERROR: Folder ${folder} tidak ditemukan`);
    hasErrors = true;
  }
});

console.log('');

// ============================================
// Summary
// ============================================
console.log('═══════════════════════════════════════════════════════');

if (hasErrors) {
  console.error('❌ GAGAL: Ada error yang harus diperbaiki sebelum deploy');
  console.error('   Perbaiki semua error di atas, lalu jalankan script ini lagi.');
  process.exit(1);
} else if (hasWarnings) {
  console.warn('⚠️  PERINGATAN: Ada beberapa warning, tapi aplikasi bisa di-deploy');
  console.warn('   Disarankan untuk memperbaiki warning sebelum deploy.');
  console.log('');
  console.log('✅ Aplikasi SIAP untuk di-deploy ke Vercel');
  console.log('');
  console.log('📝 Langkah selanjutnya:');
  console.log('   1. Tambahkan environment variables di Vercel Dashboard');
  console.log('   2. Jalankan: vercel --prod');
  console.log('   3. Atau push ke Git untuk auto-deploy');
  process.exit(0);
} else {
  console.log('✅ SEMPURNA: Semua pemeriksaan berhasil!');
  console.log('');
  console.log('📝 Langkah selanjutnya:');
  console.log('   1. Tambahkan environment variables di Vercel Dashboard:');
  console.log('      - VITE_SUPABASE_URL');
  console.log('      - VITE_SUPABASE_ANON_KEY');
  console.log('      - VITE_API_URL=/api');
  console.log('      - SUPABASE_URL');
  console.log('      - SUPABASE_ANON_KEY');
  console.log('      - SUPABASE_SERVICE_ROLE_KEY');
  console.log('      - NODE_ENV=production');
  console.log('');
  console.log('   2. Deploy dengan salah satu cara:');
  console.log('      - vercel --prod');
  console.log('      - git push (untuk auto-deploy)');
  console.log('      - Vercel Dashboard > Deploy');
  console.log('');
  console.log('   3. Setelah deploy, test:');
  console.log('      - https://your-app.vercel.app/');
  console.log('      - https://your-app.vercel.app/api/public/health');
  console.log('');
  console.log('📖 Lihat VERCEL_DEPLOYMENT_CHECKLIST.md untuk panduan lengkap');
  process.exit(0);
}
