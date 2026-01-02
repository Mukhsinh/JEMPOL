@echo off
echo ========================================
echo DEPLOY VERCEL - FINAL COMPLETE VERSION
echo ========================================
echo.

echo [1/5] Cleaning previous build...
if exist "frontend\dist" rmdir /s /q "frontend\dist"
echo ✓ Cleaned previous build

echo.
echo [2/5] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install root dependencies
    pause
    exit /b 1
)

cd frontend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install frontend dependencies
    cd ..
    pause
    exit /b 1
)
cd ..
echo ✓ Dependencies installed

echo.
echo [3/5] Building frontend...
cd frontend
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Frontend build failed
    cd ..
    pause
    exit /b 1
)
cd ..
echo ✓ Frontend built successfully

echo.
echo [4/5] Verifying build output...
if not exist "frontend\dist\index.html" (
    echo ❌ Build output not found
    pause
    exit /b 1
)
echo ✓ Build output verified

echo.
echo [5/5] Deploying to Vercel...
call vercel --prod
if %errorlevel% neq 0 (
    echo ❌ Vercel deployment failed
    pause
    exit /b 1
)

echo.
echo ========================================
echo ✅ DEPLOYMENT COMPLETED SUCCESSFULLY!
echo ========================================
echo.
echo Your application has been deployed to Vercel.
echo Check the Vercel dashboard for the deployment URL.
echo.
pause