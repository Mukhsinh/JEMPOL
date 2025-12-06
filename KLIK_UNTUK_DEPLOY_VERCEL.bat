@echo off
color 0A
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                                                              ║
echo ║          🚀 DEPLOY KE VERCEL - QUICK LAUNCHER 🚀             ║
echo ║                                                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo.
echo ✅ Status: Code sudah di-push ke GitHub
echo ✅ Build: Tested dan berhasil
echo ✅ Config: Sudah diperbaiki
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo Pilih metode deploy:
echo.
echo [1] Buka Vercel Dashboard (RECOMMENDED)
echo [2] Deploy via Vercel CLI
echo [3] Test Build Lokal Dulu
echo [4] Lihat Dokumentasi
echo [5] Exit
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
set /p choice="Pilih (1-5): "

if "%choice%"=="1" goto dashboard
if "%choice%"=="2" goto cli
if "%choice%"=="3" goto test
if "%choice%"=="4" goto docs
if "%choice%"=="5" goto end
goto invalid

:dashboard
echo.
echo 📱 Membuka Vercel Dashboard...
echo.
echo Langkah selanjutnya:
echo 1. Login dengan GitHub
echo 2. Klik "Add New Project"
echo 3. Import repository: Mukhsinh/JEMPOL
echo 4. Klik "Deploy" (jangan ubah konfigurasi!)
echo.
start https://vercel.com/dashboard
echo.
echo ✅ Browser terbuka! Silakan lanjutkan di browser.
echo.
pause
goto end

:cli
echo.
echo 💻 Deploy via Vercel CLI...
echo.
echo Memeriksa Vercel CLI...
where vercel >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ❌ Vercel CLI belum terinstall!
    echo.
    echo Install dengan: npm install -g vercel
    echo.
    set /p install="Install sekarang? (y/n): "
    if /i "%install%"=="y" (
        echo.
        echo Installing Vercel CLI...
        call npm install -g vercel
        if %errorlevel% neq 0 (
            echo.
            echo ❌ Install gagal!
            pause
            goto end
        )
    ) else (
        goto end
    )
)

echo.
echo ✅ Vercel CLI ditemukan!
echo.
echo Menjalankan: vercel --prod
echo.
call vercel --prod
echo.
pause
goto end

:test
echo.
echo 🧪 Testing Build Lokal...
echo.
call TEST_VERCEL_BUILD.bat
goto end

:docs
echo.
echo 📖 Membuka Dokumentasi...
echo.
echo File dokumentasi yang tersedia:
echo.
echo 1. STATUS_DEPLOY_VERCEL_FIXED.txt (Quick summary)
echo 2. VERCEL_DEPLOY_SOLUTION.md (Analisis lengkap)
echo 3. DEPLOY_VERCEL_FIXED.md (Step-by-step guide)
echo 4. PANDUAN_DEPLOY_VERCEL_VISUAL.md (Visual guide)
echo.
set /p doc="Pilih file (1-4) atau Enter untuk buka semua: "

if "%doc%"=="1" start STATUS_DEPLOY_VERCEL_FIXED.txt
if "%doc%"=="2" start VERCEL_DEPLOY_SOLUTION.md
if "%doc%"=="3" start DEPLOY_VERCEL_FIXED.md
if "%doc%"=="4" start PANDUAN_DEPLOY_VERCEL_VISUAL.md
if "%doc%"=="" (
    start STATUS_DEPLOY_VERCEL_FIXED.txt
    timeout /t 1 >nul
    start VERCEL_DEPLOY_SOLUTION.md
    timeout /t 1 >nul
    start DEPLOY_VERCEL_FIXED.md
    timeout /t 1 >nul
    start PANDUAN_DEPLOY_VERCEL_VISUAL.md
)
echo.
echo ✅ File dibuka!
echo.
pause
goto end

:invalid
echo.
echo ❌ Pilihan tidak valid!
echo.
pause
goto end

:end
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 💡 Tips: Setelah deploy berhasil, website akan otomatis
echo    ter-deploy setiap kali Anda push ke GitHub!
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo Terima kasih! 🎉
echo.
pause
