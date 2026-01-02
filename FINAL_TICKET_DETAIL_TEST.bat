@echo off
echo ========================================
echo    FINAL TEST - TICKET DETAIL PAGE
echo ========================================
echo.

echo [1/5] Checking Frontend Build...
cd frontend
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Frontend build failed!
    pause
    exit /b 1
)
echo ✅ Frontend build successful!
echo.

echo [2/5] Starting Frontend Server...
start "Frontend Server" cmd /k "npm run dev"
timeout /t 5 /nobreak > nul
echo ✅ Frontend server started on http://localhost:3000
echo.

echo [3/5] Starting Backend Server...
cd ..\backend
start "Backend Server" cmd /k "npm run dev"
timeout /t 5 /nobreak > nul
echo ✅ Backend server started on http://localhost:5001
echo.

echo [4/5] Opening Test Pages...
start "" "http://localhost:3000/tickets"
timeout /t 2 /nobreak > nul
start "" "http://localhost:3000/tickets/990e8400-e29b-41d4-a716-446655440001"
timeout /t 2 /nobreak > nul
start "" "%~dp0test-ticket-detail-page.html"
timeout /t 2 /nobreak > nul
start "" "%~dp0test-ticket-detail-integration.html"
echo ✅ Test pages opened!
echo.

echo [5/5] Test Instructions:
echo ========================================
echo 1. Ticket List: http://localhost:3000/tickets
echo 2. Sample Detail: http://localhost:3000/tickets/990e8400-e29b-41d4-a716-446655440001
echo 3. Click eye icon (👁️) in ticket list to navigate to detail
echo 4. Verify all components are working:
echo    - AI Analysis panel
echo    - Activity timeline
echo    - Reply box
echo    - Sidebar details
echo    - SLA timer
echo    - Sentiment analysis
echo    - Reporter info
echo 5. Test responsive design by resizing browser
echo 6. Test dark mode toggle (if available)
echo ========================================
echo.

echo ✅ ALL SYSTEMS READY FOR TESTING!
echo.
echo Press any key to continue monitoring...
pause > nul

echo.
echo Monitoring servers... Press Ctrl+C to stop.
timeout /t 999999 /nobreak > nul