@echo off
echo ========================================
echo 🔧 PERBAIKAN LOGIN ADMIN FINAL
echo ========================================
echo.

echo 1. Menjalankan perbaikan konfigurasi Supabase...
node fix-supabase-url-config-final.js
echo.

echo 2. Membuka test login clean...
start test-login-clean-final.html
echo.

echo 3. Kredensial login:
echo    Email: admin@jempol.com
echo    Password: admin123
echo.

echo 4. Langkah selanjutnya:
echo    - Buka test-login-clean-final.html di browser
echo    - Klik "Clear Cache" terlebih dahulu
echo    - Kemudian klik "Login"
echo    - Jika berhasil, coba login di aplikasi utama
echo.

echo ✅ Perbaikan selesai!
pause