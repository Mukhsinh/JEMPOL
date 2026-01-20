@echo off
echo ========================================
echo TEST PERBAIKAN SURVEI
echo ========================================
echo.
echo Perbaikan yang dilakukan:
echo 1. Icon rating diperbesar dan diperjelas dengan keterangan
echo 2. Dropdown unit untuk pemilihan manual
echo 3. Unit otomatis terisi jika dari QR Code
echo.
echo Membuka browser untuk testing...
echo.

start http://localhost:3002/survey
timeout /t 2 /nobreak >nul
start http://localhost:3002/survey?qr=test123

echo.
echo ========================================
echo Browser telah dibuka!
echo ========================================
echo.
echo Silakan test:
echo 1. Halaman survei normal (pilih unit manual)
echo 2. Halaman survei dengan QR Code (unit otomatis)
echo.
pause
