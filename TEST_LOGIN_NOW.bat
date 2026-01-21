@echo off
echo ========================================
echo TEST LOGIN SEKARANG
echo ========================================
echo.
echo Membuka browser untuk test login...
echo.
echo Kredensial yang bisa dicoba:
echo 1. Email: admin@jempol.com
echo    Password: admin123
echo.
echo 2. Email: mukhsin9@gmail.com  
echo    Password: admin123
echo.
echo ========================================

start http://localhost:3005/login
start test-login-simple-now.html

echo.
echo Browser sudah dibuka!
echo Silakan coba login dengan kredensial di atas.
echo.
pause
