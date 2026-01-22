@echo off
echo ========================================
echo TEST TOMBOL EDIT DAN HAPUS MASTER DATA
echo ========================================
echo.
echo Perbaikan yang dilakukan:
echo - Tombol edit dan hapus sekarang selalu terlihat
echo - Tidak perlu hover untuk melihat tombol
echo - Warna tombol lebih jelas (biru untuk edit, merah untuk hapus)
echo.
echo Halaman yang diperbaiki:
echo 1. Unit Kerja (Units)
echo 2. Tipe Unit Kerja (Unit Types)
echo 3. Kategori Layanan (Service Categories)
echo 4. Tipe Tiket (Ticket Types)
echo 5. Jenis Pasien (Patient Types)
echo 6. Klasifikasi Tiket (Ticket Classifications)
echo 7. Status Tiket (Ticket Statuses)
echo 8. Pengaturan SLA (SLA Settings)
echo.
echo Memulai aplikasi...
echo.

cd backend
start "Backend Server" cmd /k "npm run dev"
timeout /t 3 /nobreak >nul

cd ../frontend
start "Frontend Server" cmd /k "npm run dev"

echo.
echo ========================================
echo Aplikasi sedang berjalan!
echo ========================================
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Cara test:
echo 1. Buka browser ke http://localhost:5173
echo 2. Login sebagai admin
echo 3. Buka menu Master Data
echo 4. Pilih salah satu submenu (Units, Unit Types, dll)
echo 5. Lihat tombol edit (biru) dan hapus (merah) di kolom Aksi
echo 6. Tombol sekarang selalu terlihat tanpa perlu hover
echo 7. Klik tombol edit untuk mengedit data
echo 8. Klik tombol hapus untuk menghapus data
echo.
echo Tekan Ctrl+C di window server untuk menghentikan
echo.
pause
