/**
 * Script untuk memperbaiki masalah styling di Vercel
 * Masalah: CSS/Tailwind tidak ter-load di production
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Memperbaiki masalah styling Vercel...\n');

// 1. Verifikasi file-file penting
const filesToCheck = [
  'frontend/tailwind.config.js',
  'frontend/src/index.css',
  'frontend/src/main.tsx',
  'frontend/index.html',
  'frontend/vite.config.ts',
  'vercel.json'
];

console.log('📋 Memeriksa file-file konfigurasi...');
filesToCheck.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} - OK`);
  } else {
    console.log(`❌ ${file} - TIDAK DITEMUKAN`);
  }
});

// 2. Periksa package.json frontend
console.log('\n📦 Memeriksa dependencies frontend...');
const frontendPackageJson = JSON.parse(
  fs.readFileSync('frontend/package.json', 'utf8')
);

const requiredDeps = {
  'tailwindcss': 'devDependencies',
  'postcss': 'devDependencies',
  'autoprefixer': 'devDependencies'
};

Object.entries(requiredDeps).forEach(([dep, type]) => {
  if (frontendPackageJson[type] && frontendPackageJson[type][dep]) {
    console.log(`✅ ${dep} - Terinstall di ${type}`);
  } else {
    console.log(`❌ ${dep} - TIDAK DITEMUKAN di ${type}`);
  }
});

// 3. Periksa PostCSS config
console.log('\n🎨 Memeriksa PostCSS configuration...');
const postcssConfigPath = 'frontend/postcss.config.js';
if (fs.existsSync(postcssConfigPath)) {
  console.log(`✅ ${postcssConfigPath} - OK`);
  const postcssConfig = fs.readFileSync(postcssConfigPath, 'utf8');
  if (postcssConfig.includes('tailwindcss') && postcssConfig.includes('autoprefixer')) {
    console.log('✅ PostCSS config sudah benar');
  } else {
    console.log('⚠️  PostCSS config mungkin tidak lengkap');
  }
} else {
  console.log(`❌ ${postcssConfigPath} - TIDAK DITEMUKAN`);
  console.log('📝 Membuat postcss.config.js...');
  
  const postcssContent = `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
`;
  
  fs.writeFileSync(postcssConfigPath, postcssContent);
  console.log('✅ postcss.config.js berhasil dibuat');
}

// 4. Verifikasi Tailwind content paths
console.log('\n🎯 Memeriksa Tailwind content paths...');
const tailwindConfig = fs.readFileSync('frontend/tailwind.config.js', 'utf8');
if (tailwindConfig.includes('./src/**/*.{js,ts,jsx,tsx}')) {
  console.log('✅ Tailwind content paths sudah benar');
} else {
  console.log('⚠️  Tailwind content paths mungkin tidak lengkap');
}

// 5. Verifikasi index.css imports
console.log('\n📄 Memeriksa index.css...');
const indexCss = fs.readFileSync('frontend/src/index.css', 'utf8');
const requiredDirectives = ['@tailwind base', '@tailwind components', '@tailwind utilities'];
requiredDirectives.forEach(directive => {
  if (indexCss.includes(directive)) {
    console.log(`✅ ${directive} - OK`);
  } else {
    console.log(`❌ ${directive} - TIDAK DITEMUKAN`);
  }
});

// 6. Verifikasi main.tsx imports
console.log('\n🚀 Memeriksa main.tsx...');
const mainTsx = fs.readFileSync('frontend/src/main.tsx', 'utf8');
if (mainTsx.includes("import './index.css'")) {
  console.log("✅ import './index.css' - OK");
} else {
  console.log("❌ import './index.css' - TIDAK DITEMUKAN");
}

// 7. Periksa vercel.json
console.log('\n⚙️  Memeriksa vercel.json...');
const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
console.log(`Build Command: ${vercelConfig.buildCommand}`);
console.log(`Output Directory: ${vercelConfig.outputDirectory}`);

if (vercelConfig.buildCommand === 'npm run vercel-build' && 
    vercelConfig.outputDirectory === 'frontend/dist') {
  console.log('✅ Vercel configuration sudah benar');
} else {
  console.log('⚠️  Vercel configuration mungkin perlu disesuaikan');
}

// 8. Rekomendasi
console.log('\n\n📋 REKOMENDASI PERBAIKAN:\n');
console.log('1. Pastikan semua dependencies terinstall:');
console.log('   cd frontend && npm install');
console.log('');
console.log('2. Test build locally:');
console.log('   npm run build');
console.log('');
console.log('3. Periksa hasil build:');
console.log('   ls -la frontend/dist');
console.log('   cat frontend/dist/index.html');
console.log('');
console.log('4. Jika CSS tidak ada di dist, periksa:');
console.log('   - PostCSS config');
console.log('   - Tailwind config');
console.log('   - Vite config');
console.log('');
console.log('5. Deploy ke Vercel:');
console.log('   git add .');
console.log('   git commit -m "fix: styling issue"');
console.log('   git push');
console.log('');
console.log('6. Verifikasi Environment Variables di Vercel Dashboard:');
console.log('   - VITE_SUPABASE_URL');
console.log('   - VITE_SUPABASE_ANON_KEY');
console.log('   - VITE_API_URL (optional)');
console.log('');

console.log('✅ Analisis selesai!\n');
