@echo off
echo ========================================
echo   TEST PEMBUATAN TIKET - SUDAH DIPERBAIKI
echo ========================================
echo.

echo Membuka halaman test pembuatan tiket...
echo.

echo 1. Test Tiket Internal (untuk staff)
start http://localhost:3002/form/internal

timeout /t 2 /nobreak >nul

echo 2. Test Tiket Eksternal (untuk publik)
start http://localhost:3002/form/eksternal

echo.
echo ========================================
echo   PETUNJUK TESTING:
echo ========================================
echo.
echo 1. Isi form tiket internal atau eksternal
echo 2. Pilih unit tujuan (wajib)
echo 3. Pilih kategori (opsional)
echo 4. Isi judul dan deskripsi
echo 5. Klik tombol submit
echo.
echo Jika berhasil, akan muncul nomor tiket
echo Jika gagal, periksa console browser (F12)
echo.
echo ========================================
pause
