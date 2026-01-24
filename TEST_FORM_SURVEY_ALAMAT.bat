@echo off
echo ========================================
echo TEST FORM SURVEY - ALAMAT DOMISILI BARU
echo ========================================
echo.
echo Membuka form survey untuk test alamat domisili...
echo.
echo Fitur yang ditest:
echo - Dropdown Kab/Kota: Kota Pekalongan, Kab Pekalongan, Kab Batang, Kab Pemalang
echo - Dropdown Kecamatan: Lengkap untuk setiap Kab/Kota
echo - Input manual alamat jalan
echo.
timeout /t 2 /nobreak >nul
start http://localhost:3002/form/survey
echo.
echo Form survey dibuka di browser!
echo Silakan test:
echo 1. Pilih Kab/Kota
echo 2. Pilih Kecamatan (akan muncul setelah pilih Kab/Kota)
echo 3. Isi alamat lengkap (Jalan, RT/RW, Kelurahan/Desa)
echo.
pause
