@echo off
echo ========================================
echo 🔐 TEST LOGIN YANG SUDAH DIPERBAIKI
echo ========================================
echo.
echo Kredensial Login:
echo 1. admin@jempol.com / admin123
echo 2. mukhsin9@gmail.com / mukhsin123
echo.
echo Pilih cara test:
echo [1] Buka Aplikasi Web (http://localhost:3001/login)
echo [2] Buka Test HTML
echo [3] Lihat Instruksi Lengkap
echo.
set /p choice="Pilih (1/2/3): "

if "%choice%"=="1" (
    echo Membuka aplikasi web...
    start http://localhost:3001/login
) else if "%choice%"=="2" (
    echo Membuka file test HTML...
    start test-login-after-reset.html
) else if "%choice%"=="3" (
    echo Membuka instruksi lengkap...
    start LOGIN_FIXED_INSTRUCTIONS.md
) else (
    echo Pilihan tidak valid!
)

echo.
echo ✅ Login sudah diperbaiki!
echo Gunakan kredensial di atas untuk login.
pause