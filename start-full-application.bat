@echo off
echo 🚀 Starting full application for testing...
echo.

echo 📋 Step 1: Starting backend server...
cd backend
start "Backend Server" cmd /k "echo Starting backend server... && npm start"

echo ⏳ Waiting for backend to initialize...
timeout /t 15 /nobreak > nul

echo.
echo 📋 Step 2: Starting frontend server...
cd ../frontend
start "Frontend Server" cmd /k "echo Starting frontend server... && npm start"

echo ⏳ Waiting for frontend to initialize...
timeout /t 10 /nobreak > nul

echo.
echo 📋 Step 3: Testing endpoints...
cd ..
node test-patient-types-comprehensive.js

echo.
echo 📋 Step 4: Opening application in browser...
echo Frontend: http://localhost:3001
echo Backend API: http://localhost:3003/api
echo Patient Types Page: http://localhost:3001/admin/settings/patient-types

start http://localhost:3001/admin/settings/patient-types

echo.
echo 🎯 Testing Instructions:
echo 1. Check if both servers started successfully
echo 2. Login to the application
echo 3. Navigate to Settings > Patient Types
echo 4. Check browser console for any 403 errors
echo 5. Verify that patient types data loads correctly
echo.

pause