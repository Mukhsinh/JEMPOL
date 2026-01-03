@echo off
echo 🚀 Starting backend server and testing patient-types endpoint...
echo.

echo 📋 Step 1: Starting backend server...
cd backend
start "Backend Server" cmd /k "npm start"

echo ⏳ Waiting for backend to start...
timeout /t 10 /nobreak > nul

echo.
echo 📋 Step 2: Testing endpoints...
cd ..
node test-patient-types-endpoint.js

echo.
echo 📋 Step 3: Testing frontend integration...
echo Open browser and go to: http://localhost:3001
echo Check patient types page and console for errors

pause