@echo off
echo ========================================
echo TEST RESPON DAN ESKALASI TIKET - FIXED
echo ========================================
echo.
echo Membuka halaman test untuk respon dan eskalasi tiket...
echo.

start http://localhost:3002/tickets

echo.
echo ========================================
echo INSTRUKSI TEST:
echo ========================================
echo.
echo 1. Pilih salah satu tiket dari daftar
echo 2. Klik tombol "Respon" untuk menambahkan respon
echo 3. Isi pesan respon dan klik "Kirim Respon"
echo 4. Klik tombol "Eskalasi" untuk eskalasi tiket
echo 5. Pilih unit tujuan, isi alasan, dan klik "Eskalasi"
echo.
echo Kedua fitur seharusnya berfungsi tanpa error RLS!
echo.
echo ========================================
pause
