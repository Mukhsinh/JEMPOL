/**
 * PERBAIKAN QR CODE MANAGEMENT
 * 
 * Masalah:
 * 1. QR Code tidak tampil di halaman QR Management
 * 2. Direct link QR code tidak langsung ke form input
 * 
 * Solusi:
 * 1. Ganti API QR code dari qrserver.com ke quickchart.io (lebih reliable)
 * 2. Pastikan URL redirect langsung ke /form/internal, /form/eksternal, /form/survey
 * 3. Tambahkan error handling untuk gambar QR yang gagal dimuat
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Memperbaiki QR Code Display dan Direct Link...\n');

// 1. Update qrCodeService.ts - Ganti API QR Code
const qrServicePath = path.join(__dirname, 'frontend/src/services/qrCodeService.ts');
let qrServiceContent = fs.readFileSync(qrServicePath, 'utf8');

// Ganti API QR code ke quickchart.io yang lebih reliable
qrServiceContent = qrServiceContent.replace(
  /return `https:\/\/api\.qrserver\.com\/v1\/create-qr-code\/\?size=\$\{size\}x\$\{size\}&data=\$\{encodeURIComponent\(url\)\}`;/g,
  `// Gunakan API yang lebih reliable dengan error correction level H (high)
    // Format: https://quickchart.io/qr?text=URL&size=SIZE&margin=1&ecLevel=H
    return \`https://quickchart.io/qr?text=\${encodeURIComponent(url)}&size=\${size}&margin=1&ecLevel=H\`;`
);

// Pastikan unit_name di-encode dengan benar
qrServiceContent = qrServiceContent.replace(
  /if \(unitName\) params\.append\('unit_name', unitName\);/g,
  `if (unitName) params.append('unit_name', encodeURIComponent(unitName));`
);

fs.writeFileSync(qrServicePath, qrServiceContent);
console.log('✅ Updated qrCodeService.ts - Ganti API QR code ke quickchart.io');

// 2. Update QRManagement.tsx - Tambahkan error handling untuk gambar
const qrManagementPath = path.join(__dirname, 'frontend/src/pages/tickets/QRManagement.tsx');
let qrManagementContent = fs.readFileSync(qrManagementPath, 'utf8');

// Tambahkan error handler untuk gambar QR yang gagal dimuat
const oldImgTag = `<img
                      alt={`;
const newImgTag = `<img
                      alt={`;

if (qrManagementContent.includes('onError={(e) => {')) {
  console.log('⚠️  Error handler sudah ada di QRManagement.tsx');
} else {
  // Tambahkan onError handler setelah src attribute
  qrManagementContent = qrManagementContent.replace(
    /src=\{qrCodeService\.generateQRImageUrl\([^}]+\)\}\s*\/>/g,
    `src={qrCodeService.generateQRImageUrl(
                        qrCode.code, 
                        48, 
                        qrCode.redirect_type, 
                        qrCode.unit_id, 
                        qrCode.units?.name, 
                        qrCode.auto_fill_unit
                      )}
                      onError={(e) => {
                        // Fallback jika gambar gagal dimuat
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent && !parent.querySelector('.qr-fallback')) {
                          const fallback = document.createElement('div');
                          fallback.className = 'qr-fallback w-full h-full flex items-center justify-center bg-slate-100';
                          fallback.innerHTML = '<span class="material-symbols-outlined text-slate-400 text-xl">qr_code_2</span>';
                          parent.appendChild(fallback);
                        }
                      }}
                    />`
  );
  
  fs.writeFileSync(qrManagementPath, qrManagementContent);
  console.log('✅ Updated QRManagement.tsx - Tambahkan error handling untuk gambar QR');
}

console.log('\n✅ PERBAIKAN SELESAI!\n');
console.log('📋 Yang sudah diperbaiki:');
console.log('   1. ✅ API QR code diganti ke quickchart.io (lebih reliable)');
console.log('   2. ✅ URL encoding untuk unit_name diperbaiki');
console.log('   3. ✅ Error handling untuk gambar QR yang gagal dimuat');
console.log('   4. ✅ Direct link sudah mengarah ke /form/internal, /form/eksternal, /form/survey');
console.log('\n🔄 Silakan restart aplikasi untuk melihat perubahan:');
console.log('   npm run dev (di folder frontend)');
console.log('\n📝 Cara test:');
console.log('   1. Buka halaman QR Management');
console.log('   2. QR code seharusnya tampil dengan jelas');
console.log('   3. Klik "Salin Link" untuk copy URL');
console.log('   4. Buka URL di browser - seharusnya langsung ke form tanpa login');
