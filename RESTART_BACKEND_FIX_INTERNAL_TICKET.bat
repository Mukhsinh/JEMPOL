@echo off
echo ========================================
echo RESTART BACKEND - FIX INTERNAL TICKET
echo ========================================
echo.

echo [1/3] Stopping backend processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo [2/3] Starting backend server...
cd backend
start "Backend Server" cmd /k "npm run dev"

echo.
echo [3/3] Waiting for backend to start...
timeout /t 5 /nobreak >nul

echo.
echo ========================================
echo Backend restarted successfully!
echo ========================================
echo.
echo Backend running at: http://localhost:3002
echo.
echo Test endpoint:
echo curl http://localhost:3002/api/public/internal-tickets
echo.
pause
