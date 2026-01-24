@echo off
echo ========================================
echo TEST HALAMAN LACAK TIKET ADMIN
echo ========================================
echo.
echo Membuka halaman test...
start test-track-ticket-admin.html
timeout /t 2 /nobreak >nul
echo.
echo Membuka aplikasi di browser...
start http://localhost:3005/track-ticket
echo.
echo ========================================
echo PETUNJUK TEST:
echo ========================================
echo 1. Login sebagai admin
echo 2. Lihat menu Tickets di sidebar
echo 3. Klik submenu "Lacak Tiket"
echo 4. Masukkan nomor tiket untuk test
echo 5. Klik tombol "Lacak"
echo.
echo ========================================
pause
