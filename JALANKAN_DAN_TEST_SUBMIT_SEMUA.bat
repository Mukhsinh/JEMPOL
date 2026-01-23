@echo off
chcp 65001 >nul
echo ========================================
echo 🚀 JALANKAN DAN TEST SUBMIT SEMUA FORM
echo ========================================
echo.
echo Memulai backend dan frontend...
echo.

REM Cek apakah backend sudah running
echo 📡 Mengecek backend...
curl -s http://localhost:3000/api/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend sudah running
) else (
    echo ⚠️ Backend belum running, memulai...
    start "Backend Server" cmd /k "cd backend && npm run dev"
    timeout /t 5 >nul
)

REM Cek apakah frontend sudah running
echo 📱 Mengecek frontend...
curl -s http://localhost:5173 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Frontend sudah running
) else (
    echo ⚠️ Frontend belum running, memulai...
    start "Frontend Server" cmd /k "cd frontend && npm run dev"
    timeout /t 5 >nul
)

echo.
echo ⏳ Menunggu server siap...
timeout /t 3 >nul

echo.
echo 🧪 Membuka halaman test...
start http://localhost:5173/test-all-submit-forms.html

echo.
echo ========================================
echo ✅ SIAP UNTUK TESTING!
echo ========================================
echo.
echo 📋 INSTRUKSI:
echo 1. Klik "TEST SEMUA FORM SEKALIGUS"
echo 2. Lihat hasil di browser
echo 3. Cek console log untuk detail error
echo.
echo 🔍 Jika ada error:
echo - Lihat console browser (F12)
echo - Lihat log backend di terminal
echo - Periksa response JSON
echo.
pause
