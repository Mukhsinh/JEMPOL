@echo off
echo ========================================
echo DEPLOY VERCEL - ERROR FIXED
echo ========================================

echo.
echo 🔧 PERBAIKAN YANG DITERAPKAN:
echo - Fixed vercel.json buildCommand
echo - Added Supabase environment variables
echo - Updated .env.production
echo - Created proper build script
echo.

echo 📋 CHECKING FILES...
if exist "vercel.json" (
    echo ✅ vercel.json - Updated
) else (
    echo ❌ vercel.json - Missing
    exit /b 1
)

if exist "frontend\.env.production" (
    echo ✅ frontend/.env.production - Updated
) else (
    echo ❌ frontend/.env.production - Missing
    exit /b 1
)

echo.
echo 🧪 TESTING BUILD LOCALLY...
call npm run vercel-build
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Local build failed! Please fix errors before deploying.
    pause
    exit /b 1
)

echo ✅ Local build successful!
echo.

echo 🚀 COMMITTING CHANGES...
git add .
git commit -m "fix: Perbaikan konfigurasi Vercel deploy - buildCommand dan environment variables"

echo.
echo 📤 PUSHING TO GITHUB...
git push origin main

if %ERRORLEVEL% EQ 0 (
    echo.
    echo ========================================
    echo ✅ DEPLOY INITIATED SUCCESSFULLY!
    echo ========================================
    echo.
    echo 📊 NEXT STEPS:
    echo 1. Monitor deploy progress di Vercel dashboard
    echo 2. Check build logs jika ada error
    echo 3. Test aplikasi setelah deploy selesai
    echo.
    echo 🔗 USEFUL LINKS:
    echo - Vercel Dashboard: https://vercel.com/dashboard
    echo - Project URL: https://jempol-git-main-mukhsinhs-projects.vercel.app
    echo.
) else (
    echo ❌ Push to GitHub failed!
    echo Please check your git configuration and try again.
)

pause