@echo off
echo ========================================
echo    TEST QR MANAGEMENT AUTH FIX
echo ========================================
echo.

echo 1. Starting backend server...
cd backend
start "Backend Server" cmd /k "npm run dev"
timeout /t 5 /nobreak >nul

echo.
echo 2. Starting frontend server...
cd ../frontend
start "Frontend Server" cmd /k "npm run dev"
timeout /t 5 /nobreak >nul

echo.
echo 3. Opening test page...
timeout /t 10 /nobreak >nul
start "" "http://localhost:3000/test-qr-management-auth-fix.html"

echo.
echo 4. Opening QR Management page...
timeout /t 3 /nobreak >nul
start "" "http://localhost:3000/tickets/qr-management"

echo.
echo ========================================
echo    TESTING INSTRUCTIONS
echo ========================================
echo.
echo 1. First, test your auth status in the test page
echo 2. If not logged in, use the login form
echo 3. Test the units and QR codes endpoints
echo 4. Then check the QR Management page
echo.
echo If you see 403 errors:
echo - Make sure you're logged in as admin
echo - Check if backend is running on port 3003
echo - Check browser console for detailed errors
echo.
echo Press any key to continue...
pause >nul