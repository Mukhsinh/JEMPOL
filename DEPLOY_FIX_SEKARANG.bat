@echo off
echo ========================================
echo   DEPLOY FIX - VERCEL CONFIGURATION
echo ========================================
echo.

echo [1/4] Checking Git status...
git status
echo.

echo [2/4] Adding changes...
git add vercel.json DEPLOY_VERCEL_FIX.md
echo.

echo [3/4] Committing changes...
git commit -m "fix: perbaiki konfigurasi Vercel untuk npm workspaces"
echo.

echo [4/4] Pushing to GitHub...
git push origin main
echo.

echo ========================================
echo   DEPLOY FIX SELESAI!
echo ========================================
echo.
echo Vercel akan otomatis deploy setelah push berhasil.
echo Cek status di: https://vercel.com/dashboard
echo.
pause
