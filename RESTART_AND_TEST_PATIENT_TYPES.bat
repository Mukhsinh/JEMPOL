@echo off
echo ========================================
echo RESTART BACKEND AND TEST PATIENT TYPES
echo ========================================

echo.
echo 1. Stopping any existing backend processes...
taskkill /f /im node.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo 2. Starting backend server...
cd backend
start "Backend Server" cmd /k "npm run dev"

echo.
echo 3. Waiting for backend to start...
timeout /t 5 /nobreak >nul

echo.
echo 4. Opening test page...
start "" "test-patient-types-fix-final.html"

echo.
echo 5. Backend server is running in separate window
echo 6. Test page should open in your browser
echo.
echo ========================================
echo TESTING INSTRUCTIONS:
echo ========================================
echo 1. Wait for backend to fully start (check backend window)
echo 2. In the test page, click "Run All Tests"
echo 3. Check if all tests pass
echo 4. If tests fail, check backend logs for errors
echo.
echo Backend logs will show in the separate command window
echo Press any key to close this window...
pause >nul