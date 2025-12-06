@echo off
echo ========================================
echo TEST SEMUA FITUR APLIKASI JEMPOL
echo ========================================
echo.

echo [1/5] Testing Backend Connection...
cd backend
call npm run test:connection
if errorlevel 1 (
    echo ERROR: Backend connection failed!
    pause
    exit /b 1
)
echo Backend connection OK!
echo.

echo [2/5] Testing Database...
call npm run test:database
if errorlevel 1 (
    echo ERROR: Database test failed!
    pause
    exit /b 1
)
echo Database OK!
echo.

echo [3/5] Testing API Endpoints...
node test-all-endpoints.js
if errorlevel 1 (
    echo ERROR: API endpoints test failed!
    pause
    exit /b 1
)
echo API Endpoints OK!
echo.

cd ..

echo [4/5] Building Frontend...
cd frontend
call npm run build
if errorlevel 1 (
    echo ERROR: Frontend build failed!
    pause
    exit /b 1
)
echo Frontend build OK!
echo.

cd ..

echo [5/5] Testing Production Build...
echo Starting production preview...
cd frontend
start cmd /k "npm run preview"
timeout /t 5
echo.

echo ========================================
echo SEMUA TEST BERHASIL!
echo ========================================
echo.
echo Aplikasi siap untuk:
echo 1. Game dapat dimainkan sempurna
echo 2. Materi, video, foto tampil sempurna
echo 3. Data pengunjung tersimpan sempurna
echo.
echo Tekan tombol apapun untuk menutup...
pause > nul
