@echo off
echo ========================================
echo PERBAIKAN LOGIN ERROR - UNIT_ID
echo ========================================
echo.

echo [1/4] Menghapus cache frontend...
cd frontend
if exist node_modules\.vite rmdir /s /q node_modules\.vite
if exist dist rmdir /s /q dist
echo Cache frontend dihapus!
echo.

echo [2/4] Menghapus cache backend...
cd ..\backend
if exist dist rmdir /s /q dist
echo Cache backend dihapus!
echo.

echo [3/4] Memulai backend...
cd ..
start "Backend Server" cmd /k "cd backend && npm run dev"
timeout /t 5 /nobreak >nul
echo.

echo [4/4] Memulai frontend...
start "Frontend Server" cmd /k "cd frontend && npm run dev"
echo.

echo ========================================
echo APLIKASI SEDANG DIMULAI
echo ========================================
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Tunggu beberapa saat, lalu buka browser dan test login
echo Email: admin@jempol.com
echo Password: Admin123!@#
echo.
pause
