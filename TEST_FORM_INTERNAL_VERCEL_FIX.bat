@echo off
echo ========================================
echo TEST FORM INTERNAL VERCEL FIX
echo ========================================
echo.
echo Membuka halaman test di browser...
echo.
echo Test yang akan dilakukan:
echo 1. Test endpoint /api/public/units
echo 2. Test endpoint /api/public/app-settings
echo 3. Test submit internal ticket
echo 4. Verifikasi routing (JSON vs HTML)
echo.
echo ========================================
echo.

start "" "test-form-internal-vercel-fix.html"

echo.
echo Halaman test sudah dibuka di browser.
echo.
echo Instruksi:
echo 1. Klik tombol "Test Units Endpoint"
echo 2. Klik tombol "Test App Settings Endpoint"
echo 3. Pastikan Unit ID terisi otomatis
echo 4. Klik tombol "Submit Test Ticket"
echo 5. Klik tombol "Check All Endpoints"
echo.
echo Hasil yang diharapkan:
echo - Semua test mengembalikan JSON (bukan HTML)
echo - Tidak ada error 405
echo - Tiket berhasil dibuat
echo.
pause
