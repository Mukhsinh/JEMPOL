/**
 * Script untuk memverifikasi dan memperbaiki endpoint API Vercel
 * Mengatasi error "Unexpected token '<', "<!doctype "... is not valid JSON"
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Memperbaiki konfigurasi API Vercel...\n');

// 1. Verifikasi struktur folder api/public
const apiPublicDir = path.join(__dirname, 'api', 'public');
if (!fs.existsSync(apiPublicDir)) {
  console.error('❌ Folder api/public tidak ditemukan!');
  process.exit(1);
}

console.log('✅ Folder api/public ditemukan');

// 2. List semua file TypeScript di api/public
const files = fs.readdirSync(apiPublicDir).filter(f => f.endsWith('.ts'));
console.log('📁 File API ditemukan:', files.join(', '));

// 3. Verifikasi setiap file memiliki export default handler
files.forEach(file => {
  const filePath = path.join(apiPublicDir, file);
  const content = fs.readFileSync(filePath, 'utf-8');
  
  if (!content.includes('export default')) {
    console.error(`❌ ${file} tidak memiliki export default!`);
  } else if (!content.includes('VercelRequest') || !content.includes('VercelResponse')) {
    console.error(`❌ ${file} tidak menggunakan tipe Vercel yang benar!`);
  } else if (!content.includes("res.setHeader('Content-Type', 'application/json")) {
    console.warn(`⚠️  ${file} tidak set Content-Type header!`);
  } else {
    console.log(`✅ ${file} - OK`);
  }
});

// 4. Verifikasi vercel.json
const vercelJsonPath = path.join(__dirname, 'vercel.json');
if (!fs.existsSync(vercelJsonPath)) {
  console.error('\n❌ vercel.json tidak ditemukan!');
  process.exit(1);
}

const vercelConfig = JSON.parse(fs.readFileSync(vercelJsonPath, 'utf-8'));
console.log('\n📋 Vercel Configuration:');
console.log('   - Framework:', vercelConfig.framework);
console.log('   - Output Directory:', vercelConfig.outputDirectory);

// Cek rewrites
if (vercelConfig.rewrites) {
  console.log('   - Rewrites:', vercelConfig.rewrites.length, 'rules');
  vercelConfig.rewrites.forEach(r => {
    console.log(`     • ${r.source} → ${r.destination}`);
  });
} else {
  console.warn('   ⚠️  Tidak ada rewrites dikonfigurasi');
}

// Cek routes
if (vercelConfig.routes) {
  console.log('   - Routes:', vercelConfig.routes.length, 'rules');
  vercelConfig.routes.forEach(r => {
    console.log(`     • ${r.src} → ${r.dest || r.destination || 'N/A'}`);
  });
}

// 5. Cek environment variables yang diperlukan
console.log('\n🔐 Environment Variables yang diperlukan:');
const requiredEnvVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'VITE_SUPABASE_SERVICE_ROLE_KEY'
];

requiredEnvVars.forEach(envVar => {
  console.log(`   - ${envVar}: ${process.env[envVar] ? '✅ SET' : '❌ NOT SET'}`);
});

console.log('\n✅ Verifikasi selesai!');
console.log('\n📝 Langkah selanjutnya:');
console.log('   1. Pastikan semua environment variables sudah di-set di Vercel');
console.log('   2. Deploy ulang aplikasi ke Vercel');
console.log('   3. Test endpoint: https://your-app.vercel.app/api/public/units');
console.log('   4. Cek Vercel logs jika masih ada error');
