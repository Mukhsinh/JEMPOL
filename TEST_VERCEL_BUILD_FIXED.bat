@echo off
echo ========================================
echo TESTING VERCEL BUILD CONFIGURATION
echo ========================================

echo.
echo 1. Cleaning previous builds...
if exist "frontend\dist" rmdir /s /q "frontend\dist"
if exist "node_modules" rmdir /s /q "node_modules"
if exist "frontend\node_modules" rmdir /s /q "frontend\node_modules"

echo.
echo 2. Installing root dependencies...
call npm install

echo.
echo 3. Running vercel-build command...
call npm run vercel-build

echo.
echo 4. Checking build output...
if exist "frontend\dist" (
    echo ✅ Build successful! Frontend dist directory created.
    dir "frontend\dist"
) else (
    echo ❌ Build failed! Frontend dist directory not found.
    exit /b 1
)

echo.
echo 5. Testing API endpoints...
if exist "api\[...slug].ts" (
    echo ✅ API handler found
) else (
    echo ❌ API handler missing
)

echo.
echo ========================================
echo BUILD TEST COMPLETED
echo ========================================
pause