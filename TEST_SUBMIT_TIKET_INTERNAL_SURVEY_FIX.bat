@echo off
echo ========================================
echo TEST SUBMIT TIKET INTERNAL DAN SURVEY
echo PERBAIKAN RESPONSE HANDLING
echo ========================================
echo.

echo Membuka test page...
start http://localhost:3004
timeout /t 2 /nobreak >nul
start test-submit-tiket-internal-survey-fix.html

echo.
echo ========================================
echo INSTRUKSI:
echo ========================================
echo 1. Pastikan backend sudah berjalan di port 3001
echo 2. Test page akan terbuka di browser
echo 3. Pilih unit dari dropdown
echo 4. Klik tombol untuk test submit
echo 5. Periksa hasil di halaman
echo.
echo PERBAIKAN YANG DILAKUKAN:
echo - Set Content-Type header sebelum try/catch
echo - Validasi response JSON di client
echo - Error handling yang lebih baik
echo - Logging yang lebih detail
echo.
echo ========================================
pause
