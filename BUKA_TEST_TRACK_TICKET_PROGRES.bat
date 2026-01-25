@echo off
echo ========================================
echo BUKA TEST TRACK TICKET PROGRES
echo ========================================
echo.
echo Membuka file test HTML...
echo.

start test-track-ticket-progres-integration.html

echo.
echo File test dibuka!
echo.
echo INSTRUKSI:
echo 1. Masukkan nomor tiket yang sudah ada di database
echo 2. Klik "Test Track Ticket"
echo 3. Periksa hasil:
echo    - Timeline harus tampil data real
echo    - Stats (respon, eskalasi) harus akurat
echo    - Eskalasi unit harus tampil jika ada
echo 4. Centang checklist verifikasi
echo.
pause
