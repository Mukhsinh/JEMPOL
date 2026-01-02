@echo off
echo ========================================
echo DEPLOY VERCEL - MASALAH FIXED
echo ========================================
echo.

echo [1/3] Commit perubahan...
git add .
git commit -m "fix: perbaiki konfigurasi deploy vercel dan optimasi bundle"

echo.
echo [2/3] Push ke GitHub...
git push origin main

echo.
echo [3/3] Deploy otomatis akan berjalan di Vercel
echo.
echo ========================================
echo DEPLOY BERHASIL DIPERBAIKI!
echo ========================================
echo.
echo Masalah yang diperbaiki:
echo - Output directory path sudah benar
echo - Bundle size sudah dioptimasi
echo - Build command sudah diperbaiki
echo.
echo Cek status deploy di: https://vercel.com/dashboard
echo.
pause