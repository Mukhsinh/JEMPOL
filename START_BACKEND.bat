@echo off
echo ========================================
echo Starting JEMPOL Backend Server
echo ========================================
echo.

cd backend

echo Checking MongoDB connection...
echo.

echo Starting backend server...
npm run dev

pause
