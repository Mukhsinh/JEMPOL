@echo off
echo ========================================
echo PERBAIKAN SUBMIT TIKET DAN SURVEY
echo ========================================
echo.

echo Langkah 1: Pastikan backend berjalan...
echo.

:: Cek apakah backend sudah berjalan
curl -s http://localhost:3004/api/health >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Backend belum berjalan!
    echo.
    echo Silakan jalankan backend terlebih dahulu dengan:
    echo   cd backend
    echo   npm run dev
    echo.
    pause
    exit /b 1
)

echo ✅ Backend sudah berjalan
echo.

echo Langkah 2: Test endpoint internal-tickets...
node test-api-submit-endpoints.js

echo.
echo ========================================
echo SELESAI!
echo ========================================
echo.
echo Jika test berhasil, silakan coba submit form lagi:
echo 1. Buka: http://localhost:3002/direct-internal-ticket
echo 2. Isi form dan klik Submit
echo 3. Periksa apakah berhasil
echo.
pause
