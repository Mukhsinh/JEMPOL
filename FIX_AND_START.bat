@echo off
echo ========================================
echo JEMPOL Platform - Fix and Start
echo ========================================
echo.

echo [Step 1] Checking if port 5000 is in use...
netstat -ano | findstr :5000 > nul
if %errorlevel% equ 0 (
    echo ⚠️  Port 5000 is already in use!
    echo.
    echo Killing process on port 5000...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do (
        taskkill /F /PID %%a 2>nul
    )
    echo ✅ Port 5000 cleared
    timeout /t 2 >nul
) else (
    echo ✅ Port 5000 is available
)
echo.

echo [Step 2] Checking MongoDB...
netstat -ano | findstr :27017 > nul
if %errorlevel% equ 0 (
    echo ✅ MongoDB is running
) else (
    echo ❌ MongoDB is NOT running
    echo.
    echo Please start MongoDB first:
    echo   1. Open new Command Prompt
    echo   2. Run: mongod
    echo.
    pause
    exit /b 1
)
echo.

echo [Step 3] Checking backend dependencies...
cd backend
if not exist node_modules (
    echo Installing dependencies...
    call npm install
)
echo ✅ Dependencies OK
echo.

echo [Step 4] Starting backend server...
echo.
echo ========================================
echo Backend server starting...
echo Press Ctrl+C to stop
echo ========================================
echo.

call npm run dev

pause
