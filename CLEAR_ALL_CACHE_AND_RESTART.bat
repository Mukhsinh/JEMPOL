@echo off
echo ========================================
echo 🧹 CLEAR ALL CACHE DAN RESTART
echo ========================================

echo.
echo 1️⃣ Menghentikan semua proses...
taskkill /f /im node.exe >nul 2>&1
taskkill /f /im npm.exe >nul 2>&1
taskkill /f /im chrome.exe >nul 2>&1
taskkill /f /im msedge.exe >nul 2>&1
timeout /t 3

echo.
echo 2️⃣ Membersihkan cache npm...
cd frontend
call npm run build >nul 2>&1
cd ..

echo.
echo 3️⃣ Membersihkan browser cache...
echo Menghapus Chrome cache...
rd /s /q "%LOCALAPPDATA%\Google\Chrome\User Data\Default\Local Storage" >nul 2>&1
rd /s /q "%LOCALAPPDATA%\Google\Chrome\User Data\Default\Session Storage" >nul 2>&1
rd /s /q "%LOCALAPPDATA%\Google\Chrome\User Data\Default\IndexedDB" >nul 2>&1

echo Menghapus Edge cache...
rd /s /q "%LOCALAPPDATA%\Microsoft\Edge\User Data\Default\Local Storage" >nul 2>&1
rd /s /q "%LOCALAPPDATA%\Microsoft\Edge\User Data\Default\Session Storage" >nul 2>&1
rd /s /q "%LOCALAPPDATA%\Microsoft\Edge\User Data\Default\IndexedDB" >nul 2>&1

echo.
echo 4️⃣ Memulai backend...
cd backend
start "Backend Server" cmd /k "npm run dev"
timeout /t 5

echo.
echo 5️⃣ Memulai frontend...
cd ../frontend
start "Frontend Server" cmd /k "npm run dev"
timeout /t 5

echo.
echo 6️⃣ Membuka test login dengan cache bersih...
start "" "clear-cache-and-test-login.html"

echo.
echo ✅ CACHE DIBERSIHKAN DAN APLIKASI RESTART!
echo.
echo 📋 LANGKAH SELANJUTNYA:
echo 1. Buka clear-cache-and-test-login.html
echo 2. Klik "Clear All Cache" 
echo 3. Klik "Test Login"
echo 4. Gunakan kredensial: admin@jempol.com / admin123
echo.
pause