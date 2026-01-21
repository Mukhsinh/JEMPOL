@echo off
echo ========================================
echo RESTART DAN TEST RESPON ESKALASI
echo ========================================
echo.
echo Langkah-langkah:
echo 1. Restart backend
echo 2. Buka halaman test
echo.
echo ========================================
echo.

echo [1/2] Restarting backend...
cd backend
start cmd /k "npm run dev"
timeout /t 5 /nobreak >nul

echo.
echo [2/2] Membuka halaman test...
cd ..
start http://localhost:3002/test-respon-eskalasi.html

echo.
echo ========================================
echo APLIKASI SIAP!
echo ========================================
echo.
echo Backend: http://localhost:3001
echo Frontend: http://localhost:3002
echo Test Page: http://localhost:3002/test-respon-eskalasi.html
echo.
echo CARA TESTING:
echo 1. Login terlebih dahulu di http://localhost:3002
echo 2. Buka halaman test
echo 3. Test fitur Tambah Respon
echo 4. Test fitur Buat Eskalasi
echo.
echo Dokumentasi lengkap: PERBAIKAN_RESPON_DAN_ESKALASI_SELESAI.md
echo.
pause
