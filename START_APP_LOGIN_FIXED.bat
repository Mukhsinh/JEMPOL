@echo off
echo ========================================
echo 🚀 MENJALANKAN APLIKASI - LOGIN FIXED
echo ========================================
echo.

echo 📋 Kredensial Login:
echo    Email: admin@jempol.com
echo    Password: admin123
echo.

echo 🔧 Langkah perbaikan yang sudah dilakukan:
echo    ✅ Password admin sudah direset
echo    ✅ URL Supabase sudah diperbaiki
echo    ✅ AuthContext baru sudah dibuat
echo.

echo 🚀 Menjalankan aplikasi...
echo.

echo 1. Starting backend...
start "Backend" cmd /k "cd backend && npm start"
timeout /t 3 /nobreak > nul

echo 2. Starting frontend...
start "Frontend" cmd /k "cd frontend && npm run dev"
timeout /t 3 /nobreak > nul

echo.
echo ⚠️  PENTING - Sebelum login:
echo    1. Buka browser dan tekan Ctrl+Shift+R untuk clear cache
echo    2. Atau buka Developer Tools (F12) dan klik kanan refresh, pilih "Empty Cache and Hard Reload"
echo    3. Kemudian coba login dengan kredensial di atas
echo.

echo 🌐 Aplikasi akan terbuka di:
echo    Frontend: http://localhost:3001
echo    Backend: http://localhost:3003
echo.

echo ✅ Aplikasi sedang berjalan!
echo    Jika masih ada masalah, jalankan test-login-clean-final.html terlebih dahulu
pause