@echo off
echo ========================================
echo   PUSH KE GITHUB - JEMPOL
echo ========================================
echo.
echo Pastikan Anda sudah:
echo 1. Buat repository di GitHub (https://github.com/new)
echo 2. Copy URL repository
echo.
echo ========================================
echo.

set /p REPO_URL="Masukkan URL GitHub repository (contoh: https://github.com/username/JEMPOL.git): "

if "%REPO_URL%"=="" (
    echo.
    echo ❌ URL repository tidak boleh kosong!
    echo.
    pause
    exit /b 1
)

echo.
echo Mengupdate remote URL...
git remote remove origin 2>nul
git remote add origin %REPO_URL%

echo.
echo Verifying remote...
git remote -v

echo.
echo Pushing ke GitHub...
git push -u origin main

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Push gagal! Mencoba dengan --force...
    git push -u origin main --force
    
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo ❌ Push masih gagal!
        echo.
        echo Troubleshooting:
        echo 1. Pastikan repository sudah dibuat di GitHub
        echo 2. Pastikan URL repository benar
        echo 3. Pastikan Anda punya akses ke repository
        echo 4. Coba generate Personal Access Token di GitHub
        echo.
        echo Lihat SETUP_GITHUB_VERCEL.md untuk panduan lengkap
        echo.
        pause
        exit /b 1
    )
)

echo.
echo ========================================
echo   PUSH BERHASIL!
echo ========================================
echo.
echo ✅ Code sudah di-push ke GitHub
echo.
echo Next steps:
echo 1. Buka repository di GitHub untuk verify
echo 2. Login ke Vercel: https://vercel.com/login
echo 3. Import repository dari GitHub
echo 4. Configure build settings
echo 5. Add environment variables
echo 6. Deploy!
echo.
echo Lihat QUICK_DEPLOY_GUIDE.md untuk panduan deploy
echo.
pause
