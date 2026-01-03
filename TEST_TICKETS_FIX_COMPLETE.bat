@echo off
echo ========================================
echo 🧪 TESTING TICKETS AUTHENTICATION FIX
echo ========================================

echo.
echo 📋 Test Plan:
echo 1. Backend connectivity test
echo 2. Supabase connection test  
echo 3. Authentication flow test
echo 4. Tickets API test
echo 5. Frontend integration test
echo.

echo 🔧 Step 1: Testing Backend Connectivity...
curl -s http://localhost:3003/api/complaints/test > test_backend.json
if %errorlevel% equ 0 (
    echo ✅ Backend is running
) else (
    echo ❌ Backend is not running - please start it first
    echo Run: RESTART_BACKEND_WITH_FIX.bat
    pause
    exit /b 1
)

echo.
echo 🔧 Step 2: Testing Public Endpoints...
curl -s http://localhost:3003/api/complaints/public/tickets > test_public.json
if %errorlevel% equ 0 (
    echo ✅ Public endpoints working
) else (
    echo ❌ Public endpoints failed
)

echo.
echo 🔧 Step 3: Opening Comprehensive Test Suite...
echo Opening test-tickets-auth-fix.html in your default browser...
start test-tickets-auth-fix.html

echo.
echo 📋 Manual Test Instructions:
echo.
echo 1. In the opened browser window:
echo    - Click "Test Login" button
echo    - Wait for success message
echo    - Click "Test Fetch Tickets" button
echo    - Verify tickets are loaded
echo.
echo 2. Test Frontend Integration:
echo    - Open http://localhost:3001/tickets
echo    - Login if prompted
echo    - Verify tickets list loads without errors
echo.
echo 3. Check Browser Console:
echo    - Press F12 to open DevTools
echo    - Look for any red errors
echo    - Should see "Tickets fetched successfully"
echo.

echo 🎯 Expected Results:
echo ✅ Login successful with token
echo ✅ Tickets API returns 200 OK
echo ✅ Tickets data displayed in frontend
echo ✅ No 403 Forbidden errors
echo.

echo 📊 Test Results Summary:
type test_backend.json 2>nul | findstr "success.*true" >nul
if %errorlevel% equ 0 (
    echo ✅ Backend Test: PASSED
) else (
    echo ❌ Backend Test: FAILED
)

type test_public.json 2>nul | findstr "success.*true" >nul
if %errorlevel% equ 0 (
    echo ✅ Public API Test: PASSED
) else (
    echo ❌ Public API Test: FAILED
)

echo.
echo 🔍 Debug Information:
echo Backend URL: http://localhost:3003/api
echo Frontend URL: http://localhost:3001
echo Test Suite: test-tickets-auth-fix.html
echo.

echo 📝 If tests fail, check:
echo 1. Backend is running (npm start in backend folder)
echo 2. Environment variables in backend/.env
echo 3. Supabase connection
echo 4. Browser console for errors
echo.

pause