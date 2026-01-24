@echo off
echo ========================================
echo DEPLOY FIX - PERBEDAAN TAMPILAN VERCEL
echo ========================================
echo.

echo Perbaikan yang dilakukan:
echo 1. API app-settings: Return object bukan array
echo 2. API track-ticket: Endpoint baru untuk Vercel
echo 3. Frontend: Update endpoint tracking
echo 4. Vercel.json: Routing yang benar
echo.

echo [1/4] Build frontend...
cd frontend
call npm run build
if errorlevel 1 (
    echo ERROR: Build frontend gagal!
    cd ..
    pause
    exit /b 1
)
cd ..
echo.

echo [2/4] Commit changes...
git add .
git commit -m "fix: Perbaiki perbedaan tampilan localhost vs Vercel - API response format dan routing"
echo.

echo [3/4] Push to repository...
git push origin main
if errorlevel 1 (
    echo ERROR: Push gagal!
    pause
    exit /b 1
)
echo.

echo [4/4] Deploy ke Vercel...
echo Jalankan: vercel --prod
echo Atau tunggu auto-deploy dari GitHub
echo.

echo ========================================
echo DEPLOY SIAP
echo ========================================
echo.
echo Setelah deploy, test di:
echo https://your-app.vercel.app/track-ticket
echo.
echo Pastikan:
echo 1. Environment variables sudah diset di Vercel
echo 2. VITE_SUPABASE_URL
echo 3. VITE_SUPABASE_ANON_KEY
echo 4. SUPABASE_SERVICE_ROLE_KEY (optional)
echo.
pause
