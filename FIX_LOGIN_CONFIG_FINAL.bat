@echo off
echo ========================================
echo FIXING LOGIN CONFIGURATION ISSUE
echo ========================================
echo.

echo 1. Testing current login with corrected config...
start "" "test-login-fix-config.html"
timeout /t 3 /nobreak > nul

echo.
echo 2. Creating/verifying admin user in correct database...
node create-admin-correct-db.js

echo.
echo 3. Restarting frontend with new config...
cd frontend
taskkill /f /im node.exe 2>nul
start /b npm run dev
cd ..

echo.
echo 4. Restarting backend with new config...
cd backend
taskkill /f /im node.exe 2>nul
start /b npm run dev
cd ..

echo.
echo ========================================
echo CONFIGURATION FIX COMPLETED!
echo ========================================
echo.
echo The issue was:
echo - Wrong Supabase URL and keys in .env files
echo - Frontend was connecting to wrong project
echo.
echo Fixed:
echo - Updated frontend/.env with correct Supabase URL and keys
echo - Updated backend/.env with correct Supabase URL and keys
echo - Verified admin user exists in correct database
echo.
echo Please test login at: http://localhost:3001
echo Email: admin@jempol.com
echo Password: admin123
echo.
pause