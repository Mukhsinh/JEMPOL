@echo off
echo ========================================
echo TEST APP SETTINGS INTEGRATION - FINAL
echo ========================================
echo.

echo Starting backend server...
start "Backend Server" cmd /k "cd backend && npm run dev"

echo Waiting for server to start...
timeout /t 5 /nobreak > nul

echo Opening test page...
start "" "test-app-settings-integration-final.html"

echo.
echo ========================================
echo Test Instructions:
echo ========================================
echo 1. Backend server is starting in separate window
echo 2. Test page will open in your browser
echo 3. Check console for any errors
echo 4. Test all buttons to verify integration
echo 5. Check database for updated values
echo ========================================
echo.
echo Press any key to continue...
pause > nul