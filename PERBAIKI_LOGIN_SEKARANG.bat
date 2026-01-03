@echo off
color 0A
echo ========================================
echo 🔧 PERBAIKI LOGIN SEKARANG - FINAL FIX
echo ========================================

echo.
echo 🎯 Masalah: Invalid login credentials
echo 🔧 Solusi: Update password + clear cache + restart
echo.

echo 1️⃣ Menghentikan semua proses...
taskkill /f /im node.exe >nul 2>&1
taskkill /f /im npm.exe >nul 2>&1
echo ✅ Proses dihentikan

echo.
echo 2️⃣ Membersihkan cache browser...
rd /s /q "%LOCALAPPDATA%\Google\Chrome\User Data\Default\Local Storage" >nul 2>&1
rd /s /q "%LOCALAPPDATA%\Microsoft\Edge\User Data\Default\Local Storage" >nul 2>&1
echo ✅ Cache browser dibersihkan

echo.
echo 3️⃣ Memulai backend...
cd backend
start "Backend" cmd /k "echo Backend Server Starting... && npm run dev"
timeout /t 5

echo.
echo 4️⃣ Memulai frontend...
cd ../frontend
start "Frontend" cmd /k "echo Frontend Server Starting... && npm run dev"
timeout /t 5

echo.
echo 5️⃣ Membuka test login...
cd ..
start "" "test-login-simple-final-complete.html"

echo.
echo ========================================
echo ✅ PERBAIKAN SELESAI!
echo ========================================
echo.
echo 🔐 KREDENSIAL LOGIN:
echo Email: admin@jempol.com
echo Password: admin123
echo.
echo 🌐 URL APLIKASI:
echo Frontend: http://localhost:3001
echo Backend: http://localhost:3003
echo Test: test-login-simple-final-complete.html
echo.
echo 📋 LANGKAH SELANJUTNYA:
echo 1. Test login di file HTML yang terbuka
echo 2. Jika berhasil, buka http://localhost:3001
echo 3. Login dengan kredensial di atas
echo.
echo ⚠️ JIKA MASIH GAGAL:
echo - Buka clear-cache-and-test-login.html
echo - Klik "Clear All Cache" lalu "Test Login"
echo - Periksa console browser untuk error detail
echo.
pause