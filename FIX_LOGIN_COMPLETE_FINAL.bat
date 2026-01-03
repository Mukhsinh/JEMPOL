@echo off
echo ========================================
echo    PERBAIKAN LOGIN LENGKAP FINAL
echo ========================================
echo.

echo 🔧 Step 1: Reset admin password...
node reset-admin-password-final.js

echo.
echo 🧪 Step 2: Test login...
node test-login-simple-final.js

echo.
echo 🛑 Step 3: Stop running applications...
taskkill /f /im node.exe 2>nul
timeout /t 3 /nobreak >nul

echo.
echo 🧹 Step 4: Clear cache...
cd frontend
if exist node_modules\.vite rmdir /s /q node_modules\.vite
if exist dist rmdir /s /q dist
cd ..

echo.
echo 🚀 Step 5: Start applications...
cd frontend
start "Frontend" cmd /k "npm run dev"
cd ..

timeout /t 3 /nobreak >nul

cd backend
start "Backend" cmd /k "npm run dev"
cd ..

echo.
echo ✅ PERBAIKAN LOGIN SELESAI!
echo.
echo 📧 Email: admin@jempol.com
echo 🔑 Password: admin123
echo 🌐 Frontend: http://localhost:3001/login
echo 🔧 Backend: http://localhost:3003
echo.
echo 💡 Tips:
echo - Tunggu beberapa detik sampai aplikasi fully loaded
echo - Buka browser dan akses http://localhost:3001/login
echo - Gunakan kredensial di atas untuk login
echo - Jika masih error, cek console browser untuk detail
echo.
pause