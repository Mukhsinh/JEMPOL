@echo off
echo ========================================
echo   JEMPOL Landing Page - Startup
echo ========================================
echo.

echo [1/2] Starting Backend Server...
start "JEMPOL Backend" cmd /k "cd backend && npm run dev"
timeout /t 3 /nobreak > nul

echo [2/2] Starting Frontend Server...
start "JEMPOL Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo   Servers are starting...
echo ========================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3001
echo Admin:    http://localhost:3001/admin
echo.
echo Press any key to exit this window...
pause > nul
