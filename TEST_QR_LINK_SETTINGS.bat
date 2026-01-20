@echo off
echo ========================================
echo TEST QR LINK SETTINGS
echo ========================================
echo.

echo [1/3] Membuka halaman QR Link Settings...
start http://localhost:3003/settings/qr-link
timeout /t 2 /nobreak >nul

echo.
echo [2/3] Membuka test page...
start test-qr-link-settings.html
timeout /t 2 /nobreak >nul

echo.
echo [3/3] Membuka browser console...
echo.
echo INSTRUKSI:
echo 1. Buka Developer Tools (F12) di browser
echo 2. Lihat tab Console untuk error messages
echo 3. Lihat tab Network untuk API calls
echo 4. Periksa apakah ada error merah
echo.
echo Jika halaman kosong, periksa:
echo - Apakah backend berjalan di port 3003?
echo - Apakah ada error di console?
echo - Apakah token auth valid?
echo.
pause
