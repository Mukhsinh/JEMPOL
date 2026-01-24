@echo off
echo ========================================
echo TEST FORM TIKET INTERNAL - PERBAIKAN API
echo ========================================
echo.

echo [1/3] Membuka backend...
start cmd /k "cd backend && npm run dev"
timeout /t 5 /nobreak >nul

echo [2/3] Membuka frontend...
start cmd /k "cd frontend && npm run dev"
timeout /t 8 /nobreak >nul

echo [3/3] Membuka browser untuk test form tiket internal...
timeout /t 3 /nobreak >nul
start http://localhost:3002/tickets/internal/create

echo.
echo ========================================
echo APLIKASI BERJALAN!
echo ========================================
echo.
echo Backend: http://localhost:3004
echo Frontend: http://localhost:3002
echo Form Tiket Internal: http://localhost:3002/tickets/internal/create
echo.
echo Silakan test form tiket internal:
echo 1. Isi semua field yang diperlukan
echo 2. Pilih unit kerja
echo 3. Submit form
echo 4. Periksa apakah tidak ada error 500
echo.
echo Tekan Ctrl+C untuk menghentikan aplikasi
pause
