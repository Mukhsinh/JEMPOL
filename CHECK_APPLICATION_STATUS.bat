@echo off
echo ========================================
echo    STATUS APLIKASI COMPLAINT SYSTEM
echo ========================================
echo.

echo [1] Memeriksa proses yang berjalan...
echo.
echo Backend processes:
netstat -aon | find ":3003" | find "LISTENING"
if %errorlevel% equ 0 (
    echo ✅ Backend server berjalan di port 3003
) else (
    echo ❌ Backend server TIDAK berjalan di port 3003
)

echo.
echo Frontend processes:
netstat -aon | find ":3001" | find "LISTENING"
if %errorlevel% equ 0 (
    echo ✅ Frontend server berjalan di port 3001
) else (
    echo ❌ Frontend server TIDAK berjalan di port 3001
)

echo.
echo [2] Testing koneksi API...
node test-quick-connection.js

echo.
echo [3] Testing endpoint API...
node test-api-endpoints.js

echo.
echo ========================================
echo    STATUS CHECK SELESAI
echo ========================================
echo.
echo Jika semua ✅, aplikasi siap digunakan di:
echo http://localhost:3001
echo.
pause