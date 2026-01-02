@echo off
echo ========================================
echo    SARAH - Dashboard Access Helper
echo ========================================
echo.
echo Membuka dashboard di browser...
echo.
echo URL: http://localhost:3001
echo Login: admin@jempol.com / admin123
echo.
start http://localhost:3001
echo.
echo Dashboard telah dibuka di browser default.
echo Jika halaman tidak muncul, pastikan:
echo 1. Frontend berjalan di port 3001
echo 2. Backend berjalan di port 5001
echo.
pause