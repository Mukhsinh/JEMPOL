@echo off
echo ========================================
echo TEST FORM INTERNAL - UNITS FIX
echo ========================================
echo.
echo Membuka form internal untuk test units loading...
echo.
start http://localhost:3002/form/internal
echo.
echo Form dibuka di browser!
echo.
echo CARA TEST:
echo 1. Periksa console browser (F12)
echo 2. Pastikan tidak ada error "units.map is not a function"
echo 3. Pastikan dropdown Unit/Departemen terisi dengan benar
echo 4. Coba pilih unit dan isi form
echo.
pause
