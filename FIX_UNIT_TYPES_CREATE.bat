@echo off
echo ========================================
echo PERBAIKAN: Tidak Bisa Tambah Unit Type
echo ========================================
echo.

echo Masalah: Error 500 saat menambah data Unit Type
echo Solusi: Pastikan backend berjalan dengan benar
echo.

echo [1/3] Cek apakah backend sudah berjalan...
curl -s http://localhost:3001/api/health >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Backend TIDAK berjalan!
    echo.
    echo Memulai backend...
    cd backend
    start "Backend Server" cmd /k "npm run dev"
    cd ..
    echo ⏳ Menunggu backend siap (10 detik)...
    timeout /t 10 /nobreak >nul
) else (
    echo ✅ Backend sudah berjalan
)

echo.
echo [2/3] Cek apakah frontend sudah berjalan...
curl -s http://localhost:3002 >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Frontend TIDAK berjalan!
    echo.
    echo Memulai frontend...
    cd frontend
    start "Frontend Server" cmd /k "npm run dev"
    cd ..
    echo ⏳ Menunggu frontend siap (10 detik)...
    timeout /t 10 /nobreak >nul
) else (
    echo ✅ Frontend sudah berjalan
)

echo.
echo [3/3] Membuka aplikasi...
start http://localhost:3002/master-data/unit-types

echo.
echo ========================================
echo SELESAI!
echo ========================================
echo.
echo Silakan coba tambah Unit Type lagi.
echo Jika masih error, lihat console browser (F12)
echo dan console backend untuk detail error.
echo.
pause
