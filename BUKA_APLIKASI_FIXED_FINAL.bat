@echo off
echo ========================================
echo    MEMBUKA APLIKASI DENGAN KONFIGURASI FIXED
echo ========================================
echo.

echo Membuka browser untuk test API connection...
start test-frontend-api-connection.html

echo.
echo Menunggu 3 detik...
timeout /t 3 /nobreak >nul

echo.
echo Membuka aplikasi frontend...
start http://localhost:3002

echo.
echo ========================================
echo    APLIKASI BERHASIL DIBUKA
echo ========================================
echo.
echo Frontend: http://localhost:3002
echo Backend:  http://localhost:5002
echo API Test: test-frontend-api-connection.html
echo.
echo Tekan tombol apa saja untuk keluar...
pause >nul