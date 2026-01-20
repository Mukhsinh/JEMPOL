@echo off
echo ========================================
echo   TEST QR LINK SETTINGS - DIRECT
echo ========================================
echo.
echo Membuka test halaman QR Link Settings...
echo.

start http://localhost:3003/test-qr-link-direct.html

echo.
echo Test halaman akan terbuka di browser.
echo.
echo Halaman ini akan:
echo 1. Load data units dari API
echo 2. Load data QR codes dari API
echo 3. Tampilkan QR codes dalam grid
echo 4. Fitur search dan filter
echo 5. Toggle status aktif/nonaktif
echo 6. Copy link QR code
echo.
echo Jika halaman kosong, cek:
echo - Backend berjalan di port 3001
echo - Sudah login di aplikasi utama
echo - Token tersimpan di localStorage
echo.
pause
