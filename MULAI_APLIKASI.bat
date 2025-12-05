@echo off
color 0A
echo ========================================
echo   APLIKASI JEMPOL - MULAI
echo ========================================
echo.

echo [1/4] Menghentikan proses lama...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul
echo ✅ Proses dihentikan!

echo.
echo [2/4] Membersihkan cache...
if exist "frontend\node_modules\.vite" rmdir /s /q "frontend\node_modules\.vite"
if exist "frontend\dist" rmdir /s /q "frontend\dist"
echo ✅ Cache dibersihkan!

echo.
echo [3/4] Memulai Backend...
start "JEMPOL Backend" cmd /k "color 0B && cd backend && npm run dev"
timeout /t 5 /nobreak >nul
echo ✅ Backend started!

echo.
echo [4/4] Memulai Frontend...
start "JEMPOL Frontend" cmd /k "color 0E && cd frontend && npm run dev"
echo ✅ Frontend started!

echo.
echo ========================================
echo   ✅ APLIKASI BERHASIL DIMULAI!
echo ========================================
echo.
echo 📍 URL Aplikasi:
echo    Homepage:    http://localhost:3001
echo    Admin Panel: http://localhost:3001/admin
echo    Game:        http://localhost:3001/game
echo.
echo 📍 Backend API: http://localhost:5000
echo.
echo ⏰ Tunggu 10 detik, lalu:
echo    1. Buka browser
echo    2. Ketik: http://localhost:3001
echo    3. Tekan: Ctrl + Shift + R (hard refresh)
echo.
echo 💡 Tips:
echo    - Jangan tutup terminal Backend dan Frontend
echo    - Jika error, tekan Ctrl+Shift+R di browser
echo    - Baca CARA_BUKA_APLIKASI.md untuk bantuan
echo.
echo ========================================
pause
