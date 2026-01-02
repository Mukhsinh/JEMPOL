@echo off
echo ========================================
echo    BUKA APLIKASI TICKETS - FIXED
echo ========================================
echo.
echo Membuka aplikasi dengan perbaikan koneksi backend...
echo.
echo Backend: http://localhost:5002
echo Frontend: http://localhost:3002
echo Test Page: test-tickets-connection-fixed.html
echo.

REM Buka test page untuk verifikasi
start "" "test-tickets-connection-fixed.html"

REM Tunggu sebentar
timeout /t 2 /nobreak >nul

REM Buka aplikasi utama
start "" "http://localhost:3002/tickets"

echo.
echo ✅ Aplikasi dibuka!
echo.
echo Jika ada masalah:
echo 1. Pastikan backend berjalan di port 5002
echo 2. Pastikan frontend berjalan di port 3002
echo 3. Cek test page untuk verifikasi koneksi
echo.
pause