@echo off
echo ========================================
echo   SETUP ADMIN LOGIN - JEMPOL
echo ========================================
echo.
echo Membuat/Update admin user...
echo.

cd backend
node setup-admin-user.js

echo.
echo ========================================
echo   ADMIN LOGIN SIAP DIGUNAKAN!
echo ========================================
echo.
echo Kredensial Login:
echo   Username: admin
echo   Password: admin123
echo.
echo Cara Login:
echo   1. Jalankan aplikasi (MULAI_APLIKASI.bat)
echo   2. Buka browser: http://localhost:3001/login
echo   3. Login dengan kredensial di atas
echo.
echo Dokumentasi:
echo   - CARA_LOGIN_ADMIN.md
echo   - ADMIN_LOGIN_SETUP.md
echo   - SETUP_ADMIN_SELESAI.md
echo.
pause
