@echo off
echo 🔧 Memperbaiki masalah npm dan vite...

echo.
echo 🛑 Menghentikan semua proses node...
taskkill /f /im node.exe 2>nul
taskkill /f /im npm.exe 2>nul
taskkill /f /im vite.exe 2>nul

echo.
echo 🧹 Membersihkan cache npm...
npm cache clean --force

echo.
echo 📁 Menghapus node_modules dan package-lock.json...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json

echo.
echo 📁 Membersihkan frontend...
cd frontend
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json
cd ..

echo.
echo 📁 Membersihkan backend...
cd backend
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json
cd ..

echo.
echo 📦 Menginstall dependencies root...
npm install

echo.
echo 📦 Menginstall dependencies frontend...
cd frontend
npm install
cd ..

echo.
echo 📦 Menginstall dependencies backend...
cd backend
npm install
cd ..

echo.
echo ✅ Perbaikan selesai!
echo.
echo 🚀 Untuk menjalankan aplikasi:
echo    1. Backend: cd backend && npm run dev
echo    2. Frontend: cd frontend && npm run dev
echo.
pause