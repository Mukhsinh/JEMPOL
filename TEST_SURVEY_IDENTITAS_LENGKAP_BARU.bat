@echo off
echo ========================================
echo TEST SURVEY FORM - IDENTITAS LENGKAP
echo ========================================
echo.
echo Membuka test file untuk form survey dengan identitas lengkap...
echo.
echo Field Identitas Baru (WAJIB):
echo - Nomor HP (WhatsApp)
echo - Usia (pilihan rentang)
echo - Jenis Kelamin
echo - Pendidikan Terakhir
echo - Pekerjaan
echo - Alamat Domisili (Provinsi, Kota/Kab, Kecamatan, Kelurahan)
echo.
echo Field Opsional:
echo - Nama Lengkap (bisa anonim)
echo - Email
echo.
echo ========================================
echo.

start test-survey-identitas-lengkap-baru.html

timeout /t 3 >nul

echo Membuka form survey di browser...
start http://localhost:3002/survey?unit_id=test-unit&unit_name=Unit%%20Test

echo.
echo ========================================
echo PETUNJUK TESTING:
echo ========================================
echo 1. Coba klik "Lanjutkan" tanpa isi field wajib
echo    - Tombol harus DISABLED
echo.
echo 2. Isi semua field wajib:
echo    - Nomor HP
echo    - Usia
echo    - Jenis Kelamin  
echo    - Pendidikan
echo    - Pekerjaan
echo    - Alamat (4 dropdown)
echo.
echo 3. Klik "Lanjutkan" ke Step 2
echo    - Isi penilaian layanan
echo.
echo 4. Submit dan cek data tersimpan
echo ========================================
echo.
pause
