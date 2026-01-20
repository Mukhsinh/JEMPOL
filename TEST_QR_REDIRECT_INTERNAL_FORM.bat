@echo off
echo ========================================
echo TEST QR REDIRECT - FORM TIKET INTERNAL
echo ========================================
echo.

echo [1/3] Membuka file test HTML...
start test-qr-redirect-internal-form.html
timeout /t 2 /nobreak >nul

echo.
echo [2/3] Membuka form internal langsung di browser...
start http://localhost:3002/form/internal?unit_id=550e8400-e29b-41d4-a716-446655440004^&unit_name=Bagian%%20Keuangan^&qr=QR-MKI-Z4438
timeout /t 2 /nobreak >nul

echo.
echo [3/3] Membuka Developer Console untuk debugging...
echo.
echo ========================================
echo INSTRUKSI TEST:
echo ========================================
echo.
echo 1. Periksa apakah halaman form muncul (tidak blank)
echo 2. Cek apakah nama unit "Bagian Keuangan" muncul di header
echo 3. Cek apakah field "Unit/Departemen" terisi otomatis
echo 4. Buka Developer Console (F12) untuk melihat log
echo 5. Coba isi dan submit form
echo 6. Verifikasi nomor tiket muncul setelah submit
echo.
echo ========================================
echo TROUBLESHOOTING:
echo ========================================
echo.
echo Jika halaman BLANK:
echo - Buka Console (F12) dan cek error
echo - Pastikan frontend berjalan di port 3002
echo - Pastikan backend berjalan di port 3001
echo - Cek Network tab untuk error API
echo.
echo Jika ada ERROR:
echo - Lihat pesan error di console
echo - Cek apakah Material Icons ter-load
echo - Verifikasi route terdaftar di App.tsx
echo.
echo ========================================
echo.
pause
