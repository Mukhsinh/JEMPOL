@echo off
echo ========================================
echo BUKA TEST SUBMIT FORM
echo ========================================
echo.
echo Membuka halaman test di browser...
echo.
echo 1. Test Submit Tiket Eksternal
start http://localhost:5173/test-submit-tiket-eksternal.html
timeout /t 1 /nobreak >nul
echo.
echo 2. Test Submit Survey
start http://localhost:5173/test-submit-survey.html
timeout /t 1 /nobreak >nul
echo.
echo 3. Form Tiket Eksternal (Aplikasi)
start http://localhost:5173/form/eksternal?unit_id=test&unit_name=Unit%%20Test
timeout /t 1 /nobreak >nul
echo.
echo 4. Form Survey (Aplikasi)
start http://localhost:5173/form/survey?unit_id=test&unit_name=Unit%%20Test
echo.
echo ========================================
echo Semua halaman test telah dibuka
echo Silakan test submit di browser
echo ========================================
echo.
pause
