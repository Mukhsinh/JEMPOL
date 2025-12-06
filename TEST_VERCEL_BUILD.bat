@echo off
echo ========================================
echo TEST VERCEL BUILD - LOKAL
echo ========================================
echo.

echo [1/3] Membersihkan build sebelumnya...
if exist frontend\dist rmdir /s /q frontend\dist
echo ✓ Selesai
echo.

echo [2/3] Menjalankan build script...
call npm run vercel-build
if %errorlevel% neq 0 (
    echo.
    echo ❌ BUILD GAGAL!
    echo Periksa error di atas.
    pause
    exit /b 1
)
echo ✓ Selesai
echo.

echo [3/3] Memeriksa hasil build...
if exist frontend\dist\index.html (
    echo ✓ Build berhasil! File index.html ditemukan.
    echo.
    echo 📁 Lokasi build: frontend\dist
    dir frontend\dist
) else (
    echo ❌ Build gagal! File index.html tidak ditemukan.
)

echo.
echo ========================================
echo TEST SELESAI
echo ========================================
echo.
echo Jika build berhasil, Anda siap deploy ke Vercel!
echo Jalankan: git add . && git commit -m "fix: vercel config" && git push
echo.
pause
