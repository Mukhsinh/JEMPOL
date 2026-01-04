@echo off
color 0A
echo ========================================
echo   PERBAIKAN LENGKAP TIMEOUT DAN LOADING
echo ========================================
echo.
echo Script ini akan memperbaiki semua masalah:
echo - Error timeout koneksi
echo - Loading lambat
echo - Error EBUSY dan Vite
echo - Optimasi komponen Dashboard
echo.
echo Pastikan tidak ada aplikasi yang berjalan!
echo.
pause

echo.
echo [TAHAP 1/4] Memperbaiki EBUSY dan Vite Error...
echo ================================================
call FIX_EBUSY_DAN_VITE_ERROR.bat

echo.
echo [TAHAP 2/4] Mengoptimalkan konfigurasi timeout...
echo ================================================
node fix-timeout-loading-optimized.js

echo.
echo [TAHAP 3/4] Mengoptimalkan komponen Dashboard...
echo ================================================
node optimize-dashboard-components.js

echo.
echo [TAHAP 4/4] Memulai aplikasi dengan konfigurasi baru...
echo ======================================================
echo.
echo Frontend: http://localhost:3001
echo Backend:  http://localhost:3004
echo.
echo Tunggu hingga kedua server berjalan sebelum mengakses aplikasi.
echo.

start "Backend Server (Port 3004)" cmd /k "cd backend && echo Starting Backend Server... && npm run dev"
timeout /t 8 /nobreak > nul

start "Frontend Server (Port 3001)" cmd /k "cd frontend && echo Starting Frontend Server... && npm run dev"

echo.
echo ========================================
echo   PERBAIKAN SELESAI!
echo ========================================
echo.
echo ✅ Timeout API dinaikkan ke 30-45 detik
echo ✅ Retry mechanism ditambahkan
echo ✅ Loading optimizer dibuat
echo ✅ Dashboard components dioptimalkan
echo ✅ Port conflict diperbaiki (Backend: 3004, Frontend: 3001)
echo ✅ EBUSY error diperbaiki
echo.
echo 🌐 Akses aplikasi di: http://localhost:3001
echo.
echo Jika masih ada masalah:
echo 1. Tunggu 30-60 detik untuk server startup
echo 2. Refresh browser (Ctrl+F5)
echo 3. Periksa console log untuk error detail
echo.
pause