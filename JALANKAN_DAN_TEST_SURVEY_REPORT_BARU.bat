@echo off
chcp 65001 >nul
echo ========================================
echo JALANKAN DAN TEST SURVEY REPORT
echo Fitur Baru: Filter Unit + Grafik IKM
echo ========================================
echo.

echo [1/3] Memulai Backend...
cd backend
start "Backend Server" cmd /k "npm run dev"
cd ..
timeout /t 5 /nobreak >nul

echo [2/3] Memulai Frontend...
cd frontend
start "Frontend Server" cmd /k "npm run dev"
cd ..
timeout /t 8 /nobreak >nul

echo [3/3] Membuka Test Pages...
timeout /t 3 /nobreak >nul

echo.
echo Membuka test API endpoint...
start test-survey-ikm-by-unit.html
timeout /t 2 /nobreak >nul

echo.
echo Membuka halaman Survey Report...
start http://localhost:3002/survey/report

echo.
echo ========================================
echo ✅ APLIKASI BERJALAN
echo ========================================
echo.
echo 📍 Backend: http://localhost:3001
echo 📍 Frontend: http://localhost:3002
echo 📍 Survey Report: http://localhost:3002/survey/report
echo.
echo ========================================
echo FITUR BARU YANG DITAMBAHKAN:
echo ========================================
echo.
echo 1️⃣  FILTER UNIT KERJA
echo    - Dropdown filter unit di bagian atas
echo    - Filter data survey berdasarkan unit
echo    - Otomatis update statistik
echo.
echo 2️⃣  GRAFIK KOMPARASI IKM PER UNIT
echo    - Grafik batang horizontal
echo    - Warna hijau untuk unit tertinggi
echo    - Warna orange untuk unit terendah
echo    - Menampilkan jumlah responden
echo    - Sorting otomatis dari tertinggi
echo.
echo ========================================
echo CARA TEST:
echo ========================================
echo.
echo 1. Buka halaman Survey Report
echo 2. Lihat filter "Unit Kerja" (dropdown baru)
echo 3. Pilih unit tertentu untuk filter
echo 4. Scroll ke bawah lihat grafik baru
echo 5. Grafik menampilkan komparasi IKM
echo.
echo ========================================
pause
