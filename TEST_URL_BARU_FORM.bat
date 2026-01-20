@echo off
echo ========================================
echo TEST URL BARU FORM
echo ========================================
echo.
echo Membuka browser untuk test URL baru...
echo.
echo 1. Form Internal: http://localhost:5173/form/internal
start http://localhost:5173/form/internal
timeout /t 2 /nobreak >nul
echo.
echo 2. Form Eksternal: http://localhost:5173/form/eksternal
start http://localhost:5173/form/eksternal
timeout /t 2 /nobreak >nul
echo.
echo 3. Form Survey: http://localhost:5173/form/survey
start http://localhost:5173/form/survey
echo.
echo ========================================
echo Semua form sudah dibuka di browser
echo Pastikan:
echo - Tidak ada sidebar
echo - Tidak perlu login
echo - Form langsung tampil
echo ========================================
pause
