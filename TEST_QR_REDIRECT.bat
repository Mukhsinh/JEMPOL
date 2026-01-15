@echo off
echo ========================================
echo TEST QR CODE REDIRECT
echo ========================================
echo.
echo Membuka test QR code redirect...
echo.
echo Tool ini akan membantu Anda:
echo 1. Generate URL QR code yang benar
echo 2. Melihat QR code image
echo 3. Memverifikasi redirect ke form (bukan login)
echo.
echo ========================================
echo.

start http://localhost:5173/test-qr-redirect.html

echo.
echo Test page dibuka di browser!
echo.
echo CARA TEST:
echo 1. Masukkan kode QR (contoh: ABC12345)
echo 2. Klik "Generate URL"
echo 3. Scan QR code dengan HP atau klik "Buka URL"
echo 4. Pastikan langsung ke form, BUKAN ke halaman login
echo.
pause
