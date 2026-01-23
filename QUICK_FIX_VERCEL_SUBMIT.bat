@echo off
echo ========================================
echo QUICK FIX - SUBMIT TIKET VERCEL
echo ========================================
echo.

echo Pilih masalah yang Anda alami:
echo.
echo 1. Error 405 (Method Not Allowed)
echo 2. Response bukan JSON (HTML)
echo 3. Environment variables tidak terbaca
echo 4. Supabase connection error
echo 5. Deploy ulang dengan force
echo 6. Test semua endpoint
echo 7. Buka Vercel Dashboard
echo 8. Keluar
echo.

set /p choice="Pilih (1-8): "

if "%choice%"=="1" goto fix_405
if "%choice%"=="2" goto fix_json
if "%choice%"=="3" goto fix_env
if "%choice%"=="4" goto fix_supabase
if "%choice%"=="5" goto redeploy
if "%choice%"=="6" goto test_endpoints
if "%choice%"=="7" goto open_dashboard
if "%choice%"=="8" goto end

echo Pilihan tidak valid!
pause
goto end

:fix_405
echo.
echo ========================================
echo FIX ERROR 405
echo ========================================
echo.
echo Penyebab:
echo - File API tidak ter-deploy
echo - Routing salah
echo - Method tidak di-handle
echo.
echo Solusi:
echo.
echo 1. Cek file API ada:
dir api\public\internal-tickets.ts
dir api\public\external-tickets.ts
echo.
echo 2. Cek vercel.json:
type vercel.json | findstr "rewrites"
echo.
echo 3. Redeploy dengan force:
echo    vercel --prod --force
echo.
pause
goto end

:fix_json
echo.
echo ========================================
echo FIX RESPONSE BUKAN JSON
echo ========================================
echo.
echo Penyebab:
echo - Error di code mengembalikan HTML
echo - Vercel error page
echo - Environment variables tidak terbaca
echo.
echo Solusi:
echo.
echo 1. Cek Vercel Function Logs
echo 2. Cek environment variables
echo 3. Redeploy setelah set env vars
echo.
echo Membuka Vercel Dashboard...
start https://vercel.com/dashboard
echo.
echo Langkah:
echo 1. Klik project Anda
echo 2. Klik Deployments ^> Functions
echo 3. Cari api/public/internal-tickets.ts
echo 4. Klik View Logs
echo 5. Cari error message
echo.
pause
goto end

:fix_env
echo.
echo ========================================
echo FIX ENVIRONMENT VARIABLES
echo ========================================
echo.
echo Environment variables yang diperlukan:
echo.
echo VITE_SUPABASE_URL
echo VITE_SUPABASE_ANON_KEY
echo VITE_SUPABASE_SERVICE_ROLE_KEY
echo.
echo Membuka Vercel Dashboard...
start https://vercel.com/dashboard
echo.
echo Langkah:
echo 1. Klik project Anda
echo 2. Klik Settings ^> Environment Variables
echo 3. Tambahkan ketiga variable di atas
echo 4. Pilih: Production, Preview, Development
echo 5. Klik Save
echo 6. Redeploy: vercel --prod --force
echo.
pause
goto end

:fix_supabase
echo.
echo ========================================
echo FIX SUPABASE CONNECTION
echo ========================================
echo.
echo Penyebab:
echo - Credentials salah
echo - RLS policies terlalu ketat
echo - Table tidak ada
echo.
echo Solusi:
echo.
echo 1. Cek credentials di .env:
type backend\.env | findstr "SUPABASE"
echo.
echo 2. Cek credentials di Vercel env vars
echo 3. Cek RLS policies di Supabase Dashboard
echo 4. Cek table tickets ada
echo.
echo Membuka Supabase Dashboard...
start https://supabase.com/dashboard
echo.
pause
goto end

:redeploy
echo.
echo ========================================
echo REDEPLOY DENGAN FORCE
echo ========================================
echo.
echo Ini akan:
echo 1. Commit perubahan
echo 2. Push ke GitHub
echo 3. Force redeploy ke Vercel
echo.
set /p confirm="Lanjutkan? (Y/N): "
if /i not "%confirm%"=="Y" goto end
echo.
echo [1/3] Commit perubahan...
git add .
git commit -m "fix: force redeploy untuk perbaikan submit tiket"
echo.
echo [2/3] Push ke GitHub...
git push origin main
echo.
echo [3/3] Force redeploy ke Vercel...
echo Jalankan manual: vercel --prod --force
echo.
pause
goto end

:test_endpoints
echo.
echo ========================================
echo TEST SEMUA ENDPOINT
echo ========================================
echo.
echo Membuka file test di browser...
echo.
echo File: test-vercel-submit-endpoints.html
echo.
echo Jika file tidak ada, jalankan:
echo node fix-vercel-submit-error-complete.js
echo.
if exist test-vercel-submit-endpoints.html (
    start test-vercel-submit-endpoints.html
    echo File test dibuka di browser
) else (
    echo File test tidak ditemukan!
    echo Jalankan: node fix-vercel-submit-error-complete.js
)
echo.
pause
goto end

:open_dashboard
echo.
echo Membuka Vercel Dashboard...
start https://vercel.com/dashboard
echo.
echo Yang perlu dicek:
echo 1. Status deployment (harus Ready)
echo 2. Environment Variables (harus ada 3)
echo 3. Function Logs (cari error)
echo.
pause
goto end

:end
echo.
echo Terima kasih!
echo.
