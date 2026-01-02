@echo off
echo Committing Vercel Deploy Fix and Deploying...
echo.

echo Step 1: Testing build locally first...
call TEST_VERCEL_BUILD.bat
if %errorlevel% neq 0 (
    echo ERROR: Local build test failed. Fix issues before deploying.
    pause
    exit /b 1
)

echo.
echo Step 2: Adding files to git...
git add .
if %errorlevel% neq 0 (
    echo ERROR: Git add failed
    pause
    exit /b 1
)

echo.
echo Step 3: Committing changes...
git commit -m "Fix Vercel deploy: Update build commands for monorepo structure

- Fix vercel.json buildCommand to use npm run vercel-build
- Update package.json vercel-build script to use workspace commands
- Add production environment variables
- Fix Vite config outDir specification
- Remove problematic cd frontend commands

Fixes: sh: line 1: cd: frontend: No such file or directory"

if %errorlevel% neq 0 (
    echo ERROR: Git commit failed
    pause
    exit /b 1
)

echo.
echo Step 4: Pushing to GitHub...
git push origin main
if %errorlevel% neq 0 (
    echo ERROR: Git push failed
    pause
    exit /b 1
)

echo.
echo SUCCESS: Changes committed and pushed to GitHub!
echo.
echo Vercel should automatically deploy the changes.
echo Check Vercel dashboard for deployment status.
echo.
echo If deployment still fails, check:
echo 1. Environment variables in Vercel dashboard
echo 2. Build logs for any new errors
echo 3. Ensure all dependencies are properly listed
echo.
pause