@echo off
echo ========================================
echo RESTART APLIKASI - FIX LACAK TIKET
echo ========================================
echo.

echo [1/3] Menghentikan semua proses Node.js...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo [2/3] Memulai Backend (Port 3004)...
cd backend
start "Backend Server" cmd /k "npm run dev"
timeout /t 5 /nobreak >nul

echo.
echo [3/3] Memulai Frontend (Port 3002)...
cd ..\frontend
start "Frontend Server" cmd /k "npm run dev"

echo.
echo ========================================
echo APLIKASI BERHASIL DIRESTART!
echo ========================================
echo.
echo Backend: http://localhost:3004
echo Frontend: http://localhost:3002
echo Lacak Tiket: http://localhost:3002/lacak-tiket
echo.
echo Tunggu beberapa detik untuk aplikasi siap...
timeout /t 10 /nobreak >nul

echo.
echo Membuka halaman Lacak Tiket...
start http://localhost:3002/lacak-tiket

echo.
pause
