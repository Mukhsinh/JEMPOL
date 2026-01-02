@echo off
echo Testing Vercel Build Process...
echo.

echo Step 1: Installing root dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Root npm install failed
    pause
    exit /b 1
)

echo.
echo Step 2: Building frontend...
call npm run build:frontend
if %errorlevel% neq 0 (
    echo ERROR: Frontend build failed
    pause
    exit /b 1
)

echo.
echo Step 3: Checking build output...
if exist "frontend\dist" (
    echo SUCCESS: Frontend dist folder exists
    dir "frontend\dist"
) else (
    echo ERROR: Frontend dist folder not found
    pause
    exit /b 1
)

echo.
echo Step 4: Testing vercel-build script...
call npm run vercel-build
if %errorlevel% neq 0 (
    echo ERROR: Vercel build script failed
    pause
    exit /b 1
)

echo.
echo SUCCESS: All build steps completed successfully!
echo Ready for Vercel deployment.
pause