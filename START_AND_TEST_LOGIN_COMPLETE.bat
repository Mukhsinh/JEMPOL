@echo off
echo ========================================
echo 🚀 MEMULAI APLIKASI DAN TEST LOGIN
echo ========================================
echo.

echo 📋 Kredensial Login:
echo    Email: admin@kiss.com
echo    Password: admin123
echo.

echo 🔄 Memulai backend...
cd backend
start "Backend Server" cmd /k "npm run dev"
cd ..

echo ⏳ Menunggu backend siap...
timeout /t 5 /nobreak > nul

echo 🔄 Memulai frontend...
cd frontend
start "Frontend Server" cmd /k "npm run dev"
cd ..

echo ⏳ Menunggu frontend siap...
timeout /t 8 /nobreak > nul

echo 🧪 Membuka test login...
start "" "test-login-browser-final.html"

echo ⏳ Menunggu sebentar...
timeout /t 3 /nobreak > nul

echo 🌐 Membuka aplikasi utama...
start "" "http://localhost:3001/login"

echo.
echo ✅ Aplikasi sudah berjalan!
echo.
echo 📱 URL yang tersedia:
echo    - Aplikasi utama: http://localhost:3001
echo    - Test login: test-login-browser-final.html
echo    - Backend API: http://localhost:3003
echo.
echo 🔐 Gunakan kredensial berikut untuk login:
echo    Email: admin@kiss.com
echo    Password: admin123
echo.
echo ⚠️  Jika login gagal, coba:
echo    1. Refresh halaman login
echo    2. Clear browser cache
echo    3. Pastikan backend dan frontend berjalan
echo.
pause