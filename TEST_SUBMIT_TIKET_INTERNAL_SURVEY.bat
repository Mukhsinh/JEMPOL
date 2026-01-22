@echo off
echo ========================================
echo TEST SUBMIT TIKET INTERNAL DAN SURVEY
echo ========================================
echo.

echo Membuka halaman test submit tiket internal...
start http://localhost:3002/direct-internal-ticket

timeout /t 2 /nobreak >nul

echo.
echo Membuka halaman test submit survey...
start http://localhost:3002/direct-survey

echo.
echo ========================================
echo INSTRUKSI TESTING:
echo ========================================
echo.
echo 1. Test Form Tiket Internal:
echo    - Isi semua field yang wajib
echo    - Pilih unit tujuan
echo    - Klik Submit
echo    - Periksa apakah berhasil atau muncul error
echo.
echo 2. Test Form Survey:
echo    - Isi nomor HP (wajib)
echo    - Pilih unit layanan
echo    - Isi rating untuk setiap pertanyaan
echo    - Klik Submit
echo    - Periksa apakah berhasil atau muncul error
echo.
echo 3. Periksa Console Browser (F12):
echo    - Lihat request yang dikirim
echo    - Lihat response dari server
echo    - Pastikan response adalah JSON, bukan HTML
echo.
echo ========================================
echo.
pause
