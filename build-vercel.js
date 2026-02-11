import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting Vercel build process...');

try {
  // Change to frontend directory and build
  console.log('🔨 Building frontend...');
  process.chdir('frontend');
  
  // Run vite build directly
  execSync('npx vite build --outDir dist --emptyOutDir', { stdio: 'inherit' });
  
  // Change back to root
  process.chdir('..');

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
