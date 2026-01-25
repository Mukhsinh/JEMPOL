@echo off
chcp 65001 >nul
echo ========================================
echo RESTART DAN TEST TRACK TICKET
echo ========================================
echo.

echo 🔄 Menghentikan proses yang berjalan...
taskkill /F /IM node.exe 2>nul
timeout /t 2 >nul

echo.
echo 🚀 Memulai backend...
cd backend
start "Backend Server" cmd /k "npm run dev"
timeout /t 5

echo.
echo 🚀 Memulai frontend...
cd ../frontend
start "Frontend Server" cmd /k "npm run dev"
timeout /t 10

echo.
echo ✅ Aplikasi berhasil dimulai!
echo.
echo 📍 Backend: http://localhost:3005
echo 📍 Frontend: http://localhost:3002
echo.
echo 🧪 Membuka test track ticket...
timeout /t 3
start http://localhost:3002/track-ticket?ticket=TKT-2026-0003

echo.
echo 📋 Petunjuk Testing:
echo 1. Periksa apakah halaman track ticket terbuka
echo 2. Lihat console browser (F12) untuk log debugging
echo 3. Coba cari tiket dengan nomor: TKT-2026-0003
echo 4. Jika error, periksa:
echo    - Apakah backend berjalan di localhost:3005?
echo    - Apakah ada error di console backend?
echo    - Apakah response Content-Type: application/json?
echo.
pause
