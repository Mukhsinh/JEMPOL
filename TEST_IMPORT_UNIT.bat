@echo off
echo ========================================
echo TEST IMPORT UNIT KERJA
echo ========================================
echo.
echo Membuka halaman Unit Kerja untuk test import...
echo.
start http://localhost:3002/master-data/units
echo.
echo Instruksi Testing:
echo 1. Klik tombol "Template Data" untuk download template
echo 2. Isi template dengan data unit kerja
echo 3. Klik tombol "Import" dan pilih file yang sudah diisi
echo 4. Tunggu proses import selesai
echo 5. Data akan otomatis ter-refresh
echo.
echo ========================================
pause
