@echo off
echo ========================================
echo TEST INTERNAL TICKET - DEBUG MODE
echo ========================================
echo.

echo Opening debug test page...
start test-create-internal-ticket-debug.html

echo.
echo ========================================
echo Debug Instructions:
echo ========================================
echo 1. Pastikan backend berjalan di port 3002
echo 2. Isi form dengan data test
echo 3. Klik "Kirim Tiket"
echo 4. Lihat log detail di halaman
echo 5. Cek console browser (F12) untuk info tambahan
echo 6. Cek terminal backend untuk log server
echo.
echo Jika masih error, screenshot log dan kirim ke developer
echo.
pause
