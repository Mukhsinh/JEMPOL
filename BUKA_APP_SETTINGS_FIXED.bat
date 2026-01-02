@echo off
echo ========================================
echo BUKA HALAMAN APP SETTINGS - FIXED
echo ========================================
echo.
echo Memastikan backend dan frontend berjalan...
echo Backend: http://localhost:3003/api
echo Frontend: http://localhost:3002
echo.

echo Membuka halaman App Settings...
start "" "http://localhost:3002/settings/app"

echo.
echo Halaman App Settings dibuka di browser.
echo.
echo Login dengan:
echo Username: admin
echo Password: admin123
echo.
echo Fitur yang tersedia:
echo - Pengaturan nama aplikasi dan instansi
echo - Upload logo instansi
echo - Informasi kontak lengkap
echo - Pengaturan pengelola sistem
echo.
pause