@echo off
echo ========================================
echo   BUKA HALAMAN QR LINK SETTINGS
echo ========================================
echo.
echo Membuka halaman Pengaturan QR Link...
echo.

start http://localhost:3003/settings/qr-link

echo.
echo Halaman QR Link Settings akan terbuka di browser.
echo.
echo Jika halaman kosong atau error:
echo 1. Buka Developer Tools (F12)
echo 2. Lihat tab Console untuk error messages
echo 3. Lihat tab Network untuk failed API requests
echo 4. Pastikan sudah login di aplikasi
echo.
echo Untuk test API langsung, jalankan:
echo - TEST_QR_LINK_DIRECT.bat
echo.
pause
