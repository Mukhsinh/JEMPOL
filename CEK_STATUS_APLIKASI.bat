@echo off
echo ========================================
echo    CEK STATUS APLIKASI KISS
echo ========================================
echo.

echo [1] Cek port yang digunakan:
netstat -ano | findstr :3001
netstat -ano | findstr :3004
echo.

echo [2] Test koneksi API:
node test-api-connection-quick.js
echo.

echo [3] Test login Supabase:
node test-login-quick.js
echo.

echo ========================================
echo    STATUS CHECK SELESAI
echo ========================================
pause