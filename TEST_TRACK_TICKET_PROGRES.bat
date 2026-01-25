@echo off
echo ========================================
echo TEST TRACK TICKET - PROGRES TERINTEGRASI
echo ========================================
echo.
echo Membuka halaman track ticket untuk test...
echo.
echo CATATAN:
echo - Pastikan backend dan frontend sudah berjalan
echo - Gunakan nomor tiket yang sudah ada respon/eskalasi
echo - Periksa apakah progres (respon, eskalasi, status) tampil
echo.

start http://localhost:3005/track-ticket

echo.
echo Halaman track ticket dibuka!
echo.
echo CARA TEST:
echo 1. Masukkan nomor tiket yang sudah ada
echo 2. Periksa timeline - harus tampil data real dari database
echo 3. Periksa step "Sedang Diproses" - harus tampil respon jika ada
echo 4. Periksa eskalasi - harus tampil unit tujuan jika ada
echo 5. Periksa status tindak lanjut - harus update sesuai status tiket
echo.
pause
