@echo off
echo ========================================
echo   TEST BUILD UNTUK VERCEL - JEMPOL
echo ========================================
echo.
echo Testing build process sebelum deploy...
echo.

echo 1. Building Frontend...
echo.
cd frontend
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Frontend build FAILED!
    echo.
    pause
    exit /b 1
)

echo.
echo ✅ Frontend build SUCCESS!
echo.
echo 2. Testing Frontend Preview...
echo.
echo Starting preview server...
echo Buka browser: http://localhost:4173
echo.
echo Tekan Ctrl+C untuk stop preview
echo.

start cmd /k "npm run preview"

cd ..

echo.
echo ========================================
echo   BUILD TEST SELESAI
echo ========================================
echo.
echo Frontend build: ✅ SUCCESS
echo Preview server: Running di http://localhost:4173
echo.
echo Test Checklist:
echo [ ] Halaman home tampil
echo [ ] PDF viewer berfungsi
echo [ ] Video player berfungsi
echo [ ] Photo gallery berfungsi
echo [ ] Registration form berfungsi
echo [ ] Mobile responsive (test di DevTools)
echo [ ] No horizontal scroll
echo [ ] No console errors
echo.
echo Jika semua OK, siap deploy ke Vercel!
echo.
pause
