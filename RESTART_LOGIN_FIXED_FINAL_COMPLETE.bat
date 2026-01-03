@echo off
echo ========================================
echo 🔧 RESTART APLIKASI - LOGIN FIXED FINAL
echo ========================================
echo.

echo 1️⃣ Stopping semua proses...
taskkill /f /im node.exe 2>nul
taskkill /f /im npm.exe 2>nul
timeout /t 2 >nul

echo.
echo 2️⃣ Membersihkan cache dan temporary files...
if exist "frontend\node_modules\.cache" rmdir /s /q "frontend\node_modules\.cache"
if exist "backend\node_modules\.cache" rmdir /s /q "backend\node_modules\.cache"
if exist "frontend\.vite" rmdir /s /q "frontend\.vite"

echo.
echo 3️⃣ Verifikasi konfigurasi environment...
echo Frontend .env:
findstr "VITE_SUPABASE_URL" frontend\.env
echo Backend .env:
findstr "SUPABASE_URL" backend\.env

echo.
echo 4️⃣ Testing login dengan Node.js...
node fix-login-cache-and-config.js

echo.
echo 5️⃣ Starting backend server...
cd backend
start "Backend Server" cmd /k "npm run dev"
cd ..

echo.
echo 6️⃣ Waiting for backend to start...
timeout /t 5 >nul

echo.
echo 7️⃣ Starting frontend server...
cd frontend
start "Frontend Server" cmd /k "npm run dev"
cd ..

echo.
echo 8️⃣ Opening test page untuk clear cache...
timeout /t 3 >nul
start "" "clear-cache-and-test-login-final.html"

echo.
echo ✅ APLIKASI SUDAH DISTART!
echo.
echo 📋 LANGKAH SELANJUTNYA:
echo 1. Buka halaman test yang sudah terbuka
echo 2. Klik "Clear All Cache" 
echo 3. Klik "Test Login"
echo 4. Jika berhasil, buka http://localhost:3001
echo 5. Login dengan admin@jempol.com / admin123
echo.
echo 🌐 URLs:
echo - Frontend: http://localhost:3001
echo - Backend:  http://localhost:3003
echo - Test Page: clear-cache-and-test-login-final.html
echo.
pause