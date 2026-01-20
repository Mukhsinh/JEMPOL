@echo off
echo ========================================
echo PERBAIKAN QR LINK SETTINGS
echo ========================================
echo.

echo [1/4] Checking backend...
curl -s http://localhost:3004/api/health >nul 2>&1
if %errorlevel% neq 0 (
    echo Backend NOT running!
    echo Please start backend first.
    pause
    exit /b 1
)
echo Backend OK!

echo.
echo [2/4] Testing QR codes API...
curl -s http://localhost:3004/api/qr-codes >nul 2>&1
if %errorlevel% neq 0 (
    echo QR codes API error!
) else (
    echo QR codes API OK!
)

echo.
echo [3/4] Opening QR Link Settings...
start http://localhost:3003/settings/qr-link

echo.
echo [4/4] Opening debug page...
timeout /t 2 /nobreak >nul
start http://localhost:3003/settings/qr-link-debug

echo.
echo ========================================
echo SELESAI
echo ========================================
echo.
echo Halaman sudah dibuka. Periksa:
echo 1. Apakah ada data QR codes yang muncul
echo 2. Cek console browser untuk error
echo 3. Cek debug info di bagian atas halaman
echo.
echo Jika masih kosong:
echo - Tekan F12 untuk buka DevTools
echo - Lihat tab Console untuk error
echo - Lihat tab Network untuk request API
echo.
pause
