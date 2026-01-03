@echo off
echo ========================================
echo DEPLOY VERCEL - SIAP PRODUCTION
echo ========================================
echo.

echo [1/4] Membersihkan cache dan dependencies...
cd frontend
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json

echo [2/4] Install dependencies...
npm install

echo [3/4] Test build lokal...
npm run build

if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Build gagal! Periksa error di atas.
    pause
    exit /b 1
)

echo [4/4] Build berhasil! Siap deploy ke Vercel.
echo.
echo LANGKAH SELANJUTNYA:
echo 1. Buka terminal/command prompt
echo 2. Jalankan: vercel --prod
echo 3. Atau upload folder ini ke Vercel dashboard
echo.
echo Konfigurasi sudah benar di vercel.json
echo.
pause