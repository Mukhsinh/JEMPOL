@echo off
echo ========================================
echo TEST QR CODE DISPLAY DAN DIRECT LINK
echo ========================================
echo.
echo Membuka halaman test QR code...
echo.
echo YANG AKAN DITEST:
echo 1. QR Code tampil dengan benar
echo 2. Direct link mengarah ke form yang tepat
echo 3. Auto-fill unit berfungsi
echo 4. Form terbuka tanpa login dan tanpa sidebar
echo.
echo ========================================
echo.

start http://localhost:3003/test-qr-code-display.html

echo.
echo Halaman test telah dibuka di browser.
echo.
echo INSTRUKSI:
echo 1. Pastikan semua QR code tampil (tidak error)
echo 2. Klik tombol "Test Link" untuk test direct link
echo 3. Scan QR code dengan HP untuk test mobile
echo 4. Pastikan form terbuka tanpa login
echo.
pause
