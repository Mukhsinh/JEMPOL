const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Vercel build process...');

try {
  // Build frontend (dependencies already installed by Vercel)
  console.log('🔨 Building frontend...');
  execSync('npm run build:skip-check', { cwd: 'frontend', stdio: 'inherit' });

  // Verify build
  console.log('🔍 Verifying build output...');
  const distPath = path.join(__dirname, 'frontend', 'dist');
  
  if (!fs.existsSync(distPath)) {
    console.error('❌ ERROR: dist folder not found!');
    process.exit(1);
  }

  const indexPath = path.join(distPath, 'index.html');
  if (!fs.existsSync(indexPath)) {
    console.error('❌ ERROR: index.html not found in dist!');
    process.exit(1);
  }

  console.log('✅ Build completed successfully!');
  const files = fs.readdirSync(distPath);
  console.log(`📁 Files in dist: ${files.length}`);
  console.log('📄 Files:', files.join(', '));
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
