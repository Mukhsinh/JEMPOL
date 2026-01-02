@echo off
echo ========================================
echo    MEMBUKA APLIKASI TICKETS (FIXED)
echo ========================================
echo.
echo Kredensial Login:
echo Email: admin@jempol.com
echo Password: admin123
echo.
echo Membuka browser ke halaman login...
timeout /t 3 /nobreak >nul

start http://localhost:3001/login

echo.
echo ========================================
echo APLIKASI SIAP DIGUNAKAN!
echo ========================================
echo.
echo Langkah-langkah:
echo 1. Login dengan kredensial di atas
echo 2. Klik menu "Tiket" atau navigasi ke /tickets
echo 3. Data tickets akan dimuat otomatis
echo.
echo Jika ada masalah:
echo - Pastikan backend berjalan di port 5001
echo - Pastikan frontend berjalan di port 3001
echo - Gunakan password: admin123 (bukan password)
echo.
pause