@echo off
echo ========================================
echo DEPLOY PERBAIKAN SUBMIT TIKET INTERNAL
echo ========================================
echo.

echo Perbaikan yang dilakukan:
echo 1. Routing API di vercel.json (rewrites -^> routes)
echo 2. Content-Type header di internal-tickets.ts
echo 3. Validasi Supabase credentials
echo.

echo ========================================
echo PILIH METODE DEPLOY:
echo ========================================
echo 1. Deploy via Vercel CLI (Recommended)
echo 2. Commit ke Git (Auto-deploy jika connected)
echo 3. Manual - Lihat instruksi
echo 4. Batal
echo.

set /p choice="Pilih (1-4): "

if "%choice%"=="1" goto deploy_vercel
if "%choice%"=="2" goto deploy_git
if "%choice%"=="3" goto manual
if "%choice%"=="4" goto end

:deploy_vercel
echo.
echo ========================================
echo DEPLOY VIA VERCEL CLI
echo ========================================
echo.

echo Checking Vercel CLI...
where vercel >nul 2>&1
if %errorlevel% neq 0 (
    echo Vercel CLI tidak ditemukan!
    echo Install dengan: npm i -g vercel
    echo.
    pause
    goto end
)

echo.
echo Deploying ke Vercel...
vercel --prod

echo.
echo ========================================
echo DEPLOY SELESAI!
echo ========================================
echo.
echo Verifikasi:
echo 1. Test API: https://your-app.vercel.app/api/public/units
echo 2. Test Form: https://your-app.vercel.app/form/internal
echo.
pause
goto end

:deploy_git
echo.
echo ========================================
echo COMMIT DAN PUSH KE GIT
echo ========================================
echo.

echo Menambahkan file yang diubah...
git add vercel.json
git add api/public/internal-tickets.ts
git add PERBAIKAN_SUBMIT_TIKET_INTERNAL_VERCEL.md

echo.
echo Membuat commit...
git commit -m "fix: perbaiki routing API untuk submit tiket internal di Vercel"

echo.
echo Pushing ke repository...
git push origin main

echo.
echo ========================================
echo PUSH SELESAI!
echo ========================================
echo.
echo Vercel akan auto-deploy jika connected ke Git.
echo Cek status di: https://vercel.com/dashboard
echo.
pause
goto end

:manual
echo.
echo ========================================
echo INSTRUKSI MANUAL DEPLOY
echo ========================================
echo.
echo Opsi 1: Via Vercel Dashboard
echo 1. Buka https://vercel.com/dashboard
echo 2. Pilih project Anda
echo 3. Klik "Redeploy" pada deployment terakhir
echo.
echo Opsi 2: Via Git
echo 1. Commit perubahan: git add . ^&^& git commit -m "fix routing"
echo 2. Push: git push origin main
echo 3. Vercel akan auto-deploy
echo.
echo Opsi 3: Via Vercel CLI
echo 1. Install: npm i -g vercel
echo 2. Deploy: vercel --prod
echo.
echo ========================================
echo ENVIRONMENT VARIABLES YANG DIBUTUHKAN
echo ========================================
echo.
echo Pastikan sudah di-set di Vercel Dashboard:
echo - VITE_SUPABASE_URL
echo - VITE_SUPABASE_ANON_KEY
echo - VITE_SUPABASE_SERVICE_ROLE_KEY
echo.
echo Cara set:
echo 1. Vercel Dashboard -^> Project -^> Settings
echo 2. Environment Variables
echo 3. Tambahkan ketiga variable
echo 4. Redeploy
echo.
pause
goto end

:end
echo.
echo Selesai!
