@echo off
echo ========================================
echo RESTART APLIKASI SETELAH FIX SURVEY
echo ========================================
echo.

echo [1/3] Stopping processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 >nul

echo.
echo [2/3] Starting backend...
cd backend
start "Backend Server" cmd /k "npm run dev"
timeout /t 5 >nul

echo.
echo [3/3] Starting frontend...
cd ..\frontend
start "Frontend Server" cmd /k "npm run dev"

echo.
echo ========================================
echo APLIKASI BERHASIL DI-RESTART!
echo ========================================
echo Backend: http://localhost:3001
echo Frontend: http://localhost:3002
echo.
echo Silakan buka browser dan test form survey
echo ========================================
pause
