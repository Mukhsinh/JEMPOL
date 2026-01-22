@echo off
echo ========================================
echo TEST PERBAIKAN GRAFIK DAN KATEGORI
echo ========================================
echo.
echo Perbaikan yang dilakukan:
echo 1. Kolom kategori menampilkan data dari external_tickets dengan benar
echo 2. Menambahkan kolom jenis pasien di tabel detail
echo 3. Menambahkan grafik komparasi jenis pasien
echo.
echo ========================================
echo MEMULAI BACKEND...
echo ========================================
cd backend
start cmd /k "npm run dev"
timeout /t 5 /nobreak >nul

echo.
echo ========================================
echo MEMULAI FRONTEND...
echo ========================================
cd ../frontend
start cmd /k "npm run dev"
timeout /t 5 /nobreak >nul

echo.
echo ========================================
echo APLIKASI SIAP DITEST!
echo ========================================
echo.
echo Buka browser dan akses:
echo - Frontend: http://localhost:3002
echo - Halaman Reports: http://localhost:3002/reports
echo.
echo Yang sudah diperbaiki:
echo [✓] Kolom kategori di tabel detail menampilkan kategori dari tiket eksternal
echo [✓] Kolom jenis pasien ditambahkan di tabel detail
echo [✓] Grafik komparasi jenis pasien ditambahkan
echo [✓] Integrasi frontend-backend untuk patient type trends
echo.
echo Tekan tombol apapun untuk menutup...
pause >nul
