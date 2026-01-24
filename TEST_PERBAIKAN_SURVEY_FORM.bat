@echo off
echo ========================================
echo TEST PERBAIKAN SURVEY FORM
echo ========================================
echo.
echo Membuka halaman test survey form...
echo.
start http://localhost:3002/survey?unit_id=test&unit_name=Test%%20Unit
echo.
echo ========================================
echo PETUNJUK TESTING:
echo ========================================
echo.
echo 1. ISI NOMOR HP:
echo    - Coba isi dengan format: 081234567890
echo    - Coba isi dengan spasi: 0812 3456 7890
echo    - Pastikan validasi bekerja dengan benar
echo    - Pastikan tidak ada error "no hp belum diisi"
echo.
echo 2. PILIH ALAMAT:
echo    - Pilih Kabupaten/Kota
echo    - Pilih Kecamatan (harus muncul sesuai kab/kota)
echo    - Pilih Kelurahan (harus muncul sesuai kecamatan)
echo    - Pastikan data lengkap untuk semua wilayah
echo.
echo 3. SUBMIT FORM:
echo    - Isi semua field yang wajib
echo    - Klik tombol "Lanjutkan" di setiap step
echo    - Pastikan bisa submit tanpa error
echo.
echo ========================================
pause
