@echo off
echo ========================================
echo TEST SIDEBAR SCROLLING - APLIKASI UTAMA
echo ========================================
echo.
echo Membuka aplikasi utama untuk test sidebar scrolling...
echo.
echo Frontend server sudah berjalan di: http://localhost:5173
echo.

start "" "http://localhost:5173"

echo.
echo Aplikasi dibuka di browser.
echo.
echo INSTRUKSI TEST:
echo 1. Login ke aplikasi
echo 2. Periksa sidebar di sebelah kiri
echo 3. Coba scroll naik turun pada area navigasi
echo 4. Pastikan brand tetap di atas dan profile tetap di bawah
echo 5. Periksa scrollbar custom yang halus
echo.
pause