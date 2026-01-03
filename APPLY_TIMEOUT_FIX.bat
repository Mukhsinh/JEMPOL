@echo off
echo ========================================
echo    MEMPERBAIKI MASALAH TIMEOUT LOGIN
echo ========================================
echo.

echo 🔧 Menjalankan perbaikan timeout...
node fix-timeout-issue-final.js

echo.
echo ✅ Perbaikan timeout selesai!
echo.
echo 📋 Langkah selanjutnya:
echo 1. Restart aplikasi frontend
echo 2. Test login dengan admin@jempol.com / admin123
echo 3. Periksa console log untuk memastikan tidak ada timeout
echo.
pause