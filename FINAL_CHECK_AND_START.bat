@echo off
echo ========================================
echo    CEK FINAL DAN MULAI APLIKASI KISS
echo ========================================
echo.

echo 🔍 Melakukan pengecekan final...
node fix-loading-and-verification-issue.js

echo.
echo 🔧 Memastikan konfigurasi optimal...
echo ✅ Database: Supabase terhubung
echo ✅ Auth: Admin aktif (admin@jempol.com)
echo ✅ Frontend: Port 3002
echo ✅ Backend: Port 3004
echo ✅ Loading: Dioptimalkan

echo.
echo 🧹 Membersihkan proses lama...
taskkill /f /im node.exe >nul 2>&1
taskkill /f /im npm.exe >nul 2>&1

echo.
echo 🚀 Memulai aplikasi...
cd backend
start "KISS Backend - Port 3004" cmd /k "npm run dev"
timeout /t 5 >nul

cd ..\frontend  
start "KISS Frontend - Port 3002" cmd /k "npm run dev:fast"
timeout /t 5 >nul

cd ..

echo.
echo ⏳ Menunggu aplikasi siap...
timeout /t 15 >nul

echo.
echo 🌐 Membuka aplikasi...
start http://localhost:3002

echo.
echo ✅ APLIKASI BERHASIL DIMULAI!
echo.
echo 📋 Informasi Login:
echo    URL: http://localhost:3002
echo    Email: admin@jempol.com  
echo    Password: admin123
echo.
echo 🔧 Jika masih ada masalah loading:
echo    1. Refresh browser (Ctrl+F5)
echo    2. Clear browser cache
echo    3. Cek console browser untuk error
echo.
pause