@echo off
echo ========================================
echo   CLEAR CACHE AND RESTART
echo ========================================
echo.

echo [1/5] Stopping processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo [2/5] Clearing frontend cache...
cd frontend
if exist node_modules\.vite (
    rmdir /s /q node_modules\.vite
    echo   - Vite cache cleared
)
if exist dist (
    rmdir /s /q dist
    echo   - Dist folder cleared
)
cd ..

echo [3/5] Starting backend...
start "JEMPOL Backend" cmd /k "cd backend && npm run dev"
timeout /t 5 /nobreak >nul

echo [4/5] Starting frontend...
start "JEMPOL Frontend" cmd /k "cd frontend && npm run dev"
timeout /t 3 /nobreak >nul

echo [5/5] Opening browser...
timeout /t 5 /nobreak >nul
start http://localhost:3001

echo.
echo ========================================
echo   DONE!
echo ========================================
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3001
echo.
echo IMPORTANT:
echo 1. Wait for both servers to start
echo 2. Press Ctrl+F5 in browser to hard refresh
echo 3. Check console for errors
echo.
pause
