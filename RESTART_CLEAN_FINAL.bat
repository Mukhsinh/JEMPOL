@echo off
echo ========================================
echo RESTART APLIKASI - BERSIHKAN CACHE
echo ========================================
echo.

echo [1/5] Hentikan semua proses Node.js...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo [2/5] Hapus cache Vite dan build...
if exist "frontend\node_modules\.vite" rmdir /s /q "frontend\node_modules\.vite"
if exist "frontend\dist" rmdir /s /q "frontend\dist"

echo [3/5] Mulai Backend...
cd backend
start "Backend Server" cmd /k "npm run dev"
cd ..
timeout /t 5 /nobreak >nul

echo [4/5] Mulai Frontend...
cd frontend
start "Frontend Server" cmd /k "npm run dev"
cd ..

echo [5/5] Tunggu server siap...
timeout /t 8 /nobreak >nul

echo.
echo ========================================
echo APLIKASI SIAP!
echo ========================================
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3006
echo.
echo Tekan tombol apapun untuk menutup...
pause >nul
