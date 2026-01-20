@echo off
echo ========================================
echo TEST QR LINK SETTINGS ROUTE
echo ========================================
echo.
echo Membuka halaman test routing...
echo.

start test-qr-link-settings-route.html

timeout /t 2 /nobreak >nul

echo.
echo Membuka halaman QR Link Settings...
start http://localhost:3003/settings/qr-link

echo.
echo ========================================
echo SELESAI!
echo ========================================
echo.
echo Halaman test dan QR Link Settings sudah dibuka
echo Pastikan sudah login sebagai admin
echo.
pause
