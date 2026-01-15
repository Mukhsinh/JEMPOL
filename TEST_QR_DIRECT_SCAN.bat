@echo off
echo ========================================
echo   TEST QR DIRECT SCAN
echo ========================================
echo.
echo Membuka halaman test QR direct scan...
echo.

REM Buka file test di browser default
start test-qr-direct-scan.html

echo.
echo ========================================
echo   TEST SCENARIOS
echo ========================================
echo.
echo 1. Test Scan QR (Default - Pengaduan)
echo 2. Test Scan QR (Selection Menu)
echo 3. Test Scan QR (Langsung Survei)
echo 4. Test Backend Public Endpoint
echo 5. Test QR Code Data Structure
echo 6. Test End-to-End Flow
echo.
echo Silakan pilih test yang ingin dijalankan
echo di halaman browser yang terbuka.
echo.
echo ========================================
echo   QUICK ACCESS URLs
echo ========================================
echo.
echo Frontend (Local):
echo http://localhost:5173/m/ABCD1234
echo.
echo Backend API (Local):
echo http://localhost:5000/api/qr-codes/scan/ABCD1234
echo.
echo Production:
echo https://jempol-frontend.vercel.app/m/ABCD1234
echo.
pause
