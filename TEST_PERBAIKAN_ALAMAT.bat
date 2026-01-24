@echo off
echo ========================================
echo TEST PERBAIKAN ALAMAT DAN VALIDASI HP
echo ========================================
echo.
echo Memulai backend dan frontend...
echo.

cd backend
start cmd /k "npm run dev"
timeout /t 5

cd ../frontend
start cmd /k "npm run dev"

echo.
echo ========================================
echo Aplikasi sedang berjalan!
echo ========================================
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3002
echo.
echo Silakan test:
echo 1. Buka form survey: http://localhost:3002/survey?unit_id=xxx
echo 2. Isi nomor HP (harus 08xxxxxxxxxx)
echo 3. Isi alamat lengkap (Kab/Kota, Kecamatan, Kelurahan, Jalan)
echo 4. Submit form
echo 5. Cek laporan survey untuk melihat grafik alamat
echo.
echo Tekan tombol apapun untuk menutup...
pause > nul
