@echo off
echo ========================================
echo TEST LOCAL API ENDPOINTS
echo ========================================
echo.

cd backend

echo Installing dependencies...
call npm install
echo.

echo Starting test...
echo.

node test-all-endpoints.js

echo.
echo ========================================
echo TEST COMPLETED
echo ========================================
echo.

cd ..
pause
