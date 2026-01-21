@echo off
echo ========================================
echo TEST LOGIN DENGAN PASSWORD BENAR
echo ========================================
echo.
echo Membuka browser untuk test login...
echo.
echo Credentials:
echo Email    : admin@jempol.com
echo Password : admin123
echo.
start http://localhost:3002/login
echo.
echo Browser telah dibuka!
echo Silakan login dengan credentials di atas.
echo.
pause
