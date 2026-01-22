@echo off
echo ========================================
echo TEST CREATE UNIT TYPE
echo ========================================
echo.
echo Membuka test create unit type...
echo.
start http://localhost:3002/master-data/unit-types
timeout /t 2 /nobreak >nul
start test-create-unit-type.html
echo.
echo Test page dibuka!
echo Silakan coba tambah unit type baru.
echo.
pause
