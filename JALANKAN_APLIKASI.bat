@echo off
echo ========================================
echo    APLIKASI JEMPOL - SISTEM MANAJEMEN
echo ========================================
echo.
echo Menjalankan aplikasi...
echo.
echo Frontend: http://localhost:3002
echo Backend:  http://localhost:3004
echo.
echo Login Admin:
echo Email: admin@jempol.com
echo Password: admin123
echo.
echo ========================================
echo.

start "Backend" cmd /k "cd backend && npm run dev"
timeout /t 3 /nobreak > nul
start "Frontend" cmd /k "cd frontend && npm run dev"
timeout /t 2 /nobreak > nul
start http://localhost:3002

echo Aplikasi sedang dimulai...
echo Tunggu beberapa detik untuk loading lengkap.
pause