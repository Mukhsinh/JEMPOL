@echo off
echo ========================================
echo TEST FORM TIKET INTERNAL - FIXED
echo ========================================
echo.
echo Perbaikan yang dilakukan:
echo 1. Dropdown Unit mengambil dari master data
echo 2. Fitur lampiran dinonaktifkan
echo 3. Backend endpoint diperbaiki
echo.
echo Membuka test page...
start http://localhost:3002/test-internal-ticket-form-fixed.html
echo.
echo Test page dibuka di browser!
echo Silakan test:
echo - Load units dari dropdown
echo - Submit tiket internal
echo - Verifikasi tiket tersimpan
echo.
pause
