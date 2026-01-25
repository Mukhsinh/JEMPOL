@echo off
echo ========================================
echo TEST TRACK TICKET - FIXED
echo ========================================
echo.
echo Membuka test track ticket dengan error handling yang lebih baik...
echo.

start http://localhost:3005/test-track-ticket-fix.html

echo.
echo ========================================
echo Test halaman dibuka di browser
echo ========================================
echo.
echo Instruksi:
echo 1. Test dengan nomor tiket yang valid
echo 2. Test dengan nomor tiket yang tidak valid
echo 3. Periksa error handling dan content-type
echo 4. Lihat console browser untuk detail log
echo.
pause
