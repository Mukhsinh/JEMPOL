@echo off
echo ========================================
echo TEST FORM SUBMISSION
echo ========================================
echo.
echo Membuka browser untuk test form...
echo.
echo 1. Form Survey: http://localhost:5173/form/survey
echo 2. Form Internal: http://localhost:5173/form/internal
echo 3. Form Eksternal: http://localhost:5173/form/eksternal
echo.
echo CATATAN:
echo - Fitur lampiran sudah DINONAKTIFKAN
echo - Icon rating sudah diberi background warna berbeda
echo - Label rating menggunakan kata (Sangat Tidak Puas - Sangat Puas)
echo - Pastikan backend berjalan di port 3000
echo - Pastikan frontend berjalan di port 5173
echo.
pause
start http://localhost:5173/form/survey
timeout /t 2 /nobreak >nul
start http://localhost:5173/form/internal
timeout /t 2 /nobreak >nul
start http://localhost:5173/form/eksternal
