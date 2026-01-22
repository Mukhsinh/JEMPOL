@echo off
echo ========================================
echo INSTALL DEPENDENCIES DAN DEPLOY
echo ========================================
echo.

echo [1/4] Install dependencies baru...
call npm install
if errorlevel 1 (
    echo ERROR: Gagal install dependencies
    pause
    exit /b 1
)
echo.

echo [2/4] Build frontend untuk test...
cd frontend
call npm run build
if errorlevel 1 (
    echo ERROR: Gagal build frontend
    cd ..
    pause
    exit /b 1
)
cd ..
echo.

echo [3/4] Commit perubahan ke Git...
git add .
git commit -m "fix: Tambah Vercel serverless functions untuk API tiket dan survei"
if errorlevel 1 (
    echo WARNING: Tidak ada perubahan untuk di-commit atau sudah di-commit
)
echo.

echo [4/4] Push ke GitHub...
git push origin main
if errorlevel 1 (
    echo ERROR: Gagal push ke GitHub
    echo Periksa koneksi internet dan kredensial Git
    pause
    exit /b 1
)
echo.

echo ========================================
echo SELESAI!
echo ========================================
echo.
echo LANGKAH SELANJUTNYA:
echo 1. Buka Vercel Dashboard
echo 2. Tunggu auto-deploy selesai (3-5 menit)
echo 3. Setup Environment Variables (baca SETUP_VERCEL_ENV.txt)
echo 4. Redeploy jika perlu
echo 5. Test submit tiket dan survei di production
echo.
pause
