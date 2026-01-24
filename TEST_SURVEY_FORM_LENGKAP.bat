@echo off
echo ========================================
echo TEST FORM SURVEI DENGAN IDENTITAS LENGKAP
echo ========================================
echo.
echo Membuka form survei untuk testing...
echo.
echo FITUR YANG DITEST:
echo [1] Notifikasi jika data belum lengkap
echo [2] Field identitas lengkap:
echo     - Nama Lengkap
echo     - Nomor HP
echo     - Usia
echo     - Jenis Kelamin
echo     - Pendidikan
echo     - Pekerjaan
echo     - Alamat Lengkap
echo [3] Validasi sebelum lanjut ke step 2
echo.
start http://localhost:3002/form/survey
echo.
echo Form survei dibuka di browser!
echo Silakan test semua field identitas diri.
echo.
pause
