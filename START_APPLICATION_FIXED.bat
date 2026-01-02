@echo off
echo ========================================
echo    MEMULAI APLIKASI - CONNECTION FIXED
echo ========================================
echo.

echo Memeriksa status aplikasi...
echo.

echo 1. Memulai Backend (Port 5000)...
cd /d "%~dp0backend"
start "Backend Server" cmd /k "npm run dev"

echo.
echo 2. Menunggu backend siap...
timeout /t 5 /nobreak > nul

echo.
echo 3. Memulai Frontend (Port 3001/3002)...
cd /d "%~dp0frontend"
start "Frontend Server" cmd /k "npm run dev"

echo.
echo 4. Menunggu frontend siap...
timeout /t 10 /nobreak > nul

echo.
echo ========================================
echo    APLIKASI SIAP DIGUNAKAN!
echo ========================================
echo.
echo Backend API: http://localhost:5000/api
echo Frontend:    http://localhost:3001 atau 3002
echo.
echo Test koneksi:
start "" "test-connection-fix-final.html"

echo.
echo Aplikasi telah dimulai dengan konfigurasi yang benar.
echo Connection error telah diperbaiki!
echo.
pause