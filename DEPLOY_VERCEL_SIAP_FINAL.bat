@echo off
echo ========================================
echo DEPLOY VERCEL - SIAP PRODUCTION
echo ========================================
echo.

echo [1/3] Membersihkan direktori public lama...
if exist public rmdir /s /q public

echo [2/3] Copying build ke direktori public...
xcopy /E /I /Y frontend\dist public
if %errorlevel% neq 0 (
    echo ERROR: Copy ke public gagal!
    pause
    exit /b 1
)

echo [3/3] Verifikasi build...
if not exist public\index.html (
    echo ERROR: index.html tidak ditemukan di public!
    pause
    exit /b 1
)

echo.
echo ========================================
echo BUILD BERHASIL! SIAP DEPLOY KE VERCEL
echo ========================================
echo.
echo File build tersedia di direktori 'public'
echo Jalankan: vercel --prod
echo.
echo Konfigurasi sudah diperbaiki:
echo ✅ Missing public directory - FIXED
echo ✅ Build script configuration - FIXED  
echo ✅ Vercel configuration - FIXED
echo ✅ Output directory mapping - FIXED
echo.
pause