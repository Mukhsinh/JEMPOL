@echo off
echo ========================================
echo    TEST FORM LACAK TIKET
echo ========================================
echo.

echo [1/3] Generating QR Codes...
cd scripts
node generate-form-lacak-qr.js
cd ..
echo.

echo [2/3] Starting Backend Server...
start "Backend Server" cmd /k "cd backend && npm run dev"
timeout /t 5 /nobreak >nul
echo.

echo [3/3] Starting Frontend Server...
start "Frontend Server" cmd /k "cd frontend && npm run dev"
timeout /t 5 /nobreak >nul
echo.

echo ========================================
echo    APLIKASI BERHASIL DIJALANKAN!
echo ========================================
echo.
echo Backend: http://localhost:3000
echo Frontend: http://localhost:5173
echo Form Lacak: http://localhost:5173/form-lacak
echo QR Preview: http://localhost:5173/qr-form-lacak.html
echo.
echo Tekan tombol apapun untuk membuka browser...
pause >nul

start http://localhost:5173/form-lacak

echo.
echo Aplikasi sedang berjalan...
echo Tutup window ini untuk menghentikan server.
pause
