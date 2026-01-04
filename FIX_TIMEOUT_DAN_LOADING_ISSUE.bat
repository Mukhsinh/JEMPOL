@echo off
echo ========================================
echo MEMPERBAIKI MASALAH TIMEOUT DAN LOADING
echo ========================================

echo.
echo [1/6] Membersihkan cache npm dan node_modules...
if exist node_modules rmdir /s /q node_modules
if exist frontend\node_modules rmdir /s /q frontend\node_modules
if exist backend\node_modules rmdir /s /q backend\node_modules

echo.
echo [2/6] Membersihkan cache npm...
npm cache clean --force

echo.
echo [3/6] Menginstall dependencies root...
npm install

echo.
echo [4/6] Menginstall dependencies frontend...
cd frontend
npm install
cd ..

echo.
echo [5/6] Menginstall dependencies backend...
cd backend
npm install
cd ..

echo.
echo [6/6] Memulai aplikasi dengan konfigurasi yang diperbaiki...
echo Frontend akan berjalan di: http://localhost:3001
echo Backend akan berjalan di: http://localhost:3004
echo.

start "Backend Server" cmd /k "cd backend && npm run dev"
timeout /t 5 /nobreak > nul
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo APLIKASI SEDANG DIMULAI...
echo ========================================
echo.
echo Tunggu beberapa saat hingga kedua server berjalan.
echo Jika masih ada masalah timeout, coba restart aplikasi.
echo.
pause