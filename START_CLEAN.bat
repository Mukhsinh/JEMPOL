@echo off
echo ========================================
echo   JEMPOL - Clean Start
echo ========================================
echo.

echo [1/4] Menghentikan semua proses Node.js...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul
echo Proses dihentikan!

echo.
echo [2/4] Membersihkan cache...
if exist "frontend\node_modules\.vite" rmdir /s /q "frontend\node_modules\.vite"
if exist "frontend\dist" rmdir /s /q "frontend\dist"
echo Cache dibersihkan!

echo.
echo [3/4] Memulai Backend Server...
start "JEMPOL Backend" cmd /k "cd backend && npm run dev"
timeout /t 5 /nobreak >nul

echo [4/4] Memulai Frontend Server...
start "JEMPOL Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo   Aplikasi sedang dimulai...
echo ========================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3001
echo Admin:    http://localhost:3001/admin
echo Game:     http://localhost:3001/game
echo.
echo Tunggu 5-10 detik, lalu buka browser ke:
echo http://localhost:3001
echo.
echo Tekan Ctrl+Shift+R di browser untuk refresh cache
echo.
pause
