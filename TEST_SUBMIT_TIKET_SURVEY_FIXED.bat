@echo off
echo ========================================
echo TEST SUBMIT TIKET INTERNAL DAN SURVEY
echo ========================================
echo.

echo Membuka halaman test...
start http://localhost:5173/direct-internal-ticket
timeout /t 2 /nobreak >nul
start http://localhost:5173/direct-survey

echo.
echo ========================================
echo INSTRUKSI TEST:
echo ========================================
echo 1. Isi form tiket internal dan submit
echo 2. Isi form survey dan submit
echo 3. Pastikan TIDAK ada error "response tidak valid"
echo 4. Pastikan submit BERHASIL
echo.
echo Tekan tombol apapun untuk selesai...
pause >nul
