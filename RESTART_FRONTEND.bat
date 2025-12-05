@echo off
echo ========================================
echo   RESTART FRONTEND - JEMPOL
echo ========================================
echo.
echo Menghentikan frontend yang sedang berjalan...
echo.

REM Kill any running frontend process
taskkill /F /IM node.exe /FI "WINDOWTITLE eq frontend*" 2>nul

echo.
echo Membersihkan cache...
cd frontend
if exist node_modules\.vite rmdir /s /q node_modules\.vite
if exist dist rmdir /s /q dist

echo.
echo Starting frontend...
echo.
echo Frontend akan berjalan di: http://localhost:3001
echo.
echo Setelah frontend berjalan:
echo   1. Buka browser: http://localhost:3001/login
echo   2. Tekan Ctrl+Shift+R untuk hard reload
echo   3. Login dengan:
echo      Username: admin
echo      Password: admin123
echo.
echo ========================================
echo.

start cmd /k "npm run dev"

echo.
echo Frontend sedang starting...
echo Tunggu beberapa detik, lalu buka browser.
echo.
pause
