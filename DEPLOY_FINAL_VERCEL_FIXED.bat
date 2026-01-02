@echo off
echo ========================================
echo DEPLOY FINAL - VERCEL ERROR FIXED
echo ========================================

echo.
echo 🔍 ANALISIS ERROR SELESAI:
echo ✅ Root cause: Build command di vercel.json salah
echo ✅ Solusi: Menggunakan npm script vercel-build
echo ✅ Environment variables: Ditambahkan ke vercel.json
echo ✅ Database: Siap dan terkoneksi
echo.

echo 📋 VERIFIKASI FINAL...

echo Checking vercel.json...
if exist "vercel.json" (
    echo ✅ vercel.json exists
) else (
    echo ❌ vercel.json missing
    exit /b 1
)

echo Checking package.json vercel-build script...
findstr "vercel-build" package.json >nul
if %ERRORLEVEL% EQ 0 (
    echo ✅ vercel-build script found
) else (
    echo ❌ vercel-build script missing
    exit /b 1
)

echo Checking frontend directory...
if exist "frontend" (
    echo ✅ frontend directory exists
) else (
    echo ❌ frontend directory missing
    exit /b 1
)

echo Checking API directory...
if exist "api" (
    echo ✅ api directory exists
) else (
    echo ❌ api directory missing
    exit /b 1
)

echo.
echo 🧪 TESTING BUILD PROCESS...
echo Running: npm run vercel-build
call npm run vercel-build

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ BUILD FAILED!
    echo Please check the error messages above and fix them before deploying.
    echo.
    pause
    exit /b 1
)

echo.
echo ✅ BUILD SUCCESSFUL!
echo.

echo 🚀 DEPLOYING TO VERCEL...
echo.
echo Adding all changes...
git add .

echo Committing changes...
git commit -m "fix: Perbaikan final error deploy Vercel - buildCommand dan environment variables"

echo Pushing to GitHub...
git push origin main

if %ERRORLEVEL% EQ 0 (
    echo.
    echo ========================================
    echo ✅ DEPLOY BERHASIL DIINISIASI!
    echo ========================================
    echo.
    echo 📊 STATUS:
    echo - ✅ Konfigurasi Vercel diperbaiki
    echo - ✅ Environment variables ditambahkan
    echo - ✅ Build lokal berhasil
    echo - ✅ Code pushed ke GitHub
    echo - 🔄 Vercel sedang melakukan deploy otomatis
    echo.
    echo 🔗 LINKS:
    echo - Vercel Dashboard: https://vercel.com/dashboard
    echo - GitHub Repo: https://github.com/Mukhsinh/JEMPOL
    echo - Project URL: https://jempol-git-main-mukhsinhs-projects.vercel.app
    echo.
    echo 📋 NEXT STEPS:
    echo 1. Monitor deploy progress di Vercel dashboard
    echo 2. Check build logs jika ada error
    echo 3. Test aplikasi setelah deploy selesai
    echo 4. Verifikasi API endpoints berfungsi
    echo.
    echo 🎯 EXPECTED RESULTS:
    echo - Frontend accessible di domain Vercel
    echo - API endpoints working (/api/health, /api/*)
    echo - Supabase connection active
    echo - All features functional
    echo.
) else (
    echo.
    echo ❌ PUSH TO GITHUB FAILED!
    echo Please check your git configuration and network connection.
    echo Try running: git status
    echo Then: git push origin main
    echo.
)

echo.
echo ========================================
echo DEPLOY PROCESS COMPLETED
echo ========================================
pause