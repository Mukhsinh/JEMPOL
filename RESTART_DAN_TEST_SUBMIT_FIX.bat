@echo off
echo ========================================
echo RESTART DAN TEST SUBMIT TIKET & SURVEY
echo ========================================
echo.
echo Membersihkan cache dan restart aplikasi...
echo.

REM Kill proses yang berjalan
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo Starting backend...
cd backend
start "Backend Server" cmd /k "npm run dev"
cd ..

timeout /t 5 /nobreak >nul

echo.
echo Starting frontend...
cd frontend
start "Frontend Server" cmd /k "npm run dev"
cd ..

timeout /t 10 /nobreak >nul

echo.
echo ========================================
echo Aplikasi sudah berjalan!
echo ========================================
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo CARA TEST:
echo 1. Buka browser ke http://localhost:5173
echo 2. Scan QR code atau akses form langsung
echo 3. Test submit tiket internal
echo 4. Test submit survey
echo.
echo Periksa console browser untuk melihat:
echo - Request payload yang dikirim
echo - Response dari server
echo - Error jika ada
echo.
echo Jika masih error "Unexpected end of JSON input":
echo - Periksa Network tab di browser DevTools
echo - Lihat response body dari server
echo - Pastikan server mengembalikan JSON yang valid
echo.
pause
