@echo off
echo ========================================
echo TEST QR LINK SETTINGS - SIMPLE VERSION
echo ========================================
echo.

echo Membuka versi simple untuk testing...
echo.
echo URL: http://localhost:3003/settings/qr-link
echo.
echo Jika halaman simple tampil tapi halaman asli tidak:
echo - Masalah ada di komponen QRLinkSettings.tsx
echo - Kemungkinan error saat render
echo - Periksa console untuk error detail
echo.
echo Jika halaman simple juga tidak tampil:
echo - Masalah ada di routing atau auth
echo - Periksa apakah sudah login
echo - Periksa token di localStorage
echo.

start http://localhost:3003/settings/qr-link

echo.
echo Tekan F12 untuk membuka Developer Tools
echo Lihat tab Console untuk error messages
echo.
pause
