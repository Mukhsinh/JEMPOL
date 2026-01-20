@echo off
echo ========================================
echo JALANKAN DAN TEST LACAK TIKET PENGADUAN
echo ========================================
echo.

echo Memulai Backend...
cd backend
start cmd /k "npm run dev"
timeout /t 3 /nobreak >nul

echo.
echo Memulai Frontend...
cd ..\frontend
start cmd /k "npm run dev"
timeout /t 5 /nobreak >nul

echo.
echo ========================================
echo APLIKASI BERHASIL DIJALANKAN
echo ========================================
echo.
echo Backend: http://localhost:3001
echo Frontend: http://localhost:3002
echo.
echo Halaman Lacak Tiket: http://localhost:3002/lacak-tiket
echo.
echo Membuka halaman Lacak Tiket...
timeout /t 3 /nobreak >nul
start http://localhost:3002/lacak-tiket

echo.
echo ========================================
echo CARA MENGGUNAKAN
echo ========================================
echo.
echo 1. Masukkan nomor tiket (contoh: TKT-2025-0001)
echo 2. Klik tombol "Lacak Tiket"
echo 3. Lihat detail tiket lengkap dengan:
echo    - Status dan prioritas
echo    - Unit dan kategori
echo    - Statistik (tanggapan, eskalasi, SLA)
echo    - Timeline progres dengan waktu dan jam
echo.
echo FITUR TIMELINE:
echo - Tiket dibuat
echo - Tanggapan pertama
echo - Respon dari tim
echo - Eskalasi (jika ada)
echo - Eskalasi diselesaikan
echo - Tiket diselesaikan
echo.
echo AKSES PUBLIK:
echo - Tidak perlu login
echo - Dapat diakses siapa saja
echo - Link dapat dibagikan
echo.
echo Tekan tombol apapun untuk keluar...
pause >nul
