@echo off
echo ========================================
echo TEST LACAK TIKET PENGADUAN
echo ========================================
echo.
echo Membuka halaman test tracking tiket...
echo.

start "" "test-track-ticket.html"

echo.
echo Halaman test telah dibuka di browser
echo.
echo Cara test:
echo 1. Masukkan nomor tiket yang valid (contoh: TKT-2025-0001)
echo 2. Klik tombol "Lacak Tiket"
echo 3. Lihat hasil tracking dengan timeline lengkap
echo.
echo Endpoint yang ditest:
echo GET /api/public/track/:ticketNumber
echo.
echo ========================================
pause
