@echo off
echo ========================================
echo TEST EDIT DAN HAPUS JENIS PASIEN
echo ========================================
echo.

echo Membuka browser untuk test...
timeout /t 2 /nobreak >nul

start http://localhost:3002/master-data/patient-types

echo.
echo ========================================
echo PANDUAN TEST:
echo ========================================
echo.
echo 1. TEST EDIT:
echo    - Klik tombol Edit (ikon pensil)
echo    - Ubah data yang diinginkan
echo    - Klik "Perbarui"
echo    - Verifikasi data berubah
echo.
echo 2. TEST HAPUS (Data Tidak Digunakan):
echo    - Buat data baru terlebih dahulu
echo    - Klik tombol Hapus (ikon tempat sampah)
echo    - Konfirmasi penghapusan
echo    - Verifikasi data terhapus
echo.
echo 3. TEST HAPUS (Data Digunakan):
echo    - Coba hapus data yang digunakan di SLA
echo    - Verifikasi muncul pesan error yang jelas
echo    - Ikuti instruksi di pesan error
echo.
echo ========================================
echo CATATAN:
echo ========================================
echo.
echo - Jika data digunakan di Pengaturan SLA:
echo   Hapus atau edit pengaturan SLA terlebih dahulu
echo.
echo - Jika data digunakan di Tiket:
echo   Gunakan fitur Nonaktifkan (Edit status menjadi Tidak Aktif)
echo.
echo ========================================
echo.
pause
