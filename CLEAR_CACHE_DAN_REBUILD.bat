@echo off
echo ========================================
echo CLEAR CACHE DAN REBUILD APLIKASI
echo ========================================
echo.

echo [1/5] Menghentikan aplikasi yang berjalan...
taskkill /F /IM node.exe 2>nul
timeout /t 2 >nul

echo.
echo [2/5] Menghapus cache dan build artifacts...
cd frontend
if exist dist rmdir /s /q dist
if exist node_modules\.vite rmdir /s /q node_modules\.vite
if exist .vite rmdir /s /q .vite
cd ..

cd backend
if exist dist rmdir /s /q dist
if exist node_modules\.cache rmdir /s /q node_modules\.cache
cd ..

echo.
echo [3/5] Rebuild frontend...
cd frontend
call npm run build
cd ..

echo.
echo [4/5] Rebuild backend...
cd backend
call npm run build
cd ..

echo.
echo [5/5] Memulai aplikasi...
start cmd /k "cd backend && npm start"
timeout /t 3 >nul
start cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo SELESAI!
echo ========================================
echo.
echo Aplikasi sedang dimulai...
echo Frontend: http://localhost:3002
echo Backend: http://localhost:3001
echo.
echo PENTING: Setelah aplikasi terbuka:
echo 1. Tekan Ctrl+Shift+R untuk hard refresh
echo 2. Atau buka DevTools (F12) ^> Application ^> Clear Storage ^> Clear site data
echo.
pause
