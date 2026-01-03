@echo off
echo ========================================
echo TEST INFINITE RECURSION FIX
echo ========================================
echo.
echo Menjalankan test untuk memverifikasi perbaikan infinite recursion
echo pada RLS policy tabel users dan tickets
echo.

echo 1. Memulai backend server...
cd backend
start "Backend Server" cmd /k "npm run dev"
timeout /t 5

echo.
echo 2. Memulai frontend server...
cd ../frontend
start "Frontend Server" cmd /k "npm run dev"
timeout /t 5

echo.
echo 3. Membuka test page...
cd ..
start "" "test-tickets-infinite-recursion-fix.html"

echo.
echo 4. Membuka aplikasi tickets...
timeout /t 3
start "" "http://localhost:5173/tickets"

echo.
echo ========================================
echo TEST INSTRUCTIONS:
echo ========================================
echo 1. Buka test-tickets-infinite-recursion-fix.html
echo 2. Jalankan semua test secara berurutan
echo 3. Pastikan tidak ada error "infinite recursion"
echo 4. Buka http://localhost:5173/tickets
echo 5. Login dengan admin/admin123
echo 6. Pastikan halaman tickets bisa load tanpa error
echo.
echo EXPECTED RESULTS:
echo - Public tickets endpoint: SUCCESS
echo - Admin login: SUCCESS  
echo - Authenticated tickets: SUCCESS (no infinite recursion)
echo - Users endpoint: SUCCESS
echo - Dashboard metrics: SUCCESS
echo - Direct Supabase query: SUCCESS
echo.
echo Jika semua test SUCCESS, maka infinite recursion sudah diperbaiki!
echo ========================================

pause