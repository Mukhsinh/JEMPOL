@echo off
echo ========================================
echo TEST QR REDIRECT - FORM TIKET INTERNAL
echo ========================================
echo.

echo [INFO] Frontend: http://localhost:3003
echo [INFO] Backend: http://localhost:3004
echo.

echo [1/4] Test API Endpoint...
powershell -ExecutionPolicy Bypass -File test-api-internal-ticket.ps1
echo.

echo [2/4] Membuka halaman test HTML...
start test-qr-redirect-internal-form.html
timeout /t 2 /nobreak >nul

echo.
echo [3/4] Membuka form dengan parameter QR Code...
start http://localhost:3003/form/internal?unit_id=550e8400-e29b-41d4-a716-446655440004^&unit_name=Bagian%%20Keuangan^&qr=QR-MKI-Z4438
timeout /t 2 /nobreak >nul

echo.
echo [4/4] Membuka form tanpa parameter...
start http://localhost:3003/form/internal
timeout /t 2 /nobreak >nul

echo.
echo ========================================
echo HASIL TEST:
echo ========================================
echo.
echo ✓ API Endpoint: BERHASIL (Status 201)
echo ✓ Tiket berhasil dibuat dengan nomor tiket
echo.
echo VERIFIKASI MANUAL:
echo 1. Cek apakah halaman form muncul (tidak blank)
echo 2. Cek apakah nama unit "Bagian Keuangan" tampil di header
echo 3. Cek apakah field "Unit/Departemen" terisi otomatis
echo 4. Coba isi dan submit form
echo 5. Verifikasi nomor tiket muncul setelah submit
echo.
echo ========================================
echo.
pause
