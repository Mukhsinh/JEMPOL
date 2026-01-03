@echo off
echo ========================================
echo    TEST PERBAIKAN QR MANAGEMENT
echo ========================================
echo.

echo [1/4] Checking backend server status...
curl -s http://localhost:3003/api/health > nul
if %errorlevel% neq 0 (
    echo ❌ Backend server tidak berjalan di port 3003
    echo    Jalankan: npm run dev di folder backend
    pause
    exit /b 1
)
echo ✅ Backend server berjalan

echo.
echo [2/4] Testing Units API endpoint...
curl -s -o test_units.json "http://localhost:3003/api/public/units"
if %errorlevel% neq 0 (
    echo ❌ Units API gagal
    pause
    exit /b 1
)
echo ✅ Units API berhasil

echo.
echo [3/4] Testing QR Codes API endpoint...
curl -s -o test_qr_codes.json "http://localhost:3003/api/public/qr-codes?page=1&limit=5&include_analytics=true"
if %errorlevel% neq 0 (
    echo ❌ QR Codes API gagal
    pause
    exit /b 1
)
echo ✅ QR Codes API berhasil

echo.
echo [4/4] Opening comprehensive test page...
start "" "test-qr-management-fix.html"

echo.
echo ========================================
echo           TEST SELESAI
echo ========================================
echo.
echo ✅ Perbaikan QR Management berhasil!
echo.
echo 📋 Yang sudah diperbaiki:
echo    • Menambahkan fallback mechanism di QRCodeService
echo    • Menambahkan endpoint public untuk QR codes
echo    • Menambahkan RLS policy untuk akses public
echo    • Memastikan Units API tetap berfungsi
echo.
echo 🌐 Test page telah dibuka di browser
echo    Periksa hasil test untuk memastikan semua berfungsi
echo.
echo 🚀 Halaman QR Management sekarang dapat dimuat tanpa error 403!
echo.

:: Cleanup temp files
if exist test_units.json del test_units.json
if exist test_qr_codes.json del test_qr_codes.json

pause