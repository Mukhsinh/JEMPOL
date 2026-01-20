@echo off
echo ========================================
echo RESTART DAN TEST QR REDIRECT
echo ========================================
echo.

echo [1/4] Stopping existing processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo [2/4] Starting backend...
cd backend
start "Backend Server" cmd /k "npm run dev"
cd ..
timeout /t 5 /nobreak >nul

echo.
echo [3/4] Starting frontend...
cd frontend
start "Frontend Server" cmd /k "npm run dev"
cd ..
timeout /t 10 /nobreak >nul

echo.
echo [4/4] Opening test page...
start http://localhost:3002/test-qr-redirect-form.html

echo.
echo ========================================
echo APLIKASI BERHASIL DIJALANKAN!
echo ========================================
echo.
echo Backend:  http://localhost:3001
echo Frontend: http://localhost:3002
echo Test:     http://localhost:3002/test-qr-redirect-form.html
echo.
echo ========================================
echo CARA TEST:
echo ========================================
echo.
echo 1. Buka QR Management di dashboard admin
echo 2. Klik link di kolom "Redirect"
echo 3. Pastikan langsung ke form tanpa sidebar
echo.
echo ATAU gunakan halaman test yang sudah dibuka
echo.
echo ========================================
pause
