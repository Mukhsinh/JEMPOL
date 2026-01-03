@echo off
echo ========================================
echo PERBAIKAN LOGIN API KEY - FINAL
echo ========================================
echo.
echo Menjalankan perbaikan untuk masalah "No API key found in request"
echo.

echo 1. Stopping aplikasi yang sedang berjalan...
taskkill /f /im node.exe 2>nul
taskkill /f /im npm.exe 2>nul
timeout /t 2 >nul

echo.
echo 2. Membersihkan cache dan node_modules...
if exist "frontend\node_modules\.cache" (
    rmdir /s /q "frontend\node_modules\.cache"
    echo Cache frontend dibersihkan
)

if exist "backend\node_modules\.cache" (
    rmdir /s /q "backend\node_modules\.cache"
    echo Cache backend dibersihkan
)

echo.
echo 3. Starting backend server...
cd backend
start "Backend Server" cmd /k "npm run dev"
cd ..

echo Menunggu backend server siap...
timeout /t 5 >nul

echo.
echo 4. Starting frontend server...
cd frontend
start "Frontend Server" cmd /k "npm run dev"
cd ..

echo Menunggu frontend server siap...
timeout /t 8 >nul

echo.
echo 5. Membuka test untuk verifikasi perbaikan...
start "" "test-login-api-key-fix.html"

echo.
echo ========================================
echo PERBAIKAN SELESAI!
echo ========================================
echo.
echo Yang sudah diperbaiki:
echo - API key selalu dikirim dalam setiap request
echo - Authorization header diperbaiki
echo - Session handling yang lebih robust
echo - Retry mechanism untuk request yang gagal
echo.
echo Silakan test login di:
echo - Test page: test-login-api-key-fix.html
echo - Aplikasi utama: http://localhost:3001
echo.
echo Jika masih ada masalah, periksa console browser untuk error details
echo ========================================

pause