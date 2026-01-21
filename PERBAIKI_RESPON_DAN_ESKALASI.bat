@echo off
chcp 65001 >nul
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║   PERBAIKAN RESPON DAN ESKALASI TIKET                      ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

echo 🔧 Menjalankan perbaikan...
node fix-ticket-actions-complete.js

echo.
echo ⏳ Menunggu 2 detik...
timeout /t 2 /nobreak >nul

echo.
echo 🔄 Restart backend...
cd backend
taskkill /F /IM node.exe 2>nul
timeout /t 1 /nobreak >nul
start "Backend Server" cmd /k "npm run dev"

echo.
echo ⏳ Menunggu backend siap (10 detik)...
timeout /t 10 /nobreak >nul

echo.
echo ✅ Perbaikan selesai!
echo.
echo 📝 Perubahan yang dilakukan:
echo    1. Validasi req.user sebelum digunakan
echo    2. Logging untuk debugging
echo    3. Error handling yang lebih baik
echo    4. Handle kasus req.user undefined
echo.
echo 🧪 Silakan test kembali fitur:
echo    - Respon Tiket
echo    - Eskalasi Tiket
echo.
echo Backend berjalan di: http://localhost:3001
echo.
pause
