@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   GENERATE QR CODE - FORM LACAK TIKET
echo ========================================
echo.
echo 🔄 Membuat QR Code untuk halaman Form Lacak...
echo.

cd /d "%~dp0"

node scripts/generate-form-lacak-qr.js

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo   ✅ QR CODE BERHASIL DIBUAT!
    echo ========================================
    echo.
    echo 📁 Lokasi file:
    echo    public/qr-codes/form-lacak-qr.png
    echo    public/qr-codes/form-lacak-qr.svg
    echo    public/qr-codes/form-lacak-qr.html
    echo.
    echo 🌐 Membuka preview...
    start public/qr-codes/form-lacak-qr.html
) else (
    echo.
    echo ❌ Gagal membuat QR Code
    echo.
)

echo.
pause
