@echo off
echo ========================================
echo 🔐 TEST LOGIN FIXED FINAL
echo ========================================
echo.

echo 📂 Opening test files...
start "" "test-auth-service-fixed.html"

echo.
echo 🚀 Starting frontend application...
cd frontend
start cmd /k "npm run dev"

echo.
echo ✅ Test setup complete!
echo.
echo 📋 Instructions:
echo 1. Wait for frontend to start (usually http://localhost:3001)
echo 2. Test login dengan file test-auth-service-fixed.html
echo 3. Jika test berhasil, coba login di aplikasi utama
echo.
echo 🔍 Yang sudah diperbaiki:
echo - Simplified Supabase client configuration
echo - Fixed auth service dengan session handling yang benar
echo - Updated AuthContext untuk menggunakan auth service yang diperbaiki
echo.
pause