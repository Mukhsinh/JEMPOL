@echo off
echo ========================================
echo   TEST QR LINK SETTINGS - COMPLETE
echo ========================================
echo.
echo Membuka halaman test QR Link Settings...
echo.

start http://localhost:3003/test-qr-link-settings-complete.html

echo.
echo ========================================
echo   INSTRUKSI TEST
echo ========================================
echo.
echo 1. Pastikan backend berjalan di port 3001
echo 2. Pastikan frontend berjalan di port 3003
echo 3. Pastikan sudah login di aplikasi utama
echo 4. Halaman test akan terbuka di browser
echo 5. Periksa setiap section test:
echo    - Connection Info (harus authenticated)
echo    - Load Units (harus berhasil)
echo    - Load QR Codes (harus berhasil)
echo    - Create QR Code (test buat QR baru)
echo.
echo ========================================
echo   TROUBLESHOOTING
echo ========================================
echo.
echo Jika halaman kosong atau error:
echo 1. Cek console browser (F12)
echo 2. Pastikan token auth tersimpan di localStorage
echo 3. Cek network tab untuk melihat request/response
echo 4. Pastikan backend API berjalan normal
echo.
pause
