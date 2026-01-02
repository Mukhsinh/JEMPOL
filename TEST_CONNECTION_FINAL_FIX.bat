@echo off
echo ========================================
echo    TEST KONEKSI API - FINAL FIX
echo ========================================
echo.

echo Membuka test koneksi di browser...
start "" "test-connection-fix-final.html"

echo.
echo Test koneksi API telah dibuka di browser.
echo.
echo Status:
echo - Backend: http://localhost:5000/api
echo - Frontend: http://localhost:3001 atau 3002
echo.
echo Jika masih ada error, periksa:
echo 1. Backend berjalan di port 5000
echo 2. Frontend environment variable sudah benar
echo 3. CORS configuration sudah sesuai
echo.
pause