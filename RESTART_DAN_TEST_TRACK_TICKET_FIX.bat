@echo off
echo ========================================
echo RESTART DAN TEST TRACK TICKET - FIXED
echo ========================================
echo.

echo [1/4] Stopping existing processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo [2/4] Starting backend server...
cd backend
start "Backend Server" cmd /k "npm run dev"
cd ..

echo.
echo [3/4] Waiting for backend to start...
timeout /t 5 /nobreak >nul

echo.
echo [4/4] Opening test page...
start "" "test-track-ticket-fixed.html"

echo.
echo ========================================
echo SELESAI!
echo ========================================
echo.
echo Backend berjalan di: http://localhost:3004
echo Test page dibuka di browser
echo.
echo Cara test:
echo 1. Masukkan nomor tiket (contoh: TKT-2026-0004)
echo 2. Klik tombol "Lacak Tiket"
echo 3. Lihat hasil di halaman
echo.
echo Tekan tombol apapun untuk keluar...
pause >nul
