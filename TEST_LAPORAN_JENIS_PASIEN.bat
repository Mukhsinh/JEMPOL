@echo off
echo ========================================
echo TEST LAPORAN DENGAN JENIS PASIEN
echo ========================================
echo.
echo Membuka halaman Laporan dengan:
echo 1. Kolom Kategori (sudah terintegrasi dengan external_tickets)
echo 2. Kolom Jenis Pasien di tabel detail
echo 3. Grafik Komparasi Jenis Pasien
echo.
echo Pastikan:
echo - Kolom kategori menampilkan data dari service_categories
echo - Kolom jenis pasien menampilkan data dari patient_types
echo - Grafik jenis pasien menampilkan distribusi tiket eksternal
echo.
start http://localhost:3002/reports
echo.
echo Halaman Laporan dibuka di browser!
pause
