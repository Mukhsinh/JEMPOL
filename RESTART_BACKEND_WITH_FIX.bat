@echo off
echo ========================================
echo 🔧 RESTARTING BACKEND WITH AUTH FIX
echo ========================================

cd backend

echo.
echo 📦 Installing dependencies...
call npm install

echo.
echo 🔨 Building TypeScript...
call npm run build

echo.
echo 🚀 Starting backend server...
echo Backend will run on http://localhost:3003
echo.
echo Press Ctrl+C to stop the server
echo.

call npm start

pause