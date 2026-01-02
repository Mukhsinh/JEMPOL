@echo off
echo ========================================
echo TEST APP SETTINGS - PERBAIKAN KONEKSI
echo ========================================
echo.
echo Membuka test halaman app settings...
echo Backend URL: http://localhost:3003/api
echo Frontend URL: http://localhost:3001
echo.

start "" "test-app-settings-fix.html"

echo.
echo Test file dibuka di browser.
echo Periksa:
echo 1. Koneksi ke backend berhasil
echo 2. API app settings berfungsi
echo 3. Load dan save settings bekerja
echo.
pause