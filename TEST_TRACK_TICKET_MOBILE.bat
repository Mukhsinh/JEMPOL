@echo off
echo ========================================
echo TEST TRACK TICKET MOBILE VERSION
echo ========================================
echo.
echo Membuka halaman test track ticket mobile...
echo.

start http://localhost:3002/track-ticket
start test-track-ticket-mobile.html

echo.
echo ========================================
echo Test dimulai!
echo ========================================
echo.
echo Halaman yang dibuka:
echo 1. http://localhost:3002/track-ticket (React Version)
echo 2. test-track-ticket-mobile.html (HTML Preview)
echo.
echo Fitur yang ditest:
echo - Tampilan mobile modern dan user-friendly
echo - Search tiket dengan nomor
echo - Timeline progres dengan AI insight
echo - Notifikasi WhatsApp
echo - Rincian tiket
echo - Riwayat pembaruan
echo - Contact cards
echo.
pause
