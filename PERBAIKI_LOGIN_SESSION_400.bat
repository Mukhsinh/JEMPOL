@echo off
echo ========================================
echo PERBAIKAN LOGIN SESSION 400 ERROR
echo ========================================
echo.

echo Menjalankan script perbaikan...
node fix-login-session-400.js

echo.
echo ========================================
echo LANGKAH SELANJUTNYA:
echo ========================================
echo.
echo 1. Buka browser Chrome/Edge
echo 2. Tekan F12 untuk membuka DevTools
echo 3. Klik tab "Application" atau "Storage"
echo 4. Di sidebar kiri, expand "Local Storage"
echo 5. Klik "http://localhost:3002"
echo 6. HAPUS SEMUA item yang dimulai dengan:
echo    - sb-
echo    - supabase
echo.
echo 7. Atau lebih mudah: Tekan Ctrl+Shift+Delete
echo    - Pilih "Cached images and files"
echo    - Pilih "Cookies and other site data"
echo    - Klik "Clear data"
echo.
echo 8. Tutup browser sepenuhnya
echo 9. Buka kembali browser
echo 10. Buka http://localhost:3002/login
echo 11. Login dengan:
echo     Email: admin@jempol.com
echo     Password: admin123
echo.
echo ========================================
pause
