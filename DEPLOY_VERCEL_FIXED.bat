@echo off
echo ========================================
echo DEPLOY VERCEL - CONFIGURATION FIXED
echo ========================================

echo.
echo 1. Testing build locally...
npm run build:frontend

if %ERRORLEVEL% NEQ 0 (
    echo ✗ Build failed! Please check errors above.
    pause
    exit /b 1
)

echo.
echo ✓ Build successful!

echo.
echo 2. Checking required files...
if exist "frontend\dist\index.html" (
    echo ✓ index.html found
) else (
    echo ✗ index.html NOT found
    pause
    exit /b 1
)

echo.
echo 3. Committing changes...
git add .
git commit -m "Fix Vercel deployment configuration - update vercel.json and build process"

echo.
echo 4. Pushing to GitHub...
git push origin main

echo.
echo 5. Ready for Vercel deployment!
echo.
echo Configuration changes made:
echo - Updated vercel.json with correct buildCommand and outputDirectory
echo - Fixed .vercelignore to include frontend/dist
echo - Verified build process works correctly
echo.
echo Next steps:
echo 1. Go to Vercel dashboard
echo 2. Trigger new deployment or it will auto-deploy from GitHub
echo 3. Deployment should now succeed!
echo.
pause