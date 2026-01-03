@echo off
echo ========================================
echo    RESTART APLIKASI - AUTH TIMEOUT FIXED
echo ========================================
echo.

echo 🔄 Menghentikan proses yang sedang berjalan...
taskkill /f /im node.exe 2>nul
taskkill /f /im npm.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo 🧹 Membersihkan cache...
cd frontend
if exist node_modules\.cache rmdir /s /q node_modules\.cache
if exist .vite rmdir /s /q .vite
cd ..

echo.
echo 🚀 Memulai backend...
cd backend
start "Backend Server" cmd /k "npm run dev"
timeout /t 3 /nobreak >nul
cd ..

echo.
echo 🌐 Memulai frontend...
cd frontend
start "Frontend Server" cmd /k "npm run dev"
cd ..

echo.
echo ✅ Aplikasi sedang dimulai...
echo.
echo 📋 Informasi:
echo - Backend: http://localhost:3004
echo - Frontend: http://localhost:3001
echo - Login: admin@jempol.com / admin123
echo.
echo ⏰ Tunggu 10-15 detik untuk aplikasi siap
echo 🔧 Perbaikan timeout sudah diterapkan
echo.
echo Tekan tombol apa saja untuk membuka browser...
pause >nul

start http://localhost:3001

echo.
echo 🎉 Aplikasi berhasil dimulai!
echo Jika masih ada masalah, cek console browser untuk error
pause