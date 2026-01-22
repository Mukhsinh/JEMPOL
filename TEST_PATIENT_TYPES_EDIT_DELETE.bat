@echo off
echo ========================================
echo TEST EDIT DAN HAPUS PATIENT TYPES
echo ========================================
echo.

echo Membuka browser untuk test...
timeout /t 2 /nobreak >nul

start http://localhost:3002/master-data/patient-types

echo.
echo ========================================
echo INSTRUKSI TEST:
echo ========================================
echo 1. Coba klik tombol EDIT pada salah satu jenis pasien
echo 2. Ubah data (misalnya nama atau deskripsi)
echo 3. Klik PERBARUI
echo 4. Cek apakah data berubah
echo.
echo 5. Coba klik tombol HAPUS pada salah satu jenis pasien
echo 6. Konfirmasi penghapusan
echo 7. Cek apakah data terhapus
echo.
echo 8. Buka Console Browser (F12) untuk melihat log detail
echo.
echo ========================================
echo Tekan tombol apapun untuk selesai...
pause >nul
