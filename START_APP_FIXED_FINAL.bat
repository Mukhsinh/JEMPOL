@echo off
echo ========================================
echo    KISS - Startup Aplikasi Fixed Final
echo ========================================
echo.

echo [1/4] Checking ports...
netstat -an | findstr :3002 >nul
if %errorlevel% equ 0 (
    echo ❌ Port 3002 sudah digunakan. Menghentikan proses...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3002') do taskkill /pid %%a /f >nul 2>&1
)

netstat -an | findstr :3003 >nul
if %errorlevel% equ 0 (
    echo ❌ Port 3003 sudah digunakan. Menghentikan proses...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3003') do taskkill /pid %%a /f >nul 2>&1
)

echo ✅ Ports cleared

echo.
echo [2/4] Starting Backend Server (Port 3003)...
cd backend
start "Backend Server" cmd /k "npm run dev"
cd ..

echo ⏳ Waiting for backend to start...
timeout /t 5 /nobreak >nul

echo.
echo [3/4] Starting Frontend Server (Port 3002)...
cd frontend
start "Frontend Server" cmd /k "npm run dev"
cd ..

echo ⏳ Waiting for frontend to start...
timeout /t 8 /nobreak >nul

echo.
echo [4/4] Opening Application...
timeout /t 3 /nobreak >nul
start http://localhost:3002

echo.
echo ========================================
echo ✅ Aplikasi berhasil dijalankan!
echo.
echo 🌐 Frontend: http://localhost:3002
echo 🔧 Backend:  http://localhost:3003
echo 📊 Test:     test-connection-final-fix.html
echo.
echo Tekan tombol apa saja untuk membuka test koneksi...
pause >nul
start test-connection-final-fix.html

echo.
echo ========================================
echo 📋 PANDUAN PENGGUNAAN:
echo.
echo 1. Login Admin:
echo    - Username: admin
echo    - Password: admin123
echo.
echo 2. Jika ada error koneksi:
echo    - Jalankan: test-connection-final-fix.html
echo    - Periksa console browser (F12)
echo.
echo 3. Untuk stop aplikasi:
echo    - Tutup kedua window command prompt
echo    - Atau tekan Ctrl+C di masing-masing window
echo.
echo ========================================
pause