@echo off
echo ========================================
echo START AND TEST QR REDIRECT FIX
echo ========================================
echo.
echo Memulai aplikasi dan membuka test page...
echo.

REM Check if backend is running
echo Checking backend status...
curl -s http://localhost:3001/api/health >nul 2>&1
if %errorlevel% neq 0 (
    echo Backend tidak berjalan. Memulai backend...
    cd backend
    start cmd /k "npm run dev"
    cd ..
    timeout /t 5 /nobreak >nul
) else (
    echo Backend sudah berjalan.
)

REM Check if frontend is running
echo Checking frontend status...
curl -s http://localhost:3002 >nul 2>&1
if %errorlevel% neq 0 (
    echo Frontend tidak berjalan. Memulai frontend...
    cd frontend
    start cmd /k "npm run dev"
    cd ..
    timeout /t 5 /nobreak >nul
) else (
    echo Frontend sudah berjalan.
)

echo.
echo Menunggu aplikasi siap...
timeout /t 10 /nobreak

echo.
echo Membuka test page...
start test-qr-redirect-link-fix.html

echo.
echo Membuka QR Management...
timeout /t 2 /nobreak
start http://localhost:3002/tickets/qr-management

echo.
echo ========================================
echo APLIKASI DAN TEST PAGE SUDAH DIBUKA
echo ========================================
echo.
echo CARA TEST:
echo 1. Lihat kolom "Redirect" di QR Management
echo 2. Klik tombol "Buka Link" di bawah badge
echo 3. Verifikasi form terbuka di tab baru
echo 4. Pastikan tidak ada tooltip yang menghalangi
echo.
pause
