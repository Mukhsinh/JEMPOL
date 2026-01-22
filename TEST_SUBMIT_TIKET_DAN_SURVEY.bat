@echo off
echo ========================================
echo TEST SUBMIT TIKET DAN SURVEY
echo ========================================
echo.
echo Membuka browser untuk test submit...
echo.
echo 1. Test Form Tiket Eksternal
start http://localhost:5173/form/eksternal?unit_id=test&unit_name=Unit%%20Test
timeout /t 2 /nobreak >nul
echo.
echo 2. Test Form Survey
start http://localhost:5173/form/survey?unit_id=test&unit_name=Unit%%20Test
echo.
echo ========================================
echo Browser telah dibuka untuk testing
echo Silakan coba submit form di browser
echo ========================================
pause
