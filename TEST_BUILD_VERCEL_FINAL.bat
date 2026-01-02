@echo off
echo ========================================
echo TESTING VERCEL BUILD CONFIGURATION
echo ========================================

echo.
echo [1/4] Testing frontend build locally...
cd frontend
call npm install
if errorlevel 1 (
    echo ERROR: Frontend npm install failed
    pause
    exit /b 1
)

call npm run build
if errorlevel 1 (
    echo ERROR: Frontend build failed
    pause
    exit /b 1
)

echo.
echo [2/4] Checking if dist directory exists...
if exist "dist" (
    echo SUCCESS: dist directory found
    dir dist
) else (
    echo ERROR: dist directory not found
    pause
    exit /b 1
)

cd ..

echo.
echo [3/4] Testing root build command...
call npm install
if errorlevel 1 (
    echo ERROR: Root npm install failed
    pause
    exit /b 1
)

echo.
echo [4/4] Testing Vercel build command...
cd frontend && npm install && npm run build
if errorlevel 1 (
    echo ERROR: Vercel build command failed
    pause
    exit /b 1
)

cd ..

echo.
echo ========================================
echo BUILD TEST COMPLETED SUCCESSFULLY!
echo ========================================
echo.
echo Ready for Vercel deployment!
echo.
pause