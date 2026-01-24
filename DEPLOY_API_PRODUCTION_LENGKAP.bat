@echo off
echo ========================================
echo DEPLOY API PRODUCTION LENGKAP KE VERCEL
echo ========================================
echo.

echo Langkah-langkah yang akan dilakukan:
echo 1. Install dependencies
echo 2. Build frontend
echo 3. Deploy ke Vercel
echo.

pause

echo.
echo [1/3] Install dependencies...
call npm install

echo.
echo [2/3] Build frontend...
cd frontend
call npm run build
cd ..

echo.
echo [3/3] Deploy ke Vercel...
echo.
echo PENTING: Pastikan environment variables sudah diset di Vercel:
echo - VITE_SUPABASE_URL
echo - VITE_SUPABASE_ANON_KEY
echo - NODE_ENV=production
echo.

vercel --prod

echo.
echo ========================================
echo DEPLOY SELESAI!
echo ========================================
echo.
echo Sekarang test API production dengan:
echo 1. Buka: https://your-app.vercel.app/api/health
echo 2. Jalankan: TEST_API_PRODUCTION.bat
echo.
pause
