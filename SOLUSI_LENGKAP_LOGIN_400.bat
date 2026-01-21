@echo off
color 0A
echo ========================================
echo   SOLUSI LENGKAP LOGIN ERROR 400
echo ========================================
echo.
echo Masalah: Login gagal dengan error 400
echo Penyebab: Session invalid di browser
echo.
echo ========================================
echo   LANGKAH 1: Reset Password
echo ========================================
echo.
node fix-login-session-400.js
echo.
echo ========================================
echo   LANGKAH 2: Bersihkan Session Browser
echo ========================================
echo.
echo Membuka tool pembersihan otomatis...
start "" "clear-session-400-error.html"
echo.
echo Tool telah dibuka di browser.
echo.
echo ========================================
echo   INSTRUKSI:
echo ========================================
echo.
echo 1. Di halaman yang terbuka, klik tombol
echo    "Bersihkan Session & Cache"
echo.
echo 2. Tunggu sampai selesai (semua centang hijau)
echo.
echo 3. Klik tombol "Buka Halaman Login"
echo.
echo 4. Login dengan:
echo    Email: admin@jempol.com
echo    Password: admin123
echo.
echo ========================================
pause
