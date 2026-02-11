#!/bin/bash
set -e

echo "Starting build process..."

# Install root dependencies
echo "Installing root dependencies..."
npm install

# Navigate to frontend and install dependencies
echo "Installing frontend dependencies..."
cd frontend
npm install

# Build frontend
echo "Building frontend..."
npm run build

# Verify dist folder exists
if [ -d "dist" ]; then
  echo "✓ Build successful! dist folder created."
  ls -la dist
else
  echo "✗ Build failed! dist folder not found."
  exit 1
fi

echo "Build process completed successfully!"
