@echo off
echo ========================================
echo Membersihkan dan Memulai Aplikasi JEMPOL
echo ========================================
echo.

echo [1/5] Menghentikan proses yang berjalan...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo [2/5] Membersihkan cache dan build...
if exist "frontend\dist" rmdir /s /q "frontend\dist"
if exist "frontend\.vite" rmdir /s /q "frontend\.vite"
if exist "backend\dist" rmdir /s /q "backend\dist"
echo Cache dibersihkan!

echo [3/5] Menginstall dependencies...
call npm install
cd frontend
call npm install
cd ..
cd backend
call npm install
cd ..

echo [4/5] Memulai Backend...
start "JEMPOL Backend" cmd /k "cd backend && npm run dev"
timeout /t 5 /nobreak >nul

echo [5/5] Memulai Frontend...
start "JEMPOL Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo Aplikasi sedang dimulai...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3001
echo ========================================
echo.
echo Tunggu beberapa detik, lalu buka browser ke http://localhost:3001
echo Tekan tombol apapun untuk menutup jendela ini...
pause >nul
