@echo off
echo ========================================
echo DEPLOY VERCEL - FINAL FIXED VERSION
echo ========================================

echo.
echo [1/4] Testing build locally...
cd frontend
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Build failed locally!
    pause
    exit /b 1
)
cd ..

echo.
echo [2/4] Adding changes to git...
git add .
git status

echo.
echo [3/4] Committing changes...
git commit -m "Fix Vercel deploy: Update build command and output directory"

echo.
echo [4/4] Pushing to GitHub (will trigger Vercel deploy)...
git push origin main

echo.
echo ========================================
echo DEPLOY COMPLETED!
echo ========================================
echo.
echo Check Vercel dashboard for deployment status:
echo https://vercel.com/dashboard
echo.
pause