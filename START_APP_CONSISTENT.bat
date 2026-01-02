@echo off
echo ========================================
echo MEMULAI APLIKASI DENGAN ENV KONSISTEN
echo ========================================

echo.
echo 1. Memeriksa Dependencies...
echo ----------------------------
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo ✗ Error installing frontend dependencies
    pause
    exit /b 1
)

cd ..\backend
call npm install
if %errorlevel% neq 0 (
    echo ✗ Error installing backend dependencies
    pause
    exit /b 1
)

echo.
echo 2. Building Backend...
echo ---------------------
call npm run build
if %errorlevel% neq 0 (
    echo ✗ Error building backend
    pause
    exit /b 1
)

echo.
echo 3. Building Frontend...
echo ----------------------
cd ..\frontend
call npm run build
if %errorlevel% neq 0 (
    echo ✗ Error building frontend
    pause
    exit /b 1
)

echo.
echo ✓ Build berhasil! Environment sudah konsisten.
echo.
echo 4. Memulai Aplikasi...
echo ---------------------
cd ..
start "Backend Server" cmd /k "cd backend && npm run dev"
timeout /t 3 /nobreak > nul
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo.
echo ✓ Aplikasi dimulai!
echo ✓ Backend: http://localhost:3003
echo ✓ Frontend: http://localhost:3001
echo.
echo Tekan tombol apapun untuk menutup...
pause