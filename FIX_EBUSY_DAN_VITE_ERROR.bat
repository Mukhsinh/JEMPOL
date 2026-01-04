@echo off
echo ========================================
echo MEMPERBAIKI MASALAH EBUSY DAN VITE ERROR
echo ========================================

echo.
echo [1/8] Menghentikan semua proses Node.js yang berjalan...
taskkill /f /im node.exe 2>nul
taskkill /f /im npm.exe 2>nul
timeout /t 2 /nobreak > nul

echo.
echo [2/8] Membersihkan lock files...
if exist package-lock.json del package-lock.json
if exist frontend\package-lock.json del frontend\package-lock.json
if exist backend\package-lock.json del backend\package-lock.json
if exist yarn.lock del yarn.lock
if exist frontend\yarn.lock del frontend\yarn.lock
if exist backend\yarn.lock del backend\yarn.lock

echo.
echo [3/8] Membersihkan node_modules...
if exist node_modules (
    echo Menghapus node_modules root...
    rmdir /s /q node_modules
)
if exist frontend\node_modules (
    echo Menghapus frontend\node_modules...
    rmdir /s /q frontend\node_modules
)
if exist backend\node_modules (
    echo Menghapus backend\node_modules...
    rmdir /s /q backend\node_modules
)

echo.
echo [4/8] Membersihkan cache npm...
npm cache clean --force

echo.
echo [5/8] Membersihkan temporary files...
if exist %TEMP%\npm-* rmdir /s /q %TEMP%\npm-*
if exist %APPDATA%\npm-cache rmdir /s /q %APPDATA%\npm-cache

echo.
echo [6/8] Install dependencies dengan npm ci untuk konsistensi...
echo Installing root dependencies...
npm install

echo.
echo [7/8] Install frontend dependencies...
cd frontend
npm install
if errorlevel 1 (
    echo Mencoba dengan --force flag...
    npm install --force
)
cd ..

echo.
echo [8/8] Install backend dependencies...
cd backend
npm install
if errorlevel 1 (
    echo Mencoba dengan --force flag...
    npm install --force
)
cd ..

echo.
echo ========================================
echo PERBAIKAN SELESAI!
echo ========================================
echo.
echo Sekarang jalankan: FIX_TIMEOUT_DAN_LOADING_ISSUE.bat
echo untuk memulai aplikasi dengan konfigurasi yang diperbaiki.
echo.
pause