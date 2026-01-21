@echo off
echo ========================================
echo RESTART DAN TEST RESPON TIKET
echo ========================================
echo.
echo Perbaikan yang dilakukan:
echo 1. Foreign key ticket_responses.responder_id sekarang mereferensikan tabel admins
echo 2. Semua foreign key user_id di tabel lain juga sudah diperbaiki
echo 3. Data invalid sudah dibersihkan
echo.
echo ========================================
echo MEMULAI BACKEND...
echo ========================================
cd backend
start "Backend Server" cmd /k "npm run dev"
timeout /t 5 /nobreak >nul

echo.
echo ========================================
echo MEMULAI FRONTEND...
echo ========================================
cd ../frontend
start "Frontend Server" cmd /k "npm run dev"

echo.
echo ========================================
echo APLIKASI BERHASIL DIMULAI!
echo ========================================
echo.
echo Backend: http://localhost:3004
echo Frontend: http://localhost:3002
echo.
echo Silakan test fitur respon tiket:
echo 1. Login ke aplikasi
echo 2. Buka halaman Daftar Tiket
echo 3. Klik tombol Respon pada salah satu tiket
echo 4. Isi pesan respon dan submit
echo 5. Error foreign key constraint seharusnya sudah tidak muncul
echo.
pause
