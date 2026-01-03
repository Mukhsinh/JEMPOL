@echo off
echo ========================================
echo    TEST QR MANAGEMENT AUTHENTICATION
echo ========================================
echo.

echo 1. Memulai backend server...
start "Backend Server" cmd /k "cd backend && npm run dev"

echo.
echo 2. Menunggu server siap...
timeout /t 5 /nobreak > nul

echo.
echo 3. Membuka test page...
start "" "test-qr-management-auth-complete.html"

echo.
echo ========================================
echo   INSTRUKSI TEST:
echo ========================================
echo 1. Login dengan admin@kiss.com / admin123
echo 2. Test QR Codes API
echo 3. Test Create QR Code
echo 4. Periksa console browser untuk debug info
echo.
echo Tekan ENTER untuk melanjutkan...
pause > nul