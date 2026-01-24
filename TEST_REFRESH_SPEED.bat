@echo off
echo ========================================
echo TEST KECEPATAN REFRESH - KISS
echo ========================================
echo.
echo Membuka test kecepatan refresh...
echo.
echo Target:
echo - Dengan cache: ^< 500ms
echo - Tanpa cache: ^< 2000ms
echo.

start http://localhost:3005/test-refresh-speed.html

echo.
echo Test dibuka di browser!
echo Refresh halaman beberapa kali untuk melihat konsistensi.
echo.
pause
