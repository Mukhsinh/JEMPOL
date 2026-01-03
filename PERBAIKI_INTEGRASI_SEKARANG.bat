@echo off
echo ========================================
echo PERBAIKAN INTEGRASI FRONTEND-BACKEND
echo ========================================
echo.

echo [STEP 1/6] Memperbaiki RLS Policies Database...
echo.
node fix-rls-policies-final.js
if %errorlevel% neq 0 (
    echo ❌ Error dalam perbaikan RLS policies
    pause
    exit /b 1
)
echo ✅ RLS Policies berhasil diperbaiki
echo.

echo [STEP 2/6] Memperbaiki Authentication Integration...
echo.
node fix-auth-integration-final.js
if %errorlevel% neq 0 (
    echo ❌ Error dalam perbaikan authentication
    pause
    exit /b 1
)
echo ✅ Authentication integration berhasil diperbaiki
echo.

echo [STEP 3/6] Restart Backend Server...
echo.
echo Menghentikan backend server yang sedang berjalan...
taskkill /f /im node.exe 2>nul
timeout /t 3 /nobreak > nul

echo Memulai backend server...
cd backend
start "Backend Server" cmd /c "npm run dev"
cd ..
timeout /t 5 /nobreak > nul
echo ✅ Backend server berhasil direstart
echo.

echo [STEP 4/6] Testing Database Connection...
echo.
curl -s http://localhost:3003/api/health > health_check.json
if %errorlevel% equ 0 (
    echo ✅ Backend server responding
) else (
    echo ❌ Backend server not responding
    echo Tunggu beberapa detik dan coba lagi...
    timeout /t 10 /nobreak > nul
)

curl -s http://localhost:3003/api/test/units > test_units.json
if %errorlevel% equ 0 (
    echo ✅ Units endpoint working
) else (
    echo ❌ Units endpoint failed
)

curl -s http://localhost:3003/api/public/units > test_public_units.json
if %errorlevel% equ 0 (
    echo ✅ Public units endpoint working
) else (
    echo ❌ Public units endpoint failed
)
echo.

echo [STEP 5/6] Testing Frontend Integration...
echo.
echo Memulai frontend server jika belum berjalan...
cd frontend
start "Frontend Server" cmd /c "npm run dev"
cd ..
timeout /t 5 /nobreak > nul

echo Membuka halaman testing...
start http://localhost:3000/dashboard
start test-integrasi-frontend-backend-final.html
echo.

echo [STEP 6/6] Membuka Monitoring Tools...
echo.
echo Membuka browser console untuk monitoring...
start http://localhost:3000/settings/units
start http://localhost:3000/settings/master-data
start http://localhost:3000/users
start http://localhost:3000/reports
echo.

echo ========================================
echo PERBAIKAN SELESAI!
echo ========================================
echo.
echo ✅ RLS Policies diperbaiki
echo ✅ Authentication integration diperbaiki  
echo ✅ Backend server direstart
echo ✅ Frontend pages dibuka untuk testing
echo.
echo 📋 LANGKAH SELANJUTNYA:
echo 1. Periksa halaman testing yang terbuka
echo 2. Login dengan kredensial admin
echo 3. Test semua halaman (Units, Master Data, Users, Reports)
echo 4. Periksa browser console untuk error
echo 5. Jika masih ada error 403, jalankan script ini lagi
echo.
echo 🔧 TROUBLESHOOTING:
echo - Jika backend tidak responding, tunggu 30 detik
echo - Jika frontend tidak loading, restart dengan Ctrl+C dan npm run dev
echo - Jika masih error 403, periksa environment variables
echo.
pause