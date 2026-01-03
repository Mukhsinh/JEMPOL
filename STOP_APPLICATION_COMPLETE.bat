@echo off
echo ========================================
echo    MENGHENTIKAN APLIKASI
echo ========================================
echo.

echo Menghentikan semua proses Node.js...
taskkill /f /im node.exe 2>nul
taskkill /f /im npm.cmd 2>nul

echo.
echo Menghentikan proses development server...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3001" ^| find "LISTENING"') do taskkill /f /pid %%a 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3003" ^| find "LISTENING"') do taskkill /f /pid %%a 2>nul

echo.
echo ========================================
echo    APLIKASI BERHASIL DIHENTIKAN!
echo ========================================
echo.
pause