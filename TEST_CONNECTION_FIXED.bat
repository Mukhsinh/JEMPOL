@echo off
echo ========================================
echo    TEST KONEKSI API SETELAH PERBAIKAN
echo ========================================
echo.
echo Backend sekarang berjalan di port 5000 (bukan 5002)
echo Frontend akan terhubung ke http://localhost:5000/api
echo.
echo Membuka test file...
start test-connection-fix.html
echo.
echo Test file dibuka di browser.
echo Klik tombol-tombol untuk test koneksi API.
echo.
pause