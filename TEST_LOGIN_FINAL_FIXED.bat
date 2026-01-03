@echo off
echo ========================================
echo TESTING LOGIN AFTER CONFIG FIX
echo ========================================
echo.

echo 1. Opening test login page...
start "" "test-login-fix-config.html"

echo.
echo 2. Testing login via Node.js...
node create-admin-correct-db.js

echo.
echo 3. Starting applications with correct config...
echo.

echo Starting Frontend...
cd frontend
start /b cmd /c "npm run dev"
cd ..

echo.
echo Starting Backend...
cd backend  
start /b cmd /c "npm run dev"
cd ..

echo.
echo ========================================
echo APPLICATIONS STARTED!
echo ========================================
echo.
echo Frontend: http://localhost:3001
echo Backend: http://localhost:3003
echo.
echo Login Credentials:
echo Email: admin@jempol.com
echo Password: admin123
echo.
echo The configuration has been fixed:
echo - Correct Supabase URL: https://jxxzbdivafzzwqhagwrf.supabase.co
echo - Correct API keys updated
echo - Admin user confirmed in correct database
echo.
echo Please test login now!
echo.
pause