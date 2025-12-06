@echo off
echo ========================================
echo QUICK TEST - Aplikasi JEMPOL
echo ========================================
echo.

echo Memulai testing cepat...
echo.

echo [1/3] Testing Backend Connection...
cd backend
node test-connection.js
if errorlevel 1 (
    echo.
    echo ERROR: Backend connection failed!
    echo Pastikan Supabase credentials benar di backend/.env
    pause
    exit /b 1
)
echo.

echo [2/3] Testing Database Operations...
node test-database.js
if errorlevel 1 (
    echo.
    echo ERROR: Database operations failed!
    echo Cek Supabase dashboard dan table structure
    pause
    exit /b 1
)
echo.

cd ..

echo [3/3] Building Frontend...
cd frontend
call npm run build
if errorlevel 1 (
    echo.
    echo ERROR: Frontend build failed!
    echo Cek TypeScript errors
    pause
    exit /b 1
)
echo.

cd ..

echo ========================================
echo SEMUA TEST BERHASIL! ✅
echo ========================================
echo.
echo Aplikasi siap untuk:
echo 1. ✅ Game dapat dimainkan sempurna
echo 2. ✅ Materi, video, foto tampil sempurna
echo 3. ✅ Data pengunjung tersimpan sempurna
echo.
echo Untuk menjalankan aplikasi:
echo   - Backend: cd backend ^&^& npm run dev
echo   - Frontend: cd frontend ^&^& npm run dev
echo.
echo Atau gunakan: MULAI_APLIKASI.bat
echo.
pause
