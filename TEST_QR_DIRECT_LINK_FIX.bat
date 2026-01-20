@echo off
echo ========================================
echo TEST QR CODE DIRECT LINK - TANPA SIDEBAR
echo ========================================
echo.

echo Membuka halaman QR Management...
start http://localhost:5173/tickets/qr-management
timeout /t 2 /nobreak >nul

echo.
echo ========================================
echo INSTRUKSI TESTING:
echo ========================================
echo.
echo 1. Buka tab "QR Code Form" di halaman QR Management
echo 2. Klik tombol "Buka Form" pada salah satu QR Code
echo 3. Halaman baru akan terbuka TANPA SIDEBAR
echo 4. Periksa console browser (F12) untuk log debugging
echo.
echo EXPECTED RESULT:
echo - Halaman form fullscreen tanpa sidebar navigasi
echo - Console menampilkan: "DirectInternalTicketForm mounted - TANPA SIDEBAR"
echo - URL: http://localhost:5173/form/internal atau /form/eksternal atau /form/survey
echo.
echo ========================================
echo TEST DIRECT LINKS:
echo ========================================
echo.

echo Membuka Form Tiket Internal (Direct)...
start http://localhost:5173/form/internal
timeout /t 2 /nobreak >nul

echo Membuka Form Tiket Eksternal (Direct)...
start http://localhost:5173/form/eksternal
timeout /t 2 /nobreak >nul

echo Membuka Form Survei (Direct)...
start http://localhost:5173/form/survey
timeout /t 2 /nobreak >nul

echo.
echo ========================================
echo SELESAI!
echo ========================================
echo.
echo Jika masih muncul sidebar:
echo 1. Clear browser cache (Ctrl+Shift+Delete)
echo 2. Hard refresh (Ctrl+F5)
echo 3. Restart aplikasi frontend
echo.
pause
