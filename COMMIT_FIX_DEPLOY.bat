@echo off
chcp 65001 >nul
cls
echo ========================================
echo   COMMIT FIX DEPLOY ERROR
echo ========================================
echo.
echo Error yang diperbaiki:
echo ❌ ENOENT: frontend/frontend/package.json
echo ❌ Path duplikasi
echo.
echo Solusi:
echo ✅ vercel.json diperbaiki
echo ✅ installCommand: cd frontend ^&^& npm install
echo ✅ buildCommand: cd frontend ^&^& npm run build
echo.
echo File yang akan di-commit:
echo - vercel.json (FIXED)
echo - SOLUSI_ERROR_DEPLOY.md
echo - DEPLOY_ERROR_FIXED.txt
echo - FIX_DEPLOY_ERROR.bat
echo - COMMIT_FIX_DEPLOY.bat
echo - JALANKAN_INI_UNTUK_DEPLOY.txt
echo - STATUS_FIX_DEPLOY.txt
echo.
pause
echo.
echo ========================================
echo   STEP 1: Git Add
echo ========================================
echo.

git add vercel.json SOLUSI_ERROR_DEPLOY.md DEPLOY_ERROR_FIXED.txt FIX_DEPLOY_ERROR.bat COMMIT_FIX_DEPLOY.bat JALANKAN_INI_UNTUK_DEPLOY.txt STATUS_FIX_DEPLOY.txt

if %errorlevel% neq 0 (
    echo [ERROR] Git add gagal!
    pause
    exit /b 1
)

echo [OK] Files staged for commit
echo.
echo ========================================
echo   STEP 2: Git Status
echo ========================================
echo.

git status

echo.
echo ========================================
echo   STEP 3: Git Commit
echo ========================================
echo.

git commit -m "fix: perbaiki konfigurasi vercel deployment - fix ENOENT error path duplikasi"

if %errorlevel% neq 0 (
    echo [ERROR] Commit gagal!
    pause
    exit /b 1
)

echo.
echo [OK] Commit berhasil!
echo.
echo ========================================
echo   STEP 4: Git Push
echo ========================================
echo.

git push origin main

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Push gagal!
    echo.
    echo Troubleshooting:
    echo 1. Cek koneksi internet
    echo 2. Verify GitHub token
    echo 3. Coba: git push origin main --force
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo   SUCCESS! ✅
echo ========================================
echo.
echo [OK] Perubahan berhasil di-push ke GitHub!
echo.
echo Vercel akan otomatis redeploy dalam 1-2 menit.
echo.
echo Next Steps:
echo 1. Buka Vercel Dashboard: https://vercel.com/dashboard
echo 2. Monitor build log
echo 3. Tunggu deployment selesai (~3 menit)
echo 4. Verify build berhasil tanpa error ENOENT
echo 5. Test aplikasi
echo.
echo Expected Build Log:
echo   ✅ Running "install" command: cd frontend ^&^& npm install
echo   ✅ Running "build" command: cd frontend ^&^& npm run build
echo   ✅ Build completed successfully
echo.
pause
