@echo off
echo ========================================
echo DEPLOY PERBAIKAN SUBMIT TIKET & SURVEY
echo ========================================
echo.

echo [1/4] Menambahkan file yang diubah...
git add api/public/internal-tickets.ts
git add api/public/surveys.ts
git add api/public/app-settings.ts
git add PERBAIKAN_SUBMIT_TIKET_SURVEY_VERCEL.md
git add DEPLOY_FIX_SUBMIT_VERCEL.bat

echo.
echo [2/4] Commit perubahan...
git commit -m "fix: perbaiki submit tiket internal dan survey di Vercel - ubah type ke internal, pastikan response JSON valid"

echo.
echo [3/4] Push ke repository...
git push origin main

echo.
echo [4/4] Menunggu Vercel auto-deploy...
echo.
echo ========================================
echo DEPLOY SELESAI!
echo ========================================
echo.
echo Vercel akan otomatis deploy perubahan ini.
echo Tunggu 1-2 menit, lalu test aplikasi di:
echo https://your-app.vercel.app
echo.
echo Test dengan:
echo 1. Submit tiket internal
echo 2. Submit survey
echo 3. Load app settings
echo.
pause
