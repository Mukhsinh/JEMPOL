@echo off
echo ========================================
echo Restart Aplikasi JEMPOL
echo ========================================
echo.

echo [1/3] Menghentikan semua proses Node.js...
taskkill /F /IM node.exe 2>nul
timeout /t 3 /nobreak >nul
echo Proses dihentikan!

echo.
echo [2/3] Membersihkan cache Vite...
if exist "frontend\node_modules\.vite" rmdir /s /q "frontend\node_modules\.vite"
if exist "frontend\dist" rmdir /s /q "frontend\dist"
echo Cache dibersihkan!

echo.
echo [3/3] Memulai ulang aplikasi...
echo.
call START_ALL.bat
