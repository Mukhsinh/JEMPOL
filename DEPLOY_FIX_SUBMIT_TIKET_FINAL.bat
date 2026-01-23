@echo off
echo ========================================
echo DEPLOY PERBAIKAN SUBMIT TIKET INTERNAL DAN SURVEY
echo ========================================
echo.

echo [1/4] Menambahkan perubahan ke Git...
git add vercel.json
git add PERBAIKAN_SUBMIT_TIKET_INTERNAL_SURVEY_FINAL.md
git add DEPLOY_FIX_SUBMIT_TIKET_FINAL.bat

echo.
echo [2/4] Commit perubahan...
git commit -m "fix: perbaiki routing API Vercel untuk submit tiket internal dan survey - gunakan rewrites bukan routes"

echo.
echo [3/4] Push ke repository...
git push origin main

echo.
echo [4/4] Vercel akan auto-deploy...
echo.
echo ========================================
echo DEPLOY SELESAI!
echo ========================================
echo.
echo Vercel sedang melakukan auto-deploy...
echo Tunggu 2-3 menit, lalu test endpoint:
echo.
echo 1. Test Units API:
echo    https://kiss2.vercel.app/api/public/units
echo.
echo 2. Test App Settings API:
echo    https://kiss2.vercel.app/api/public/app-settings
echo.
echo 3. Test Submit Tiket Internal:
echo    https://kiss2.vercel.app/form/internal?unit_id=xxx^&unit_name=xxx
echo.
echo 4. Test Submit Survey:
echo    https://kiss2.vercel.app/form/survey?unit_id=xxx^&unit_name=xxx
echo.
echo ========================================
echo.
pause
