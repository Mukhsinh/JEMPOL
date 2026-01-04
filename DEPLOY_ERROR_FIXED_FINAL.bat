@echo off
echo ========================================
echo 🚀 DEPLOY VERCEL - ERROR SUDAH DIPERBAIKI
echo ========================================
echo.

echo ✅ ERROR 1 FIXED: Method getComplaintsByUnit sudah ditambahkan ke ComplaintService
echo ✅ ERROR 2 FIXED: @types/node sudah diinstall dan tsconfig.json sudah diupdate
echo.

echo 📋 TESTING BUILD LOKAL...
echo.

cd frontend
echo 🔨 Building frontend...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Frontend build gagal!
    pause
    exit /b 1
)
echo ✅ Frontend build berhasil!
echo.

cd ../backend
echo 🔨 Building backend...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Backend build gagal!
    pause
    exit /b 1
)
echo ✅ Backend build berhasil!
echo.

cd ..
echo 🚀 SIAP DEPLOY KE VERCEL!
echo.
echo Jalankan command berikut untuk deploy:
echo vercel --prod
echo.
echo Atau gunakan Vercel dashboard untuk deploy otomatis dari GitHub
echo.
pause