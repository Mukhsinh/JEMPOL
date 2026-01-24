@echo off
echo ========================================
echo TEST FORM SURVEY - PERBAIKAN
echo ========================================
echo.
echo Membuka form survey untuk testing...
echo.
echo Perbaikan yang sudah dilakukan:
echo 1. Hanya 2 step (Identitas + Survey)
echo 2. Alamat digabung di Step 1 (hanya sampai Kecamatan)
echo 3. Footer dinamis (tidak ada hardcoded RSUD Bendan)
echo 4. Tombol "Klik All" untuk setiap unsur
echo 5. Font pertanyaan diperbesar
echo.
echo ========================================
echo.

start http://localhost:3002/form/survey?unit_id=1&unit_name=Jlamprang

echo.
echo Form survey dibuka di browser
echo Silakan test:
echo - Cek hanya ada 2 step
echo - Cek alamat ada di Step 1 (hanya sampai Kecamatan)
echo - Cek tombol "Klik All" di setiap unsur
echo - Cek ukuran font lebih besar
echo - Cek footer tidak ada teks RSUD Bendan
echo.
pause
