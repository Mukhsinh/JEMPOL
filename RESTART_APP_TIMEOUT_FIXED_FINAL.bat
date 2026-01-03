@echo off
echo ========================================
echo    RESTART APLIKASI - TIMEOUT FIXED
echo ========================================
echo.

echo 🛑 Menghentikan proses yang sedang berjalan...
taskkill /f /im node.exe >nul 2>&1
taskkill /f /im npm.exe >nul 2>&1
timeout /t 2 >nul

echo 🧹 Membersihkan cache dan temporary files...
if exist "frontend\node_modules\.cache" rmdir /s /q "frontend\node_modules\.cache" >nul 2>&1
if exist "backend\node_modules\.cache" rmdir /s /q "backend\node_modules\.cache" >nul 2>&1

echo 📦 Memperbarui dependencies...
cd frontend
call npm install --silent
cd ..\backend
call npm install --silent
cd ..

echo.
echo ✅ Konfigurasi timeout telah diperbaiki:
echo    - Supabase timeout: 8 detik
echo    - Auth timeout: 6 detik  
echo    - Connection check: 3 detik
echo    - Login timeout: 8 detik
echo.

echo 🚀 Memulai backend server...
cd backend
start "Backend Server" cmd /c "npm run dev"
timeout /t 3 >nul

echo 🚀 Memulai frontend server...
cd ..\frontend
start "Frontend Server" cmd /c "npm run dev"

echo.
echo ✅ Aplikasi sedang dimulai dengan konfigurasi timeout yang diperbaiki!
echo.
echo 📋 Informasi Login:
echo    URL: http://localhost:3001
echo    Email: admin@jempol.com
echo    Password: admin123
echo.
echo 🔍 Periksa console browser untuk memastikan tidak ada error timeout
echo    Jika masih ada masalah, coba refresh halaman beberapa kali
echo.
pause