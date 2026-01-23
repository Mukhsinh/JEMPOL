@echo off
echo ========================================
echo DEPLOY PERBAIKAN FORM INTERNAL VERCEL
echo ========================================
echo.
echo Perbaikan yang dilakukan:
echo - Fix routing API di vercel.json
echo - Gunakan routes eksplisit untuk API endpoints
echo - Fix error 405 dan HTML response
echo.
echo ========================================
echo.

echo [1/4] Menambahkan perubahan ke Git...
git add vercel.json
git add PERBAIKAN_FORM_INTERNAL_VERCEL_405_ERROR.md
git add DEPLOY_FIX_FORM_INTERNAL_VERCEL.bat

echo.
echo [2/4] Commit perubahan...
git commit -m "fix: perbaiki routing API di Vercel untuk form internal tickets - fix error 405"

echo.
echo [3/4] Push ke repository...
git push origin main

echo.
echo [4/4] Vercel akan otomatis deploy...
echo.
echo ========================================
echo DEPLOY SELESAI!
echo ========================================
echo.
echo Tunggu beberapa menit untuk Vercel selesai deploy.
echo.
echo Cara verifikasi:
echo 1. Buka Vercel Dashboard
echo 2. Lihat status deployment
echo 3. Setelah selesai, test form internal ticket
echo 4. Pastikan tidak ada error 405 lagi
echo.
echo URL untuk test:
echo https://your-app.vercel.app/form/internal?unit_id=xxx
echo.
pause
