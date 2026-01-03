@echo off
echo ========================================
echo VERIFIKASI PERBAIKAN AUTH 403 ERROR
echo ========================================
echo.

echo 1. Testing API Endpoints...
node test-dashboard-api.js
echo.

echo 2. Checking Backend Status...
curl -s http://localhost:3003/api/complaints/test
echo.

echo 3. Testing Public Endpoints...
curl -s http://localhost:3003/api/complaints/public/tickets?limit=3
echo.

echo ========================================
echo VERIFIKASI SELESAI
echo ========================================
echo.
echo Jika semua test berhasil, maka:
echo - Error 403 Forbidden sudah teratasi
echo - Frontend dapat mengakses backend
echo - Dashboard dapat memuat data
echo - Admin authentication berfungsi
echo.
pause