@echo off
echo ========================================
echo   TEST BUILD VERCEL (LOCAL)
echo ========================================
echo.

echo [1/3] Installing dependencies...
call npm install
echo.

echo [2/3] Building frontend...
call npm run build --workspace=frontend
echo.

echo [3/3] Checking build output...
if exist "frontend\dist\index.html" (
    echo.
    echo ========================================
    echo   BUILD BERHASIL! ✓
    echo ========================================
    echo.
    echo Output directory: frontend\dist
    echo File index.html: FOUND
    echo.
    echo Konfigurasi Vercel sudah benar!
    echo Siap untuk deploy ke Vercel.
    echo.
) else (
    echo.
    echo ========================================
    echo   BUILD GAGAL! ✗
    echo ========================================
    echo.
    echo File index.html tidak ditemukan di frontend\dist
    echo Cek error di atas.
    echo.
)

pause
