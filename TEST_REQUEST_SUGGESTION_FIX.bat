@echo off
echo ========================================
echo TEST REQUEST DAN SUGGESTION FIX
echo ========================================
echo.
echo Membuka browser untuk test form...
echo.

REM Buka form eksternal ticket
start http://localhost:3002/form/eksternal?qr=QRE786191&unit_id=550e8400-e29b-41d4-a716-446655440033&unit_name=Bagian%%20Administrasi&auto_fill=true

echo.
echo ========================================
echo INSTRUKSI TESTING:
echo ========================================
echo.
echo 1. TEST PENGADUAN (Complaint):
echo    - Pilih "Pengaduan" di Jenis Layanan
echo    - Isi form dan submit
echo    - Harus berhasil dengan notifikasi sukses
echo.
echo 2. TEST PERMINTAAN (Request):
echo    - Pilih "Permintaan Informasi" di Jenis Layanan
echo    - Isi form dan submit
echo    - Harus berhasil dengan notifikasi sukses
echo.
echo 3. TEST SARAN (Suggestion):
echo    - Pilih "Saran & Masukan" di Jenis Layanan
echo    - Isi form dan submit
echo    - Harus berhasil dengan notifikasi sukses
echo.
echo 4. TEST SURVEI (Survey):
echo    - Pilih "Survei Kepuasan" di Jenis Layanan
echo    - Isi form dan submit
echo    - Harus berhasil dengan notifikasi sukses
echo.
echo ========================================
echo CATATAN:
echo ========================================
echo - Pastikan backend sudah di-restart dengan perbaikan
echo - Periksa console browser untuk log error (F12)
echo - Periksa console backend untuk log server
echo.
pause
