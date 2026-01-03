@echo off
echo ========================================
echo 🔧 Testing QR Management Auth Fix
echo ========================================
echo.

echo 📋 Starting QR Management authentication test...
echo.

echo 🔄 Step 1: Starting backend server...
cd backend
start "Backend Server" cmd /k "npm run dev"
timeout /t 5 /nobreak > nul

echo 🔄 Step 2: Starting frontend server...
cd ../frontend
start "Frontend Server" cmd /k "npm run dev"
timeout /t 5 /nobreak > nul

echo 🔄 Step 3: Opening test page...
cd ..
start "" "test-qr-management-auth-fix-final.html"

echo 🔄 Step 4: Opening QR Management page...
timeout /t 3 /nobreak > nul
start "" "http://localhost:5173/tickets/qr-management"

echo.
echo ✅ Test environment started!
echo.
echo 📋 Manual Test Steps:
echo 1. Login to the application at http://localhost:5173/login
echo 2. Navigate to QR Management at http://localhost:5173/tickets/qr-management
echo 3. Check if QR codes load without 403 errors
echo 4. Use the test page to verify API endpoints
echo.
echo 🔍 Check browser console for any errors
echo 🔍 Check backend logs for authentication issues
echo.
pause