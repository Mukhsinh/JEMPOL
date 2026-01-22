@echo off
echo ========================================
echo TEST FUNGSI EDIT DAN HAPUS UNIT KERJA
echo ========================================
echo.

echo Membuka halaman Manajemen Unit Kerja...
start http://localhost:3002/master-data/units

echo.
echo ========================================
echo PANDUAN TESTING:
echo ========================================
echo.
echo 1. TOMBOL EDIT:
echo    - Klik tombol Edit (ikon pensil) pada salah satu unit
echo    - Modal edit akan terbuka dengan data unit yang dipilih
echo    - Ubah data (misalnya nama atau deskripsi)
echo    - Klik "Perbarui" untuk menyimpan
echo    - Unit akan diperbarui di tabel
echo.
echo 2. TOMBOL HAPUS:
echo    - Klik tombol Hapus (ikon tempat sampah) pada unit
echo    - Konfirmasi penghapusan akan muncul
echo    - Jika unit memiliki sub-unit atau tiket, akan muncul pesan error
echo    - Jika tidak ada kendala, unit akan dihapus
echo.
echo 3. VALIDASI:
echo    - Nama dan kode wajib diisi
echo    - Kode unit tidak boleh duplikat
echo    - Unit dengan sub-unit tidak bisa dihapus
echo    - Unit dengan tiket tidak bisa dihapus
echo.
echo ========================================
echo.
pause
