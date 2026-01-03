@echo off
echo ========================================
echo    PERBAIKAN LENGKAP MASALAH LOADING
echo ========================================

echo.
echo 🔧 LANGKAH 1: Membersihkan proses yang berjalan...
taskkill /f /im node.exe 2>nul
taskkill /f /im npm.exe 2>nul
echo ✅ Proses dibersihkan

echo.
echo 🔧 LANGKAH 2: Membersihkan cache...
if exist "backend\node_modules\.cache" rmdir /s /q "backend\node_modules\.cache" 2>nul
if exist "frontend\node_modules\.cache" rmdir /s /q "frontend\node_modules\.cache" 2>nul
if exist "frontend\dist" rmdir /s /q "frontend\dist" 2>nul
echo ✅ Cache dibersihkan

echo.
echo 🔧 LANGKAH 3: Memverifikasi konfigurasi...
echo Checking backend .env...
findstr "PORT=3003" backend\.env >nul
if %errorlevel%==0 (
    echo ✅ Backend port sudah benar (3003)
) else (
    echo ⚠️ Updating backend port ke 3003...
    powershell -Command "(Get-Content backend\.env) -replace 'PORT=5000', 'PORT=3003' | Set-Content backend\.env"
)

echo.
echo 🔧 LANGKAH 4: Starting backend dengan konfigurasi benar...
cd backend
start "Backend-Fixed" cmd /k "echo Backend starting on port 3003... && npm run dev"
cd ..

echo.
echo 🔧 LANGKAH 5: Menunggu backend siap...
timeout /t 8 >nul

echo.
echo 🔧 LANGKAH 6: Testing backend connection...
node -e "
const axios = require('axios');
(async () => {
    try {
        const response = await axios.get('http://localhost:3003/api/health', { timeout: 5000 });
        console.log('✅ Backend siap:', response.data);
    } catch (err) {
        console.log('⚠️ Backend masih starting up...');
    }
})();
"

echo.
echo 🔧 LANGKAH 7: Starting frontend...
cd frontend
start "Frontend-Fixed" cmd /k "echo Frontend starting on port 3001... && npm run dev"
cd ..

echo.
echo 🔧 LANGKAH 8: Menunggu frontend siap...
timeout /t 10 >nul

echo.
echo 🔧 LANGKAH 9: Testing aplikasi lengkap...
node test-application-after-restart.js

echo.
echo ========================================
echo    PERBAIKAN SELESAI
echo ========================================
echo.
echo 🎯 APLIKASI SIAP DIGUNAKAN:
echo    Frontend: http://localhost:3001
echo    Backend:  http://localhost:3003
echo.
echo 🔑 LOGIN CREDENTIALS:
echo    Username: admin
echo    Password: admin123
echo.
echo 💡 TIPS JIKA MASIH LOADING:
echo    1. Tekan Ctrl+Shift+R untuk hard refresh
echo    2. Buka Developer Tools (F12) untuk cek error
echo    3. Clear localStorage di Application tab
echo.
echo Tekan Enter untuk membuka aplikasi...
pause >nul

start http://localhost:3001

echo.
echo 🚀 Aplikasi dibuka di browser!
echo Jika masih stuck di "Memverifikasi akses...", 
echo lakukan hard refresh (Ctrl+Shift+R)
pause