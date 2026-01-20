@echo off
echo ========================================
echo TEST STANDALONE INTERNAL TICKET FORM
echo ========================================
echo.
echo Membuka halaman test...
echo.

REM Buka halaman test
start "" "test-standalone-internal-ticket.html"

echo.
echo ========================================
echo URL YANG TERSEDIA:
echo ========================================
echo.
echo 1. Form Dasar (Tanpa Unit Lock):
echo    http://localhost:3002/standalone/tiket-internal
echo.
echo 2. Form dengan Unit Terkunci:
echo    http://localhost:3002/standalone/tiket-internal?unit_id=1
echo.
echo ========================================
echo CARA PENGGUNAAN DI QR MANAGEMENT:
echo ========================================
echo.
echo 1. Buka QR Code Management
echo 2. Pada kolom Redirect URL, masukkan:
echo    http://localhost:3002/standalone/tiket-internal
echo.
echo 3. Atau dengan unit terkunci:
echo    http://localhost:3002/standalone/tiket-internal?unit_id=123
echo.
echo 4. Generate QR Code
echo 5. Scan QR Code untuk test
echo.
echo ========================================
echo FITUR STANDALONE FORM:
echo ========================================
echo.
echo [+] Tanpa Login
echo [+] Tanpa Sidebar
echo [+] Tanpa Navigasi
echo [+] UI Clean dan Modern
echo [+] Responsive Mobile
echo [+] Success Screen dengan Nomor Tiket
echo [+] Support Unit Lock via URL Parameter
echo.
echo ========================================
echo.
pause
