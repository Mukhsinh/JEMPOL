@echo off
echo ========================================
echo 🔧 RESTART APLIKASI - LOGIN FIXED FINAL
echo ========================================
echo.

echo 📋 Konfigurasi yang benar:
echo    URL: https://jxxzbdivafzzwqhagwrf.supabase.co
echo    Email: admin@jempol.com
echo    Password: admin123
echo.

echo 🛑 Menghentikan semua proses...
taskkill /f /im node.exe 2>nul
taskkill /f /im npm.exe 2>nul
timeout /t 2 >nul

echo 🧹 Membersihkan cache npm...
cd frontend
call npm cache clean --force 2>nul
cd ..

cd backend  
call npm cache clean --force 2>nul
cd ..

echo 🔄 Memulai backend...
cd backend
start "Backend Server" cmd /k "npm run dev"
timeout /t 5 >nul

echo 🔄 Memulai frontend...
cd ../frontend
start "Frontend Server" cmd /k "npm run dev"
timeout /t 3 >nul

echo 🌐 Membuka halaman test login...
start "" "clear-cache-and-fix-login.html"

echo.
echo ✅ Aplikasi berhasil direstart!
echo.
echo 📋 LANGKAH SELANJUTNYA:
echo 1. Tunggu backend dan frontend selesai loading
echo 2. Buka halaman test yang sudah terbuka
echo 3. Klik "Bersihkan Semua Cache"
echo 4. Klik "Test Login" dengan admin@jempol.com / admin123
echo 5. Jika berhasil, buka http://localhost:3001
echo.
echo 🔍 Jika masih error, periksa:
echo    - Network tab di browser untuk URL yang dipanggil
echo    - Console untuk error message
echo    - Pastikan tidak ada cache lama
echo.
pause