@echo off
echo ========================================
echo JEMPOL Platform - Status Check
echo ========================================
echo.

echo [1] Checking MongoDB (Port 27017)...
netstat -ano | findstr :27017
if %errorlevel% equ 0 (
    echo ✅ MongoDB is RUNNING
) else (
    echo ❌ MongoDB is NOT RUNNING
    echo    Start with: mongod
)
echo.

echo [2] Checking Backend (Port 5000)...
netstat -ano | findstr :5000
if %errorlevel% equ 0 (
    echo ✅ Backend is RUNNING
) else (
    echo ❌ Backend is NOT RUNNING
    echo    Start with: START_BACKEND.bat
)
echo.

echo [3] Checking Frontend (Port 3000)...
netstat -ano | findstr :3000
if %errorlevel% equ 0 (
    echo ✅ Frontend is RUNNING
) else (
    echo ❌ Frontend is NOT RUNNING
    echo    Start with: START_FRONTEND.bat
)
echo.

echo ========================================
echo Testing Backend API...
echo ========================================
curl -s http://localhost:5000/api/health
echo.
echo.

echo ========================================
echo Summary
echo ========================================
echo If all services are running:
echo - Backend API: http://localhost:5000/api/health
echo - Frontend: http://localhost:3000
echo - Admin Panel: http://localhost:3000/admin
echo.

pause
