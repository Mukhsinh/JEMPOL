@echo off
echo ========================================
echo TEST SURVEY REPORT - FITUR BARU
echo ========================================
echo.
echo Fitur yang ditambahkan:
echo 1. Filter Unit Kerja
echo 2. Grafik Komparasi IKM per Unit
echo.
echo ========================================
echo.

echo Membuka browser untuk test...
timeout /t 2 /nobreak >nul

start http://localhost:3002/survey/report

echo.
echo ========================================
echo PETUNJUK TEST:
echo ========================================
echo 1. Cek filter "Unit Kerja" di bagian filter
echo 2. Pilih unit tertentu untuk filter data
echo 3. Lihat grafik "Komparasi IKM Per Unit Kerja"
echo 4. Grafik menampilkan:
echo    - Bar chart horizontal
echo    - Unit tertinggi (hijau)
echo    - Unit terendah (orange)
echo    - Jumlah responden per unit
echo ========================================
echo.
pause
