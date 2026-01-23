@echo off
echo ========================================
echo   CEK KESIAPAN DEPLOY VERCEL
echo ========================================
echo.

echo [1/4] Cek file konfigurasi...
if not exist "vercel.json" (
    echo ❌ vercel.json tidak ada
    pause
    exit /b 1
)
echo ✅ vercel.json ada

if not exist "api\public\internal-tickets.ts" (
    echo ❌ API internal-tickets.ts tidak ada
    pause
    exit /b 1
)
echo ✅ API files ada

echo.
echo [2/4] Test build frontend...
cd frontend
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Build gagal - perbaiki error dulu
    cd ..
    pause
    exit /b 1
)
cd ..
echo ✅ Build berhasil

echo.
echo [3/4] Cek environment variables...
echo.
echo Pastikan di Vercel Dashboard sudah set:
echo - VITE_SUPABASE_URL
echo - VITE_SUPABASE_ANON_KEY
echo - VITE_SUPABASE_SERVICE_ROLE_KEY
echo - NODE_ENV=production
echo.

echo [4/4] Cara deploy:
echo.
echo OPSI 1 - Via Vercel Dashboard (RECOMMENDED):
echo 1. Buka https://vercel.com/dashboard
echo 2. Klik "Add New" - "Project"
echo 3. Import repository atau upload folder
echo 4. Set environment variables
echo 5. Deploy
echo.
echo OPSI 2 - Via Vercel CLI:
echo 1. Install: npm install -g vercel
echo 2. Login: vercel login
echo 3. Deploy: vercel --prod
echo.
echo ========================================
echo   ✅ APLIKASI SIAP DEPLOY!
echo ========================================
echo.
pause
