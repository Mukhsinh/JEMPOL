@echo off
echo ========================================
echo DEPLOY PERBAIKAN ERROR UNITS DI VERCEL
echo ========================================
echo.

echo [1/4] Membersihkan cache dan build...
cd frontend
if exist dist rmdir /s /q dist
if exist node_modules\.vite rmdir /s /q node_modules\.vite
cd ..

echo.
echo [2/4] Build frontend...
cd frontend
call npm run build
if errorlevel 1 (
    echo ❌ Build gagal!
    pause
    exit /b 1
)
cd ..

echo.
echo [3/4] Commit perubahan...
git add .
git commit -m "fix: perbaiki error units di Vercel - tambah endpoint unit-types dan validasi array"

echo.
echo [4/4] Push ke repository...
git push origin main

echo.
echo ========================================
echo ✅ DEPLOY SELESAI!
echo ========================================
echo.
echo Vercel akan otomatis deploy perubahan ini.
echo Tunggu 2-3 menit lalu cek aplikasi di Vercel.
echo.
echo Perbaikan yang dilakukan:
echo - Tambah endpoint /api/public/unit-types
echo - Tambah validasi Array.isArray() di komponen
echo - Perbaiki error handling untuk data kosong
echo - Tambah timeout 3 detik untuk request
echo.
pause
