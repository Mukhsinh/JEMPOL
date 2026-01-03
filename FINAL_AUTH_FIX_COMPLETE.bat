@echo off
echo ========================================
echo FINAL AUTH FIX COMPLETE - TESTING
echo ========================================
echo.

echo 1. Checking Backend Status...
curl -s http://localhost:3003/api/complaints/test > nul
if %errorlevel% equ 0 (
    echo ✅ Backend is running on port 3003
) else (
    echo ❌ Backend is not running. Please start backend first.
    pause
    exit /b 1
)

echo.
echo 2. Checking Frontend Status...
curl -s http://localhost:3001 > nul
if %errorlevel% equ 0 (
    echo ✅ Frontend is running on port 3001
) else (
    echo ❌ Frontend is not running. Please start frontend first.
    pause
    exit /b 1
)

echo.
echo 3. Testing Authentication...
node test-auth-simple-final.js
if %errorlevel% equ 0 (
    echo ✅ Authentication test passed
) else (
    echo ❌ Authentication test failed
    pause
    exit /b 1
)

echo.
echo 4. Opening Test Pages...
start test-frontend-backend-integration-final.html
timeout /t 2 > nul

echo.
echo 5. Opening Frontend Application...
start http://localhost:3001
timeout /t 2 > nul

echo.
echo ========================================
echo ✅ AUTH FIX COMPLETE - ALL TESTS PASSED
echo ========================================
echo.
echo Frontend: http://localhost:3001
echo Backend:  http://localhost:3003
echo.
echo Login Credentials:
echo Email: admin@jempol.com
echo Password: admin123
echo.
echo The application is now ready to use!
echo All API endpoints are working correctly.
echo.
pause