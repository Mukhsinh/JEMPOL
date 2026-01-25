@echo off
echo ========================================
echo TEST HALAMAN LACAK TIKET REALTIME
echo ========================================
echo.
echo Perbaikan yang dilakukan:
echo 1. Timeline dinamis berdasarkan status dari backend
echo 2. Status "Selesai" muncul ketika tiket resolved
echo 3. Semua event ditampilkan secara realtime
echo 4. Tanggal penyelesaian ditampilkan dengan jelas
echo.
echo ========================================
echo.

echo [1/3] Memulai Backend...
cd backend
start "Backend Server" cmd /k "npm run dev"
timeout /t 5 /nobreak >nul
cd ..

echo [2/3] Memulai Frontend...
cd frontend
start "Frontend Server" cmd /k "npm run dev"
timeout /t 8 /nobreak >nul
cd ..

echo [3/3] Membuka halaman lacak tiket...
timeout /t 3 /nobreak >nul
start http://localhost:3005/track-ticket

echo.
echo ========================================
echo CARA TEST:
echo ========================================
echo 1. Masukkan nomor tiket yang sudah SELESAI
echo 2. Perhatikan timeline - harus ada step "Selesai"
echo 3. Cek tanggal penyelesaian ditampilkan
echo 4. Verifikasi semua respon dan eskalasi muncul
echo.
echo Aplikasi berjalan di:
echo - Frontend: http://localhost:3005
echo - Backend: http://localhost:5000
echo - Lacak Tiket: http://localhost:3005/track-ticket
echo.
echo Tekan Ctrl+C di window server untuk stop
echo ========================================
pause
