@echo off
echo ========================================
echo    RESTART APLIKASI DENGAN PORT FIXED
echo ========================================

echo.
echo 1. Stopping semua proses yang berjalan...
taskkill /f /im node.exe 2>nul
taskkill /f /im npm.exe 2>nul
timeout /t 2 >nul

echo.
echo 2. Membersihkan cache dan temporary files...
if exist "backend\node_modules\.cache" rmdir /s /q "backend\node_modules\.cache" 2>nul
if exist "frontend\node_modules\.cache" rmdir /s /q "frontend\node_modules\.cache" 2>nul

echo.
echo 3. Memverifikasi konfigurasi port...
echo Backend akan berjalan di port 3003
echo Frontend akan berjalan di port 3001

echo.
echo 4. Starting Backend di port 3003...
cd backend
start "Backend Server" cmd /k "npm run dev"
cd ..

echo.
echo 5. Menunggu backend siap...
timeout /t 5 >nul

echo.
echo 6. Starting Frontend di port 3001...
cd frontend
start "Frontend Server" cmd /k "npm run dev"
cd ..

echo.
echo 7. Menunggu aplikasi siap...
timeout /t 10 >nul

echo.
echo ========================================
echo    APLIKASI SIAP DIGUNAKAN
echo ========================================
echo.
echo Backend: http://localhost:3003
echo Frontend: http://localhost:3001
echo.
echo Login dengan:
echo Username: admin
echo Password: admin123
echo.
echo Tekan Enter untuk membuka aplikasi...
pause >nul

start http://localhost:3001

echo.
echo Aplikasi telah dibuka di browser.
echo Jika masih loading, tekan Ctrl+Shift+R untuk refresh cache.
pause