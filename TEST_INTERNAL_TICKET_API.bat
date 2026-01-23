@echo off
echo ========================================
echo TEST INTERNAL TICKET API
echo ========================================
echo.
echo Membuka test page di browser...
echo.
start http://localhost:5173/test-internal-ticket-api.html
echo.
echo INSTRUKSI:
echo 1. Pastikan aplikasi sudah berjalan (npm run dev)
echo 2. Isi form dengan data test
echo 3. Klik tombol "Kirim Test Ticket"
echo 4. Periksa console browser (F12) untuk detail
echo 5. Periksa response di halaman
echo.
echo Endpoint yang ditest: /api/public/internal-tickets
echo Method: POST
echo.
pause
