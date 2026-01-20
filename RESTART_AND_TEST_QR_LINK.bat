@echo off
echo ========================================
echo RESTART DAN TEST QR LINK SETTINGS
echo ========================================
echo.

echo [1/4] Membersihkan proses yang berjalan...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo [2/4] Memulai backend...
cd backend
start "Backend Server" cmd /k "npm run dev"
cd ..
timeout /t 5 /nobreak >nul

echo.
echo [3/4] Memulai frontend...
cd frontend
start "Frontend Server" cmd /k "npm run dev"
cd ..
timeout /t 8 /nobreak >nul

echo.
echo [4/4] Membuka aplikasi...
timeout /t 3 /nobreak >nul
start http://localhost:3003/settings/qr-link

echo.
echo ========================================
echo APLIKASI BERHASIL DIMULAI!
echo ========================================
echo.
echo Backend: http://localhost:3004
echo Frontend: http://localhost:3003
echo QR Link Settings: http://localhost:3003/settings/qr-link
echo.
echo Buka Browser Console (F12) untuk melihat log debug
echo.
pause
