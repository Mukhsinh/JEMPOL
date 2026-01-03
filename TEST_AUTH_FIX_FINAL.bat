@echo off
echo ========================================
echo 🔧 TEST AUTH FIX FINAL
echo ========================================
echo.

echo 📋 Checking if backend is running...
curl -s http://localhost:3003/api/health >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Backend not running. Starting backend...
    echo.
    cd backend
    start "Backend Server" cmd /k "npm run dev"
    cd ..
    echo ⏳ Waiting for backend to start...
    timeout /t 10 /nobreak >nul
) else (
    echo ✅ Backend is running
)

echo.
echo 📋 Checking if frontend is running...
curl -s http://localhost:3001 >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Frontend not running. Starting frontend...
    echo.
    cd frontend
    start "Frontend Server" cmd /k "npm run dev"
    cd ..
    echo ⏳ Waiting for frontend to start...
    timeout /t 10 /nobreak >nul
) else (
    echo ✅ Frontend is running
)

echo.
echo 🌐 Opening test page...
start "" "test-auth-fix-final.html"

echo.
echo 🔍 Opening browser console for monitoring...
echo.
echo ========================================
echo 📋 TESTING INSTRUCTIONS:
echo ========================================
echo 1. Test page will open in your browser
echo 2. Check application status first
echo 3. Test login with admin@jempol.com / admin123
echo 4. Test API connections
echo 5. Test dashboard data
echo 6. Monitor console logs for errors
echo.
echo 🔧 Expected fixes:
echo - No multiple Supabase client instances
echo - No "authService is not defined" errors
echo - No "useAuth must be used within AuthProvider" errors
echo - API 403 errors should be resolved
echo - Token should sync properly between services
echo.
echo ✅ Test ready! Check the browser window.
echo ========================================

pause