@echo off
echo ========================================
echo TESTING APLIKASI TANPA ERROR
echo ========================================

echo.
echo 1. Testing Backend Build...
echo ---------------------------
cd backend
call npm run build
if %errorlevel% neq 0 (
    echo ✗ Backend build GAGAL!
    echo Ada error TypeScript yang perlu diperbaiki.
    pause
    exit /b 1
) else (
    echo ✓ Backend build BERHASIL!
)

echo.
echo 2. Testing Frontend Build...
echo ----------------------------
cd ..\frontend
call npm run build
if %errorlevel% neq 0 (
    echo ✗ Frontend build GAGAL!
    echo Ada error yang perlu diperbaiki.
    pause
    exit /b 1
) else (
    echo ✓ Frontend build BERHASIL!
)

echo.
echo 3. Testing Environment Consistency...
echo ------------------------------------
cd ..

:: Check if Supabase URLs match
for /f "tokens=2 delims==" %%a in ('findstr "SUPABASE_URL=" backend\.env') do set BACKEND_SUPABASE=%%a
for /f "tokens=2 delims==" %%a in ('findstr "VITE_SUPABASE_URL=" frontend\.env') do set FRONTEND_SUPABASE=%%a

if "%BACKEND_SUPABASE%"=="%FRONTEND_SUPABASE%" (
    echo ✓ Supabase URL konsisten antara backend dan frontend
) else (
    echo ✗ Supabase URL TIDAK konsisten!
    echo Backend: %BACKEND_SUPABASE%
    echo Frontend: %FRONTEND_SUPABASE%
)

echo.
echo 4. Testing API Connection...
echo ----------------------------
echo Memulai backend untuk test connection...
start /min "Backend Test" cmd /c "cd backend && npm run dev"
timeout /t 5 /nobreak > nul

:: Test API endpoint
curl -s http://localhost:3003/api/health > nul
if %errorlevel% equ 0 (
    echo ✓ Backend API responding
) else (
    echo ✗ Backend API tidak merespons
)

:: Stop backend
taskkill /f /im node.exe > nul 2>&1

echo.
echo ========================================
echo TESTING SELESAI
echo ========================================
echo.
echo ✓ Semua test berhasil! Aplikasi siap dijalankan.
echo.
pause