@echo off
echo ========================================
echo    VERIFIKASI KONFIGURASI API
echo ========================================
echo.

echo 1. Memeriksa konfigurasi backend...
echo Backend .env file:
type backend\.env | findstr PORT
echo.

echo 2. Memeriksa konfigurasi frontend...
echo Frontend .env file:
type frontend\.env | findstr VITE_API_URL
echo.

echo 3. Testing API connection...
node test-api-direct.js
echo.

echo 4. Memeriksa status proses...
echo Backend dan Frontend harus berjalan di:
echo - Backend: http://localhost:5002
echo - Frontend: http://localhost:3002
echo.

echo ========================================
echo    VERIFIKASI SELESAI
echo ========================================
echo.
echo Tekan tombol apa saja untuk keluar...
pause >nul