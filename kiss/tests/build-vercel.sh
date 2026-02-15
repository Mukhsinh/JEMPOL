#!/bin/bash
set -e

echo "🚀 Starting Vercel build process..."

# Install dependencies
echo "📦 Installing root dependencies..."
npm install

echo "📦 Installing frontend dependencies..."
cd frontend
npm install

# Build frontend
echo "🔨 Building frontend..."
npm run build:skip-check

# Verify build
echo "🔍 Verifying build output..."
if [ ! -d "dist" ]; then
  echo "❌ ERROR: dist folder not found!"
  exit 1
fi

if [ ! -f "dist/index.html" ]; then
  echo "❌ ERROR: index.html not found in dist!"
  exit 1
fi

echo "✅ Build completed successfully!"
ls -la dist/
