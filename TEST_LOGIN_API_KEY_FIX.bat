@echo off
echo ========================================
echo 🔐 TEST LOGIN API KEY FIX
echo ========================================
echo.

echo 📂 Opening test files...
start "" "test-login-simple-fix.html"
start "" "test-login-api-key-fix.html"

echo.
echo ✅ Test files opened in browser
echo.
echo 📋 Instructions:
echo 1. Test dengan file test-login-simple-fix.html terlebih dahulu
echo 2. Jika masih error, gunakan test-login-api-key-fix.html untuk debugging detail
echo 3. Periksa console browser untuk log detail
echo.
echo 🔍 Yang harus diperiksa:
echo - Apakah authentication berhasil?
echo - Apakah session token ada setelah login?
echo - Apakah query ke tabel admins berhasil?
echo - Apakah API key dikirim dengan benar?
echo.
pause