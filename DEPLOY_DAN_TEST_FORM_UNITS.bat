@echo off
echo ========================================
echo DEPLOY DAN TEST FORM UNITS - VERCEL
echo ========================================
echo.

echo [1/5] Commit perubahan...
git add .
git commit -m "fix: perbaikan API units dan internal tickets untuk Vercel - JSON response valid"
echo.

echo [2/5] Push ke repository...
git push origin main
echo.

echo [3/5] Menunggu Vercel auto-deploy...
echo Buka Vercel Dashboard untuk melihat progress deploy
echo https://vercel.com/dashboard
echo.
timeout /t 5

echo [4/5] PENTING - Set Environment Variables di Vercel:
echo.
echo Buka: https://vercel.com/dashboard
echo Pilih project Anda
echo Klik Settings -^> Environment Variables
echo.
echo Tambahkan variabel berikut:
echo   VITE_SUPABASE_URL = https://xxx.supabase.co
echo   VITE_SUPABASE_ANON_KEY = eyJhbGc...
echo   VITE_SUPABASE_SERVICE_ROLE_KEY = eyJhbGc...
echo.
echo Setelah set, REDEPLOY aplikasi!
echo.
pause

echo [5/5] Testing...
echo.
echo Setelah deploy selesai, test dengan:
echo.
echo 1. Test API Units:
echo    curl https://your-app.vercel.app/api/public/units
echo.
echo 2. Test Form:
echo    Buka: https://your-app.vercel.app/form/internal
echo    - Dropdown unit harus terisi
echo    - Submit harus berhasil
echo.
echo 3. Cek Logs di Vercel:
echo    Dashboard -^> Deployments -^> Functions -^> /api/public/units
echo.

echo ========================================
echo DEPLOY SELESAI!
echo ========================================
echo.
echo Baca file: PERBAIKAN_FORM_UNITS_VERCEL_FINAL.md
echo untuk detail lengkap dan troubleshooting
echo.
pause
