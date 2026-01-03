@echo off
echo ========================================
echo 🚀 Starting Application and Testing Login
echo ========================================

echo.
echo 📋 Login Credentials:
echo Username: admin_jempol
echo Password: admin123
echo.
echo Alternative:
echo Username: admin  
echo Password: admin123
echo.

echo 🔄 Starting Backend Server...
start "Backend Server" cmd /k "cd backend && npm run dev"

echo ⏳ Waiting for backend to start...
timeout /t 5 /nobreak > nul

echo 🔄 Starting Frontend Server...
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo ⏳ Waiting for frontend to start...
timeout /t 8 /nobreak > nul

echo 🌐 Opening test page...
start "" "test-login-fix-400-error.html"

echo.
echo ✅ Application started!
echo.
echo 📊 Test Steps:
echo 1. Wait for both servers to fully start
echo 2. Use test page to verify login
echo 3. Try credentials: admin_jempol / admin123
echo 4. Check backend status first
echo.
echo 🔗 URLs:
echo Frontend: http://localhost:3001
echo Backend:  http://localhost:3003
echo Test:     test-login-fix-400-error.html
echo.

pause