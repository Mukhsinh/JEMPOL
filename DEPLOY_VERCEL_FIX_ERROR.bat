@echo off
chcp 65001 >nul
echo ========================================
echo   DEPLOY VERCEL - PERBAIKAN ERROR
echo ========================================
echo.

echo [1/5] Memeriksa perubahan...
git status

echo.
echo [2/5] Menambahkan file yang diubah...
git add vercel.json
git add PERBAIKAN_ERROR_VERCEL_DEPLOY.md

echo.
echo [3/5] Commit perubahan...
git commit -m "fix: perbaiki routing dan CORS Vercel API untuk mengatasi error 405 dan non-JSON response"

echo.
echo [4/5] Push ke GitHub...
git push origin main

echo.
echo ========================================
echo   LANGKAH SELANJUTNYA (MANUAL)
echo ========================================
echo.
echo 1. Buka Vercel Dashboard: https://vercel.com/dashboard
echo.
echo 2. Pilih project Anda
echo.
echo 3. Klik "Settings" → "Environment Variables"
echo.
echo 4. Pastikan sudah ada:
echo    - VITE_SUPABASE_URL
echo    - VITE_SUPABASE_ANON_KEY
echo    - VITE_SUPABASE_SERVICE_ROLE_KEY
echo    - NODE_ENV=production
echo.
echo 5. Jika baru menambahkan env vars, klik "Redeploy"
echo.
echo 6. Tunggu deploy selesai (2-5 menit)
echo.
echo 7. Test aplikasi di browser
echo.
echo 8. Cek "Function Logs" jika masih ada error
echo.
echo ========================================
echo   VERIFIKASI
echo ========================================
echo.
echo Setelah deploy selesai, test endpoint:
echo.
echo 1. Units: https://your-app.vercel.app/api/public/units
echo 2. App Settings: https://your-app.vercel.app/api/public/app-settings
echo 3. Buka form dan coba submit tiket
echo.
echo ========================================

pause
