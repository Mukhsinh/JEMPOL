@echo off
echo ========================================
echo    MEMULAI APLIKASI - TIMEOUT FIXED
echo ========================================
echo.

echo 🔧 Menggunakan konfigurasi timeout yang diperbaiki...
echo   - Frontend timeout: 30 detik
echo   - Backend timeout: 45 detik
echo   - Connection check: 15 detik
echo.

echo 🧹 Membersihkan cache dan proses lama...
taskkill /f /im node.exe >nul 2>&1
taskkill /f /im npm.exe >nul 2>&1

echo.
echo 🚀 Memulai Backend (Port 3004)...
cd backend
start "Backend Server" cmd /c "npm run dev"
echo ⏳ Menunggu backend siap...
timeout /t 10 /nobreak >nul

echo.
echo 🌐 Memulai Frontend (Port 3001)...
cd ../frontend
start "Frontend Server" cmd /c "npm run dev"
echo ⏳ Menunggu frontend siap...
timeout /t 15 /nobreak >nul

echo.
echo ✅ Aplikasi sedang dimulai...
echo 📋 Status:
echo   - Backend: http://localhost:3004
echo   - Frontend: http://localhost:3001
echo   - Admin Login: admin@jempol.com / admin123
echo.

echo 🔍 Membuka test login...
start "" "test-login-timeout-fixed-mcp.html"

echo.
echo 📊 Monitoring aplikasi...
echo Tekan Ctrl+C untuk menghentikan monitoring
echo.

:monitor
timeout /t 5 /nobreak >nul
echo [%time%] Aplikasi berjalan - Frontend: http://localhost:3001
goto monitor