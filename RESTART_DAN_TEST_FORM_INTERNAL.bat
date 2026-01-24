@echo off
echo ========================================
echo RESTART DAN TEST FORM TIKET INTERNAL
echo ========================================
echo.
echo Langkah 1: Membersihkan proses yang berjalan...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo Langkah 2: Memulai Backend Server...
cd backend
start "Backend Server" cmd /k "npm run dev"
cd ..

echo.
echo Menunggu backend siap (5 detik)...
timeout /t 5 /nobreak >nul

echo.
echo Langkah 3: Memulai Frontend Server...
cd frontend
start "Frontend Server" cmd /k "npm run dev"
cd ..

echo.
echo Menunggu frontend siap (10 detik)...
timeout /t 10 /nobreak >nul

echo.
echo Langkah 4: Membuka Form Tiket Internal...
start http://localhost:3002/form/internal

echo.
echo ========================================
echo APLIKASI BERHASIL DIMULAI!
echo ========================================
echo.
echo Backend: http://localhost:3004
echo Frontend: http://localhost:3002
echo Form Internal: http://localhost:3002/form/internal
echo.
echo ========================================
echo INSTRUKSI TEST:
echo ========================================
echo 1. Form harus terbuka TANPA SIDEBAR (fullscreen)
echo 2. Dropdown Unit harus terisi dengan data dari database
echo 3. Footer harus tampil dengan data institusi
echo 4. TIDAK ADA ERROR 500 di console browser
echo.
echo Buka Console Browser (F12) untuk melihat:
echo - ✅ Units loaded successfully
echo - ✅ App settings loaded
echo - ❌ TIDAK ADA error 500
echo.
echo Jika masih ada error:
echo - Periksa apakah backend berjalan di port 3004
echo - Periksa apakah frontend berjalan di port 3002
echo - Periksa console untuk detail error
echo.
pause
