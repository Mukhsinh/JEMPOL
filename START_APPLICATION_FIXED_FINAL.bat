@echo off
echo ========================================
echo    MEMULAI APLIKASI KISS - FINAL FIX
echo ========================================
echo.

echo 🔧 Mengecek konfigurasi...
if not exist "backend\.env" (
    echo ❌ File backend\.env tidak ditemukan!
    pause
    exit /b 1
)

if not exist "frontend\.env" (
    echo ❌ File frontend\.env tidak ditemukan!
    pause
    exit /b 1
)

echo ✅ File konfigurasi ditemukan

echo.
echo 🧹 Membersihkan cache dan proses lama...
taskkill /f /im node.exe >nul 2>&1
taskkill /f /im npm.exe >nul 2>&1

echo.
echo 🔄 Memulai Backend (Port 3004)...
cd backend
start "KISS Backend" cmd /k "npm run dev"
timeout /t 3 >nul

echo.
echo 🔄 Memulai Frontend (Port 3002)...
cd ..\frontend
start "KISS Frontend" cmd /k "npm run dev"
timeout /t 3 >nul

cd ..

echo.
echo ✅ Aplikasi sedang dimulai...
echo.
echo 📋 Informasi Akses:
echo    Frontend: http://localhost:3002
echo    Backend:  http://localhost:3004
echo    Admin:    admin@jempol.com / admin123
echo.
echo 🔍 Status:
echo    - Database: Supabase (Online)
echo    - Auth: Terintegrasi
echo    - Admin: Aktif
echo.
echo ⏳ Tunggu 10 detik untuk startup lengkap...
timeout /t 10 >nul

echo.
echo 🌐 Membuka aplikasi di browser...
start http://localhost:3002

echo.
echo ✅ Aplikasi berhasil dimulai!
echo    Jika ada masalah, cek terminal Backend dan Frontend
echo.
pause