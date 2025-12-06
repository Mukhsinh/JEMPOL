@echo off
echo ========================================
echo   FIX VERCEL DEPLOY ERROR
echo ========================================
echo.
echo Memperbaiki error: ENOENT package.json
echo Path duplikasi: /frontend/frontend/
echo.
echo ========================================
echo   STEP 1: Commit Perubahan
echo ========================================
echo.

git add vercel.json SOLUSI_ERROR_DEPLOY.md
git commit -m "fix: perbaiki konfigurasi vercel deployment - fix ENOENT error"

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Commit gagal!
    echo Mungkin tidak ada perubahan atau git error.
    pause
    exit /b 1
)

echo.
echo [OK] Commit berhasil!
echo.
echo ========================================
echo   STEP 2: Push ke GitHub
echo ========================================
echo.

git push origin main

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Push gagal!
    echo.
    echo Troubleshooting:
    echo 1. Pastikan GitHub token valid
    echo 2. Cek koneksi internet
    echo 3. Coba: git push origin main --force
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo   SUCCESS!
echo ========================================
echo.
echo [OK] Perubahan berhasil di-push ke GitHub!
echo.
echo Vercel akan otomatis redeploy dalam 1-2 menit.
echo.
echo Next Steps:
echo 1. Buka Vercel Dashboard
echo 2. Monitor build log
echo 3. Tunggu deployment selesai (~3 menit)
echo 4. Test aplikasi
echo.
echo Vercel Dashboard:
echo https://vercel.com/dashboard
echo.
pause
