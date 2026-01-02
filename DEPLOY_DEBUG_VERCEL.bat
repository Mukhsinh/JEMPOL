@echo off
echo ========================================
echo VERCEL DEPLOY DEBUG SCRIPT
echo ========================================

echo.
echo 1. Cleaning previous build...
if exist "frontend\dist" rmdir /s /q "frontend\dist"

echo.
echo 2. Installing dependencies...
npm install

echo.
echo 3. Building frontend...
cd frontend
npm install
npm run build

echo.
echo 4. Checking build output...
if exist "dist" (
    echo ✓ Build successful! Files in frontend/dist:
    dir dist /b
    echo.
    echo 5. Checking index.html...
    if exist "dist\index.html" (
        echo ✓ index.html found
    ) else (
        echo ✗ index.html NOT found
    )
) else (
    echo ✗ Build failed! No dist directory found
    exit /b 1
)

cd ..

echo.
echo 6. Ready for Vercel deployment!
echo Run: vercel --prod
echo.
pause