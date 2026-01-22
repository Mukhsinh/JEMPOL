@echo off
echo ========================================
echo RESTART APLIKASI DAN TEST IMPORT
echo ========================================
echo.

echo Menghentikan semua proses Node.js...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo.
echo Memulai Backend...
cd backend
start "Backend Server" cmd /k "npm run dev"
timeout /t 5 /nobreak >nul

echo.
echo Memulai Frontend...
cd ..\frontend
start "Frontend Server" cmd /k "npm run dev"
timeout /t 10 /nobreak >nul

echo.
echo Membuka halaman Unit Kerja...
start http://localhost:3002/master-data/units

echo.
echo ========================================
echo APLIKASI SUDAH BERJALAN!
echo ========================================
echo.
echo Backend: http://localhost:3001
echo Frontend: http://localhost:3002
echo.
echo TOMBOL YANG TERSEDIA:
echo 1. Template Data - Download template CSV
echo 2. Import - Upload file CSV/Excel
echo 3. Ekspor - Export data ke CSV
echo 4. Tambah Unit Baru - Tambah unit manual
echo.
echo ========================================
pause
