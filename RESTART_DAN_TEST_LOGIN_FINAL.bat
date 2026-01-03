@echo off
echo ========================================
echo 🔄 RESTART DAN TEST LOGIN FINAL
echo ========================================

echo.
echo 1️⃣ Menghentikan aplikasi yang berjalan...
taskkill /f /im node.exe >nul 2>&1
taskkill /f /im npm.exe >nul 2>&1
timeout /t 2 >nul

echo.
echo 2️⃣ Membersihkan cache npm...
cd frontend
call npm run build >nul 2>&1
cd ..

echo.
echo 3️⃣ Memulai backend...
cd backend
start "Backend Server" cmd /k "npm run dev"
timeout /t 5

echo.
echo 4️⃣ Memulai frontend...
cd ../frontend
start "Frontend Server" cmd /k "npm run dev"
timeout /t 5

echo.
echo 5️⃣ Membuka test login...
start "" "test-login-simple-final-complete.html"

echo.
echo ✅ APLIKASI SUDAH RESTART!
echo.
echo 📋 INSTRUKSI:
echo - Backend: http://localhost:3003
echo - Frontend: http://localhost:3001
echo - Test Login: test-login-simple-final-complete.html
echo.
echo 🔐 Kredensial Login:
echo Email: admin@jempol.com
echo Password: admin123
echo.
pause