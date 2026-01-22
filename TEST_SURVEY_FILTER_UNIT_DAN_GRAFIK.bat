@echo off
echo ========================================
echo TEST FILTER UNIT DAN GRAFIK KOMPARASI
echo ========================================
echo.

echo [1/3] Membersihkan cache...
cd backend
if exist node_modules\.cache rmdir /s /q node_modules\.cache
cd ..

echo.
echo [2/3] Memulai Backend...
cd backend
start "Backend Server" cmd /k "npm run dev"
timeout /t 5 /nobreak >nul
cd ..

echo.
echo [3/3] Memulai Frontend...
cd frontend
start "Frontend Server" cmd /k "npm run dev"
timeout /t 3 /nobreak >nul
cd ..

echo.
echo ========================================
echo APLIKASI BERHASIL DIJALANKAN!
echo ========================================
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3002
echo.
echo CARA TEST:
echo 1. Buka: http://localhost:3002/survey/report
echo 2. Pilih filter "Unit Kerja" = Semua Unit
echo    - Grafik akan menampilkan komparasi per unit
echo 3. Pilih filter "Unit Kerja" = Unit tertentu
echo    - Grafik akan menampilkan komparasi per jenis layanan
echo 4. Pilih filter "Jenis Layanan" 
echo    - Data akan terfilter sesuai jenis layanan
echo.
echo Tekan tombol apapun untuk menutup...
pause >nul
