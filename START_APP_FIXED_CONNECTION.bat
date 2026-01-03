@echo off
echo ========================================
echo    MEMULAI APLIKASI KISS - FIXED
echo ========================================
echo.
echo Konfigurasi:
echo - Backend: http://localhost:3003
echo - Frontend: http://localhost:3001
echo - Database: Supabase
echo.

echo [1/3] Memulai Backend Server...
cd backend
start "Backend Server" cmd /k "npm run dev"
timeout /t 5 /nobreak > nul

echo [2/3] Memulai Frontend Server...
cd ../frontend
start "Frontend Server" cmd /k "npm run dev"
timeout /t 5 /nobreak > nul

echo [3/3] Membuka Test Connection...
cd ..
start test-full-connection.html
timeout /t 2 /nobreak > nul

echo.
echo ========================================
echo    APLIKASI BERHASIL DIMULAI!
echo ========================================
echo.
echo URL Akses:
echo - Frontend: http://localhost:3001
echo - Backend API: http://localhost:3003/api
echo - Test Connection: test-full-connection.html
echo.
echo Tekan tombol apapun untuk menutup...
pause > nul