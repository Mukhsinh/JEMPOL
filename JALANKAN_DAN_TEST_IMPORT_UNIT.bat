@echo off
echo ========================================
echo JALANKAN APLIKASI DAN TEST IMPORT UNIT
echo ========================================
echo.
echo Memulai Backend...
cd backend
start cmd /k "npm run dev"
timeout /t 5 /nobreak >nul

echo.
echo Memulai Frontend...
cd ..\frontend
start cmd /k "npm run dev"
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
echo CARA TEST IMPORT:
echo 1. Klik tombol "Template Data" untuk download template CSV
echo 2. Buka template dengan Excel atau text editor
echo 3. Isi data unit kerja sesuai format
echo 4. Simpan file
echo 5. Klik tombol "Import" dan pilih file yang sudah diisi
echo 6. Tunggu proses import selesai
echo 7. Data akan otomatis ter-refresh di tabel
echo.
echo CONTOH DATA:
echo - File "template_unit_kerja_contoh.csv" sudah tersedia
echo - Bisa langsung digunakan untuk testing
echo.
echo ========================================
pause
