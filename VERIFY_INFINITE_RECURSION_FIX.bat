@echo off
echo ========================================
echo VERIFY INFINITE RECURSION FIX
echo ========================================
echo.
echo Memverifikasi bahwa perbaikan infinite recursion sudah berhasil
echo.

echo 1. Checking if backend is running...
curl -s http://localhost:3003/api/complaints/test > nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Backend tidak berjalan. Memulai backend...
    cd backend
    start "Backend Server" cmd /k "npm run dev"
    cd ..
    echo ⏳ Menunggu backend siap...
    timeout /t 10
) else (
    echo ✅ Backend sudah berjalan
)

echo.
echo 2. Running API tests...
node test-tickets-api-simple.js

echo.
echo 3. Testing dengan browser...
echo Membuka test page untuk verifikasi manual...
start "" "test-tickets-infinite-recursion-fix.html"

echo.
echo 4. Testing aplikasi langsung...
echo Membuka halaman tickets untuk test manual...
timeout /t 2
start "" "http://localhost:5173/tickets"

echo.
echo ========================================
echo MANUAL VERIFICATION STEPS:
echo ========================================
echo 1. Buka test-tickets-infinite-recursion-fix.html
echo 2. Klik semua tombol test secara berurutan
echo 3. Pastikan semua menunjukkan SUCCESS
echo 4. Buka http://localhost:5173/tickets
echo 5. Login dengan admin/admin123
echo 6. Pastikan halaman load tanpa error di console
echo.
echo EXPECTED RESULTS:
echo ✅ No "infinite recursion" errors in console
echo ✅ Tickets page loads successfully
echo ✅ Data tickets tampil dengan normal
echo ✅ API endpoints return 200 OK
echo.
echo Jika semua OK, maka infinite recursion sudah diperbaiki!
echo ========================================

pause