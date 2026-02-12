#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Vercel build process...');
console.log('📍 Current directory:', process.cwd());
console.log('📍 __dirname:', __dirname);

try {
  // Ensure we're in the right directory
  const rootDir = __dirname;
  const kissDir = path.join(rootDir, 'kiss');
  
  console.log('🔍 Checking kiss directory:', kissDir);
  if (!fs.existsSync(kissDir)) {
    console.error('❌ ERROR: kiss directory not found!');
    process.exit(1);
  }

  // Change to kiss directory and build
  console.log('🔨 Building kiss...');
  process.chdir(kissDir);
  console.log('📍 Changed to:', process.cwd());
  
  // Check if node_modules exists
  const nodeModulesPath = path.join(process.cwd(), 'node_modules');
  if (!fs.existsSync(nodeModulesPath)) {
    console.log('📦 Installing dependencies...');
    execSync('npm install --legacy-peer-deps', { stdio: 'inherit' });
  }
  
  // Run vite build directly
  console.log('🏗️ Running vite build...');
  execSync('npx vite build --outDir dist --emptyOutDir', { stdio: 'inherit' });
  
  // Verify build
  console.log('🔍 Verifying build output...');
  const distPath = path.join(process.cwd(), 'dist');
  
  if (!fs.existsSync(distPath)) {
    console.error('❌ ERROR: dist folder not found at:', distPath);
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
  console.log('📄 Sample files:', files.slice(0, 10).join(', '));
  
  // Change back to root
  process.chdir(rootDir);
  console.log('📍 Changed back to root:', process.cwd());
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  console.error('Stack trace:', error.stack);
  process.exit(1);
}
