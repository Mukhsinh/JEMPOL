@echo off
echo ========================================
echo TEST INTEGRASI TRACK TICKET
echo ========================================
echo.
echo Membuka halaman track ticket...
echo.

start http://localhost:3005/track-ticket

echo.
echo ========================================
echo CARA TEST:
echo ========================================
echo 1. Masukkan nomor tiket yang sudah ada
echo 2. Periksa apakah muncul:
echo    - Jumlah respon (jika ada)
echo    - Informasi eskalasi (jika ada)
echo    - Daftar unit eskalasi dengan status
echo    - Timeline yang berubah sesuai status
echo 3. Status harus dinamis:
echo    - Biru = Sedang diproses
echo    - Hijau = Sudah ada respon/selesai
echo ========================================
echo.
pause
