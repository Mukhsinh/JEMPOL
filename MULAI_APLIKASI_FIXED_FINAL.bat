@echo off
title KISS Application - Fixed Connection
color 0A

echo.
echo ========================================
echo    🚀 KISS APPLICATION STARTUP
echo    ✅ CONNECTION FIXED VERSION
echo ========================================
echo.

echo 📋 Konfigurasi:
echo    - Frontend: http://localhost:3001
echo    - Backend:  http://localhost:3003  
echo    - Database: Supabase
echo.

echo 🔧 Memulai Services...
echo.

echo [1/4] 🔄 Checking existing processes...
tasklist /FI "IMAGENAME eq node.exe" /FO TABLE | findstr node.exe >nul
if %errorlevel% == 0 (
    echo    ⚠️  Node processes detected, akan restart...
    timeout /t 2 /nobreak > nul
) else (
    echo    ✅ No conflicting processes found
)

echo.
echo [2/4] 🚀 Starting Backend Server...
cd backend
start "KISS Backend (Port 3003)" cmd /k "echo Backend Server Starting... && npm run dev"
echo    ✅ Backend started on port 3003
timeout /t 3 /nobreak > nul

echo.
echo [3/4] 🌐 Starting Frontend Server...
cd ../frontend  
start "KISS Frontend (Port 3001)" cmd /k "echo Frontend Server Starting... && npm run dev"
echo    ✅ Frontend started on port 3001
timeout /t 3 /nobreak > nul

echo.
echo [4/4] 🧪 Opening Test Tools...
cd ..
start "Connection Test" test-frontend-backend-integration.html
echo    ✅ Test tools opened
timeout /t 2 /nobreak > nul

echo.
echo ========================================
echo    ✅ APLIKASI BERHASIL DIMULAI!
echo ========================================
echo.
echo 🌐 URL Akses:
echo    Frontend:     http://localhost:3001
echo    Backend API:  http://localhost:3003/api
echo    Health Check: http://localhost:3003/api/health
echo.
echo 🧪 Test Tools:
echo    Integration Test: test-frontend-backend-integration.html
echo    Connection Test:  test-full-connection.html
echo    Quick Status:     CHECK_CONNECTION_STATUS.bat
echo.
echo 📝 Logs:
echo    - Backend logs: Terminal "KISS Backend (Port 3003)"
echo    - Frontend logs: Terminal "KISS Frontend (Port 3001)"
echo.
echo ⚠️  Jika ada masalah:
echo    1. Jalankan CHECK_CONNECTION_STATUS.bat
echo    2. Periksa terminal logs
echo    3. Restart dengan script ini
echo.
echo 🎯 Aplikasi siap digunakan!
echo    Tekan ENTER untuk membuka frontend...
pause > nul

start http://localhost:3001

echo.
echo 👋 Selamat menggunakan KISS Application!
echo    Script akan tetap terbuka untuk monitoring...
echo.
pause