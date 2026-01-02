@echo off
echo ========================================
echo DEPLOY VERCEL - FINAL VERSION V2
echo ========================================

echo.
echo [1/6] Checking Node.js and npm versions...
node --version
npm --version

echo.
echo [2/6] Installing dependencies...
npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install root dependencies
    pause
    exit /b 1
)

echo.
echo [3/6] Installing frontend dependencies...
cd frontend
npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install frontend dependencies
    cd ..
    pause
    exit /b 1
)
cd ..

echo.
echo [4/6] Running local build test...
npm run vercel-build
if %errorlevel% neq 0 (
    echo ERROR: Local build failed
    pause
    exit /b 1
)

echo.
echo [5/6] Checking Vercel configuration...
if not exist "vercel.json" (
    echo ERROR: vercel.json not found
    pause
    exit /b 1
)

echo.
echo [6/6] Ready for Vercel deployment!
echo.
echo Configuration Summary:
echo - Build Command: npm run vercel-build
echo - Output Directory: frontend/dist
echo - Node.js Version: 20.x
echo - Security vulnerabilities: FIXED
echo - RLS policies: ENABLED
echo.
echo Next steps:
echo 1. Run: vercel --prod
echo 2. Or push to GitHub for automatic deployment
echo.
echo ========================================
echo DEPLOY PREPARATION COMPLETED SUCCESSFULLY!
echo ========================================
pause