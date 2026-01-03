@echo off
echo ========================================
echo    MEMULAI APLIKASI KISS - FIXED
echo ========================================
echo.

echo [1/3] Membuka aplikasi di browser...
start http://localhost:3001
timeout /t 2 /nobreak >nul

echo [2/3] Status aplikasi:
echo - Frontend: http://localhost:3001 (Vite React)
echo - Backend:  http://localhost:3004 (Node.js API)
echo - Database: Supabase (Cloud)
echo.

echo [3/3] Kredensial login:
echo - Email: admin@jempol.com
echo - Password: admin123
echo.

echo ========================================
echo    APLIKASI SIAP DIGUNAKAN!
echo ========================================
echo.
echo Tekan tombol apa saja untuk menutup...
pause >nul