@echo off
echo ========================================
echo DEPLOY TO VERCEL - FINAL FIXED VERSION
echo ========================================

echo.
echo [1/5] Testing build locally first...
call TEST_BUILD_VERCEL_FINAL.bat
if errorlevel 1 (
    echo ERROR: Local build test failed
    pause
    exit /b 1
)

echo.
echo [2/5] Adding changes to git...
git add .
if errorlevel 1 (
    echo ERROR: Git add failed
    pause
    exit /b 1
)

echo.
echo [3/5] Committing changes...
git commit -m "Fix Vercel deployment: Update build command and remove NODE_ENV from .env.production"
if errorlevel 1 (
    echo WARNING: Git commit failed (maybe no changes)
)

echo.
echo [4/5] Pushing to GitHub...
git push origin main
if errorlevel 1 (
    echo ERROR: Git push failed
    pause
    exit /b 1
)

echo.
echo [5/5] Deployment completed!
echo ========================================
echo.
echo Changes pushed to GitHub successfully!
echo Vercel will automatically deploy the changes.
echo.
echo Fixed issues:
echo - Updated buildCommand in vercel.json
echo - Removed NODE_ENV from .env.production
echo - Ensured proper output directory configuration
echo.
echo Check your Vercel dashboard for deployment status.
echo.
pause