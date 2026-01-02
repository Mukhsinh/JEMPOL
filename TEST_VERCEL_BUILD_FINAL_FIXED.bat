@echo off
echo ========================================
echo TESTING VERCEL BUILD - FINAL FIXED
echo ========================================

echo.
echo [1/4] Cleaning previous build...
if exist "frontend\dist" rmdir /s /q "frontend\dist"

echo.
echo [2/4] Installing dependencies...
npm install

echo.
echo [3/4] Building frontend (Vercel command)...
cd frontend && npm install && npm run build
cd ..

echo.
echo [4/4] Verifying build output...
if exist "frontend\dist\index.html" (
    echo ✓ Build successful! Output directory exists.
    echo ✓ Index.html found in frontend/dist/
    dir "frontend\dist" /b
) else (
    echo ✗ Build failed! No output directory found.
    exit /b 1
)

echo.
echo ========================================
echo BUILD TEST COMPLETED SUCCESSFULLY!
echo ========================================
pause