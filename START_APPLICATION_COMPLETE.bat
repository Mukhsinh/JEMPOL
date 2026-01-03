@echo off
echo ========================================
echo    MEMULAI APLIKASI COMPLAINT SYSTEM
echo ========================================
echo.

echo [1/3] Memeriksa status server...
node test-quick-connection.js

echo.
echo [2/3] Memulai Backend Server (Port 3003)...
start "Backend Server" cmd /k "cd backend && npm run dev"

echo.
echo [3/3] Memulai Frontend Server (Port 3001)...
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo    APLIKASI BERHASIL DIMULAI!
echo ========================================
echo.
echo Backend:  http://localhost:3003
echo Frontend: http://localhost:3001
echo.
echo Tunggu beberapa detik untuk server startup...
timeout /t 10 /nobreak > nul

echo.
echo Testing koneksi final...
node test-api-endpoints.js

echo.
echo ========================================
echo    SIAP DIGUNAKAN!
echo ========================================
echo.
echo Buka browser dan akses: http://localhost:3001
echo.
pause