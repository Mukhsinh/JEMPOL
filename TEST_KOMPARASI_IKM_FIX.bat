@echo off
echo ========================================
echo TEST KOMPARASI IKM - DATA RIIL
echo ========================================
echo.
echo Membuka test komparasi IKM...
echo.

start test-ikm-komparasi-fix.html

echo.
echo ✅ Test file dibuka di browser
echo.
echo Instruksi:
echo 1. Pastikan backend sudah berjalan di port 3001
echo 2. Klik tombol "Test Komparasi IKM" untuk test dengan filter
echo 3. Klik "Test Semua Unit" untuk melihat semua unit
echo 4. Pilih unit tertentu lalu klik "Test Per Jenis Layanan"
echo.
echo Perbaikan yang dilakukan:
echo - Filter data dengan unit_id null
echo - Skip survey tanpa score valid
echo - Hitung IKM dari data riil database
echo - Grouping dinamis (unit atau service_type)
echo.
pause
