@echo off
echo ========================================
echo JALANKAN APLIKASI DAN TEST SUBMIT FIX
echo ========================================
echo.

echo [1/3] Memverifikasi perbaikan API...
node verify-api-response-format.js
if errorlevel 1 (
    echo.
    echo ❌ Verifikasi gagal!
    pause
    exit /b 1
)

echo.
echo [2/3] Menjalankan backend...
cd backend
start "Backend Server" cmd /k "npm run dev"
cd ..

echo Menunggu backend siap...
timeout /t 5 /nobreak >nul

echo.
echo [3/3] Menjalankan frontend...
cd frontend
start "Frontend Server" cmd /k "npm run dev"
cd ..

echo Menunggu frontend siap...
timeout /t 8 /nobreak >nul

echo.
echo ========================================
echo ✅ APLIKASI BERJALAN
echo ========================================
echo.
echo Membuka halaman test...
start http://localhost:5173/direct-internal-ticket
timeout /t 2 /nobreak >nul
start http://localhost:5173/direct-survey

echo.
echo ========================================
echo INSTRUKSI TEST:
echo ========================================
echo 1. Isi form tiket internal dan SUBMIT
echo 2. Isi form survey dan SUBMIT
echo 3. Pastikan TIDAK ada error "response tidak valid"
echo 4. Pastikan submit BERHASIL dengan notifikasi sukses
echo.
echo Jika masih error, cek console browser (F12)
echo dan lihat response dari API
echo.
pause
