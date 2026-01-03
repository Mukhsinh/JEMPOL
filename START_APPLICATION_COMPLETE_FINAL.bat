@echo off
echo ========================================
echo    MEMULAI APLIKASI LENGKAP - FINAL
echo ========================================
echo.

echo [1/5] Memeriksa Node.js dan npm...
node --version
npm --version
echo.

echo [2/5] Memulai Backend Server...
cd backend
echo Memulai backend di port 3003...
start "Backend Server" cmd /k "npm run dev"
echo Backend dimulai dalam window terpisah
cd ..
echo.

echo [3/5] Menunggu backend siap...
timeout /t 5 /nobreak > nul
echo.

echo [4/5] Memulai Frontend Development Server...
cd frontend
echo Memulai frontend di port 3001...
start "Frontend Server" cmd /k "npm run dev"
echo Frontend dimulai dalam window terpisah
cd ..
echo.

echo [5/5] Menunggu aplikasi siap...
timeout /t 3 /nobreak > nul
echo.

echo ========================================
echo           APLIKASI SIAP!
echo ========================================
echo.
echo Backend: http://localhost:3003
echo Frontend: http://localhost:3001
echo Health Check: http://localhost:3003/api/health
echo.
echo Login Admin:
echo Email: admin@jempol.com
echo Password: admin123
echo.
echo Tekan tombol apa saja untuk membuka aplikasi...
pause > nul

echo Membuka aplikasi di browser...
start http://localhost:3001

echo.
echo ========================================
echo    APLIKASI BERJALAN DENGAN SUKSES!
echo ========================================
echo.
echo Untuk menghentikan aplikasi:
echo 1. Tutup window Backend Server
echo 2. Tutup window Frontend Server
echo.
echo Atau tekan Ctrl+C di masing-masing window
echo.
pause