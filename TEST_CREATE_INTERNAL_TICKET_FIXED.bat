@echo off
echo ========================================
echo TEST BUAT TIKET INTERNAL - FIXED
echo ========================================
echo.
echo Perbaikan yang dilakukan:
echo 1. Mengubah source dari 'direct_form' ke 'web'
echo 2. Mengubah source dari 'standalone_form' ke 'web'
echo 3. Mengubah source dari 'public_survey' ke 'qr_code' atau 'web'
echo.
echo Nilai source yang valid:
echo - web
echo - qr_code
echo - mobile
echo - email
echo - phone
echo.
echo ========================================
echo.

start http://localhost:3002/form/internal

echo.
echo Juga membuka halaman test...
timeout /t 2 /nobreak >nul
start http://localhost:3002/test-create-internal-ticket-fixed.html

echo.
echo ========================================
echo PETUNJUK TEST:
echo ========================================
echo 1. Isi form dengan data yang diperlukan
echo 2. Pilih unit dari dropdown
echo 3. Klik "Kirim Tiket"
echo 4. Periksa apakah tiket berhasil dibuat
echo.
echo Jika masih error, periksa console browser (F12)
echo ========================================
pause
