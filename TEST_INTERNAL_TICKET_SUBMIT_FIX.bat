@echo off
echo ========================================
echo TEST SUBMIT TIKET INTERNAL - FIXED
echo ========================================
echo.
echo Membuka test page untuk submit tiket internal...
echo.
echo Perbaikan yang diterapkan:
echo - Validasi input yang lebih ketat
echo - Error handling yang lebih detail
echo - Logging yang lebih lengkap
echo - Response handling yang lebih baik
echo - Timeout 30 detik untuk request
echo - Adopsi pola dari external tickets
echo.

start http://localhost:5173
timeout /t 2 /nobreak >nul
start test-internal-ticket-submit-fix.html

echo.
echo Test page dibuka!
echo Silakan test submit tiket internal.
echo.
pause
