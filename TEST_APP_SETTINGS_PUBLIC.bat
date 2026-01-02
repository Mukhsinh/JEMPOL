@echo off
echo ========================================
echo TEST APP SETTINGS - PUBLIC ONLY
echo ========================================
echo.

echo Starting backend server...
start "Backend Server" cmd /k "cd backend && npm run dev"

echo Waiting for server to start...
timeout /t 8 /nobreak > nul

echo Opening test page...
start "" "test-app-settings-public-only.html"

echo.
echo ========================================
echo Test Instructions:
echo ========================================
echo 1. Backend server is starting in separate window
echo 2. Test page will open in your browser
echo 3. This tests public endpoints only (no auth required)
echo 4. Check if server is running and database is accessible
echo 5. View current settings from database
echo ========================================
echo.
echo Press any key to continue...
pause > nul