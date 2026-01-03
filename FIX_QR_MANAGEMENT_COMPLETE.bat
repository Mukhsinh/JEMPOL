@echo off
echo ========================================
echo    FIX QR MANAGEMENT COMPLETE
echo ========================================
echo.

echo Step 1: Creating admin user for testing...
cd backend
node ../create-admin-for-qr-management.js
if %errorlevel% neq 0 (
    echo Failed to create admin user. Please check backend/.env configuration.
    pause
    exit /b 1
)

echo.
echo Step 2: Starting backend server...
start "Backend Server" cmd /k "npm run dev"
timeout /t 5 /nobreak >nul

echo.
echo Step 3: Starting frontend server...
cd ../frontend
start "Frontend Server" cmd /k "npm run dev"
timeout /t 5 /nobreak >nul

echo.
echo Step 4: Opening admin login test page...
timeout /t 10 /nobreak >nul
start "" "http://localhost:3000/admin-login-test.html"

echo.
echo Step 5: Waiting for login test...
timeout /t 5 /nobreak >nul

echo.
echo Step 6: Opening QR Management page...
start "" "http://localhost:3000/tickets/qr-management"

echo.
echo ========================================
echo    QR MANAGEMENT FIX COMPLETE
echo ========================================
echo.
echo TESTING INSTRUCTIONS:
echo.
echo 1. In the admin login test page:
echo    - Check server status (should be online)
echo    - Check current auth status
echo    - Login with: admin@example.com / admin123
echo    - Test protected endpoints
echo.
echo 2. In the QR Management page:
echo    - Page should load without 403 errors
echo    - Units dropdown should populate
echo    - QR codes list should load
echo.
echo 3. If you still see 403 errors:
echo    - Make sure you're logged in
echo    - Check browser console for details
echo    - Refresh the page after login
echo.
echo LOGIN CREDENTIALS:
echo Email: admin@example.com
echo Password: admin123
echo.
echo Press any key to continue...
pause >nul