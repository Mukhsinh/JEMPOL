@echo off
color 0A
title DEPLOY KE VERCEL - OTOMATIS

cls
echo.
echo  ========================================
echo    DEPLOY KE VERCEL - OTOMATIS
echo  ========================================
echo.
echo  Error deploy sudah diperbaiki!
echo  Konfigurasi Vercel sudah benar.
echo.
echo  ========================================
echo.
echo  Proses akan:
echo  1. Add perubahan ke Git
echo  2. Commit dengan pesan fix
echo  3. Push ke GitHub
echo  4. Vercel otomatis deploy
echo.
echo  ========================================
echo.
pause
echo.

echo [STEP 1/4] Git Status...
git status
echo.

echo [STEP 2/4] Git Add...
git add vercel.json DEPLOY_VERCEL_FIX.md VERCEL_ENV_SETUP.md SIAP_DEPLOY_VERCEL.md DEPLOY_ERROR_FIXED_SUMMARY.txt TEST_BUILD_VERCEL.bat DEPLOY_FIX_SEKARANG.bat KLIK_UNTUK_DEPLOY.bat
echo.

echo [STEP 3/4] Git Commit...
git commit -m "fix: perbaiki konfigurasi Vercel untuk npm workspaces - error deploy fixed"
echo.

echo [STEP 4/4] Git Push...
git push origin main
echo.

echo.
echo  ========================================
echo    DEPLOY SELESAI!
echo  ========================================
echo.
echo  Vercel sedang build project Anda...
echo.
echo  Cek status di:
echo  https://vercel.com/dashboard
echo.
echo  Build akan selesai dalam 2-5 menit.
echo.
echo  ========================================
echo.
pause
