@echo off
echo ========================================
echo    START TICKETS DEBUG MODE
echo ========================================
echo.
echo Memulai backend dan frontend untuk debug tickets...
echo.

REM Buka terminal baru untuk backend
echo Starting backend server...
start "Backend Server" cmd /k "cd backend && npm run dev"

REM Tunggu sebentar untuk backend startup
timeout /t 3 /nobreak >nul

REM Buka terminal baru untuk frontend
echo Starting frontend server...
start "Frontend Server" cmd /k "cd frontend && npm run dev"

REM Tunggu sebentar untuk frontend startup
timeout /t 5 /nobreak >nul

REM Buka test page
echo Opening test page...
start "" "test-tickets-api-connection.html"

REM Buka aplikasi di browser
timeout /t 3 /nobreak >nul
echo Opening application...
start "" "http://localhost:3001/tickets"

echo.
echo ========================================
echo    SERVERS STARTED
echo ========================================
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3001
echo Test Page: test-tickets-api-connection.html
echo Tickets Page: http://localhost:3001/tickets
echo.
echo Gunakan test page untuk debug masalah koneksi.
echo Tekan Ctrl+C di terminal untuk stop servers.
echo.
pause