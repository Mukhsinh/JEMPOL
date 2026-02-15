#!/usr/bin/env node

/**
 * Script untuk test build lokal sebelum deploy ke Vercel
 * Memastikan build berhasil dan output benar
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔨 Testing build untuk Vercel...\n');

let hasErrors = false;

// ============================================
// 1. Clean dist folder
// ============================================
console.log('📋 1. Membersihkan folder dist...');

const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  console.log('   🗑️  Menghapus folder dist lama...');
  fs.rmSync(distPath, { recursive: true, force: true });
  console.log('   ✅ Folder dist dihapus');
} else {
  console.log('   ℹ️  Folder dist tidak ada (skip)');
}

console.log('');

// ============================================
// 2. Install dependencies
// ============================================
console.log('📋 2. Menginstall dependencies...');

try {
  console.log('   📦 Running: npm install --legacy-peer-deps...');
  execSync('npm install --legacy-peer-deps', { 
    stdio: 'inherit',
    encoding: 'utf-8'
  });
  console.log('   ✅ Dependencies terinstall');
} catch (error) {
  console.error('   ❌ ERROR: Gagal install dependencies');
  console.error(`      ${error.message}`);
  hasErrors = true;
}

console.log('');

// ============================================
// 3. Run build
// ============================================
console.log('📋 3. Menjalankan build...');

try {
  console.log('   🔨 Running: npm run vercel-build...');
  execSync('npm run vercel-build', { 
    stdio: 'inherit',
    encoding: 'utf-8'
  });
  console.log('   ✅ Build berhasil');
} catch (error) {
  console.error('   ❌ ERROR: Build gagal');
  console.error(`      ${error.message}`);
  hasErrors = true;
}

console.log('');

// ============================================
// 4. Verify output
// ============================================
console.log('📋 4. Memverifikasi output build...');

if (fs.existsSync(distPath)) {
  console.log('   ✅ Folder dist ada');
  
  // Cek index.html
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    console.log('   ✅ index.html ada');
    
    // Cek ukuran file
    const stats = fs.statSync(indexPath);
    console.log(`   ℹ️  Ukuran index.html: ${(stats.size / 1024).toFixed(2)} KB`);
  } else {
    console.error('   ❌ ERROR: index.html tidak ditemukan');
    hasErrors = true;
  }
  
  // Cek assets folder
  const assetsPath = path.join(distPath, 'assets');
  if (fs.existsSync(assetsPath)) {
    console.log('   ✅ Folder assets ada');
    
    // Hitung jumlah file
    const files = fs.readdirSync(assetsPath);
    console.log(`   ℹ️  Jumlah file di assets: ${files.length}`);
    
    // Cek ada JS dan CSS
    const hasJS = files.some(f => f.endsWith('.js'));
    const hasCSS = files.some(f => f.endsWith('.css'));
    
    if (hasJS) {
      console.log('   ✅ File JavaScript ada');
    } else {
      console.error('   ❌ ERROR: File JavaScript tidak ditemukan');
      hasErrors = true;
    }
    
    if (hasCSS) {
      console.log('   ✅ File CSS ada');
    } else {
      console.warn('   ⚠️  WARNING: File CSS tidak ditemukan');
    }
  } else {
    console.error('   ❌ ERROR: Folder assets tidak ditemukan');
    hasErrors = true;
  }
  
  // Hitung total size
  const getTotalSize = (dirPath) => {
    let totalSize = 0;
    const files = fs.readdirSync(dirPath);
    
    files.forEach(file => {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        totalSize += getTotalSize(filePath);
      } else {
        totalSize += stats.size;
      }
    });
    
    return totalSize;
  };
  
  const totalSize = getTotalSize(distPath);
  console.log(`   ℹ️  Total ukuran build: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
  
} else {
  console.error('   ❌ ERROR: Folder dist tidak ditemukan setelah build');
  hasErrors = true;
}

console.log('');

// ============================================
// 5. Check for common issues
// ============================================
console.log('📋 5. Memeriksa masalah umum...');

// Cek apakah ada console.log di production build
const indexPath = path.join(distPath, 'index.html');
if (fs.existsSync(indexPath)) {
  const indexContent = fs.readFileSync(indexPath, 'utf-8');
  
  // Cek apakah ada script tags
  if (indexContent.includes('<script')) {
    console.log('   ✅ Script tags ditemukan di index.html');
  } else {
    console.error('   ❌ ERROR: Tidak ada script tags di index.html');
    hasErrors = true;
  }
  
  // Cek apakah ada link tags untuk CSS
  if (indexContent.includes('<link') && indexContent.includes('stylesheet')) {
    console.log('   ✅ CSS link tags ditemukan di index.html');
  } else {
    console.warn('   ⚠️  WARNING: Tidak ada CSS link tags di index.html');
  }
}

console.log('');

// ============================================
// Summary
// ============================================
console.log('═══════════════════════════════════════════════════════');

if (hasErrors) {
  console.error('❌ GAGAL: Build memiliki error');
  console.error('   Perbaiki error di atas sebelum deploy ke Vercel');
  process.exit(1);
} else {
  console.log('✅ SUKSES: Build berhasil dan siap untuk deploy!');
  console.log('');
  console.log('📝 Langkah selanjutnya:');
  console.log('   1. Pastikan environment variables sudah ditambahkan di Vercel Dashboard');
  console.log('   2. Deploy dengan: vercel --prod');
  console.log('   3. Atau push ke Git untuk auto-deploy');
  console.log('');
  console.log('📖 Lihat VERCEL_DEPLOYMENT_CHECKLIST.md untuk panduan lengkap');
  process.exit(0);
}
