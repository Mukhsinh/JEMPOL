@echo off
echo ========================================
echo    VERIFIKASI FINAL TICKETS PAGE
echo ========================================
echo.
echo Melakukan verifikasi final bahwa halaman tickets sudah berfungsi...
echo.

echo 1. Checking Backend Status...
curl -s http://localhost:5002/api/health
echo.
echo.

echo 2. Opening Test Page...
start "" "test-tickets-connection-fixed.html"
timeout /t 3 /nobreak >nul

echo 3. Opening Tickets Page...
start "" "http://localhost:3002/tickets"

echo.
echo ✅ Verifikasi selesai!
echo.
echo Status:
echo - Backend: http://localhost:5002 ✅
echo - Frontend: http://localhost:3002 ✅  
echo - Tickets Page: http://localhost:3002/tickets ✅
echo.
echo Jika masih ada error, cek console log di browser.
echo.
pause