@echo off
echo ========================================
echo    RESTART APLIKASI - AUTH TIMEOUT FIXED
echo ========================================
echo.

echo 🔧 Perbaikan yang diterapkan:
echo ✅ Timeout ditingkatkan dari 10s ke 30s
echo ✅ Konfigurasi Supabase client diperbaiki
echo ✅ Singleton pattern untuk mencegah multiple instances
echo ✅ Fetch timeout ditingkatkan ke 30s
echo.

echo 🛑 Menghentikan proses yang sedang berjalan...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 >nul

echo 🔄 Memulai backend...
cd backend
start "Backend Server" cmd /k "npm run dev"
timeout /t 3 >nul

echo 🔄 Memulai frontend...
cd ..\frontend
start "Frontend Server" cmd /k "npm run dev"
timeout /t 3 >nul

echo.
echo ✅ Aplikasi sedang dimulai...
echo 📱 Frontend: http://localhost:3001
echo 🔧 Backend: http://localhost:3004
echo.
echo 🧪 Membuka halaman test...
start test-auth-timeout-fixed.html
echo.
echo ⏳ Tunggu beberapa detik untuk aplikasi siap...
timeout /t 5 >nul

echo.
echo 🎉 Aplikasi siap digunakan!
echo 👤 Login: admin@jempol.com / admin123
echo.
pause