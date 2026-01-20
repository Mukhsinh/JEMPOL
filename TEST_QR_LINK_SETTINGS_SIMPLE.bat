@echo off
echo ========================================
echo TEST QR LINK SETTINGS - SIMPLE
echo ========================================
echo.

echo [1/3] Checking backend status...
curl -s http://localhost:3001/api/health >nul 2>&1
if %errorlevel% neq 0 (
    echo Backend NOT running! Starting backend...
    cd backend
    start "Backend Server" cmd /k "npm run dev"
    cd ..
    echo Waiting for backend to start...
    timeout /t 10 /nobreak >nul
) else (
    echo Backend is running!
)

echo.
echo [2/3] Opening test page...
start http://localhost:3001/test-qr-link-settings-simple.html

echo.
echo [3/3] Opening QR Link Settings page...
timeout /t 2 /nobreak >nul
start http://localhost:3003/settings/qr-link

echo.
echo ========================================
echo TEST COMPLETED
echo ========================================
echo.
echo Halaman test dan QR Link Settings sudah dibuka.
echo Periksa console browser untuk melihat log.
echo.
pause
