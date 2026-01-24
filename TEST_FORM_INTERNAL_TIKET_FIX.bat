@echo off
echo ========================================
echo TEST FORM TIKET INTERNAL - PERBAIKAN
echo ========================================
echo.
echo Membuka form tiket internal untuk test...
echo.

start http://localhost:3000/form/internal

echo.
echo ========================================
echo INSTRUKSI TEST:
echo ========================================
echo 1. Form harus terbuka tanpa sidebar
echo 2. Dropdown Unit harus terisi dengan data
echo 3. Footer harus tampil dengan data institusi
echo 4. Tidak ada error 500 di console
echo.
echo Periksa Console Browser (F12) untuk melihat:
echo - Status loading units
echo - Status loading app settings
echo - Tidak ada error 500
echo.
pause
