@echo off
echo ========================================
echo    RESTART APLIKASI - LOADING FIX
echo ========================================
echo.

echo 🧹 Membersihkan cache dan dependencies...
cd frontend
if exist node_modules rmdir /s /q node_modules
if exist .vite rmdir /s /q .vite
if exist dist rmdir /s /q dist

cd ../backend
if exist node_modules rmdir /s /q node_modules
if exist dist rmdir /s /q dist

cd ..

echo.
echo 📦 Menginstall dependencies...
cd frontend
call npm install
cd ../backend
call npm install
cd ..

echo.
echo 🚀 Memulai aplikasi...
echo Backend akan berjalan di port 3003
echo Frontend akan berjalan di port 3001
echo.

start "Backend Server" cmd /k "cd backend && npm run dev"
timeout /t 3 /nobreak > nul
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo.
echo ✅ Aplikasi sedang dimulai...
echo 🌐 Tunggu beberapa detik, lalu buka: http://localhost:3001
echo.
echo 📋 Jika masih loading:
echo 1. Buka Developer Tools (F12)
echo 2. Lihat tab Console untuk error
echo 3. Coba refresh halaman (Ctrl+F5)
echo.
pause