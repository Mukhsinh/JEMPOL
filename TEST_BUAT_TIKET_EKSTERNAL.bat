@echo off
echo ========================================
echo TEST BUAT TIKET EKSTERNAL
echo ========================================
echo.

echo 1. Membuka test page...
start http://localhost:3002/test-external-ticket-form-unit-id.html

timeout /t 2 /nobreak >nul

echo.
echo 2. Membuka QR Pengaduan...
start http://localhost:3002/qr/QR-PENGADUAN

timeout /t 2 /nobreak >nul

echo.
echo 3. Membuka Direct Form...
start "http://localhost:3002/form/eksternal?unit_id=550e8400-e29b-41d4-a716-446655440007&unit_name=Sub%%20Bagian%%20Pengaduan&qr=QR-PENGADUAN"

echo.
echo ========================================
echo PETUNJUK TEST:
echo ========================================
echo.
echo 1. Test Page akan membuka di browser
echo 2. Pilih salah satu link untuk test
echo 3. Isi form dan submit
echo 4. Pastikan tidak ada error "Unit ID tidak ditemukan"
echo 5. Setelah submit, harus dapat nomor tiket
echo.
echo Tekan tombol apapun untuk menutup...
pause >nul
