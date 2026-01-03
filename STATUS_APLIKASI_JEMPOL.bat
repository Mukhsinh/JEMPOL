@echo off
echo ========================================
echo    STATUS APLIKASI JEMPOL
echo ========================================
echo.
echo Memeriksa status aplikasi...
echo.

REM Cek apakah frontend berjalan
echo Mengecek Frontend (Port 3003)...
netstat -an | findstr ":3003" >nul
if %errorlevel%==0 (
    echo ✓ Frontend: BERJALAN di http://localhost:3003/
) else (
    echo ✗ Frontend: TIDAK BERJALAN
)

REM Cek apakah backend berjalan  
echo Mengecek Backend (Port 3004)...
netstat -an | findstr ":3004" >nul
if %errorlevel%==0 (
    echo ✓ Backend: BERJALAN di http://localhost:3004/
) else (
    echo ✗ Backend: TIDAK BERJALAN
)

echo.
echo Database: Supabase (https://jxxzbdivafzzwqhagwrf.supabase.co)
echo.
echo Untuk menjalankan aplikasi: npm run dev
echo Untuk membuka aplikasi: BUKA_APLIKASI_JEMPOL.bat
echo.
pause