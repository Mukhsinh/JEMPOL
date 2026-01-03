@echo off
echo ========================================
echo    RESTART APLIKASI - TIMEOUT FIXED
echo ========================================
echo.

echo 🔄 Menghentikan aplikasi yang sedang berjalan...
taskkill /f /im node.exe >nul 2>&1
taskkill /f /im npm.exe >nul 2>&1
timeout /t 2 >nul

echo 🧹 Membersihkan cache...
cd frontend
if exist node_modules\.cache rmdir /s /q node_modules\.cache >nul 2>&1
if exist .vite rmdir /s /q .vite >nul 2>&1
cd ..

cd backend
if exist node_modules\.cache rmdir /s /q node_modules\.cache >nul 2>&1
cd ..

echo 🚀 Memulai backend...
cd backend
start "Backend Server" cmd /c "npm run dev"
timeout /t 5 >nul

echo 🌐 Memulai frontend...
cd ../frontend
start "Frontend Server" cmd /c "npm run dev"

echo.
echo ✅ Aplikasi sedang dimulai...
echo 📱 Frontend: http://localhost:3001
echo 🔧 Backend: http://localhost:3004
echo.
echo 🔑 Kredensial login:
echo    Email: admin@jempol.com
echo    Password: admin123
echo.
echo ⏳ Tunggu 10-15 detik untuk aplikasi siap...
timeout /t 3 >nul

echo 🌐 Membuka browser...
start http://localhost:3001

echo.
echo 📋 Perbaikan yang diterapkan:
echo - ✅ Timeout connection diperbaiki
echo - ✅ Auth initialization timeout dioptimalkan  
echo - ✅ Login timeout disesuaikan
echo - ✅ Connection check timeout diperbaiki
echo.
pause