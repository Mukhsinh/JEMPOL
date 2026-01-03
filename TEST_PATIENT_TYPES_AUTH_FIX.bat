@echo off
echo ========================================
echo 🔧 TESTING PATIENT TYPES AUTH FIX
echo ========================================
echo.

echo 📋 Langkah-langkah yang akan dilakukan:
echo 1. Restart backend server
echo 2. Test endpoint patient-types
echo 3. Buka test page di browser
echo.

pause

echo.
echo 🔄 Step 1: Restarting backend server...
echo.

cd backend
echo Stopping any existing backend process...
taskkill /f /im node.exe 2>nul
timeout /t 2 /nobreak >nul

echo Starting backend server...
start "Backend Server" cmd /k "npm run dev"

echo Waiting for backend to start...
timeout /t 5 /nobreak >nul

cd ..

echo.
echo 🧪 Step 2: Testing patient-types endpoints...
echo.

echo Testing public endpoint...
curl -X GET "http://localhost:3003/api/master-data/public/patient-types" -H "Content-Type: application/json" 2>nul
echo.

echo.
echo 🌐 Step 3: Opening test page in browser...
echo.

start "" "test-patient-types-auth-fix.html"

echo.
echo ✅ Test setup complete!
echo.
echo 📋 Manual testing steps:
echo 1. Check if backend server started successfully
echo 2. Use the test page to verify endpoints
echo 3. Check browser console for any errors
echo 4. Test the actual frontend application
echo.

echo 🔍 Troubleshooting:
echo - If backend fails to start, check port 3003 availability
echo - If endpoints return 403, check Supabase RLS policies
echo - If token issues persist, clear browser storage and re-login
echo.

pause