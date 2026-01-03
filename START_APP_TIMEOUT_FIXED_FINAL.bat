@echo off
echo ========================================
echo START APLIKASI - TIMEOUT FIXED FINAL
echo ========================================

echo.
echo 🔄 Memulai aplikasi dengan perbaikan timeout...

echo.
echo 1. Membersihkan proses lama...
taskkill /f /im node.exe 2>nul
taskkill /f /im npm.exe 2>nul
timeout /t 2 >nul

echo.
echo 2. Memulai backend server (Port 3004)...
cd backend
start "KISS Backend - Timeout Fixed" cmd /k "echo Backend Server Starting... && npm run dev"
timeout /t 8 >nul

echo.
echo 3. Memulai frontend server (Port 3002)...
cd ..\frontend  
start "KISS Frontend - Timeout Fixed" cmd /k "echo Frontend Server Starting... && npm run dev"
timeout /t 10 >nul

echo.
echo 4. Membuka aplikasi di browser...
start "" "http://localhost:3002"

echo.
echo ========================================
echo ✅ APLIKASI BERHASIL DIMULAI
echo ========================================
echo.
echo 🌐 Frontend: http://localhost:3002
echo 🔧 Backend:  http://localhost:3004
echo.
echo 🔐 KREDENSIAL LOGIN:
echo    Email: test@admin.com
echo    Password: admin123
echo.
echo    Atau:
echo    Email: admin@jempol.com
echo    Password: admin123
echo.
echo 📋 PERBAIKAN YANG DITERAPKAN:
echo    ✅ Timeout diperpanjang menjadi 30 detik
echo    ✅ Retry mechanism untuk login
echo    ✅ Better error handling
echo    ✅ Optimized Supabase client config
echo    ✅ Session management diperbaiki
echo.
echo 🔍 Jika masih ada masalah:
echo    1. Jalankan: VERIFY_TIMEOUT_FIX.bat
echo    2. Cek browser console untuk error
echo    3. Clear browser cache dan cookies
echo.
echo ========================================

cd ..
pause