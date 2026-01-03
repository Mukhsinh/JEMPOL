@echo off
echo ========================================
echo    RESTART APLIKASI - TIMEOUT FIXED
echo ========================================
echo.

echo 🛑 Menghentikan aplikasi yang sedang berjalan...
taskkill /f /im node.exe 2>nul
taskkill /f /im npm.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo 🧹 Membersihkan cache...
cd frontend
if exist node_modules\.cache rmdir /s /q node_modules\.cache
if exist .vite rmdir /s /q .vite
cd ..

cd backend
if exist node_modules\.cache rmdir /s /q node_modules\.cache
cd ..

echo.
echo 🚀 Memulai backend...
start "Backend Server" cmd /c "cd backend && npm run dev"

echo ⏳ Menunggu backend siap...
timeout /t 5 /nobreak >nul

echo.
echo 🚀 Memulai frontend...
start "Frontend Server" cmd /c "cd frontend && npm run dev"

echo.
echo ✅ Aplikasi sedang dimulai dengan perbaikan timeout!
echo.
echo 📋 Yang sudah diperbaiki:
echo - Timeout connection check: 30s → 2s
echo - Timeout auth initialization: 30s → 3s  
echo - Timeout login: 30s → 5s
echo - Skip connection test saat startup
echo - Optimized retry mechanism
echo.
echo 🌐 Akses aplikasi di:
echo - Frontend: http://localhost:3001
echo - Backend: http://localhost:3004
echo.
echo 🔐 Login dengan:
echo - Email: admin@jempol.com
echo - Password: admin123
echo.
echo 📊 Test login: test-login-timeout-fixed.html
echo.
pause