@echo off
echo ========================================
echo CEK QR REDIRECT URL
echo ========================================
echo.
echo Script ini akan memeriksa semua QR Code di database
echo dan memastikan redirect URL sudah benar.
echo.
echo REDIRECT URL YANG BENAR:
echo - Form Tiket Internal: /form/internal
echo - Form Tiket Eksternal: /form/eksternal
echo - Form Survei: /form/survey
echo.
echo REDIRECT URL YANG SALAH:
echo - /tickets/create/internal (ini ada sidebar!)
echo - /tickets/create/external (ini ada sidebar!)
echo.
pause
echo.
echo Menjalankan script...
node fix-qr-redirect-url.js
echo.
pause
