@echo off
echo ========================================
echo   MEMULAI APLIKASI DAN TEST LOGIN
echo ========================================
echo.

echo 🔄 Memulai backend...
cd backend
start "Backend Server" cmd /k "npm start"
cd ..

echo ⏳ Menunggu backend siap...
timeout /t 5 /nobreak > nul

echo 🔄 Memulai frontend...
cd frontend
start "Frontend Server" cmd /k "npm run dev"
cd ..

echo ⏳ Menunggu frontend siap...
timeout /t 8 /nobreak > nul

echo 🌐 Membuka test login...
start "" "test-login-final-fixed.html"

echo ⏳ Menunggu sebentar...
timeout /t 3 /nobreak > nul

echo 🌐 Membuka aplikasi utama...
start "" "http://localhost:3001/login"

echo.
echo ========================================
echo   INFORMASI LOGIN
echo ========================================
echo Email: admin@jempol.com
echo Password: admin123
echo URL Test: test-login-final-fixed.html
echo URL Aplikasi: http://localhost:3001/login
echo ========================================
echo.
echo ✅ Aplikasi sudah berjalan!
echo 📝 Silakan test login dengan kredensial di atas
echo.
pause