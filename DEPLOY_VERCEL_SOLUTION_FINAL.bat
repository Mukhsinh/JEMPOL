@echo off
echo ========================================
echo DEPLOY VERCEL - SOLUSI FINAL FIXED
echo ========================================

echo.
echo [INFO] Menggunakan konfigurasi yang sudah diperbaiki:
echo - vercel.json: buildCommand menggunakan npm run vercel-build
echo - package.json: vercel-build script sudah tersedia
echo - .env files: NODE_ENV warning sudah diperbaiki
echo - MCP Supabase: Sudah terkonfigurasi dan diverifikasi

echo.
echo [1/4] Membersihkan build cache...
if exist frontend\dist rmdir /s /q frontend\dist

echo.
echo [2/4] Test build lokal...
call npm run vercel-build
if errorlevel 1 (
    echo ERROR: Build gagal! Periksa error di atas.
    pause
    exit /b 1
)

echo.
echo [3/4] Verifikasi file build...
if not exist frontend\dist\index.html (
    echo ERROR: File index.html tidak ditemukan di frontend\dist\
    pause
    exit /b 1
)

echo.
echo [4/4] Deploy ke Vercel...
echo Pastikan Anda sudah login ke Vercel CLI: vercel login
echo.
call vercel --prod

echo.
echo ========================================
echo DEPLOY SELESAI!
echo ========================================
echo.
echo Konfigurasi yang diperbaiki:
echo 1. Build command: npm run vercel-build
echo 2. Output directory: frontend/dist
echo 3. Environment variables: Sudah dikonfigurasi di vercel.json
echo 4. NODE_ENV warning: Sudah diperbaiki
echo.
pause