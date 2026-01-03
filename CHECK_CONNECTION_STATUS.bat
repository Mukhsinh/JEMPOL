@echo off
echo ========================================
echo    CEK STATUS KONEKSI APLIKASI
echo ========================================
echo.

echo [1] Memeriksa Port yang Digunakan...
echo.
echo Port 3001 (Frontend):
netstat -an | findstr :3001
echo.
echo Port 3003 (Backend):
netstat -an | findstr :3003
echo.

echo [2] Test Koneksi Backend...
curl -s http://localhost:3003/api/health
echo.
echo.

echo [3] Test Koneksi Public Endpoints...
curl -s http://localhost:3003/api/public/units | head -c 200
echo.
echo.

echo [4] Membuka Test Connection Tool...
start test-full-connection.html

echo.
echo ========================================
echo    STATUS CHECK SELESAI
echo ========================================
echo.
echo Jika ada error, jalankan START_APP_FIXED_CONNECTION.bat
echo.
pause