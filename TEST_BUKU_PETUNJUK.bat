@echo off
echo ========================================
echo TEST HALAMAN BUKU PETUNJUK KISS
echo ========================================
echo.

echo Memulai test halaman buku petunjuk...
echo.

echo 1. Testing API Endpoint Ebook...
curl -X GET "http://localhost:3004/api/ebooks" -H "Accept: application/json" --silent --show-error
echo.
echo.

echo 2. Testing Health Check Backend...
curl -X GET "http://localhost:3004/api/health" -H "Accept: application/json" --silent --show-error
echo.
echo.

echo 3. Membuka halaman test di browser...
start test-buku-petunjuk.html
echo.

echo 4. Membuka aplikasi frontend di browser...
start http://localhost:3000/buku-petunjuk
echo.

echo ========================================
echo TEST SELESAI
echo ========================================
echo.
echo Periksa browser untuk melihat hasil test:
echo - File test-buku-petunjuk.html untuk test API
echo - http://localhost:3000/buku-petunjuk untuk halaman asli
echo.
pause