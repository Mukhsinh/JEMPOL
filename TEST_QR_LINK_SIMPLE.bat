@echo off
echo ========================================
echo TEST QR LINK SETTINGS - SIMPLE VERSION
echo ========================================
echo.

echo Membuka halaman test sederhana...
start http://localhost:3003/test-qr-link-simple.html

echo.
echo Halaman test akan terbuka di browser
echo Buka Console (F12) untuk melihat log detail
echo.
echo Jika halaman ini berfungsi tapi halaman asli tidak,
echo berarti ada masalah di komponen React
echo.
pause
