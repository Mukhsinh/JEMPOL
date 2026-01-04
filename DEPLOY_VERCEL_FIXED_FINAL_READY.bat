@echo off
echo ========================================
echo 🚀 DEPLOY VERCEL - SIAP DEPLOY
echo ========================================
echo.

echo ✅ Error TypeScript sudah diperbaiki:
echo    - Method getComplaintsByUnit sudah ditambahkan
echo    - Method updateComplaint sudah ditambahkan  
echo    - Method getComplaintById sudah ditambahkan
echo    - NodeJS types sudah diperbaiki di loadingOptimizer.ts
echo    - @types/node sudah terinstall
echo    - tsconfig.json sudah diupdate
echo.

echo 🔍 Testing build lokal terlebih dahulu...
cd frontend
npm run build

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Build gagal! Periksa error di atas.
    pause
    exit /b 1
)

echo.
echo ✅ Build lokal berhasil!
echo.
echo 📤 Melakukan commit dan push ke GitHub...
cd ..

git add .
git commit -m "fix: Perbaiki error deploy TypeScript - tambah method ComplaintService dan fix NodeJS types"
git push origin main

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Push ke GitHub gagal!
    pause
    exit /b 1
)

echo.
echo ✅ Push ke GitHub berhasil!
echo.
echo 🚀 Deploy ke Vercel akan otomatis dimulai...
echo    Cek status deploy di: https://vercel.com/dashboard
echo.
echo ✅ DEPLOY SIAP!
echo.
pause