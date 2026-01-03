@echo off
echo 🔧 Restarting aplikasi dengan URL Supabase yang benar...
echo.

echo ✅ Perbaikan yang sudah dilakukan:
echo 1. URL Supabase diperbaiki di supabaseClient.ts
echo 2. Menggunakan URL yang benar: https://jxxzbdivafzzwqhagwrf.supabase.co
echo 3. Anon key sudah disesuaikan
echo.

echo 🔄 Stopping existing processes...
taskkill /f /im node.exe 2>nul
timeout /t 2 /nobreak >nul

echo 🧹 Clearing cache...
if exist "frontend\node_modules\.vite" rmdir /s /q "frontend\node_modules\.vite"
if exist "frontend\dist" rmdir /s /q "frontend\dist"

echo 📦 Installing dependencies...
cd frontend
call npm install

echo 🚀 Starting frontend...
start "Frontend" cmd /k "npm run dev"

echo.
echo ✅ Aplikasi sedang dimulai...
echo 🌐 Frontend akan tersedia di: http://localhost:3001
echo.
echo 📝 Kredensial login:
echo    Email: admin@jempol.com
echo    Password: admin123
echo.
echo 🧪 Untuk test login, buka: test-login-url-fixed.html
echo.
pause