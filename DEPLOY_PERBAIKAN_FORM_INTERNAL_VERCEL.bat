@echo off
echo ========================================
echo DEPLOY PERBAIKAN FORM INTERNAL VERCEL
echo ========================================
echo.
echo Perbaikan yang dilakukan:
echo 1. Memperbaiki routing Vercel (vercel.json)
echo 2. Memastikan API selalu return JSON
echo 3. Memperbaiki error 405 Method Not Allowed
echo.
echo ========================================
echo LANGKAH 1: Commit perubahan
echo ========================================
git add .
git commit -m "fix: Perbaiki routing API Vercel untuk form internal ticket - Error 405 fixed"
echo.
echo ========================================
echo LANGKAH 2: Push ke GitHub
echo ========================================
git push origin main
echo.
echo ========================================
echo SELESAI!
echo ========================================
echo.
echo Vercel akan otomatis deploy perubahan ini.
echo Tunggu 2-3 menit, lalu test form internal ticket.
echo.
echo Endpoint yang diperbaiki:
echo - POST /api/public/internal-tickets
echo - GET /api/public/units
echo - GET /api/public/app-settings
echo.
pause
