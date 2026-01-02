@echo off
echo ========================================
echo    QUICK FIX TICKETS PAGE
echo ========================================
echo.
echo Menjalankan quick fix untuk masalah tickets...
echo.

REM Clear npm cache
echo 1. Clearing npm cache...
cd frontend
npm cache clean --force
cd ..

REM Restart backend dengan force kill port
echo 2. Killing processes on port 5000...
netstat -ano | findstr :5000
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do taskkill /f /pid %%a 2>nul

REM Restart frontend dengan force kill port
echo 3. Killing processes on port 3001...
netstat -ano | findstr :3001
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do taskkill /f /pid %%a 2>nul

REM Wait a moment
timeout /t 2 /nobreak >nul

REM Start backend
echo 4. Starting backend...
start "Backend" cmd /k "cd backend && npm run dev"

REM Wait for backend
timeout /t 5 /nobreak >nul

REM Start frontend
echo 5. Starting frontend...
start "Frontend" cmd /k "cd frontend && npm run dev"

REM Wait for frontend
timeout /t 5 /nobreak >nul

REM Open test page
echo 6. Opening test page...
start "" "test-tickets-api-connection.html"

echo.
echo ========================================
echo    QUICK FIX COMPLETED
echo ========================================
echo.
echo Servers should be running now:
echo - Backend: http://localhost:5000
echo - Frontend: http://localhost:3001
echo - Test page opened for verification
echo.
echo If still having issues:
echo 1. Check test page results
echo 2. Verify backend logs in terminal
echo 3. Check browser console for errors
echo.
pause