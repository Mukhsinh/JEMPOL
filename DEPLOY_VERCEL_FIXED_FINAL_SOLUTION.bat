@echo off
echo ========================================
echo DEPLOY VERCEL - SOLUSI FINAL
echo ========================================

echo.
echo [1/6] Membersihkan cache dan node_modules...
if exist node_modules rmdir /s /q node_modules
if exist frontend\node_modules rmdir /s /q frontend\node_modules
if exist backend\node_modules rmdir /s /q backend\node_modules

echo.
echo [2/6] Install dependencies root...
call npm install

echo.
echo [3/6] Install dependencies frontend...
cd frontend
call npm install
cd ..

echo.
echo [4/6] Install dependencies backend...
cd backend
call npm install
cd ..

echo.
echo [5/6] Test build frontend...
cd frontend
call npm run build
if errorlevel 1 (
    echo ERROR: Frontend build gagal!
    cd ..
    pause
    exit /b 1
)
cd ..

echo.
echo [6/6] Deploy ke Vercel...
call vercel --prod

echo.
echo ========================================
echo DEPLOY SELESAI!
echo ========================================
pause